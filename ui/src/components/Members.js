import React from 'react';
import { Grid } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import CreateRole from './CreateRole';
import AssignRevokeRole from './AssignRevokeRole';
import AddSuperAdmin from './AddSuperAdmin';
import Events from './Events';

export default function Main (props) {
  const { accountPair } = props;

  return <Grid columns="2">
    <Grid.Row>
      <Grid.Column style={{ display: 'flex' }}>
        <CreateRole accountPair={accountPair} />
      </Grid.Column>
      <Grid.Column style={{ display: 'flex' }}>
        <Events />
      </Grid.Column>
    </Grid.Row>
    <Grid.Row>
      <Grid.Column style={{ display: 'flex' }}>
        <AssignRevokeRole accountPair={accountPair} />
      </Grid.Column>
      <Grid.Column style={{ display: 'flex' }}>
        <AddSuperAdmin accountPair={accountPair} />
      </Grid.Column>
    </Grid.Row>
  </Grid>;
}
