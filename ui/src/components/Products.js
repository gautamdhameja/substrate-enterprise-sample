import React, { useState, Fragment } from 'react';
import { Header, Grid, Divider } from 'semantic-ui-react';

import Events from './Events';
import OrganizationSelector from './OrganizationSelector';
import ProductList from './ProductList';
import RegisterProductForm from './RegisterProductForm';

export default function Main (props) {
  const { accountPair } = props;
  const [selectedOrganization, setSelectedOrganization] = useState('');

  return <Fragment>
    <Grid>
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
          <RegisterProductForm accountPair={accountPair}
            organization={selectedOrganization} />
        </Grid.Column>
        <Grid.Column width={8} style={{ display: 'flex' }}>
          <Events />
        </Grid.Column>
      </Grid.Row>

    </Grid>
    <Divider style={{ marginTop: '2em' }} />
    <Header as='h2'>Product Listing</Header>
    <ProductList accountPair={accountPair} organization={selectedOrganization} />
  </Fragment>;
}
