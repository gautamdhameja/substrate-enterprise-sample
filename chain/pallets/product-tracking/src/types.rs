use codec::{Decode, Encode};
use core::fmt;
use fixed::types::I16F16;
use frame_support::{sp_runtime::RuntimeDebug, sp_std::prelude::*};
use product_registry::ProductId;

// Custom types
pub type Identifier = Vec<u8>;
pub type Decimal = I16F16;
pub type ShipmentId = Identifier;
pub type ShippingEventIndex = u128;
pub type DeviceId = Identifier;

#[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug)]
pub enum ShipmentStatus {
    Pending,
    InTransit,
    Delivered,
}

#[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug)]
pub struct Shipment<AccountId, Moment> {
    pub id: ShipmentId,
    pub owner: AccountId,
    pub status: ShipmentStatus,
    pub products: Vec<ProductId>,
    pub registered: Moment,
    pub delivered: Option<Moment>,
}

impl<AccountId, Moment> Shipment<AccountId, Moment> {
    pub fn pickup(mut self) -> Self {
        self.status = ShipmentStatus::InTransit;
        self
    }

    pub fn deliver(mut self, delivered_on: Moment) -> Self {
        self.status = ShipmentStatus::Delivered;
        self.delivered = Some(delivered_on);
        self
    }
}

#[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug)]
pub enum ShippingOperation {
    Pickup,
    Scan,
    Deliver,
}

#[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug)]
pub enum ShippingEventType {
    ShipmentRegistration,
    ShipmentPickup,
    ShipmentScan,
    ShipmentDeliver,
}

impl From<ShippingOperation> for ShippingEventType {
    fn from(op: ShippingOperation) -> Self {
        match op {
            ShippingOperation::Pickup => ShippingEventType::ShipmentPickup,
            ShippingOperation::Scan => ShippingEventType::ShipmentScan,
            ShippingOperation::Deliver => ShippingEventType::ShipmentDeliver,
        }
    }
}

#[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug)]
pub struct ShippingEvent<Moment> {
    pub event_type: ShippingEventType,
    pub shipment_id: ShipmentId,
    pub location: Option<ReadPoint>,
    pub readings: Vec<Reading<Moment>>,
    pub timestamp: Moment,
}

impl<Moment> fmt::Display for ShippingEvent<Moment>
where
    Moment: fmt::Debug,
{
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug)]
pub struct ReadPoint {
    pub latitude: Decimal,
    pub longitude: Decimal,
}

#[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug)]
pub enum ReadingType {
    Humidity,
    Pressure,
    Shock,
    Tilt,
    Temperature,
    Vibration,
}

#[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug)]
pub struct Reading<Moment> {
    pub device_id: DeviceId,
    pub reading_type: ReadingType,
    #[codec(compact)]
    pub timestamp: Moment,
    pub value: Decimal,
}
