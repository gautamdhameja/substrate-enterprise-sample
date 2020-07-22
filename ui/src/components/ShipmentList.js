import React, { useEffect, useState } from 'react';
import { Container, Header, List } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { useSubstrate } from '../substrate-lib';
import { hexToString } from '@polkadot/util';

function ShipmentListComponent (props) {
  const { api } = useSubstrate();
  const { account, onShipmentSelected } = props;
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState('');

  useEffect(() => {
    let unsubscribe;

    async function shipments (account) {
      await api.query.productTracking.shipmentsOfOrganization(account, data => {
        setShipments(data);
        setSelectedShipment('');
        onShipmentSelected('');
      });
    }

    if (account) {
      shipments(account);
    } else {
      return () => unsubscribe && unsubscribe();
    }
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [account, api.query.productTracking]);

  const handleSelectionClick = (index) => {
    if (index >= 0) {
      const shipment = hexToString(shipments[index].toString());
      setSelectedShipment(shipment);
      if (onShipmentSelected) {
        onShipmentSelected(shipment);
      }
    }
  };

  return (
    <Container>
      <Header as="h2">Shipments of Organization</Header>
      <Header as="h4">Choose a shipment:</Header>
      { shipments
        ? <List selection>
          { shipments.map((shipment, idx) => {
            const shipmentId = hexToString(shipment.toString());
            const isSelected = selectedShipment === shipmentId;
            return (
              <List.Item key={idx} active={isSelected} header={shipmentId}
                onClick={() => handleSelectionClick(idx)}/>
            );
          })
          }
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
