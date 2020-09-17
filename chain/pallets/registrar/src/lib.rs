#![cfg_attr(not(feature = "std"), no_std)]

use sp_std::{prelude::*, vec::Vec, if_std};
use frame_support::{
	decl_module, decl_event, decl_storage, decl_error,
	ensure, dispatch,
	traits::EnsureOrigin
};
use frame_system::{self as system, ensure_signed, RawOrigin};

/// Configure the pallet by specifying the parameters and types on which it depends.
pub trait Trait: system::Trait + did::Trait {
	/// Because this pallet emits events, it depends on the runtime's definition of an event.
	type Event: From<Event<Self>> + Into<<Self as system::Trait>::Event>;
}

// Errors inform users why an extrinsic failed.
decl_error! {
	pub enum Error for Module<T: Trait> {
		/// Cannot create the organization because it already exists.
		OrganizationExists,
		/// Cannot add users to a non-existent organization.
		InvalidOrganization,
		/// Cannot add a user to an organization to which they already belong.
		MemberOfOrganization,
	}
}

// Pallets use events to inform users when important changes are made.
// https://substrate.dev/docs/en/knowledgebase/runtime/events
decl_event!(
	pub enum Event<T> where AccountId = <T as system::Trait>::AccountId {
		/// An organization has been created. [creator, organization_id]
		CreatedOrganization(AccountId, Vec<u8>),
		/// An account was added to an organization. [account, organization_id]
		AddedToOrganization(AccountId, Vec<u8>),
	}
);

// The pallet's runtime storage items.
// https://substrate.dev/docs/en/knowledgebase/runtime/storage
decl_storage! {
	trait Store for Module<T: Trait> as registrar {
			/// The list of organizations in the supply chain consortium.
			/// Organizations are identified by the ID of the account that created them.
			pub Organizations get(fn organizations): Vec<T::AccountId>;
			/// Maps organizations to their members.
			pub OrganizationsOf get(fn organizations_of):map hasher(blake2_128_concat) T::AccountId => Vec<T::AccountId>;
	}
}

// Dispatchable functions allows users to interact with the pallet and invoke state changes.
// These functions materialize as "extrinsics", which are often compared to transactions.
// Dispatchable functions must be annotated with a weight and must return a DispatchResult.
decl_module! {
	pub struct Module<T: Trait> for enum Call where origin: T::Origin {
		fn deposit_event() = default;
		type Error = Error<T>;

		/// Create an organization. Will return an OrganizationExists error if the organization has already
		/// been created. Will emit a CreatedOrganization event on success.
		///
		/// The dispatch origin for this call must be Signed.
		#[weight = 10_000]
		pub fn create_organization(origin, org_name: Vec<u8>) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			let mut orgs = Self::organizations();
			ensure!(!orgs.contains(&who), Error::<T>::OrganizationExists);

			orgs.push(who.clone());
			<Organizations<T>>::put(orgs);

			// DID add attribute
			<did::Module<T>>::create_attribute(&who, &who, b"Org", &org_name, None)?;

			Self::deposit_event(RawEvent::CreatedOrganization(who, org_name));
			Ok(())
		}

		/// Add an account to an organization. Will return an InvalidOrganization error if the organization
		/// does not exist or the account is already a member. Will emit a AddedToOrganization event on success.
		///
		/// The dispatch origin for this call must be Signed.
		#[weight = 10_000]
		pub fn add_to_organization(origin, account: T::AccountId) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			// Organizations list.
			let orgs = Self::organizations();
			ensure!(orgs.contains(&who), Error::<T>::InvalidOrganization);

			// Accounts that belong to a certain organization.
			let mut orgs = Self::organizations_of(&account);

			// Validate organization and account should not be part.
			if !orgs.contains(&who) {
				orgs.push(who.clone());
				OrganizationsOf::<T>::insert(&account, orgs);
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
	/// Returns true if and only if the account is a member of an organization.
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

/// Ensure that a consortium member is invoking a dispatch.
// https://substrate.dev/rustdocs/v2.0.0-rc6/frame_support/traits/trait.EnsureOrigin.html
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
