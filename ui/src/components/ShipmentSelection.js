import React, { useEffect, useState } from 'react';
import { Card, List, Message } from 'semantic-ui-react';
import { useSubstrate } from '../substrate-lib';
import { hexToString } from '@polkadot/util';

export default function Main (props) {
  const { api } = useSubstrate();
  const { organization, setSelectedShipment } = props;
  const [shipments, setShipments] = useState([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    let unsub = null;

    async function shipments (organization) {
      unsub = await api.query.productTracking.shipmentsOfOrganization(organization, data => {
        setShipments(data);
        setSelectedShipment('');
        setSelected('');
      });
    }

    if (organization) {
      shipments(organization);
    } else {
      setShipments([]);
      setSelectedShipment('');
      setSelected('');
    }

    return () => unsub && unsub();
  }, [organization, api.query.productTracking, setSelectedShipment]);

  const handleSelectionClick = (ev, { data }) => {
    const shipment = hexToString(shipments[data].toString());
    setSelectedShipment(shipment);
    setSelected(shipment);
  };

  if (!shipments || shipments.length === 0) {
    return <Message warning>
      <Message.Header>No shipment registered for your organisation.</Message.Header>
    </Message>;
  }

  return <Card fluid color = 'blue'>
    <Card.Content style={{ flexGrow: 0 }} header = 'Select a Shipment' />
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
