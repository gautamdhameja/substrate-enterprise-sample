import React, { useState } from 'react';
import { Container, Divider, Grid, Header } from 'semantic-ui-react';

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
        <Grid.Column>
          {/* For testing only, to be moved to a popup */}
          <RegisterShipmentForm accountPair={accountPair} />
        </Grid.Column>
        <Grid.Column>
          <Events />
        </Grid.Column>
      </Grid>
      <Header as='h2'>Shipment Listing</Header>
      <ShipmentList accountPair={accountPair} setSelectedShipment={setSelectedShipment} />
      <Divider style={{ marginTop: '2em' }} />
      <ShipmentDetails shipmentId={selectedShipment} />
    </Container>
  );
}
