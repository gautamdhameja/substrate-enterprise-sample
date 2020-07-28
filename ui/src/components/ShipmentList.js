import React, { useEffect, useState } from 'react';
import { Table, Message } from 'semantic-ui-react';
import { u8aToString } from '@polkadot/util';

import { useSubstrate } from '../substrate-lib';

export default function Main (props) {
  const { organization } = props;
  const { api } = useSubstrate();
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    let unsub = null;

    async function shipments (organization) {
      unsub = await api.query.productTracking.shipmentsOfOrganization(organization, shipmentIds => {
        api.query.productTracking.shipments.multi(shipmentIds, shipments => {
          const validShipments = shipments
            .filter(shipment => !shipment.isNone)
            .map(shipment => shipment.unwrap());
          setShipments(validShipments);
        });
      });
    }

    if (organization) {
      shipments(organization);
    } else {
      setShipments([]);
    }

    return () => unsub && unsub();
  }, [organization, api.query.productTracking]);

  if (!shipments || shipments.length === 0) {
    return <Message warning>
      <Message.Header>No shipment registered for your organisation.</Message.Header>
      <p>Please create one using the above form.</p>
    </Message>;
  }

  return <Table color='blue'>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>ID</Table.HeaderCell>
        <Table.HeaderCell>Owner</Table.HeaderCell>
        <Table.HeaderCell>Status</Table.HeaderCell>
        <Table.HeaderCell>Products</Table.HeaderCell>
      </Table.Row>
    </Table.Header>

    <Table.Body>{ shipments.map(shipment => {
      const id = u8aToString(shipment.id);
      const products = shipment.products.map(p => u8aToString(p));
      return <Table.Row key={id}>
        <Table.Cell>{ id }</Table.Cell>
        <Table.Cell>{ shipment.owner.toString() }</Table.Cell>
        <Table.Cell>{ shipment.status.toString() }</Table.Cell>
        <Table.Cell>{ products.map(p => {
          return <div key={`${id}-${p}`}>{p}</div>;
        }) }</Table.Cell>
      </Table.Row>;
    })}</Table.Body>
  </Table>;
}
