#![cfg_attr(not(feature = "std"), no_std)]

use sp_std::{prelude::*, vec::Vec, if_std};
use frame_support::{
	decl_module, decl_event, decl_storage, decl_error,
	ensure, dispatch,
	traits::EnsureOrigin
};
use frame_system::{self as system, ensure_signed, RawOrigin};

pub trait Trait: system::Trait + did::Trait {
	type Event: From<Event<Self>> + Into<<Self as system::Trait>::Event>;
}

decl_error! {
	pub enum Error for Module<T: Trait> {
			OrganizationExists,
			InvalidOrganization,
			MemberOfOrganization,
	}
}

decl_event!(
	pub enum Event<T>
	where
			AccountId = <T as system::Trait>::AccountId,
	{
		CreatedOrganization(AccountId, Vec<u8>),
		AddedToOrganization(AccountId, Vec<u8>),
	}
);

decl_storage! {
	trait Store for Module<T: Trait> as registrar {
			pub Organizations get(fn organizations): Vec<T::AccountId>;
			pub OrganizationsOf get(fn organizations_of):map hasher(blake2_128_concat) T::AccountId => Vec<T::AccountId>;
	}
}

decl_module! {
	pub struct Module<T: Trait> for enum Call where origin: T::Origin {
		fn deposit_event() = default;
		type Error = Error<T>;

		#[weight = 10_000]
		pub fn create_organization(origin, org_name: Vec<u8>) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			let mut orgs = Self::organizations();
			ensure!(!orgs.contains(&who), Error::<T>::OrganizationExists);

			orgs.push(who.clone());
			<Organizations<T>>::put(orgs);

			// DID add attribute
			<did::Module<T>>::create_attribute(who.clone(), &who, b"Org", &org_name, None)?;

			Self::deposit_event(RawEvent::CreatedOrganization(who, org_name));
			Ok(())
		}

		#[weight = 10_000]
		pub fn add_to_organization(origin, account: T::AccountId) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			// Organizations list.
			let orgs = Self::organizations();
			ensure!(orgs.contains(&who), Error::<T>::InvalidOrganization);

			// Accounts that belong to a certain organization.
			let mut orgs_of = Self::organizations_of(&account);

			// Validate organization and account should not be part.
			if !orgs_of.contains(&who) {
				orgs_of.push(who.clone());
				OrganizationsOf::<T>::insert(&account, &orgs_of);
			} else {
				return Err(Error::<T>::MemberOfOrganization.into());
			}

			// Add account as a DID delegate.
			<did::Module<T>>::create_delegate(&who, &who, &account, &b"OrgMember".to_vec(), None)?;

			Self::deposit_event(RawEvent::AddedToOrganization(who, b"OrgMember".to_vec()));
			Ok(())
		}
	}
}

impl<T: Trait> Module<T> {
		/// Valid if the account belongs to organization or is an organization.
		pub fn part_of_organization(account: &T::AccountId) -> bool {
			let orgs = <Module<T>>::organizations();
			for org in orgs.iter() {
				if <did::Module<T>>::valid_delegate(org, &b"OrgMember".to_vec(), &account).is_ok() {
					return true
				}
			}
			false
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
			RawOrigin::Signed(ref who)
				if  <Module<T>>::part_of_organization(&who) => Ok(who.clone()),
				r => Err(T::Origin::from(r)),
		})
	}

	#[cfg(feature = "runtime-benchmarks")]
	fn successful_origin() -> T::Origin {
		T::Origin::from(RawOrigin::Signed(Default::default()))
	}
}