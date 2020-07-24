import React from 'react';
import { Container, Divider, Grid } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import CreateRole from './CreateRole';
import AddSuperAdmin from './AddSuperAdmin';
import AssignRole from './AssignRole';
import RevokeAccess from './RevokeAccess';

export default function Main (props) {
  const { accountPair } = props;

  return (
    <Container>
      <Grid columns="2">
        <Grid.Column>
          <CreateRole accountPair={accountPair} />
          <AssignRole accountPair={accountPair} />
          <RevokeAccess accountPair={accountPair} />
          <AddSuperAdmin accountPair={accountPair} />
        </Grid.Column>
      </Grid>
      <Divider style={{ marginTop: '2em' }} />
    </Container>
  );
}
