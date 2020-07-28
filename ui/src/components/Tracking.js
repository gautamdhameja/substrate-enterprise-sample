import React, { useState, Fragment } from 'react';
import { Container, Divider, Grid } from 'semantic-ui-react';

import Events from './Events';
import OrganizationSelector from './OrganizationSelector';
import ShipmentSelection from './ShipmentSelection';
import ShipmentDetails from './ShipmentDetails';

export default function Main (props) {
  const { accountPair } = props;
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [selectedShipment, setSelectedShipment] = useState('');

  return (
    <Container>
      <OrganizationSelector accountPair={accountPair} setSelectedOrganization={setSelectedOrganization}/>
      <Grid columns="2">
        <Grid.Column width={8} style={{ display: 'flex' }}>
          <ShipmentSelection accountPair={accountPair}
            organization={selectedOrganization}
            setSelectedShipment={setSelectedShipment} />
        </Grid.Column>
        <Grid.Column width={8} style={{ display: 'flex' }}>
          <Events />
        </Grid.Column>
      </Grid>
      { selectedShipment
        ? <Fragment>
          <Divider style={{ marginTop: '2em' }} />
          <ShipmentDetails accountPair={accountPair} shipmentId={selectedShipment} />
        </Fragment>
        : null
      }
    </Container>
  );
}
