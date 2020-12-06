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
                    <Dropdown.Item href="https://github.com/substrate-developer-hub/substrate-enterprise-sample" target="_blank">GitHub</Dropdown.Item>
                    <Dropdown.Item href="https://substrate.io" target="_blank">Substrate</Dropdown.Item>
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
          <Menu.Item as='a' href="https://github.com/substrate-developer-hub/substrate-enterprise-sample" target="_blank">
            GitHub
            <Icon name='external' />
          </Menu.Item>
          <Menu.Item as='a' href="https://substrate.io" target="_blank">
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
          The <strong>Substate Enterprise Sample</strong> demonstrates how the <a href="https://www.substrate.io/">Substrate</a> framework for building
          blockchains and its standard <a href="https://substrate.dev/docs/en/knowledgebase/runtime/frame">FRAME</a> library for runtime development can be
          used to quickly build an ergonomic, end-to-end, blockchain-based application. This sample includes a custom front-end that was created from the
          helpful <a href="https://github.com/substrate-developer-hub/substrate-front-end-template">Substrate Front-End Template</a>, which itself makes use of
          the powerful <a href="https://polkadot.js.org/">Polkadot&#123;JS&#125;</a> API. The&nbsp;
          <a href="https://github.com/substrate-developer-hub/substrate-enterprise-sample/tree/master/chain">chain</a> in this sample is a fork of the
          official <a href="https://github.com/substrate-developer-hub/substrate-node-template">Substrate Node Template</a> - a supported starting point that
          decreases the time it takes to implement a custom next-generation blockchain.
        </p>

        <p className='homepage-content'>
          The use case that this sample demonstrates is a decentralized supply-chain consortium. In order to accomplish this, FRAME is used to implement
          custom business logic as well as existing standards, such as <a href="https://w3c.github.io/did-core/">decentralized identifiers (DIDs)</a>.
        </p>

        <p className='homepage-content'>
          The capabilities demonstrated by this project include:
        </p>

        <ul>
          <li>Fine-grained and performance-preserving role-based access control (RBAC).</li>
          <li>Set-up and coordinate a decentralized network (permissioned blockchain) among several organisations.</li>
          <li>Manage decentralized identities for member organisations and their delegates.</li>
          <li>Register products and associated metadata, such as the organisation that owns them.</li>
          <li>Create shipments and track their journey through the supply chain.</li>
          <li>Monitor a shipment's storage and transportation conditions.</li>
        </ul>

        <p className='homepage-content'>
          The sample demonstrates many features and capabilities of the <a href="https://substrate.dev/">Substrate framework</a>, including:
        </p>

        <ul>
          <li>
            Consortium network with a <a href="https://en.wikipedia.org/wiki/Proof_of_authority">proof-of-authority consensus</a>&nbsp;
            (<a href="https://substrate.dev/docs/en/knowledgebase/advanced/consensus#aura">Aura</a> for block production,&nbsp;
            <a href="https://substrate.dev/docs/en/knowledgebase/advanced/consensus#grandpa">GRANDPA</a> for block finalization). Substrate and FRAME ship with
              a number of well-research and battle-tested&nbsp;
            <a href="https://substrate.dev/docs/en/knowledgebase/advanced/consensus#consensus-in-substrate">consensus mechanisms</a>&nbsp;
            and also make it possible to design and implement custom consensus mechanisms.
          </li>
          <li>Dynamic set of <a href="https://substrate.dev/docs/en/knowledgebase/getting-started/glossary#authority">authority</a> nodes.</li>
          <li>
            Role-based access control (RBAC) built on&nbsp;
            <a href="https://substrate.dev/docs/en/knowledgebase/learn-substrate/extrinsics#signed-extension">signed extensions</a>.
          </li>
          <li>
            Reliable real-world data integration with <a href="https://substrate.dev/docs/en/knowledgebase/runtime/off-chain-workers">off-chain workers</a>.
          </li>

          <li>
            Flexible blockchain runtime development that uses FRAME pallets to encapsulate domain-specific logic (e.g. separate pallets for product&nbsp;
            <a href="chain/pallets/registrar">registry</a> &amp; <a href="https://github.com/stiiifff/pallet-product-tracking">tracking</a>).
          </li>
        </ul>

        <p className='homepage-content'>
          Go to GitHub for a <a href="https://github.com/substrate-developer-hub/substrate-enterprise-sample#running-the-demo">detailed guide</a> to building
          this project and interacting with the supply chain applications.
        </p>

        <p className='homepage-content'>
          The supply chain consortium application is comprised of a number of a modules, many of which are configured in the&nbsp;
          <a href="https://github.com/substrate-developer-hub/substrate-enterprise-sample/blob/master/chain/node/src/chain_spec.rs">chain
          specification</a>'s <code>development_config</code> function:
        </p>

        <ul>
          <li>
            <a href="https://github.com/gautamdhameja/substrate-rbac/tree/enterprise-sample">Role-Based Access Control (RBAC) pallet</a> - This pallet maintains
            an on-chain registry of roles and the users to which those roles are assigned. A <code>Role</code> is a tuple that encapsulates the name of a pallet
            and a <code>Permission</code> that qualifies the level of access granted by the <code>Role</code>. A <code>Permission</code> is an enum with the
            following variants: <code>Execute</code> and <code>Manage</code>. The <code>Execute</code> permission allows a user to invoke a pallet's&nbsp;
            <a href="https://substrate.dev/docs/en/knowledgebase/getting-started/glossary#dispatch">dispatchable functions</a>. The <code>Manage</code>&nbsp;
            permission allows a user to assign and revoke roles for a pallet, and also implies the <code>Execute</code> permission. Access control validation is
            done at the <a href="https://substrate.dev/docs/en/knowledgebase/learn-substrate/tx-pool">transaction pool</a> validation layer by way of the RBAC
            pallet's <code>Authorize</code> <a href="https://substrate.dev/docs/en/knowledgebase/learn-substrate/extrinsics#signed-extension">signed
            extension</a>. Notice the permissions that are configured in the chain specification file. Alice is granted the <code>Execute</code> permission on
            the RBAC pallet, which allows her to use the RBAC pallet to create roles. In order to enable her to bootstrap the consortium, Alice is also granted
            the <code>Manage</code> permission on a few other pallet.
          </li>

          <li>
            <a href="https://github.com/substrate-developer-hub/substrate-enterprise-sample/tree/master/chain/pallets/registrar/src/lib.rs">Registrar
            pallet</a> - The Registrar pallet inherits decentralized identifier (DID) capabilities from the&nbsp;
            <a href="https://github.com/substrate-developer-hub/pallet-did">DID pallet</a> and uses these capabilities to implement an organization registry.
            This pallet maintains a list of organizations and maps each organization to a list of members. Organizations are identified by the ID of the account
            that created and owns it, which means that an account may create and own <em>at most</em> one organization. Organizations are associated with a
            name, which is designated by the value of the <code>Org</code> attribute on the DID of the organization owner. Organization owners are the only
            accounts that may add members to their organizations. When an account is added to an organization as a member, the organization owner creates
            an <code>OrgMember</code> delegate for the member's DID - this is a way for the organization owner to certify an account's membership in the
            organization. The registrar pallet exposes a custom <a href="https://substrate.dev/docs/en/knowledgebase/runtime/origin">origin</a>,&nbsp;
            <code>EnsureOrg</code>, that validates whether or not an account owns or is a member of at least one organization. The <code>EnsureOrg</code> origin
            is used to control access to many of the chain's capabilities, including the ability to create roles with the RBAC pallet.
          </li>

          <li>
            <a href="https://github.com/substrate-developer-hub/substrate-enterprise-sample/tree/master/chain/pallets/product-registry/src/lib.rs">Product
            Registry pallet</a> - This pallet maintains a registry of products and maps each product to the organization to which it belongs. A product is
            defined by three required properties (an ID, an owner, and a time of creation), and may have one or more optional user-defined properties. The&nbsp;
            <code>EnsureOrg</code> origin is used to control the accounts that are allowed to create products.
          </li>

          <li>
            <a href="https://github.com/substrate-developer-hub/substrate-enterprise-sample/tree/master/chain/pallets/product-tracking/src/lib.rs">Product
            Tracking pallet</a> - The Product Tracking pallet tracks shipments of products as they move throughout the supply chain. The
            <code>EnsureOrg</code> origin is used to control the accounts that are allowed to interact with this pallet. Shipments, like products, are assigned
            an ID and associated with an organization. This pallet supports tracking several types of shipping events: registration, pickup, scan, and delivery.
            With the exception of registration, shipment events may be associated with a list of sensor readings. Shipment events are placed in a queue that is
            monitored by an <a href="https://substrate.dev/docs/en/knowledgebase/runtime/off-chain-workers">off-chain worker</a>; when events appear in this
            queue the off-chain worker sends them to an HTTP listener.
          </li>
        </ul>

        <h3 className='homepage-header'>Related Github Repositories</h3>

        <List bulleted className='homepage-list'>
          <List.Item content="Decentralized Identifier Pallet" href="https://github.com/substrate-developer-hub/pallet-did"/>
          <List.Item content="Role-Based Access Control Pallet" href="https://github.com/gautamdhameja/substrate-rbac"/>
          <List.Item content="Validator Set Pallet" href="https://github.com/gautamdhameja/substrate-validator-set"/>
        </List>

        <h3 className='homepage-header'>Learn More</h3>

        <List bulleted className='homepage-list'>
          <List.Item content="Substrate Developer Hub" href="https://substrate.dev"/>
          <List.Item content="Element Technical Chat" href="https://app.element.io/#/room/!HzySYSaIhtyWrwiwEV:matrix.org"/>
        </List>

        <h3 id="disclaimer">Disclaimer</h3>

        <p>This project is intended for demonstration purposes and is not audited or ready for production use.</p>
      </Container>
    </Segment>
  </ResponsiveContainer>
);

export default Homepage;
