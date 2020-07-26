import React, { useState, Fragment } from 'react';
import { Container, Divider, Grid } from 'semantic-ui-react';

import Events from './Events';
import RegisterShipmentForm from './RegisterShipmentForm';
import ShipmentList from './ShipmentList';
import ShipmentDetails from './ShipmentDetails';

export default function Main (props) {
  const { accountPair } = props;
  const [selectedShipment, setSelectedShipment] = useState('');

  return (
    <Container>
      <Grid columns="2">
        <Grid.Column style={{ display: 'flex' }}>
          <RegisterShipmentForm accountPair={accountPair} />
        </Grid.Column>
        <Grid.Column style={{ display: 'flex' }}>
          <Events />
        </Grid.Column>
      </Grid>
      <Header as='h2'>Shipment Listing</Header>
      <ShipmentList accountPair={accountPair} setSelectedShipment={setSelectedShipment} />
      { selectedShipment
        ? <Fragment>
          <Divider style={{ marginTop: '2em' }} />
          <ShipmentDetails shipmentId={selectedShipment} />
        </Fragment>
        : null
      }

    </Container>
  );
}
