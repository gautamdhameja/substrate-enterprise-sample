import React from 'react';
import { Grid } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import AddToOrg from './AddToOrg';
import CreateOrg from './CreateOrg';
import Events from './Events';

export default function Main (props) {
  const { accountPair } = props;

  return <Grid columns="2">
    <Grid.Row>
      <Grid.Column style={{ display: 'flex' }} >
        <CreateOrg accountPair={accountPair} />
      </Grid.Column>
      <Grid.Column style={{ display: 'flex' }}>
        <Events />
      </Grid.Column>
    </Grid.Row>
    <Grid.Row>
      <Grid.Column>
        <AddToOrg accountPair={accountPair} />
      </Grid.Column>
    </Grid.Row>
  </Grid>;
}
