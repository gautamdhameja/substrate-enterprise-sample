import React, { useEffect, useState } from 'react';
import { Card, List } from 'semantic-ui-react';
import { useSubstrate } from '../substrate-lib';
import { hexToString } from '@polkadot/util';

function ShipmentListComponent (props) {
  const { api } = useSubstrate();
  const { accountPair, setSelectedShipment } = props;
  const [shipments, setShipments] = useState([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    let unsub = null;

    async function shipments (accountPair) {
      const addr = accountPair.address;
      unsub = await api.query.productTracking.shipmentsOfOrganization(addr, data => {
        setShipments(data);
        setSelectedShipment('');
        setSelected('');
      });
    }

    if (accountPair) shipments(accountPair);
    return () => unsub && unsub();
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [accountPair, api.query.productTracking]);

  const handleSelectionClick = (ev, { data }) => {
    const shipment = hexToString(shipments[data].toString());
    setSelectedShipment(shipment);
    setSelected(shipment);
  };

  return <Card fluid>
    <Card.Content style={{ flexGrow: 0 }} header = 'Shipment List' />
    <Card.Content>
      <Card.Description>{ shipments
        ? <List selection>
          { shipments.map((shipment, idx) => {
            const shipmentId = hexToString(shipment.toString());
            return <List.Item key={idx} active={selected === shipmentId} header={shipmentId}
              onClick={handleSelectionClick} data={idx}/>;
          }) }</List>
        : <div>No shipment found</div>
      }</Card.Description>
    </Card.Content>
  </Card>;
}

export default function ShipmentList (props) {
  const { api } = useSubstrate();
  return api ? <ShipmentListComponent {...props} /> : null;
}
