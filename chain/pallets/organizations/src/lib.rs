#![cfg_attr(not(feature = "std"), no_std)]

/// Feel free to remove or edit this file as needed.
/// If you change the name of this file, make sure to update its references in runtime/src/lib.rs
/// If you remove this file, you can remove those references

/// For more guidance on Substrate FRAME, see the example pallet
/// https://github.com/paritytech/substrate/blob/master/frame/example/src/lib.rs
use frame_support::{decl_error, decl_event, decl_module, decl_storage, dispatch};
use frame_support::traits::Currency;
use sp_io::hashing::keccak_256;
use system::ensure_signed;
use sp_std::{prelude::*, vec::Vec};
use codec::{Decode, Encode};
use sp_core::RuntimeDebug;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

/// A contract function selector.
///
/// # Note
///
/// This is equal to the first four bytes of the SHA-3 hash of a function's name.
#[derive(Clone, Copy, PartialEq, Eq, Encode, Decode, RuntimeDebug)]
pub struct FunctionSelector([u8; 4]);

impl FunctionSelector {
    /// Returns the underlying four bytes.
    pub fn as_bytes(&self) -> &[u8; 4] {
        &self.0
    }

    /// Returns a unique identifier as `usize`.
    pub fn unique_id(self) -> usize {
        u32::from_le_bytes(self.0) as usize
    }
}

impl From<&'_ str> for FunctionSelector {
    fn from(name: &str) -> Self {
        let sha3_hash = keccak_256(name.as_bytes());
        Self([sha3_hash[0], sha3_hash[1], sha3_hash[2], sha3_hash[3]])
    }
}

//pub type BalanceOf<T> = <<T as Trait>::Currency as Currency<<T as system::Trait>::AccountId>>::Balance;

/// The pallet's configuration trait.
pub trait Trait: system::Trait + did::Trait + validator_set::Trait + contracts::Trait {
    /// The overarching event type.
    type Event: From<Event<Self>> + Into<<Self as system::Trait>::Event>;

    type Currency: Currency<Self::AccountId>;
}

// This pallet's storage items.
decl_storage! {
    trait Store for Module<T: Trait> as OrgsModule {
        // Just a dummy storage item.
        // Here we are declaring a StorageValue, `Something` as a Option<u32>
        // `get(fn something)` is the default getter which returns either the stored `u32` or `None` if nothing stored
        Something get(fn something): Option<u32>;
    }
}

// The pallet's events
decl_event!(
    pub enum Event<T>
    where
        AccountId = <T as system::Trait>::AccountId,
    {
        /// Just a dummy event.
        /// Event `Something` is declared with a parameter of the type `u32` and `AccountId`
        /// To emit this event, we call the deposit function, from our runtime functions
        SomethingStored(u32, AccountId),

        // A smart contract was called from the runtime.
        ContractCalled(AccountId, bool),
    }
);

// The pallet's errors
decl_error! {
    pub enum Error for Module<T: Trait> {
        /// Value was None
        NoneValue,
        /// Value reached maximum and cannot be incremented further
        StorageOverflow,
    }
}

// The pallet's dispatchable functions.
decl_module! {
    /// The module declaration.
    pub struct Module<T: Trait> for enum Call where origin: T::Origin {
        // Initializing errors
        // this includes information about your errors in the node's metadata.
        // it is needed only if you are using errors in your pallet
        type Error = Error<T>;

        // Initializing events
        // this is needed only if you are using events in your pallet
        fn deposit_event() = default;

        /// Just a dummy entry point.
        /// function that can be called by the external world as an extrinsics call
        /// takes a parameter of the type `AccountId`, stores it, and emits an event
        pub fn do_something(origin, something: u32, validator_id: T::AccountId) -> dispatch::DispatchResult {
            // Check it was signed and get the signer. See also: ensure_root and ensure_none
            let who = ensure_signed(origin.clone())?;

            // Code to execute when something calls this.
            // For example: the following line stores the passed in u32 in the storage
            Something::put(something);

            <did::Module<T>>::delegate_of((who.clone(), b"validator".to_vec() , validator_id.clone()));
            <did::Module<T>>::add_delegate(origin.clone(), who.clone(), validator_id.clone(), b"validator".to_vec(), 1000.into())?;
            <validator_set::Module<T>>::add_validator(origin, validator_id)?;

            // Here we are raising the Something event
            Self::deposit_event(RawEvent::SomethingStored(something, who));
            Ok(())
        }

        /// Another dummy entry point.
        /// takes no parameters, attempts to increment storage value, and possibly throws an error
        pub fn cause_error(origin) -> dispatch::DispatchResult {
            // Check it was signed and get the signer. See also: ensure_root and ensure_none
            let _who = ensure_signed(origin)?;

            match Something::get() {
                None => Err(Error::<T>::NoneValue)?,
                Some(old) => {
                    let new = old.checked_add(1).ok_or(Error::<T>::StorageOverflow)?;
                    Something::put(new);
                    Ok(())
                },
            }
        }

    //     /// Calls a Substrate smart contract using its address and ABI.
    //     /// input_data is the bytes representation of contract function/message name
    //     /// and scale encoded parameter value.
    //     pub fn call_contract(origin, address: T::AccountId, selector: FunctionSelector
    //       #[compact] value: BalanceOf<T>,
    //       #[compact] gas_limit: Gas
    //     ) -> dispatch::DispatchResult {
    //       let who = ensure_signed(origin)?;
    //       let encoded_bool = bool::encode(&flag);
    //       let encoded_int = u32::encode(&val);
    //       let input_data = [&selector.as_bytes()[..], &encoded_bool[..], &encoded_int[..]].concat();

    //       let exec_result = <contracts::Module<T>>::bare_call(who, address.clone(), value.into(), 500000, input_data);
    //       match exec_result {
    //           Ok(v) => {
    //               let result_val = bool::decode(&mut &v.data[..]);
    //               match result_val {
    //                   Ok(b) => {
    //                       Self::deposit_event(RawEvent::ContractCalled(address, b));
    //                   },
    //                   Err(_) => { },
    //               }
    //           },
    //           Err(_) => { },
    //       }

    //       Ok(())
    //   }
    }
}
