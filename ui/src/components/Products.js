import React, { Fragment } from 'react';
import { Header, Grid, Divider } from 'semantic-ui-react';

import Events from './Events';
import ProductList from './ProductList';
import RegisterProductForm from './RegisterProductForm';

export default function Main (props) {
  const { accountPair } = props;

  return (
    <Fragment>
      <Grid>
        <Grid.Column width={8} style={{ display: 'flex' }}>
          <RegisterProductForm accountPair={accountPair} />
        </Grid.Column>
        <Grid.Column width={8} style={{ display: 'flex' }}>
          <Events />
        </Grid.Column>
      </Grid>
      <Divider style={{ marginTop: '2em' }} />
      <Header as='h2'>Product Listing</Header>
      <ProductList accountPair={accountPair} />
    </Fragment>
  );
}
