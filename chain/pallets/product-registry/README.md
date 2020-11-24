# Substrate Product Registry pallet

The Product Registry pallet provides functionality for registering and managing master data (aka class-level) about products / trade items exchanged in a supply chain between various stakeholders. This data is typically registered once by the product's manufacturer / supplier to be shared with other network participants.

When this pallet is added to a Subtrate runtime, other custom Substrate pallets can then implement additional business logic leveraging this Product Registry pallet as a reference for known products and their owning organizations.

This pallet is part of the [Substrate Enterprise sample](https://github.com/gautamdhameja/substrate-enterprise-sample).

It is inspired by existing projects & standards:
- [IBM Food Trust](https://github.com/IBM/IFT-Developer-Zone/wiki/APIs)
- [Hyperledger Grid](https://www.hyperledger.org/use/grid)
- [GS1 Standards](https://www.gs1.org/standards)

NOTE: This pallet implements the aforementionned process in a simplified way, thus it is intended for demonstration purposes and is not audited or ready for production use.

## Usage

To register a product, one must send a transaction with a `productRegistry.registerProduct` extrinsic with the following arguments:
- `id` as the Product ID, typically this would be a GS1 GTIN (Global Trade Item Number), or ASIN (Amazon Standard Identification Number), or similar, a numeric or alpha-numeric code with a well-defined data structure.
- `owner` as the Substrate Account representing the organization owning this product, as in the manufacturer or supplier providing this product within the value chain.
- `props` which is a series of properties (name & value) describing the product. Typically, there would at least be a textual description, and SKU. It could also contain instance / lot master data e.g. expiration, weight, harvest date.

## Dependencies

### Traits

This pallet depends on on the [FRAME EnsureOrigin System trait]
```
frame_support::traits::EnsureOrigin;
```

### Pallets

This pallet depends on on the [FRAME Timestamp pallet](https://docs.rs/crate/pallet-timestamp).

## Testing

Run the tests with:

    ```
    cargo test
    ```

## How to use in your runtime

### Runtime `Cargo.toml`

To add this pallet to your runtime, simply include the following to your runtime's `Cargo.toml` file:

```TOML
[dependencies.product-registry]
default_features = false
package = 'pallet-product-registry'
version = '2.0.0'
```

and update your runtime's `std` feature to include this pallet:

```TOML
std = [
    # --snip--
    'product-registry/std',
]
```

### Runtime `lib.rs`

You should implement it's trait like so:

```rust
impl product_registry::Trait for Runtime {
	type Event = Event;
	type CreateRoleOrigin = Origin;
}
```

and include it in your `construct_runtime!` macro:

```rust
ProductRegistry: product_registry::{Module, Call, Storage, Event<T>},
```

### Genesis Configuration

This template pallet does not have any genesis configuration.

## Reference Docs

You can view the reference docs for this pallet by running:

```
cargo doc --open
```
