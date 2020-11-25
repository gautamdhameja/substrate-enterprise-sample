# Substrate Supply Chain Demo

This sample demonstrates how a software engineering team can leverage
[the Parity Substrate framework](https://www.substrate.io/) and its standard
[FRAME](https://substrate.dev/docs/en/knowledgebase/runtime/frame) library to quickly build an
application-specific blockchain by creating and composing runtime modules (known as "pallets").
Included in the sample is a custom front-end that was created using the helpful
[Substrate front-end template](https://github.com/substrate-developer-hub/substrate-front-end-template),
which itself makes use of the powerful [Polkadot JS](https://polkadot.js.org/) API. The
[chain](chain) included in this sample is a fork of the official
[Substrate node template](https://github.com/substrate-developer-hub/substrate-node-template).

The use case that this sample demonstrates is a collaborative supply-chain ecosystem. In order to
accomplish this, Substrate is used to implement existing standards, such as
[decentralized identifiers (DIDs)](https://en.wikipedia.org/wiki/Decentralized_identifiers).

Capabilities include:

- Setup a shared platform (permissioned blockchain network) among several organisations.
- Manage decentralized identities for member organisations and their delegates.
- Register master data about products, including the organisation that owns them.
- Register a shipment and track its journey through the supply chain.
- Monitor a shipment's storage and transportation conditions.
- Enable seamless data integration with existing ERP (enterprise resource planning) systems deployed
  within corporate walls.

The sample demonstrates many features and capabilities of the
[Parity Substrate framework](https://github.com/paritytech/substrate), including:

- Consortium network with a
  [proof-of-authority consensus](https://en.wikipedia.org/wiki/Proof_of_authority)
  ([Aura](https://substrate.dev/docs/en/knowledgebase/advanced/consensus#aura) for block production,
  [GRANDPA](https://substrate.dev/docs/en/knowledgebase/advanced/consensus#grandpa) for block
  finalization).
- Dynamic set of
  [authority](https://substrate.dev/docs/en/knowledgebase/getting-started/glossary#authority) nodes.
- Role-based access control.
- Reliable data integration with
  [off-chain workers](https://substrate.dev/docs/en/knowledgebase/runtime/off-chain-workers).
- Flexible blockchain runtime development that uses FRAME pallets to encapsulate domain-specific
  logic (e.g. separate pallets for product [registry](chain/pallets/registrar) &
  [tracking](https://github.com/stiiifff/pallet-product-tracking)).

## Running the demo

Follow the [installation instructions](https://substrate.dev/docs/en/knowledgebase/getting-started/)
for getting started with Rust and Substrate. This project is built on Substrate v2.0.0, which means
that it uses the
[Rust `nightly-2020-10-05` toolchain](https://substrate.dev/docs/en/knowledgebase/getting-started/#rust-nightly-toolchain)
for Wasm compilation. Ensure that you run the following commands as part of the installation
process:

```bash
rustup install nightly-2020-10-05
rustup target add wasm32-unknown-unknown --toolchain nightly-2020-10-05
```

- Run the [Substrate chain](chain)

  ```bash
  cd chain
  WASM_BUILD_TOOLCHAIN=nightly-2020-10-05 cargo build --release
  # Launch the node in development mode and do not persist chain state
  ./target/release/enterprise-sample --dev --tmp
  ```

- Launch the [front-end](ui)

  ```bash
  cd ui
  yarn install && yarn start
  ```

- Run the [listener](listener) that receives off-chain worker notifications

  ```bash
  cd listener
  yarn install && yarn start
  ```

- [Seed the chain with data](chain-story-init)

  ```bash
  cd chain-story-init
  yarn install && yarn start
  ```

## Related Github Repositories

- [Decentralized Identifier Pallet](https://github.com/substrate-developer-hub/pallet-did)
