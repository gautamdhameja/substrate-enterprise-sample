import React, { useEffect, useState, createRef } from 'react';
import { Container, Header, Icon, Grid, List, Step, StepGroup } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { useSubstrate } from './substrate-lib';

function ShipmentDetailsComponent (props) {
  const { api } = useSubstrate();
  const [ shipment, setShipment ] = useState({});
  const [ eventIndices, setEventIndices] = useState([]);
  const [ events, setEvents ] = useState([]);
  const { accountPair, shipmentId } = props;

  useEffect(() => {
    let unsubscribe;

    async function shipment (shipmentId) {
      await api.query.productTracking.shipments(shipmentId, data =>
        setShipment(data ? data.value : {})
      );
    }

    if (shipmentId) {
        shipment(shipmentId);
    } else {
      return () => unsubscribe && unsubscribe();
    }
  }, [api.query.productTracking]);

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
      return () => unsubscribe && unsubscribe();
    }
  }, [api.query.productTracking]);

  useEffect(() => {
    let unsubscribe;

    async function allEvents (eventIndices) {
      const futures = eventIndices
        .map(async idx => await api.query.productTracking.allEvents(BigInt(idx)));
      Promise.all(futures)
        .then(data => {
            if (data) {
                const sorted = data.map(x => x.value).sort((a, b) => a.timestamp.toNumber() - b.timestamp.toNumber());
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
      return () => unsubscribe && unsubscribe();
    }
  }, [api.query.productTracking, eventIndices]);

  return (
    <Container>
        <Header as="h2">Shipment {shipmentId}</Header>
        <Grid stackable columns='equal'>
            <Grid.Column>
                <Header as="h3">Status: Delivered</Header> 
            </Grid.Column>
        </Grid>
        <Grid container columns={2} style={{ marginTop: '1em' }}>
            <Grid.Column width={8}>
                <Header as="h3">Shipping Events</Header>
                { 
                    events ?
                        <Step.Group vertical size='small'>
                            {events
                                .map((event, idx) => {
                                    const event_type = event.event_type.toString();
                                    return (
                                        <Step key={idx}>
                                            <Icon name={event_type == 'ShipmentRegistration' ? 'tasks'
                                                : event_type == 'ShipmentPickup' ? 'truck'
                                                : event_type == 'ShipmentScan' ? 'barcode' : 'home'
                                            } />
                                            <Step.Content>
                                                <Step.Title>{event.event_type.toString().substring(8)}</Step.Title>
                                                <Step.Description>{new Date(event.timestamp.toNumber()).toLocaleString()}</Step.Description>
                                            </Step.Content>
                                        </Step>
                                    );
                            })
                            }
                        </Step.Group> : <div>No event found</div>
                }
            </Grid.Column>
            <Grid.Column width={8}>
                <Header as="h3">Products</Header>
                { 
                    shipment && shipment.products ?
                        <List>
                            {shipment.products
                                .map((productId, idx) => {
                                return <List.Item key={idx}>{productId.toString()}</List.Item >;
                            })
                            }
                        </List > : <div>No event found</div>
                }
            </Grid.Column>
        </Grid>
    </Container>
  );
}

export default function ShipmentDetails (props) {
  const { api } = useSubstrate();
  return api ? <ShipmentDetailsComponent {...props} /> : null;
}
