import React, { useEffect, useState, createRef } from 'react';
import { Container, Dimmer, Divider, Loader, Header, Grid, Segment, Sticky, Message, Menu } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { Link } from 'react-router-dom';

import { useSubstrate } from './substrate-lib';
import { DeveloperConsole } from './substrate-lib/components';

import AccountSelector from './AccountSelector';
import ShipmentDetails from './ShipmentDetails';

function ShipmentTrackingComponent (props) {
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
            <ShipmentDetails shipmentId='S0001'/>
          </Grid.Row>
        </Grid>
      </Container>
      <DeveloperConsole />
    </div>
  );
}

export default function ShipmentTrackingPage (props) {
  const { api } = useSubstrate();
  return api ? <ShipmentTrackingComponent {...props} /> : null;
}
