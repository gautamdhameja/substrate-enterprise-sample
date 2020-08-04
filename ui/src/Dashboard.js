import React, { useState, createRef } from 'react';
import { Tab, Container, Dimmer, Loader, Grid, Message, Sticky } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import { SubstrateContextProvider, useSubstrate } from './substrate-lib';
import { DeveloperConsole } from './substrate-lib/components';
import { AccountSelector, Members, Organizations, Products, Shipments, TopNavMenu, Tracking } from './components';

const Dashboard = (props) => {
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

  const panes = [
    { menuItem: 'Organizations', render: () => <Organizations accountPair={accountPair} /> },
    { menuItem: 'Members', render: () => <Members accountPair={accountPair} /> },
    { menuItem: 'Products', render: () => <Products accountPair={accountPair} /> },
    { menuItem: 'Shipments', render: () => <Shipments accountPair={accountPair} /> },
    { menuItem: 'Tracking', render: () => <Tracking accountPair={accountPair} /> }
  ];

  const contextRef = createRef();

  return (
    <div ref={contextRef}>
      <TopNavMenu />
      <Sticky context={contextRef}>
        <AccountSelector setAccountAddress={setAccountAddress} />
      </Sticky>

      <Container>
        <Tab menu={{ fluid: true, vertical: true, tabular: true }} panes={panes} />
      </Container>
    </div>
  );
};

export default function DashboardWithContext (props) {
  return (
    <SubstrateContextProvider>
      <Dashboard {...props} />
      <DeveloperConsole />
    </SubstrateContextProvider>
  );
}
