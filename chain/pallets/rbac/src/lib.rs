//! # Role-based Access Control (RBAC) Pallet
//!
//! The RBAC Pallet implements role-based access control and permissions for Substrate extrinsic calls.

#![cfg_attr(not(feature = "std"), no_std)]

use codec::{Decode, Encode};
use frame_support::{
    decl_error, decl_event, decl_module, decl_storage, dispatch,
    traits::{EnsureOrigin, GetCallMetadata},
    weights::DispatchInfo,
};
use frame_system::{self as system, ensure_root, ensure_signed};
use sp_runtime::{
    print,
    traits::{DispatchInfoOf, Dispatchable, SignedExtension},
    transaction_validity::{
        InvalidTransaction, TransactionLongevity, TransactionPriority, TransactionValidity,
        TransactionValidityError, ValidTransaction,
    },
    RuntimeDebug,
};
use sp_std::fmt::Debug;
use sp_std::marker::PhantomData;
use sp_std::prelude::*;

pub trait Trait: system::Trait {
    type Event: From<Event<Self>> + Into<<Self as system::Trait>::Event>;
    type CreateRoleOrigin: EnsureOrigin<Self::Origin>;
}

#[derive(PartialEq, Eq, Clone, RuntimeDebug, Encode, Decode)]
pub enum Permission {
    Execute,
    Manage,
}

impl Permission {
    fn as_bytes(&self) -> &[u8] {
        match self {
            Permission::Execute => b"Permission::Execute",
            Permission::Manage => b"Permission::Manage",
        }
    }
}

impl Default for Permission {
    fn default() -> Self {
        Permission::Execute
    }
}

#[derive(PartialEq, Eq, Clone, RuntimeDebug, Encode, Decode)]
pub struct Role {
    pallet: Vec<u8>,
    permission: Permission,
}

decl_event!(
    pub enum Event<T>
    where
        AccountId = <T as system::Trait>::AccountId,
    {
        RoleCreated(AccountId, Vec<u8>, Vec<u8>),
        AccessRevoked(AccountId, Vec<u8>),
        AccessGranted(AccountId, Vec<u8>),
        SuperAdminAdded(AccountId),
    }
);

decl_storage! {
    trait Store for Module<T: Trait> as RBAC {
        pub SuperAdmins get(fn super_admins): map hasher(blake2_128_concat) T::AccountId => bool;
        pub Permissions get(fn permissions): map hasher(blake2_128_concat) (T::AccountId, Role) => bool;
        pub Roles get(fn roles): Vec<Role>;
    }
    add_extra_genesis {
        config(super_admins): Vec<T::AccountId>;
        build(|config| {
            for admin in config.super_admins.iter() {
                <SuperAdmins<T>>::insert(admin, true);
            }
        })
    }
}

decl_error! {
    pub enum Error for Module<T: Trait> {
        AccessDenied,
        RoleExisted
    }
}

decl_module! {
    pub struct Module<T: Trait> for enum Call where origin: T::Origin {
        type Error = Error<T>;
        fn deposit_event() = default;

        #[weight = 10_000]
        pub fn create_role(origin, pallet_name: Vec<u8>, permission: Permission) -> dispatch::DispatchResult {
            T::CreateRoleOrigin::ensure_origin(origin.clone())?;

            // TODO: This should be removed and the AccountId should be extracted from the above.
            let who = ensure_signed(origin)?;

            let role = Role {
                pallet: pallet_name.clone(),
                permission: permission.clone()
            };

            let roles = Self::roles();
            if roles.contains(&role) {
                return Err(Error::<T>::RoleExisted.into());
            }

            Roles::append(role.clone());
            <Permissions<T>>::insert((who.clone(), role.clone()), true);
            Self::deposit_event(RawEvent::RoleCreated(who, pallet_name, permission.as_bytes().to_vec()));
            Ok(())
        }

        #[weight = 10_000]
        pub fn assign_role(origin, account_id: T::AccountId, role: Role) -> dispatch::DispatchResult {
            let who = ensure_signed(origin)?;

            if !Self::verify_manage_access(who.clone(), role.pallet.clone()) {
                return Err(Error::<T>::AccessDenied.into());
            }

            <Permissions<T>>::insert((account_id.clone(), role.clone()), true);
            Self::deposit_event(RawEvent::AccessGranted(account_id, role.pallet));
            Ok(())
        }

        #[weight = 10_000]
        pub fn revoke_access(origin, account_id: T::AccountId, role: Role) -> dispatch::DispatchResult {
            let who = ensure_signed(origin)?;

            if !Self::verify_manage_access(who.clone(), role.pallet.clone()) {
                return Err(Error::<T>::AccessDenied.into());
            }

            <Permissions<T>>::remove((account_id.clone(), role.clone()));
            Self::deposit_event(RawEvent::AccessRevoked(account_id, role.pallet));
            Ok(())
        }

        /// Add a new Super Admin.
        /// Super Admins have access to execute and manage all pallets.
        ///
        /// Only _root_ can add a Super Admin.
        #[weight = 10_000]
        pub fn add_super_admin(origin, account_id: T::AccountId) -> dispatch::DispatchResult {
            ensure_root(origin)?;
            <SuperAdmins<T>>::insert(&account_id, true);
            Self::deposit_event(RawEvent::SuperAdminAdded(account_id));
            Ok(())
        }
    }
}

impl<T: Trait> Module<T> {
    pub fn verify_access(account_id: T::AccountId, pallet: Vec<u8>) -> bool {
        let execute_role = Role {
            pallet: pallet.clone(),
            permission: Permission::Execute,
        };

        let manage_role = Role {
            pallet,
            permission: Permission::Manage,
        };

        let roles = Self::roles();
        if (roles.contains(&manage_role)
            && <Permissions<T>>::get((account_id.clone(), manage_role)))
            || (roles.contains(&execute_role) && <Permissions<T>>::get((account_id, execute_role)))
        {
            return true;
        }
        false
    }

    fn verify_manage_access(account_id: T::AccountId, pallet: Vec<u8>) -> bool {
        let role = Role {
            pallet,
            permission: Permission::Manage,
        };

        let roles = Self::roles();
        if roles.contains(&role) && <Permissions<T>>::get((account_id, role)) {
            return true;
        }
        false
    }
}

/// The following section implements the `SignedExtension` trait
/// for the `Authorize` type.
/// `SignedExtension` is being used here to filter out the not authorized accounts
/// when they try to send extrinsics to the runtime.
/// Inside the `validate` function of the `SignedExtension` trait,
/// we check if the sender (origin) of the extrinsic has the execute permission or not.
/// The validation happens at the transaction queue level,
///  and the extrinsics are filtered out before they hit the pallet logic.

/// The `Authorize` struct.
#[derive(Encode, Decode, Clone, Eq, PartialEq)]
pub struct Authorize<T: Trait + Send + Sync>(PhantomData<T>);

/// Debug impl for the `Authorize` struct.
impl<T: Trait + Send + Sync> Debug for Authorize<T> {
    #[cfg(feature = "std")]
    fn fmt(&self, f: &mut sp_std::fmt::Formatter) -> sp_std::fmt::Result {
        write!(f, "Authorize")
    }

    #[cfg(not(feature = "std"))]
    fn fmt(&self, _: &mut sp_std::fmt::Formatter) -> sp_std::fmt::Result {
        Ok(())
    }
}

impl<T: Trait + Send + Sync> SignedExtension for Authorize<T>
where
    T::Call: Dispatchable<Info = DispatchInfo> + GetCallMetadata,
{
    type AccountId = T::AccountId;
    type Call = T::Call;
    type AdditionalSigned = ();
    type Pre = ();
    const IDENTIFIER: &'static str = "Authorize";

    fn additional_signed(&self) -> sp_std::result::Result<(), TransactionValidityError> {
        Ok(())
    }

    fn validate(
        &self,
        who: &Self::AccountId,
        call: &Self::Call,
        info: &DispatchInfoOf<Self::Call>,
        _len: usize,
    ) -> TransactionValidity {
        let md = call.get_call_metadata();

        if <SuperAdmins<T>>::contains_key(who.clone()) {
            print("Access Granted!");
            Ok(ValidTransaction {
                priority: info.weight as TransactionPriority,
                longevity: TransactionLongevity::max_value(),
                propagate: true,
                ..Default::default()
            })
        } else if <Module<T>>::verify_access(who.clone(), md.pallet_name.as_bytes().to_vec()) {
            print("Access Granted!");
            Ok(ValidTransaction {
                priority: info.weight as TransactionPriority,
                longevity: TransactionLongevity::max_value(),
                propagate: true,
                ..Default::default()
            })
        } else {
            print("Access Denied!");
            Err(InvalidTransaction::Call.into())
        }
    }
}
