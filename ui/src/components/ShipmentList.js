import React, { useEffect, useState } from 'react';
import { Table, Message } from 'semantic-ui-react';
import { u8aToString } from '@polkadot/util';

import { useSubstrate } from '../substrate-lib';

export default function Main (props) {
  const { accountPair, setSelectedShipment } = props;
  const { api } = useSubstrate();
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

    if (accountPair) {
      shipments(accountPair);
    }

    return () => unsub && unsub();
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [accountPair, api.query.productTracking]);

  const handleSelectionClick = (id) => {
    setSelectedShipment(id);
    setSelected(id);
  };

  if (!shipments || shipments.length === 0) {
    return <Message warning>
      <Message.Header>No shipment registered for your organisation.</Message.Header>
      <p>Please create one using the above form.</p>
    </Message>;
  }

  return (
    <Table color='blue' selectable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>ID</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>{ shipments.map(shipment => {
        const id = u8aToString(shipment);
        return <Table.Row key={id}>
          <Table.Cell active={selected === id}
            onClick={() => handleSelectionClick(id)}>
            { id }
          </Table.Cell>
        </Table.Row>;
      })}</Table.Body>
    </Table>
  );
}
