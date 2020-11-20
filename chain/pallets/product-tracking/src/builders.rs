use crate::types::*;
use frame_support::sp_std::prelude::*;
use product_registry::ProductId;

// --- ShipmentBuilder ---

#[derive(Default)]
pub struct ShipmentBuilder<AccountId, Moment>
where
    AccountId: Default,
    Moment: Default,
{
    id: ShipmentId,
    owner: AccountId,
    products: Vec<ProductId>,
    registered: Moment,
}

impl<AccountId, Moment> ShipmentBuilder<AccountId, Moment>
where
    AccountId: Default,
    Moment: Default,
{
    pub fn identified_by(mut self, id: ShipmentId) -> Self {
        self.id = id;
        self
    }

    pub fn owned_by(mut self, owner: AccountId) -> Self {
        self.owner = owner;
        self
    }

    pub fn with_products(mut self, products: Vec<ProductId>) -> Self {
        self.products = products;
        self
    }

    pub fn registered_at(mut self, registered: Moment) -> Self {
        self.registered = registered;
        self
    }

    pub fn build(self) -> Shipment<AccountId, Moment> {
        Shipment::<AccountId, Moment> {
            id: self.id,
            owner: self.owner,
            products: self.products,
            registered: self.registered,
            status: ShipmentStatus::Pending,
            delivered: None,
        }
    }
}

// --- ShipmentEventBuilder ---

pub struct ShippingEventBuilder<Moment>
where
    Moment: Default,
{
    shipment_id: ShipmentId,
    event_type: ShippingEventType,
    location: Option<ReadPoint>,
    readings: Vec<Reading<Moment>>,
    timestamp: Moment,
}

impl<Moment> Default for ShippingEventBuilder<Moment>
where
    Moment: Default,
{
    fn default() -> Self {
        ShippingEventBuilder {
            shipment_id: ShipmentId::default(),
            event_type: ShippingEventType::ShipmentPickup,
            location: Option::<ReadPoint>::default(),
            readings: Vec::<Reading<Moment>>::default(),
            timestamp: Moment::default(),
        }
    }
}

impl<Moment> ShippingEventBuilder<Moment>
where
    Moment: Default,
{
    pub fn of_type(mut self, event_type: ShippingEventType) -> Self {
        self.event_type = event_type;
        self
    }

    pub fn for_shipment(mut self, id: ShipmentId) -> Self {
        self.shipment_id = id;
        self
    }

    pub fn at_location(mut self, location: Option<ReadPoint>) -> Self {
        self.location = location;
        self
    }

    pub fn with_readings(mut self, readings: Vec<Reading<Moment>>) -> Self {
        self.readings = readings;
        self
    }

    pub fn at_time(mut self, timestamp: Moment) -> Self {
        self.timestamp = timestamp;
        self
    }

    pub fn build(self) -> ShippingEvent<Moment> {
        ShippingEvent::<Moment> {
            event_type: self.event_type,
            shipment_id: self.shipment_id,
            location: self.location,
            readings: self.readings,
            timestamp: self.timestamp,
        }
    }
}
