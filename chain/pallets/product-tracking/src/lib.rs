//! # Substrate Enterprise Sample - Product Tracking pallet

#![cfg_attr(not(feature = "std"), no_std)]

use codec::alloc::string::ToString;
use core::convert::TryInto;
use frame_support::{
    debug, decl_error, decl_event, decl_module, decl_storage, dispatch, ensure,
    sp_runtime::offchain::{
        self as rt_offchain,
        storage::StorageValueRef,
        storage_lock::{StorageLock, Time},
    },
    sp_std::prelude::*,
    traits::EnsureOrigin,
};
use frame_system::{self as system, ensure_signed, offchain::SendTransactionTypes};

use product_registry::ProductId;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

mod types;
use crate::types::*;

mod builders;
use crate::builders::*;

// General constraints to limit data size
// Note: these could also be passed as trait config parameters
pub const IDENTIFIER_MAX_LENGTH: usize = 36;
pub const SHIPMENT_MAX_PRODUCTS: usize = 10;
pub const LISTENER_ENDPOINT: &str = "http://localhost:3005";
pub const LOCK_TIMEOUT_EXPIRATION: u64 = 3000; // in milli-seconds

pub trait Trait: system::Trait + timestamp::Trait + SendTransactionTypes<Call<Self>> {
    type Event: From<Event<Self>> + Into<<Self as system::Trait>::Event>;
    type CreateRoleOrigin: EnsureOrigin<Self::Origin>;
}

decl_storage! {
    trait Store for Module<T: Trait> as ProductTracking {
        // Shipments
        pub Shipments get(fn shipment_by_id): map hasher(blake2_128_concat) ShipmentId => Option<Shipment<T::AccountId, T::Moment>>;
        pub ShipmentsOfOrganization get(fn shipments_of_org): map hasher(blake2_128_concat) T::AccountId => Vec<ShipmentId>;

        // Shipping events
        pub EventCount get(fn event_count): u128 = 0;
        pub AllEvents get(fn event_by_idx): map hasher(blake2_128_concat) ShippingEventIndex => Option<ShippingEvent<T::Moment>>;
        pub EventsOfShipment get(fn events_of_shipment): map hasher(blake2_128_concat) ShipmentId => Vec<ShippingEventIndex>;

        // Off-chain Worker notifications
        pub OcwNotifications get (fn ocw_notifications): map hasher(identity) T::BlockNumber => Vec<ShippingEventIndex>;
    }
}

decl_event!(
    pub enum Event<T>
    where
        AccountId = <T as system::Trait>::AccountId,
    {
        ShipmentRegistered(AccountId, ShipmentId, AccountId),
        ShipmentStatusUpdated(AccountId, ShipmentId, ShippingEventIndex, ShipmentStatus),
    }
);

decl_error! {
    pub enum Error for Module<T: Trait> {
        InvalidOrMissingIdentifier,
        ShipmentAlreadyExists,
        ShipmentHasBeenDelivered,
        ShipmentIsInTransit,
        ShipmentIsUnknown,
        ShipmentHasTooManyProducts,
        ShippingEventAlreadyExists,
        ShippingEventMaxExceeded,
        OffchainWorkerAlreadyBusy
    }
}

decl_module! {
    pub struct Module<T: Trait> for enum Call where origin: T::Origin {
        type Error = Error<T>;
        fn deposit_event() = default;

        #[weight = 10_000]
        pub fn register_shipment(origin, id: ShipmentId, owner: T::AccountId, products: Vec<ProductId>) -> dispatch::DispatchResult {
            T::CreateRoleOrigin::ensure_origin(origin.clone())?;
            let who = ensure_signed(origin)?;

            // Validate format of shipment ID
            Self::validate_identifier(&id)?;

            // Validate shipment products
            Self::validate_shipment_products(&products)?;

            // Check shipment doesn't exist yet (1 DB read)
            Self::validate_new_shipment(&id)?;

            // Create a shipment instance
            let shipment = Self::new_shipment()
                .identified_by(id.clone())
                .owned_by(owner.clone())
                .registered_at(<timestamp::Module<T>>::now())
                .with_products(products)
                .build();
            let status = shipment.status.clone();

            // Create shipping event
            let event = Self::new_shipping_event()
                .of_type(ShippingEventType::ShipmentRegistration)
                .for_shipment(id.clone())
                .at_location(None)
                .with_readings(vec![])
                .at_time(shipment.registered)
                .build();

            // Storage writes
            // --------------
            // Add shipment (2 DB write)
            <Shipments<T>>::insert(&id, shipment);
            <ShipmentsOfOrganization<T>>::append(&owner, &id);
            // Store shipping event (1 DB read, 3 DB writes)
            let event_idx = Self::store_event(event)?;
            // Update offchain notifications (1 DB write)
            <OcwNotifications<T>>::append(<system::Module<T>>::block_number(), event_idx);

            // Raise events
            Self::deposit_event(RawEvent::ShipmentRegistered(who.clone(), id.clone(), owner));
            Self::deposit_event(RawEvent::ShipmentStatusUpdated(who, id, event_idx, status));

            Ok(())
        }

        #[weight = 10_000]
        pub fn track_shipment(
            origin,
            id: ShipmentId,
            operation: ShippingOperation,
            #[compact] timestamp: T::Moment,
            location: Option<ReadPoint>,
            readings: Option<Vec<Reading<T::Moment>>>
        ) -> dispatch::DispatchResult {
            T::CreateRoleOrigin::ensure_origin(origin.clone())?;
            let who = ensure_signed(origin)?;

            // Validate format of shipment ID
            Self::validate_identifier(&id)?;

            // Check shipment is known (1 DB read) & do transition checks
            let mut shipment = match <Shipments<T>>::get(&id) {
                Some(shipment) => match shipment.status {
                    ShipmentStatus::Delivered => Err(<Error<T>>::ShipmentHasBeenDelivered),
                    ShipmentStatus::InTransit if operation == ShippingOperation::Pickup =>
                        Err(<Error<T>>::ShipmentIsInTransit),
                    _ => Ok(shipment)
                }
                None => Err(<Error<T>>::ShipmentIsUnknown)
            }?;

            // Update shipment status
            shipment = match operation {
                ShippingOperation::Pickup => shipment.pickup(),
                ShippingOperation::Deliver => shipment.deliver(timestamp),
                _ => shipment,
            };
            let status = shipment.status.clone();

            // Create shipping event
            let event = Self::new_shipping_event()
                .of_type(operation.clone().into())
                .for_shipment(id.clone())
                .at_location(location)
                .with_readings(readings.unwrap_or_default())
                .at_time(timestamp)
                .build();

            // Storage writes
            // --------------
            // Store shipping event (1 DB read, 3 DB writes)
            let event_idx = Self::store_event(event)?;
            // Update offchain notifications (1 DB write)
            <OcwNotifications<T>>::append(<system::Module<T>>::block_number(), event_idx);

            if operation != ShippingOperation::Scan {
                // Update shipment (1 DB write)
                <Shipments<T>>::insert(&id, shipment);
                // Raise events
                Self::deposit_event(RawEvent::ShipmentStatusUpdated(who, id, event_idx, status));
            }

            Ok(())
        }

        fn offchain_worker(block_number: T::BlockNumber) {
            // Acquiring the lock
            let mut lock = StorageLock::<Time>::with_deadline(
                b"product_tracking_ocw::lock",
                rt_offchain::Duration::from_millis(LOCK_TIMEOUT_EXPIRATION)
            );

            match lock.try_lock() {
                Ok(_guard) => { Self::process_ocw_notifications(block_number); }
                Err(_err) => { debug::info!("[product_tracking_ocw] lock is already acquired"); }
            };
        }
    }
}

impl<T: Trait> Module<T> {
    // Helper methods
    fn new_shipment() -> ShipmentBuilder<T::AccountId, T::Moment> {
        ShipmentBuilder::<T::AccountId, T::Moment>::default()
    }

    fn new_shipping_event() -> ShippingEventBuilder<T::Moment> {
        ShippingEventBuilder::<T::Moment>::default()
    }

    fn store_event(event: ShippingEvent<T::Moment>) -> Result<ShippingEventIndex, Error<T>> {
        let event_idx = EventCount::get()
            .checked_add(1)
            .ok_or(Error::<T>::ShippingEventMaxExceeded)?;

        EventCount::put(event_idx);
        EventsOfShipment::append(&event.shipment_id, event_idx);
        <AllEvents<T>>::insert(event_idx, event);

        Ok(event_idx)
    }

    // (Public) Validation methods
    pub fn validate_identifier(id: &[u8]) -> Result<(), Error<T>> {
        // Basic identifier validation
        ensure!(!id.is_empty(), Error::<T>::InvalidOrMissingIdentifier);
        ensure!(
            id.len() <= IDENTIFIER_MAX_LENGTH,
            Error::<T>::InvalidOrMissingIdentifier
        );
        Ok(())
    }

    pub fn validate_new_shipment(id: &[u8]) -> Result<(), Error<T>> {
        // Shipment existence check
        ensure!(
            !<Shipments<T>>::contains_key(id),
            Error::<T>::ShipmentAlreadyExists
        );
        Ok(())
    }

    pub fn validate_shipment_products(props: &[ProductId]) -> Result<(), Error<T>> {
        ensure!(
            props.len() <= SHIPMENT_MAX_PRODUCTS,
            Error::<T>::ShipmentHasTooManyProducts,
        );
        Ok(())
    }

    // --- Offchain worker methods ---

    fn process_ocw_notifications(block_number: T::BlockNumber) {
        // Check last processed block
        let last_processed_block_ref =
            StorageValueRef::persistent(b"product_tracking_ocw::last_proccessed_block");
        let mut last_processed_block: u32 = match last_processed_block_ref.get::<T::BlockNumber>() {
            Some(Some(last_proccessed_block)) if last_proccessed_block >= block_number => {
                debug::info!(
                    "[product_tracking_ocw] Skipping: Block {:?} has already been processed.",
                    block_number
                );
                return;
            }
            Some(Some(last_proccessed_block)) => {
                last_proccessed_block.try_into().ok().unwrap() as u32
            }
            None => 0u32, //TODO: define a OCW_MAX_BACKTRACK_PERIOD param
            _ => {
                debug::error!("[product_tracking_ocw] Error reading product_tracking_ocw::last_proccessed_block.");
                return;
            }
        };

        let start_block = last_processed_block + 1;
        let end_block = block_number.try_into().ok().unwrap() as u32;
        for current_block in start_block..end_block {
            debug::debug!(
                "[product_tracking_ocw] Processing notifications for block {}",
                current_block
            );
            let ev_indices = Self::ocw_notifications::<T::BlockNumber>(current_block.into());

            let listener_results: Result<Vec<_>, _> = ev_indices
                .iter()
                .map(|idx| match Self::event_by_idx(idx) {
                    Some(ev) => Self::notify_listener(&ev),
                    None => Ok(()),
                })
                .collect();

            if let Err(err) = listener_results {
                debug::warn!("[product_tracking_ocw] notify_listener error: {}", err);
                break;
            }
            last_processed_block = current_block;
        }

        // Save last processed block
        if last_processed_block >= start_block {
            last_processed_block_ref.set(&last_processed_block);
            debug::info!(
                "[product_tracking_ocw] Notifications successfully processed up to block {}",
                last_processed_block
            );
        }
    }

    fn notify_listener(ev: &ShippingEvent<T::Moment>) -> Result<(), &'static str> {
        debug::info!("notifying listener: {:?}", ev);

        let request =
            sp_runtime::offchain::http::Request::post(&LISTENER_ENDPOINT, vec![ev.to_string()]);

        let timeout =
            sp_io::offchain::timestamp().add(sp_runtime::offchain::Duration::from_millis(3000));

        let pending = request
            .add_header(&"Content-Type", &"text/plain")
            .deadline(timeout) // Setting the timeout time
            .send() // Sending the request out by the host
            .map_err(|_| "http post request building error")?;

        let response = pending
            .try_wait(timeout)
            .map_err(|_| "http post request sent error")?
            .map_err(|_| "http post request sent error")?;

        if response.code != 200 {
            return Err("http response error");
        }

        Ok(())
    }
}
