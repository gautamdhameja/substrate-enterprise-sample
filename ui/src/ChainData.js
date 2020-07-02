import React, { useState, createRef } from 'react';
import { Container, Dimmer, Divider, Loader, Grid, Sticky, Message } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import { useSubstrate } from './substrate-lib';
import { DeveloperConsole } from './substrate-lib/components';

import AccountSelector from './AccountSelector';
import Events from './Events';
import Identifiers from './Identifiers';
import Products from './Products';
// import Metadata from './Metadata';
// import NodeInfo from './NodeInfo';
import Transfer from './Transfer';
import HomepageLayout from './Homepage';

const ChainData = () => {
  const [accountAddress, setAccountAddress] = useState(null);
  const { apiState, keyring, keyringState, apiError } = useSubstrate();
  const accountPair =
    accountAddress &&
    keyringState === 'READY' &&
    keyring.getPair(accountAddress);

  const loader = text =>
    <Dimmer active>
      <Loader size='small'>{text}</Loader>
    </Dimmer>;

  const message = err =>
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message negative compact floating
          header='Error Connecting to Substrate'
          content={`${err}`}
        />
      </Grid.Column>
    </Grid>;

  if (apiState === 'ERROR') return message(apiError);
  else if (apiState !== 'READY') return loader('Connecting to Substrate');

  if (keyringState !== 'READY') {
    return loader('Loading accounts (please review any extension\'s authorization)');
  }

  const contextRef = createRef();

  return (
    <div ref={contextRef}>
      <HomepageLayout/>
      <Sticky context={contextRef}>
        <AccountSelector setAccountAddress={setAccountAddress} />
      </Sticky>
      <Container>
        <Grid stackable columns='equal'>
          <Grid.Row stretched>
          </Grid.Row>
          <Divider horizontal>Organizations</Divider>
          <Grid.Row stretched>
            <Identifiers accountPair={accountPair} />
          </Grid.Row>
          <Divider horizontal>Products</Divider>
          <Grid.Row stretched>
            <Products accountPair={accountPair} />
          </Grid.Row>
          <Grid.Row>
            <Transfer accountPair={accountPair} />
            <Events />
          </Grid.Row>
        </Grid>
      </Container>
      <DeveloperConsole />
    </div>
  );
  // return (
  //   <h2>chain data</h2>
  // );
};

export default ChainData;
