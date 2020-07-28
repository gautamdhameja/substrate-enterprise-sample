import React, { useState } from 'react';
import { Container, Divider, Grid, Header } from 'semantic-ui-react';

import Events from './Events';
import OrganizationSelector from './OrganizationSelector';
import RegisterShipmentForm from './RegisterShipmentForm';
import ShipmentList from './ShipmentList';

export default function Main (props) {
  const { accountPair } = props;
  const [selectedOrganization, setSelectedOrganization] = useState('');

  return <Container>
    <Grid columns="2">
      <Grid.Row>
        <Grid.Column width={16}>
          <OrganizationSelector
            accountPair={accountPair}
            setSelectedOrganization={setSelectedOrganization}
          />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width={8} style={{ display: 'flex' }}>
          <RegisterShipmentForm accountPair={accountPair}
            organization={selectedOrganization} />
        </Grid.Column>
        <Grid.Column width={8} style={{ display: 'flex' }}>
          <Events />
        </Grid.Column>
      </Grid.Row>
    </Grid>
    <Divider style={{ marginTop: '2em' }} />
    <Header as='h2'>Shipment Listing</Header>
    <ShipmentList accountPair={accountPair}
      organization={selectedOrganization}
    />
  </Container>;
}
