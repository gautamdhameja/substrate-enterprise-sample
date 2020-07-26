#![cfg_attr(not(feature = "std"), no_std)]

use sp_std::{prelude::*, vec::Vec, if_std};
use frame_support::{decl_module, decl_event, decl_storage, dispatch, traits::EnsureOrigin};
use frame_system::{self as system, ensure_signed};

pub trait Trait: system::Trait + did::Trait {
	type Event: From<Event<Self>> + Into<<Self as system::Trait>::Event>;
}

decl_event!(
    pub enum Event<T>
    where
        AccountId = <T as system::Trait>::AccountId,
    {
			AddedToOrganization(AccountId, Vec<u8>),
    }
);


decl_storage! {
	trait Store for Module<T: Trait> as RBAC {
			pub Organizations get(fn organizations): Vec<Vec<u8>>;
			pub AccountsInOrgs get(fn accounts_in_orgs):map hasher(blake2_128_concat) Vec<u8> => Vec<T::AccountId>;
	}
}

decl_module! {
	pub struct Module<T: Trait> for enum Call where origin: T::Origin {
		fn deposit_event() = default;
		#[weight = 10_000]
		pub fn join_organization(origin, org_name: Vec<u8>) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			let attr_name = b"Org";

			// Organizations list.
			let mut orgs = Self::organizations();
			orgs.push(org_name.clone());
			<Organizations>::put(orgs);

			// DID add attribute
			<did::Module<T>>::create_attribute(who.clone(), &who, attr_name, &org_name, None)?;

			// Accounts that belong to a certain organization.
			let mut accounts = Self::accounts_in_orgs(&org_name);
			accounts.push(who.clone());
			AccountsInOrgs::<T>::insert(&org_name, accounts);

			// Only used for debugging.
			if_std! {
				let (_, id) = <did::Module<T>>::attribute_and_id(&who, attr_name).unwrap();
				// Print Hex id.
				println!("attribute id: {:x?}", id);
			}

			Self::deposit_event(RawEvent::AddedToOrganization(who.clone(), org_name));
			Ok(())
		}
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
			system::RawOrigin::Signed(ref who)
				if <did::Module<T>>::attribute_and_id(&who, b"Org").is_some() => Ok(who.clone()),
				r => Err(T::Origin::from(r)),
		})
	}

	#[cfg(feature = "runtime-benchmarks")]
	fn successful_origin() -> T::Origin {
		T::Origin::from(system::RawOrigin::Signed(Default::default()))
	}
}