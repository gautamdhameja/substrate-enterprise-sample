use super::*;
use crate::{mock::*, types::*, Error};
use fixed::types::I16F16;
use frame_support::{assert_noop, assert_ok, dispatch};

pub fn store_test_shipment<T: Trait>(
    id: ShipmentId,
    owner: T::AccountId,
    status: ShipmentStatus,
    products: Vec<ProductId>,
    registered: T::Moment,
) {
    Shipments::<T>::insert(
        id.clone(),
        Shipment {
            id,
            owner,
            status,
            products,
            registered,
            delivered: None,
        },
    );
}

pub fn store_test_event<T: Trait>(shipment_id: ShipmentId, event_type: ShippingEventType) {
    let event = ShippingEvent {
        event_type,
        shipment_id: shipment_id.clone(),
        location: None,
        readings: vec![],
        timestamp: 42.into(),
    };
    let event_idx = EventCount::get().checked_add(1).unwrap();
    EventCount::put(event_idx);
    AllEvents::<T>::insert(event_idx, event);
    EventsOfShipment::append(shipment_id, event_idx);
}

const TEST_PRODUCT_ID: &str = "00012345678905";
const TEST_SHIPMENT_ID: &str = "0001";
const TEST_ORGANIZATION: &str = "Northwind";
const TEST_SENDER: &str = "Alice";
const LONG_VALUE : &str = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec aliquam ut tortor nec congue. Pellente";

#[test]
fn register_shipment_without_products() {
    new_test_ext().execute_with(|| {
        let sender = account_key(TEST_SENDER);
        let id = TEST_SHIPMENT_ID.as_bytes().to_owned();
        let owner = account_key(TEST_ORGANIZATION);
        let now = 42;
        Timestamp::set_timestamp(now);

        let result = ProductTracking::register_shipment(
            Origin::signed(sender),
            id.clone(),
            owner.clone(),
            vec![],
        );

        assert_ok!(result);

        assert_eq!(
            ProductTracking::shipment_by_id(&id),
            Some(Shipment {
                id: id.clone(),
                owner: owner,
                status: ShipmentStatus::Pending,
                products: vec![],
                registered: now,
                delivered: None
            })
        );

        assert_eq!(
            <ShipmentsOfOrganization<Test>>::get(owner),
            vec![id.clone()]
        );

        assert!(System::events().iter().any(|er| er.event
            == TestEvent::product_tracking(RawEvent::ShipmentRegistered(
                sender,
                id.clone(),
                owner
            ))));

        assert!(System::events().iter().any(|er| er.event
            == TestEvent::product_tracking(RawEvent::ShipmentStatusUpdated(
                sender,
                id.clone(),
                1,
                ShipmentStatus::Pending
            ))));
    });
}

#[test]
fn register_shipment_with_valid_products() {
    new_test_ext().execute_with(|| {
        let sender = account_key(TEST_SENDER);
        let id = TEST_SHIPMENT_ID.as_bytes().to_owned();
        let owner = account_key(TEST_ORGANIZATION);
        let now = 42;
        Timestamp::set_timestamp(now);

        let result = ProductTracking::register_shipment(
            Origin::signed(sender),
            id.clone(),
            owner.clone(),
            vec![
                b"00012345600001".to_vec(),
                b"00012345600002".to_vec(),
                b"00012345600003".to_vec(),
            ],
        );

        assert_ok!(result);

        assert_eq!(
            ProductTracking::shipment_by_id(&id),
            Some(Shipment {
                id: id.clone(),
                owner: owner,
                status: ShipmentStatus::Pending,
                products: vec![
                    b"00012345600001".to_vec(),
                    b"00012345600002".to_vec(),
                    b"00012345600003".to_vec(),
                ],
                registered: now,
                delivered: None
            })
        );

        assert_eq!(
            <ShipmentsOfOrganization<Test>>::get(owner),
            vec![id.clone()]
        );

        assert!(System::events().iter().any(|er| er.event
            == TestEvent::product_tracking(RawEvent::ShipmentRegistered(
                sender,
                id.clone(),
                owner
            ))));

        assert!(System::events().iter().any(|er| er.event
            == TestEvent::product_tracking(RawEvent::ShipmentStatusUpdated(
                sender,
                id.clone(),
                1,
                ShipmentStatus::Pending
            ))));
    });
}

#[test]
fn register_shipment_with_invalid_sender() {
    new_test_ext().execute_with(|| {
        assert_noop!(
            ProductTracking::register_shipment(
                Origin::none(),
                TEST_SHIPMENT_ID.as_bytes().to_owned(),
                account_key(TEST_ORGANIZATION),
                vec!()
            ),
            dispatch::DispatchError::BadOrigin
        );
    });
}

#[test]
fn register_shipment_with_missing_id() {
    new_test_ext().execute_with(|| {
        assert_noop!(
            ProductTracking::register_shipment(
                Origin::signed(account_key(TEST_SENDER)),
                vec!(),
                account_key(TEST_ORGANIZATION),
                vec!()
            ),
            Error::<Test>::InvalidOrMissingIdentifier
        );
    });
}

#[test]
fn register_shipment_with_long_id() {
    new_test_ext().execute_with(|| {
        assert_noop!(
            ProductTracking::register_shipment(
                Origin::signed(account_key(TEST_SENDER)),
                LONG_VALUE.as_bytes().to_owned(),
                account_key(TEST_ORGANIZATION),
                vec!()
            ),
            Error::<Test>::InvalidOrMissingIdentifier
        );
    })
}

#[test]
fn register_shipment_with_existing_id() {
    new_test_ext().execute_with(|| {
        let existing_shipment = TEST_SHIPMENT_ID.as_bytes().to_owned();
        let now = 42;

        store_test_shipment::<Test>(
            existing_shipment.clone(),
            account_key(TEST_ORGANIZATION),
            ShipmentStatus::Pending,
            vec![],
            now,
        );

        assert_noop!(
            ProductTracking::register_shipment(
                Origin::signed(account_key(TEST_SENDER)),
                existing_shipment,
                account_key(TEST_ORGANIZATION),
                vec![]
            ),
            Error::<Test>::ShipmentAlreadyExists
        );
    })
}

#[test]
fn register_shipment_with_too_many_products() {
    new_test_ext().execute_with(|| {
        assert_noop!(
            ProductTracking::register_shipment(
                Origin::signed(account_key(TEST_SENDER)),
                TEST_SHIPMENT_ID.as_bytes().to_owned(),
                account_key(TEST_ORGANIZATION),
                vec![
                    b"00012345600001".to_vec(),
                    b"00012345600002".to_vec(),
                    b"00012345600003".to_vec(),
                    b"00012345600004".to_vec(),
                    b"00012345600005".to_vec(),
                    b"00012345600006".to_vec(),
                    b"00012345600007".to_vec(),
                    b"00012345600008".to_vec(),
                    b"00012345600009".to_vec(),
                    b"00012345600010".to_vec(),
                    b"00012345600011".to_vec(),
                ]
            ),
            Error::<Test>::ShipmentHasTooManyProducts
        );
    })
}

#[test]
fn track_shipment_with_invalid_sender() {
    new_test_ext().execute_with(|| {
        let now = 42;

        assert_noop!(
            ProductTracking::track_shipment(
                Origin::none(),
                TEST_SHIPMENT_ID.as_bytes().to_owned(),
                ShippingOperation::Pickup,
                now,
                None,
                None
            ),
            dispatch::DispatchError::BadOrigin
        );
    });
}

#[test]
fn track_shipment_with_missing_shipment_id() {
    new_test_ext().execute_with(|| {
        let now = 42;

        assert_noop!(
            ProductTracking::track_shipment(
                Origin::signed(account_key(TEST_SENDER)),
                vec![],
                ShippingOperation::Pickup,
                now,
                None,
                None
            ),
            Error::<Test>::InvalidOrMissingIdentifier
        );
    });
}

#[test]
fn track_shipment_with_long_shipment_id() {
    new_test_ext().execute_with(|| {
        let now = 42;

        assert_noop!(
            ProductTracking::track_shipment(
                Origin::signed(account_key(TEST_SENDER)),
                LONG_VALUE.as_bytes().to_owned(),
                ShippingOperation::Pickup,
                now,
                None,
                None
            ),
            Error::<Test>::InvalidOrMissingIdentifier,
        );
    });
}

#[test]
fn track_shipment_with_unknown_shipment() {
    new_test_ext().execute_with(|| {
        let unknown_shipment = TEST_SHIPMENT_ID.as_bytes().to_owned();
        let now = 42;

        assert_noop!(
            ProductTracking::track_shipment(
                Origin::signed(account_key(TEST_SENDER)),
                unknown_shipment,
                ShippingOperation::Pickup,
                now,
                None,
                None
            ),
            Error::<Test>::ShipmentIsUnknown,
        );
    })
}

#[test]
fn track_shipment_pickup() {
    new_test_ext().execute_with(|| {
        let owner = account_key(TEST_ORGANIZATION);
        let shipment_id = TEST_SHIPMENT_ID.as_bytes().to_owned();
        let now = 42;

        // Store shipment w/ Pending status
        store_test_shipment::<Test>(
            shipment_id.clone(),
            owner,
            ShipmentStatus::Pending,
            vec![TEST_PRODUCT_ID.as_bytes().to_owned()],
            now,
        );

        // Store shipping registration event
        store_test_event::<Test>(shipment_id.clone(), ShippingEventType::ShipmentRegistration);

        // Dispatchable call succeeds
        assert_ok!(ProductTracking::track_shipment(
            Origin::signed(owner),
            shipment_id.clone(),
            ShippingOperation::Pickup,
            now,
            None,
            None
        ));

        // Storage is correctly updated
        assert_eq!(EventCount::get(), 2);
        assert_eq!(
            AllEvents::<Test>::get(2),
            Some(ShippingEvent {
                event_type: ShippingEventType::ShipmentPickup,
                shipment_id: shipment_id.clone(),
                location: None,
                readings: vec![],
                timestamp: now,
            })
        );
        assert_eq!(EventsOfShipment::get(&shipment_id), vec![1, 2]);

        // Shipment's status should be updated to 'InTransit'
        assert_eq!(
            ProductTracking::shipment_by_id(&shipment_id),
            Some(Shipment {
                id: shipment_id.clone(),
                owner: owner,
                status: ShipmentStatus::InTransit,
                products: vec![TEST_PRODUCT_ID.as_bytes().to_owned()],
                registered: now,
                delivered: None
            })
        );

        // Event is raised
        assert!(System::events().iter().any(|er| er.event
            == TestEvent::product_tracking(RawEvent::ShipmentStatusUpdated(
                owner,
                shipment_id.clone(),
                2,
                ShipmentStatus::InTransit
            ))));
    })
}

#[test]
fn track_shipment_delivery() {
    new_test_ext().execute_with(|| {
        let owner = account_key(TEST_ORGANIZATION);
        let shipment_id = TEST_SHIPMENT_ID.as_bytes().to_owned();
        let now = 42;
        Timestamp::set_timestamp(now);

        // Store shipment w/ InTransit status
        store_test_shipment::<Test>(
            shipment_id.clone(),
            owner,
            ShipmentStatus::InTransit,
            vec![TEST_PRODUCT_ID.as_bytes().to_owned()],
            now,
        );

        // Store shipping registration & pickup events
        store_test_event::<Test>(shipment_id.clone(), ShippingEventType::ShipmentRegistration);
        store_test_event::<Test>(shipment_id.clone(), ShippingEventType::ShipmentPickup);

        // Dispatchable call succeeds
        assert_ok!(ProductTracking::track_shipment(
            Origin::signed(owner),
            shipment_id.clone(),
            ShippingOperation::Deliver,
            now,
            None,
            None
        ));

        // Storage is correctly updated
        assert_eq!(EventCount::get(), 3);
        assert_eq!(
            AllEvents::<Test>::get(3),
            Some(ShippingEvent {
                event_type: ShippingEventType::ShipmentDeliver,
                shipment_id: shipment_id.clone(),
                location: None,
                readings: vec![],
                timestamp: now,
            })
        );
        assert_eq!(EventsOfShipment::get(&shipment_id), vec![1, 2, 3]);

        // Shipment's status should be updated to 'Delivered'
        // and delivered timestamp updated
        assert_eq!(
            ProductTracking::shipment_by_id(&shipment_id),
            Some(Shipment {
                id: shipment_id.clone(),
                owner: owner,
                status: ShipmentStatus::Delivered,
                products: vec![TEST_PRODUCT_ID.as_bytes().to_owned()],
                registered: now,
                delivered: Some(now)
            })
        );

        // Events is raised
        assert!(System::events().iter().any(|er| er.event
            == TestEvent::product_tracking(RawEvent::ShipmentStatusUpdated(
                owner,
                shipment_id.clone(),
                3,
                ShipmentStatus::Delivered
            ))));
    })
}

#[test]
fn track_shipment_for_delivered_shipment() {
    new_test_ext().execute_with(|| {
        let owner = account_key(TEST_ORGANIZATION);
        let shipment_id = TEST_SHIPMENT_ID.as_bytes().to_owned();
        let now = 42;

        // Store shipment w/ Delivered status
        store_test_shipment::<Test>(
            shipment_id.clone(),
            owner,
            ShipmentStatus::Delivered,
            vec![TEST_PRODUCT_ID.as_bytes().to_owned()],
            now,
        );

        assert_noop!(
            ProductTracking::track_shipment(
                Origin::signed(owner),
                shipment_id.clone(),
                ShippingOperation::Pickup,
                now,
                None,
                None
            ),
            Error::<Test>::ShipmentHasBeenDelivered
        );
    })
}

#[test]
fn track_shipment_for_intransit_shipment() {
    new_test_ext().execute_with(|| {
        let owner = account_key(TEST_ORGANIZATION);
        let shipment_id = TEST_SHIPMENT_ID.as_bytes().to_owned();
        let now = 42;

        // Store shipment w/ InTransit status
        store_test_shipment::<Test>(
            shipment_id.clone(),
            owner,
            ShipmentStatus::InTransit,
            vec![TEST_PRODUCT_ID.as_bytes().to_owned()],
            now,
        );

        assert_noop!(
            ProductTracking::track_shipment(
                Origin::signed(owner),
                shipment_id.clone(),
                ShippingOperation::Pickup,
                now,
                None,
                None
            ),
            Error::<Test>::ShipmentIsInTransit
        );
    })
}

#[test]
fn monitor_shipment() {
    new_test_ext().execute_with(|| {
        let owner = account_key(TEST_ORGANIZATION);
        let shipment_id = TEST_SHIPMENT_ID.as_bytes().to_owned();
        let now = 42;

        // Store shipment w/ InTransit status
        store_test_shipment::<Test>(
            shipment_id.clone(),
            owner,
            ShipmentStatus::InTransit,
            vec![TEST_PRODUCT_ID.as_bytes().to_owned()],
            now,
        );

        // Store shipping registration & pickup events
        store_test_event::<Test>(shipment_id.clone(), ShippingEventType::ShipmentRegistration);
        store_test_event::<Test>(shipment_id.clone(), ShippingEventType::ShipmentPickup);

        // Define location & readings for sensor reading
        let location = ReadPoint {
            latitude: I16F16::from_num(52.4941126),
            longitude: I16F16::from_num(13.4355606),
        };

        let readings = vec![Reading {
            device_id: "14d453ea4bdf46bc8042".as_bytes().to_owned(),
            reading_type: ReadingType::Temperature,
            value: I16F16::from_num(20.123),
            timestamp: now,
        }];

        // Dispatchable call succeeds
        assert_ok!(ProductTracking::track_shipment(
            Origin::signed(owner),
            shipment_id.clone(),
            ShippingOperation::Scan,
            now,
            Some(location.clone()),
            Some(readings.clone())
        ));

        // Storage is correctly updated
        assert_eq!(EventCount::get(), 3);
        assert_eq!(
            AllEvents::<Test>::get(3),
            Some(ShippingEvent {
                event_type: ShippingEventType::ShipmentScan,
                shipment_id: shipment_id.clone(),
                location: Some(location),
                readings: readings,
                timestamp: now,
            })
        );
        assert_eq!(EventsOfShipment::get(&shipment_id), vec![1, 2, 3]);

        // Shipment's status should still be 'InTransit'
        assert_eq!(
            ProductTracking::shipment_by_id(&shipment_id),
            Some(Shipment {
                id: shipment_id.clone(),
                owner: owner,
                status: ShipmentStatus::InTransit,
                products: vec![TEST_PRODUCT_ID.as_bytes().to_owned()],
                registered: now,
                delivered: None
            })
        );
    })
}

#[test]
fn monitor_shipment_with_negative_latlon() {
    new_test_ext().execute_with(|| {
        let owner = account_key(TEST_ORGANIZATION);
        let shipment_id = TEST_SHIPMENT_ID.as_bytes().to_owned();
        let now = 42;

        // Store shipment w/ InTransit status
        store_test_shipment::<Test>(
            shipment_id.clone(),
            owner,
            ShipmentStatus::InTransit,
            vec![TEST_PRODUCT_ID.as_bytes().to_owned()],
            now,
        );

        // Store shipping registration & pickup events
        store_test_event::<Test>(shipment_id.clone(), ShippingEventType::ShipmentRegistration);
        store_test_event::<Test>(shipment_id.clone(), ShippingEventType::ShipmentPickup);

        // Define location & readings for sensor reading
        let location = ReadPoint {
            // Rio de Janeiro, Brazil
            latitude: I16F16::from_num(-22.9466369),
            longitude: I16F16::from_num(-43.233472),
        };

        let readings = vec![Reading {
            device_id: "14d453ea4bdf46bc8042".as_bytes().to_owned(),
            reading_type: ReadingType::Temperature,
            value: I16F16::from_num(20.123),
            timestamp: now,
        }];

        // Dispatchable call succeeds
        assert_ok!(ProductTracking::track_shipment(
            Origin::signed(owner),
            shipment_id.clone(),
            ShippingOperation::Scan,
            now,
            Some(location.clone()),
            Some(readings.clone())
        ));

        // Storage is correctly updated
        assert_eq!(EventCount::get(), 3);
        assert_eq!(
            AllEvents::<Test>::get(3),
            Some(ShippingEvent {
                event_type: ShippingEventType::ShipmentScan,
                shipment_id: shipment_id.clone(),
                location: Some(location),
                readings: readings,
                timestamp: now,
            })
        );
        assert_eq!(EventsOfShipment::get(&shipment_id), vec![1, 2, 3]);

        // Shipment's status should still be 'InTransit'
        assert_eq!(
            ProductTracking::shipment_by_id(&shipment_id),
            Some(Shipment {
                id: shipment_id.clone(),
                owner: owner,
                status: ShipmentStatus::InTransit,
                products: vec![TEST_PRODUCT_ID.as_bytes().to_owned()],
                registered: now,
                delivered: None
            })
        );
    })
}
