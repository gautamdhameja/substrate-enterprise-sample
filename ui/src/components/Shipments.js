import React, { useState } from 'react';
import { Container, Divider, Grid } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import RegisterShipmentForm from './RegisterShipmentForm';
import ShipmentList from './ShipmentList';
import ShipmentDetails from './ShipmentDetails';

export default function Main(props) {
  const { account } = props;
  const [selectedShipment, setSelectedShipment] = useState('');

  return (
    <Container>
      <Grid columns="2">
        <Grid.Column>
          {/* For testing only, to be moved to a popup */}
          <RegisterShipmentForm accountPair={account} />
        </Grid.Column>
        <Grid.Column>
          <ShipmentList account={account} onShipmentSelected={shipment => setSelectedShipment(shipment)} />
        </Grid.Column>
      </Grid>
      <Divider style={{ marginTop: '2em' }} />
      <ShipmentDetails shipmentId={selectedShipment} />
    </Container>
  );
}
