#![cfg_attr(not(feature = "std"), no_std)]

use sp_std::{prelude::*, if_std};
use frame_support::{decl_module, decl_event,
	dispatch, traits::EnsureOrigin};
use frame_system::{self as system, ensure_signed};

pub trait Trait: system::Trait + did::Trait {
	type Event: From<Event<Self>> + Into<<Self as system::Trait>::Event>;
}

decl_event!(
    pub enum Event<T>
    where
        AccountId = <T as system::Trait>::AccountId,
    {
        OrganizationAdded(AccountId, Vec<u8>),
    }
);

decl_module! {
	pub struct Module<T: Trait> for enum Call where origin: T::Origin {
		fn deposit_event() = default;
		#[weight = 10_000]
		pub fn register_organization(origin, org_name: Vec<u8>) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			let attr_name = "Org".as_bytes();

			// DID add attribute
			<did::Module<T>>::create_attribute(who.clone(), &who, attr_name, &org_name, None)?;

			if_std! {
				let (_, id) = <did::Module<T>>::attribute_and_id(&who, attr_name).unwrap();
				// Print id in a Hex Vec.
				println!("attribute id: {:x?}", id);
			}

			Self::deposit_event(RawEvent::OrganizationAdded(who.clone(), org_name));
			Ok(())
		}
	}
}

impl<T: Trait> Module<T> {
	fn try_get_org(org_id: T::AccountId) -> bool {
		let attr_name = "Org".as_bytes();

		if_std! {
			println!("inside try get org");
		}

		match <did::Module<T>>::attribute_and_id(&org_id, attr_name) {
			Some(_) => return true,
			None => return false
		};
	}
}

pub struct EnsureOrg<T>(sp_std::marker::PhantomData<T>);
impl<T: Trait> EnsureOrigin<T::Origin> for EnsureOrg<T> {
	type Success = T::AccountId;
	fn try_origin(o: T::Origin) -> Result<Self::Success, T::Origin> {

		if_std! {
			println!("inside custom origin");
		}

		o.into().and_then(|o| match o {
			system::RawOrigin::Signed(ref who) if <Module<T>>::try_get_org(who.clone()) => Ok(who.clone()),
			r => Err(T::Origin::from(r)),
		})
	}

	#[cfg(feature = "runtime-benchmarks")]
	fn successful_origin() -> T::Origin {
		T::Origin::from(system::RawOrigin::Signed(Default::default()))
	}
}