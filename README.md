# Substrate Supply Chain Demo

## What is this sample about?

The Substate Enterprise Sample demonstrates how a software engineering team can quickly build an application-specific Blockchain and related applications, by leveraging the Parity Substrate framework and its standard FRAME library, as well as building composable runtime modules (known as pallets).

The sample implements, in a simplified manner, a Blockchain-based solution for a collaborative supply-chain ecosystem.

Among others, it allows to:

- Setup a shared platform among several organisations, as a permissioned Blockchain network.
- Manage decentralized identities for member organisations and their delegates.
- Register master data about products and their owning organisations.
- Register a shipment and track its journey through the value chain.
- Monitor a shipment's storage and transportation conditions.
- Enable seamless data integration with existing ERP systems deployed within corporate walls.

Specific features of the [Parity Substrate framework](https://github.com/paritytech/substrate) exhibited:

- Consortium network with a Proof-of-Authority consensus (Aura for block production, GRANDPA for block finalization).
- Dynamic set of authority nodes.
- Enterprise-class role-based access control.
- W3C Decentralized Identifiers (DIDs) for organizations & delegates.
- Substrate Node & Frontend starter templates.
- Unrestricted flexibility for runtime logic & storage in custom pallets e.g. product registry & tracking pallets.
- Reliable off-chain data integration with Offchain workers.

## Running the demo

- Run the [Substrate chain](https://github.com/gautamdhameja/substrate-enterprise-sample/tree/master/chain)
  
  ```bash
  cd chain
  cargo build --release
  ./target/release/node-template --dev

  # For purging previous chain info
  ./target/release/node-template purge-chain --dev
  ```
  
- Run the [frontend UI](https://github.com/gautamdhameja/substrate-enterprise-sample/tree/master/ui)

  ```bash
  cd ui
  yarn install && yarn start
  ```

- Run the [listener](https://github.com/gautamdhameja/substrate-enterprise-sample/tree/master/listener) for receiving off-chain worker notifications

  ```bash
  cd listener
  yarn install && yarn start
  ```

- [Initialize the chain story (data setup)](https://github.com/gautamdhameja/substrate-enterprise-sample/tree/master/chain-story-init)
  
  ```bash
  cd chain-story-init
  yarn install && yarn start
  ```

## Related Github Repositories

- [Parity Substrate framework](https://github.com/paritytech/substrate)
- [Polkadot Javascript libraries](https://github.com/polkadot-js)
- [Substrate Enterprise sample](https://github.com/gautamdhameja/substrate-enterprise-sample)
- [Substrate Frontend template](https://github.com/substrate-developer-hub/substrate-front-end-template)
- [Substrate Node template](https://github.com/substrate-developer-hub/substrate-node-template)
- [DID pallet](https://github.com/substrate-developer-hub/pallet-did)
- [Product Registry pallet](https://github.com/stiiifff/pallet-product-registry)
- [Product Tracking pallet](https://github.com/stiiifff/pallet-product-registry)
- [RBAC pallet](https://github.com/gautamdhameja/substrate-rbac)
- [Validator Set pallet](https://github.com/gautamdhameja/substrate-validator-set)
