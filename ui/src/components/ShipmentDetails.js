import React, { useEffect, useState } from 'react';
import { Container, Header, Icon, Grid, List, Step, Segment } from 'semantic-ui-react';
import { useSubstrate } from '../substrate-lib';
import { hexToString, u8aToString } from '@polkadot/util';

import ShipmentOperations from './ShipmentOperations';

function ShipmentDetailsComponent (props) {
  const { api } = useSubstrate();
  const [shipment, setShipment] = useState(null);
  const [eventIndices, setEventIndices] = useState([]);
  const [events, setEvents] = useState([]);
  const [products, setProducts] = useState([]);
  const { accountPair, shipmentId } = props;

  useEffect(() => {
    let unsubscribe;

    async function shipment (shipmentId) {
      await api.query.productTracking.shipments(shipmentId, async data => {
        if (!data || !data.value || !data.value.owner) {
          return;
        }

        const nonce = await api.query.palletDid.attributeNonce([data.value.owner, 'Org']);
        const attrHash = api.registry.createType('(AccountId, Text, u64)', [data.value.owner, 'Org', nonce.subn(1)]).hash;
        const orgAttr = await api.query.palletDid.attributeOf([data.value.owner, attrHash]);
        setShipment({ ...data.value, owner: u8aToString(orgAttr.value) });
      }
      );
    }

    if (shipmentId) {
      shipment(shipmentId);
    } else {
      setShipment(null);
      return () => unsubscribe && unsubscribe();
    }
  }, [api.query.palletDid, api.query.productTracking, api.registry, shipmentId]);

  useEffect(() => {
    let unsubscribe;

    async function eventsOfShipment (shipmentId) {
      await api.query.productTracking.eventsOfShipment(shipmentId, data =>
        setEventIndices(data ? data.map(x => x.toNumber()) : [])
      );
    }

    if (shipmentId) {
      eventsOfShipment(shipmentId);
    } else {
      setEventIndices([]);
      return () => unsubscribe && unsubscribe();
    }
  }, [api.query.productTracking, shipmentId]);

  useEffect(() => {
    let unsubscribe;

    async function allEvents (eventIndices) {
      const futures = eventIndices
        .map(idx => api.query.productTracking.allEvents(idx));
      Promise.all(futures)
        .then(data => {
          if (data) {
            const sorted = data
              .map(x => x.value)
              .sort((a, b) => a.timestamp.toNumber() - b.timestamp.toNumber());
            setEvents(sorted);
          } else {
            setEvents([]);
          }
        })
        .catch(e => console.log(e));
    }

    if (eventIndices) {
      allEvents(eventIndices);
    } else {
      setEvents([]);
      return () => unsubscribe && unsubscribe();
    }
  }, [api.query.productTracking, eventIndices]);

  useEffect(() => {
    let unsubscribe;

    async function products (shipment) {
      const futures = shipment.products
        .map(productId => api.query.productRegistry.products(productId.toString()));
      Promise.all(futures)
        .then(data => {
          if (data) {
            const products = data.map(p => {
              const product = p.value;
              const descProp = product.props ? product.props.value.find(prop => hexToString(prop.name.toString()) === 'desc') : { name: '', value: '' };
              return {
                id: hexToString(product.id.toString()),
                desc: hexToString(descProp.value.toString())
              };
            });
            setProducts(products);
          } else {
            setProducts([]);
          }
        })
        .catch(e => console.log(e));
    }

    if (shipment && shipment.products) {
      products(shipment);
    } else {
      setProducts([]);
      return () => unsubscribe && unsubscribe();
    }
  }, [api.query.productRegistry, shipment]);

  return (
    shipment != null
      ? <Container style={{ marginTop: '2em' }}>
        <Header as="h2">Shipment {shipmentId}</Header>
        <Segment>
          <Grid columns="2" rows="2">
            <Grid.Row>
              <Grid.Column>
                <Header as="h4" floated="left">Owner: </Header>
                <span style={{ fontSize: '0.8em' }}>{shipment.owner.toString()}</span>
              </Grid.Column>
              <Grid.Column>
                <Header as="h4" floated="left">Registered:</Header>
                <span>{new Date(shipment.registered.toNumber()).toLocaleString()}</span>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Header as="h4" floated="left">Status: </Header>
                <span>{shipment.status.toString()}</span>
              </Grid.Column>
              <Grid.Column>
                <Header as="h4" floated="left">Delivered:</Header>
                <span>{ shipment.delivered.value.toString().length > 0
                  ? new Date(shipment.delivered.value.toNumber()).toLocaleString() : ''
                }</span>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
        <Grid container columns={3} style={{ marginTop: '1em' }}>
          <Grid.Column width={6}>
            <Header as="h3">Shipping Events</Header>
            { events
              ? <Step.Group vertical size='small'> { events.map((event, idx) => {
                const eventType = event.event_type.toString();
                return (
                  <Step key={idx}>
                    <Icon name={ eventType === 'ShipmentRegistration'
                      ? 'tasks'
                      : eventType === 'ShipmentPickup'
                        ? 'truck'
                        : eventType === 'ShipmentScan'
                          ? 'barcode' : 'home'
                    } />
                    <Step.Content>
                      <Step.Title>{event.event_type.toString().substring(8)}</Step.Title>
                      <Step.Description>
                        { new Date(event.timestamp.toNumber()).toLocaleString() }
                      </Step.Description>
                    </Step.Content>
                  </Step>
                );
              })} </Step.Group>
              : <div>No event found</div>
            }
          </Grid.Column>
          <Grid.Column width={6}>
            <Header as="h3">Products</Header>
            { products
              ? <List> { products.map((product, idx) =>
                <List.Item key={idx} header={product.id} description={product.desc} />
              ) } </List>
              : <div>No product found</div>
            }
          </Grid.Column>
          <Grid.Column width={4}>
            <Header as="h3">Shipping Operations</Header>
            <ShipmentOperations accountPair={accountPair} shipment={shipment} />
          </Grid.Column>
        </Grid>
      </Container> : <div></div>
  );
}

export default function ShipmentDetails (props) {
  const { api } = useSubstrate();
  return api ? <ShipmentDetailsComponent {...props} /> : null;
}
