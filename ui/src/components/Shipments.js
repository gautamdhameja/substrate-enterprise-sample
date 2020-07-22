import React, { useState } from 'react';
import { Container, Divider } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import ShipmentList from './ShipmentList';
import ShipmentDetails from './ShipmentDetails';

export default function Main (props) {
  const { account } = props;
  const [selectedShipment, setSelectedShipment] = useState('');

  return (
    <Container>
      <ShipmentList account={account} onShipmentSelected={shipment => setSelectedShipment(shipment)} />
      <Divider style={{ marginTop: '2em' }}/>
      <ShipmentDetails shipmentId={selectedShipment} />
    </Container>
  );
}
