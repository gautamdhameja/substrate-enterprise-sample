import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Container,
  Dropdown,
  Header,
  Icon,
  Menu,
  Responsive,
  Segment,
  Sidebar,
  Visibility,
  List
} from 'semantic-ui-react';

const getWidth = () => {
  const isSSR = typeof window === 'undefined';

  return isSSR ? Responsive.onlyTablet.minWidth : window.innerWidth;
};

const HomepageHeading = ({ mobile }) => (
  <Container text>
    <Header
      as='h1'
      content='Substrate Enterprise Sample'
      inverted
      style={{
        fontSize: mobile ? '2em' : '4em',
        fontWeight: 'normal',
        marginBottom: 0,
        marginTop: mobile ? '1.5em' : '3em'
      }}
    />
    <Header
      as='h2'
      content='A sample application that demonstrates a decentralized consortium managing a supply chain.'
      inverted
      style={{
        fontSize: mobile ? '1.5em' : '1.7em',
        fontWeight: 'normal',
        marginTop: mobile ? '0.5em' : '1.5em'
      }}
    />
    <Button
      as={Link} to='/demo'
      primary size='huge'
    >
      Get Started
      <Icon name='right arrow' />
    </Button>
  </Container>
);

HomepageHeading.propTypes = {
  mobile: PropTypes.bool
};

class DesktopContainer extends Component {
  state = {}

  hideFixedMenu = () => this.setState({ fixed: false })
  showFixedMenu = () => this.setState({ fixed: true })

  render () {
    const { children } = this.props;
    const { fixed } = this.state;
    return (
      <Responsive getWidth={getWidth} minWidth={Responsive.onlyTablet.minWidth}>
        <Visibility
          once={false}
          onBottomPassed={this.showFixedMenu}
          onBottomPassedReverse={this.hideFixedMenu}
        >
          <Segment
            inverted
            textAlign='center'
            style={{ minHeight: 700, padding: '1em 0em' }}
            vertical
          >
            <Menu
              fixed={fixed ? 'top' : null}
              inverted={!fixed}
              pointing={!fixed}
              secondary={!fixed}
              size='large'
            >
              <Container>
                <Menu.Item as='a' active>Home</Menu.Item>
                <Menu.Item as={Link} to='/demo'>Demo</Menu.Item>
                <Dropdown item text = 'External'>
                  <Dropdown.Menu>
                    <Dropdown.Item href="https://substrate.dev" target="_blank">Substrate</Dropdown.Item>
                    <Dropdown.Item href="https://parity.io" target="_blank">Parity</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Container>
            </Menu>
            <HomepageHeading/>
          </Segment>
        </Visibility>

        {children}
      </Responsive>
    );
  }
}

DesktopContainer.propTypes = {
  children: PropTypes.node
};

class MobileContainer extends Component {
  state = {}

  handleSidebarHide = () => this.setState({ sidebarOpened: false })

  handleToggle = () => this.setState({ sidebarOpened: true })

  render () {
    const { children } = this.props;
    const { sidebarOpened } = this.state;

    return (
      <Responsive
        as={Sidebar.Pushable}
        getWidth={getWidth}
        maxWidth={Responsive.onlyMobile.maxWidth}
      >
        <Sidebar
          as={Menu}
          animation='push'
          inverted
          onHide={this.handleSidebarHide}
          vertical
          visible={sidebarOpened}
        >
          <Menu.Item as='a' active>Home</Menu.Item>
          <Menu.Item as={Link} to='/demo'>Demo</Menu.Item>
          <Menu.Item as='a' href="https://substrate.dev" target="_blank">
            Substrate
            <Icon name='external' />
          </Menu.Item>
          <Menu.Item as='a' href="https://parity.io" target="_blank">
            Parity
            <Icon name='external' />
          </Menu.Item>
        </Sidebar>

        <Sidebar.Pusher dimmed={sidebarOpened}>
          <Segment
            inverted
            textAlign='center'
            style={{ minHeight: 350, padding: '1em 0em' }}
            vertical
          >
            <Container>
              <Menu inverted pointing secondary size='large'>
                <Menu.Item onClick={this.handleToggle}>
                  <Icon name='sidebar' />
                </Menu.Item>
              </Menu>
            </Container>
            <HomepageHeading mobile />
          </Segment>

          {children}
        </Sidebar.Pusher>
      </Responsive>
    );
  }
}

MobileContainer.propTypes = {
  children: PropTypes.node
};

const ResponsiveContainer = ({ children }) => (
  <div>
    <DesktopContainer>{children}</DesktopContainer>
    <MobileContainer>{children}</MobileContainer>
  </div>
);

ResponsiveContainer.propTypes = {
  children: PropTypes.node
};

const Homepage = () => (
  <ResponsiveContainer>
    <Segment id='homepage' style={{ padding: '4em 0em' }} vertical>
      <Container text>
        <p className='homepage-content'>
          The <strong>Substate Enterprise Sample</strong> demonstrates how a software engineering team can leverage&nbsp;
          <a href="https://www.substrate.io/">the Parity Substrate framework</a> and its standard&nbsp;
          <a href="https://substrate.dev/docs/en/knowledgebase/runtime/frame">FRAME</a> library to quickly build an&nbsp;
          application-specific blockchain by creating and composing runtime modules (known as "pallets").&nbsp;
          Included in the sample is a custom front-end that was created using the helpful&nbsp;
          <a href="https://github.com/substrate-developer-hub/substrate-front-end-template">Substrate front-end template</a>,&nbsp;
          which itself makes use of the powerful <a href="https://polkadot.js.org/">Polkadot JS</a> API. The&nbsp;
          <a href="https://github.com/substrate-developer-hub/substrate-enterprise-sample/tree/master/chain">chain</a> included&nbsp;
          in this sample is a fork of the official&nbsp;
          <a href="https://github.com/substrate-developer-hub/substrate-node-template">Substrate node template</a>.
        </p>
        <p className='homepage-content'>
          The use case that this sample demonstrates is a collaborative supply-chain ecosystem. In order to&nbsp;
          accomplish this, Substrate is used to implement existing standards, such as&nbsp;
          <a href="https://en.wikipedia.org/wiki/Decentralized_identifiers">decentralized identifiers (DIDs)</a>.
        </p>
        <p className='homepage-content'>Capabilities include:</p>
        <List bulleted className='homepage-list'>
          <List.Item content="Setup a shared platform (permissioned blockchain network) among several organisations."/>
          <List.Item content="Manage decentralized identities for member organisations and their delegates."/>
          <List.Item content="Register master data about products, including the organisation that owns them."/>
          <List.Item content="Register a shipment and track its journey through the supply chain."/>
          <List.Item content="Monitor a shipment's storage and transportation conditions."/>
          <List.Item content="Enable seamless data integration with existing ERP (enterprise resource planning) systems deployed within corporate walls." />
        </List>
        <p className='homepage-content'>
          The sample demonstrates many features and capabilities of the <a href="https://github.com/paritytech/substrate">Parity Substrate framework</a>, including:
        </p>
        <List bulleted className='homepage-list'>
          <List.Item content="Consortium network with a proof-of-authority consensus (Aura for block production, GRANDPA for block finalization)."/>
          <List.Item content="Dynamic set of authority nodes."/>
          <List.Item content="Role-based access control."/>
          <List.Item content="Reliable data integration with off-chain workers."/>
          <List.Item content="Flexible blockchain runtime development that uses FRAME pallets to encapsulate domain-specific logic (e.g. separate pallets for product registry and tracking)."/>
        </List>

        <Header as='h3' className='homepage-header'>
          Related Github Repositories
        </Header>
        <List bulleted className='homepage-list'>
          <List.Item content="Decentralized Identifier Pallet" href="https://github.com/substrate-developer-hub/pallet-did"/>
          <List.Item content="Role-Based Access Control Pallet" href="https://github.com/gautamdhameja/substrate-rbac"/>
          <List.Item content="Validator Set Pallet" href="https://github.com/gautamdhameja/substrate-validator-set"/>
        </List>

        <Header as='h3' className='homepage-header'>Learn More</Header>

        <List bulleted className='homepage-list'>
          <List.Item content="Substrate Developer Hub" href="https://substrate.dev"/>
          <List.Item
            content="Element Technical Chat"
            href="https://app.element.io/#/room/!HzySYSaIhtyWrwiwEV:matrix.org"
          />
        </List>
      </Container>
    </Segment>
  </ResponsiveContainer>
);

export default Homepage;
