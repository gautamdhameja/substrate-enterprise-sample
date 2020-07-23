import React, { useState } from 'react';
import { Container, Divider } from 'semantic-ui-react';

import ShipmentList from './ShipmentList';
import ShipmentDetails from './ShipmentDetails';

export default function Main (props) {
  const { accountPair } = props;
  const [selectedShipment, setSelectedShipment] = useState('');

  return (
    <Container>
      <ShipmentList accountPair={accountPair} setSelectedShipment={setSelectedShipment} />
      <Divider style={{ marginTop: '2em' }}/>
      <ShipmentDetails shipmentId={selectedShipment} />
    </Container>
  );
}
