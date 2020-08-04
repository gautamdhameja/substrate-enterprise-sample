import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Container,
  Divider,
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
      content='Track products at every step on your supply chain.'
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
        <Header as='h3' className='homepage-header'>
          What is this sample about?
        </Header>
        <p className='homepage-content'>
          The <strong>Substate Enterprise Sample</strong> demonstrates how a software engineering team can quickly build an <strong>application-specific Blockchain</strong> and related applications, by leveraging the <strong>Parity Substrate framework</strong> and its standard <strong>FRAME library</strong>, as well as building composable runtime modules (known as pallets).
        </p>
        <p className='homepage-content'>
          The sample implements, in a simplified manner, a Blockchain-based solution for a collaborative supply-chain ecosystem.
        </p>
        <p className='homepage-content'>Among others, it allows to:</p>
        <List bulleted className='homepage-list'>
          <List.Item content="Setup a shared platform among several organisations, as a permissioned Blockchain network."/>
          <List.Item content="Manage decentralized identities for member organisations and their delegates."/>
          <List.Item content="Register master data about products and their owning organisations."/>
          <List.Item content="Register a shipment and track its journey through the value chain."/>
          <List.Item content="Monitor a shipment's storage and transportation conditions."/>
          <List.Item content="Enable seamless data integration with existing ERP systems deployed within corporate walls." />
        </List>
        <p className='homepage-content'>Specific features of the <strong>Parity Substrate framework</strong> exhibited:</p>
        <List bulleted className='homepage-list'>
          <List.Item content="Consortium network with a Proof-of-Authority consensus (Aura for block production, GRANDPA for block finalization)."/>
          <List.Item content="Dynamic set of authority nodes."/>
          <List.Item content="Enterprise-class role-based access control."/>
          <List.Item content="W3C Decentralized Identifiers (DIDs) for organizations & delegates."/>
          <List.Item content="Substrate Node & Frontend starter templates."/>
          <List.Item content="Unrestricted flexibility for runtime logic & storage in custom pallets e.g. product registry & tracking pallets."/>
          <List.Item content="Reliable off-chain data integration with Offchain workers."/>
        </List>

        <Header as='h3' className='homepage-header'>
          Related Github Repositories
        </Header>
        <List bulleted className='homepage-list'>
          <List.Item as='a' content="Parity Substrate framework" href="https://github.com/paritytech/substrate"/>
          <List.Item content="Polkadot Javascript libraries" href="https://github.com/polkadot-js/"/>
          <List.Item content="Substrate Enterprise sample" href="https://github.com/gautamdhameja/substrate-enterprise-sample" />
          <List.Item content="Substrate Frontend template" href="https://github.com/substrate-developer-hub/substrate-front-end-template"/>
          <List.Item content="Substrate Node template" href="https://github.com/substrate-developer-hub/substrate-node-template" />
          <List.Item content="DID pallet" href="https://github.com/substrate-developer-hub/pallet-did"/>
          <List.Item content="Product Registry pallet" href="https://github.com/stiiifff/pallet-product-registry"/>
          <List.Item content="Product Tracking pallet" href="https://github.com/stiiifff/pallet-product-tracking"/>
          <List.Item content="RBAC pallet" href="https://github.com/gautamdhameja/substrate-rbac"/>
          <List.Item content="Validator Set pallet" href="https://github.com/gautamdhameja/substrate-validator-set"/>
        </List>

        <Header as='h3' className='homepage-header'>Get Started</Header>

        <List bulleted className='homepage-list'>
          <List.Item content="Substrate Developer Hub" href="https://substrate.dev"/>
          <List.Item
            content="Ask Questions"
            href="https://riot.im/app/#/room/!HzySYSaIhtyWrwiwEV:matrix.org"
          />
        </List>
      </Container>
    </Segment>
  </ResponsiveContainer>
);

export default Homepage;
