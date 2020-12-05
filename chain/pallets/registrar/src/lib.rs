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
			pub MembersOf get(fn members_of):map hasher(blake2_128_concat) T::AccountId => Vec<T::AccountId>;
	}
	add_extra_genesis {
		config(orgs): Vec<(T::AccountId, Vec<u8>)>;
		config(members): Vec<(T::AccountId, Vec<T::AccountId>)>;
		build(|config| {
			for org in config.orgs.iter() {
				match Module::<T>::create_org(&org.0, org.1.clone()) {
					Err(e) => panic!(e),
					Ok(_) => (),
				}
			}

			for (org, members) in config.members.iter() {
				for member in members.iter() {
					match Module::<T>::add_to_org(org, member) {
						Err(e) => panic!(e),
						Ok(_) => (),
					}
				}
			}
		});
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
			Self::create_org(&who, org_name.clone())?;
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
			Self::add_to_org(&who, &account)?;
			Self::deposit_event(RawEvent::AddedToOrganization(who, b"OrgMember".to_vec()));
			Ok(())
		}
	}
}

impl<T: Trait> Module<T> {
	pub fn create_org(owner: &T::AccountId, org_name: Vec<u8>) -> dispatch::DispatchResult {
		let mut orgs = <Module<T>>::organizations();
		ensure!(!orgs.contains(&owner), Error::<T>::OrganizationExists);

		orgs.push(owner.clone());
		<Organizations<T>>::put(orgs);

		// DID add attribute
		<did::Module<T>>::create_attribute(&owner, &owner, b"Org", &org_name, None)?;
		Ok(())
	}

	pub fn add_to_org(org: &T::AccountId, account: &T::AccountId) -> dispatch::DispatchResult {
		// Organizations list.
		let orgs = Self::organizations();
		ensure!(orgs.contains(&org), Error::<T>::InvalidOrganization);

		// Accounts that belong to a certain organization.
		let mut members = Self::members_of(&org);

		// Validate organization and account should not be part.
		if !members.contains(&account) {
			members.push(account.clone());
			MembersOf::<T>::insert(&org, members);
		} else {
			return Err(Error::<T>::MemberOfOrganization.into());
		}

		// Add account as a DID delegate.
		<did::Module<T>>::create_delegate(&org, &org, &account, &b"OrgMember".to_vec(), None)?;
		Ok(())
	}

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
