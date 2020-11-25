# Decentralized Supply Chain Node

A FRAME-based blockchain node that implements a supply chain registry for a decentralized consortium
of organisations.

## Included Pallets

The [runtime](runtime) for this blockchain includes the following application-specific pallets:

- [Registrar](pallets/registrar)
- [Decentralized Identifiers](https://github.com/substrate-developer-hub/pallet-did)
- [Product Registry](pallets/product-registry)
- [Product Tracking](pallets/product-tracking)
- [Validator Set](pallets/validator-set)
- [Role-Based Access Control](pallets/rbac)

## Build & Launch

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

Execute these commands to build and launch the node:

```shell
WASM_BUILD_TOOLCHAIN=nightly-2020-10-05 cargo build --release
# Launch the node in development mode and do not persist chain state
./target/release/enterprise-sample --dev --tmp
```

## Upstream

This project was forked from the official
[Substrate node template](https://github.com/substrate-developer-hub/substrate-node-template/tree/v2.0.0-rc6).
Please refer to
[its documentation](https://github.com/substrate-developer-hub/substrate-node-template/blob/v2.0.0-rc6/README.md)
to learn about building and running the blockchain node.
