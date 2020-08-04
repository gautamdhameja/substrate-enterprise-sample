# Decentralized Supply Chain Node

A FRAME-based blockchain node that implements a supply chain registry for a decentralized consortium
of organisations.

## Included Pallets

The [runtime](runtime) for this blockchain includes the following application-specific pallets:

- [Registrar](pallets/registrar)
- [Decentralized Identifiers](https://github.com/substrate-developer-hub/pallet-did)
- [Product Registry](https://github.com/stiiifff/pallet-product-registry)
- [Product Tracking](https://github.com/stiiifff/pallet-product-tracking)
- [Validator Set](https://github.com/gautamdhameja/substrate-validator-set)
- [Role-Based Access Control](https://github.com/jimmychu0807/substrate-rbac)

## Build & Launch

Execute these commands to build and launch the node:

```shell
cargo build --release
# Purge existing chain state
./target/release/node-template purge-chain --dev
# Launch the node
./target/release/node-template --dev
```

## Upstream

This project was forked from the official
[Substrate node template](https://github.com/substrate-developer-hub/substrate-node-template/tree/v2.0.0-rc4).
Please refer to
[its documentation](https://github.com/substrate-developer-hub/substrate-node-template/blob/v2.0.0-rc4/README.md)
to learn about building and running the blockchain node.
