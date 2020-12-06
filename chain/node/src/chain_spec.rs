use sp_core::{Pair, Public, sr25519};
use enterprise_sample_runtime::{
	AccountId, AuraConfig, BalancesConfig, GenesisConfig, GrandpaConfig,
	Permission, Role, RegistrarConfig, SudoConfig, SystemConfig, Signature,
	ValidatorSetConfig, SessionConfig, opaque::SessionKeys, RbacConfig, WASM_BINARY
};
use sp_consensus_aura::sr25519::AuthorityId as AuraId;
use sp_finality_grandpa::AuthorityId as GrandpaId;
use sp_runtime::traits::{Verify, IdentifyAccount};
use sc_service::ChainType;

// Note this is the URL for the telemetry server
//const STAGING_TELEMETRY_URL: &str = "wss://telemetry.polkadot.io/submit/";

/// Specialized `ChainSpec`. This is a specialization of the general Substrate ChainSpec type.
pub type ChainSpec = sc_service::GenericChainSpec<GenesisConfig>;

/// Helper function to generate a crypto pair from seed
pub fn get_from_seed<TPublic: Public>(seed: &str) -> <TPublic::Pair as Pair>::Public {
	TPublic::Pair::from_string(&format!("//{}", seed), None)
		.expect("static values are valid; qed")
		.public()
}

type AccountPublic = <Signature as Verify>::Signer;

/// Helper function to generate an account ID from seed
pub fn get_account_id_from_seed<TPublic: Public>(seed: &str) -> AccountId where
	AccountPublic: From<<TPublic::Pair as Pair>::Public>
{
	AccountPublic::from(get_from_seed::<TPublic>(seed)).into_account()
}

fn session_keys(
	aura: AuraId,
	grandpa: GrandpaId,
) -> SessionKeys {
	SessionKeys { aura, grandpa }
}

/// Helper function to generate an authority key for Aura
pub fn authority_keys_from_seed(s: &str) -> (AccountId, AuraId, GrandpaId) {
	(
		get_account_id_from_seed::<sr25519::Public>(s),
		get_from_seed::<AuraId>(s),
		get_from_seed::<GrandpaId>(s),
	)
}

pub fn development_config() -> Result<ChainSpec, String> {
	let wasm_binary = WASM_BINARY.ok_or("Development wasm binary not available".to_string())?;

	Ok(ChainSpec::from_genesis(
		"Development",
		"dev",
		ChainType::Development,
		move || testnet_genesis(
			// Wasm runtime
			wasm_binary,
			// initial authorities
			vec![
				authority_keys_from_seed("Alice"),
			],
			// root user
			get_account_id_from_seed::<sr25519::Public>("Alice"),
			// endowed accounts
			vec![
				get_account_id_from_seed::<sr25519::Public>("Alice"),
				get_account_id_from_seed::<sr25519::Public>("Bob"),
				get_account_id_from_seed::<sr25519::Public>("Charlie"),
				get_account_id_from_seed::<sr25519::Public>("Dave"),
				get_account_id_from_seed::<sr25519::Public>("Eve"),
				get_account_id_from_seed::<sr25519::Public>("Ferdie"),
				get_account_id_from_seed::<sr25519::Public>("Alice//stash"),
				get_account_id_from_seed::<sr25519::Public>("Bob//stash"),
				get_account_id_from_seed::<sr25519::Public>("Charlie//stash"),
				get_account_id_from_seed::<sr25519::Public>("Dave//stash"),
				get_account_id_from_seed::<sr25519::Public>("Eve//stash"),
				get_account_id_from_seed::<sr25519::Public>("Ferdie//stash"),
			],
			// super admins
			vec![],
			// permissions
			vec![
				(Role { pallet: b"Rbac".to_vec(), permission: Permission::Execute },
				vec![get_account_id_from_seed::<sr25519::Public>("Alice")]),
				(Role { pallet: b"Registrar".to_vec(), permission: Permission::Manage },
				vec![get_account_id_from_seed::<sr25519::Public>("Alice")]),
				(Role { pallet: b"ProductRegistry".to_vec(), permission: Permission::Manage },
				vec![get_account_id_from_seed::<sr25519::Public>("Alice")]),
				(Role { pallet: b"ProductTracking".to_vec(), permission: Permission::Manage },
				vec![get_account_id_from_seed::<sr25519::Public>("Alice")]),
				(Role { pallet: b"Balances".to_vec(), permission: Permission::Manage },
				vec![get_account_id_from_seed::<sr25519::Public>("Alice")]),
			],
			// organizations
			vec![(get_account_id_from_seed::<sr25519::Public>("Alice"), b"Supply Chain Consortium".to_vec())],
			// organization members
			vec![],
			true,
		),
		vec![],
		None,
		None,
		None,
		None,
	))
}

pub fn local_testnet_config() -> Result<ChainSpec, String> {
	let wasm_binary = WASM_BINARY.ok_or("Development wasm binary not available".to_string())?;

	Ok(ChainSpec::from_genesis(
		"Local Testnet",
		"local_testnet",
		ChainType::Local,
		move || testnet_genesis(
			// Wasm runtime
			wasm_binary,
			// initial authorities
			vec![
				authority_keys_from_seed("Alice"),
				authority_keys_from_seed("Bob"),
			],
			// root user
			get_account_id_from_seed::<sr25519::Public>("Alice"),
			// endowed accounts
			vec![
				get_account_id_from_seed::<sr25519::Public>("Alice"),
				get_account_id_from_seed::<sr25519::Public>("Bob"),
				get_account_id_from_seed::<sr25519::Public>("Charlie"),
				get_account_id_from_seed::<sr25519::Public>("Dave"),
				get_account_id_from_seed::<sr25519::Public>("Eve"),
				get_account_id_from_seed::<sr25519::Public>("Ferdie"),
				get_account_id_from_seed::<sr25519::Public>("Alice//stash"),
				get_account_id_from_seed::<sr25519::Public>("Bob//stash"),
				get_account_id_from_seed::<sr25519::Public>("Charlie//stash"),
				get_account_id_from_seed::<sr25519::Public>("Dave//stash"),
				get_account_id_from_seed::<sr25519::Public>("Eve//stash"),
				get_account_id_from_seed::<sr25519::Public>("Ferdie//stash"),
				get_account_id_from_seed::<sr25519::Public>("Acme Corp."),
				get_account_id_from_seed::<sr25519::Public>("Cyberdyne Systems"),
				get_account_id_from_seed::<sr25519::Public>("Los Pollos Hermanos"),
				get_account_id_from_seed::<sr25519::Public>("Northwind Traders"),
				get_account_id_from_seed::<sr25519::Public>("Umbrella Corp."),
			],
			// super admins
			vec![],
			// permissions
			vec![],
			// organizations
			vec![],
			// organization members
			vec![],
			true,
		),
		vec![],
		None,
		None,
		None,
		None,
	))
}

/// Configure initial storage state for FRAME modules.
fn testnet_genesis(
	wasm_binary: &[u8],
	initial_authorities: Vec<(AccountId, AuraId, GrandpaId)>,
	root_key: AccountId,
	endowed_accounts: Vec<AccountId>,
	super_admins: Vec<AccountId>,
	permissions: Vec<(Role, Vec<AccountId>)>,
	orgs: Vec<(AccountId, Vec<u8>)>,
	members: Vec<(AccountId, Vec<AccountId>)>,
	_enable_println: bool,
) -> GenesisConfig {
	GenesisConfig {
		frame_system: Some(SystemConfig {
			code: wasm_binary.to_vec(),
			changes_trie_config: Default::default(),
		}),
		pallet_balances: Some(BalancesConfig {
			balances: endowed_accounts.iter().cloned().map(|k|(k, 1 << 60)).collect(),
		}),
		validatorset: Some(ValidatorSetConfig {
			validators: initial_authorities.iter().map(|x| x.0.clone()).collect::<Vec<_>>(),
		}),
		pallet_session: Some(SessionConfig {
			keys: initial_authorities.iter().map(|x| {
				(x.0.clone(), x.0.clone(), session_keys(x.1.clone(), x.2.clone()))
			}).collect::<Vec<_>>(),
		}),
		pallet_aura: Some(AuraConfig {
			authorities: vec![],
		}),
		pallet_grandpa: Some(GrandpaConfig {
			authorities: vec![],
		}),
		pallet_sudo: Some(SudoConfig {
			key: root_key,
		}),
		rbac: Some(RbacConfig {
			super_admins,
			permissions,
		}),
		registrar: Some(RegistrarConfig {
			orgs,
			members,
		}),
		pallet_collective_Instance1: Some(Default::default()),
		pallet_elections_phragmen: Some(Default::default()),
		pallet_democracy: Some(Default::default()),
	}
}
