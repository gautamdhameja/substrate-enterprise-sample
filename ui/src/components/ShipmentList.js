import React, { useEffect, useState } from 'react';
import { Container, Header, List } from 'semantic-ui-react';
import { useSubstrate } from '../substrate-lib';
import { hexToString } from '@polkadot/util';

function ShipmentListComponent (props) {
  const { api } = useSubstrate();
  const { accountPair, setSelectedShipment } = props;
  const [shipments, setShipments] = useState([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    async function shipments (accountPair) {
      const addr = accountPair.address;
      await api.query.productTracking.shipmentsOfOrganization(addr, data => {
        setShipments(data);
        setSelectedShipment('');
        setSelected('');
      });
    }

    if (accountPair) {
      shipments(accountPair);
    }
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [accountPair, api.query.productTracking]);

  const handleSelectionClick = (ev, { data }) => {
    const shipment = hexToString(shipments[data].toString());
    console.log(shipment);
    setSelectedShipment(shipment);
    setSelected(shipment);
  };

  return (
    <Container>
      <Header as="h2">Shipments of Organization</Header>
      { shipments
        ? <List selection>
          { shipments.map((shipment, idx) => {
            const shipmentId = hexToString(shipment.toString());
            return <List.Item key={idx} active={selected === shipmentId} header={shipmentId}
              onClick={handleSelectionClick} data={idx}/>;
          }) }
        </List>
        : <div>No shipment found</div>
      }
    </Container>
  );
}

export default function ShipmentList (props) {
  const { api } = useSubstrate();
  return api ? <ShipmentListComponent {...props} /> : null;
}
