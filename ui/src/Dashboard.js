import React, { useState, createRef } from 'react';
import { Tab, Container, Dimmer, Loader, Grid, Message, Sticky } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import { SubstrateContextProvider, useSubstrate } from './substrate-lib';
import { DeveloperConsole } from './substrate-lib/components';
import { AccountSelector, Members, Organizations, Products, Shipments, TopNavMenu } from './components';

import AccountSelector from './AccountSelector';
import Events from './Events';
import Identifiers from './Identifiers';
import Products from './Products';
import ProductTracking from './ProductTracking';
import ProductLog from './ProductLog';
import Transfer from './Transfer';
import RegisterProductForm from './RegisterProductForm';
import ShipmentTrackingPage from './ShipmentTrackingPage';

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

  const panes = [
    { menuItem: 'Organizations', render: () => <Organizations accountPair={accountPair} /> },
    { menuItem: 'Members', render: () => <Members accountPair={accountPair} /> },
    { menuItem: 'Products', render: () => <Products accountPair={accountPair} /> },
    { menuItem: 'Shipments', render: () => <Shipments accountPair={accountPair} /> }
  ];

  const contextRef = createRef();

  return (
    <div ref={contextRef}>
      <Menu>
        <Container>
          <Menu.Item as={Link} to='/'>Home</Menu.Item>
          <Menu.Item as={Link} to='/ChainData' active>Demo</Menu.Item>
          <Menu.Item as={Link} to='/ShipmentTracking'>Shipment</Menu.Item>
          <Menu.Item href="https://substrate.io">Substrate</Menu.Item>
          <Menu.Item href="https://parity.io">Parity</Menu.Item>
        </Container>
      </Menu>
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
          <Divider horizontal>Product Tracking</Divider>
          <Grid.Row stretched>
            <ProductTracking accountPair={accountPair} />
          </Grid.Row>
          <Grid.Row stretched>
            <ProductLog accountPair={accountPair} />
          </Grid.Row>
          <Grid.Row>
            <Transfer accountPair={accountPair} />
            <Events />
          </Grid.Row>
          <Divider horizontal>Register product</Divider>
          <Grid.Row stretched>
            <RegisterProductForm accountPair={accountPair} />
          </Grid.Row>
        </Grid>
      </Container>

      <DeveloperConsole />
    </div>
  );
};

export default function DashboardWithContext (props) {
  return (
    <SubstrateContextProvider>
      <Dashboard {...props} />
    </SubstrateContextProvider>
  );
}
