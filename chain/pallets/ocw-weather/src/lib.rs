#![cfg_attr(not(feature = "std"), no_std)]

#[cfg(test)]
mod tests;

use core::{convert::TryInto, fmt};
use frame_support::{
	debug, decl_error, decl_event, decl_module, decl_storage, dispatch::DispatchResult, traits::Get,
};
use codec::{Decode, Encode};

use frame_system::{
	self as system, ensure_signed,
	offchain::{
		AppCrypto, CreateSignedTransaction, SendSignedTransaction, Signer,
	},
};
use sp_core::crypto::KeyTypeId;
use sp_runtime::{
	offchain as rt_offchain,
	offchain::storage::StorageValueRef,
	transaction_validity::TransactionPriority,
};
use sp_std::prelude::*;
use sp_std::str;

// We use `alt_serde`, and Xanewok-modified `serde_json` so that we can compile the program
//   with serde(features `std`) and alt_serde(features `no_std`).
use alt_serde::{Deserialize, Deserializer};

/// Defines application identifier for crypto keys of this module.
///
/// Every module that deals with signatures needs to declare its unique identifier for
/// its crypto keys.
/// When offchain worker is signing transactions it's going to request keys of type
/// `KeyTypeId` from the keystore and use the ones it finds to sign the transaction.
/// The keys can be inserted manually via RPC (see `author_insertKey`).
pub const KEY_TYPE: KeyTypeId = KeyTypeId(*b"ocww");
pub const NUM_VEC_LEN: usize = 10;

// We are fetching information from Weather public API about organisation `substrate-developer-hub`.
pub const HTTP_REMOTE_REQUEST_BYTES: &[u8] = b"https://api.openweathermap.org/data/2.5/weather?lat=52.494245&lon=13.437114&appid=729a404d474b8b3527343a4ce3c15196" ;

/// Based on the above `KeyTypeId` we need to generate a pallet-specific crypto type wrappers.
/// We can use from supported crypto kinds (`sr25519`, `ed25519` and `ecdsa`) and augment
/// the types with this pallet-specific identifier.
pub mod crypto {
	use crate::KEY_TYPE;
	use sp_core::sr25519::Signature as Sr25519Signature;
	use sp_runtime::{
		traits::Verify,
		MultiSignature, MultiSigner,
	};
	use sp_application_crypto::{ app_crypto, sr25519 };

	app_crypto!(sr25519, KEY_TYPE);

	pub struct TestAuthId;
	// implemented for ocw-runtime
	impl frame_system::offchain::AppCrypto<MultiSigner, MultiSignature> for TestAuthId {
		type RuntimeAppPublic = Public;
		type GenericSignature = sp_core::sr25519::Signature;
		type GenericPublic = sp_core::sr25519::Public;
	}

	// implemented for mock runtime in test
	impl frame_system::offchain::AppCrypto<<Sr25519Signature as Verify>::Signer, Sr25519Signature>
		for TestAuthId
	{
		type RuntimeAppPublic = Public;
		type GenericSignature = sp_core::sr25519::Signature;
		type GenericPublic = sp_core::sr25519::Public;
	}
}

// Specifying serde path as `alt_serde`
// ref: https://serde.rs/container-attrs.html#crate
#[serde(crate = "alt_serde")]
#[derive(Deserialize, Encode, Decode, Default)]
struct WeatherForecast {
	main: WeatherInfo,
	#[serde(deserialize_with = "de_string_to_bytes")]
	name: Vec<u8>,
}

// Specifying serde path as `alt_serde`
// ref: https://serde.rs/container-attrs.html#crate
#[serde(crate = "alt_serde")]
#[derive(Deserialize, Encode, Decode, Default)]
struct WeatherInfo {
	// // Specify our own deserializing function to convert JSON string to vector of bytes
	#[serde(deserialize_with = "de_f32_to_u32")]
	temp: u32,
	#[serde(deserialize_with = "de_f32_to_u32")]
	feels_like: u32,
	#[serde(deserialize_with = "de_f32_to_u32")]
	temp_min: u32,
	#[serde(deserialize_with = "de_f32_to_u32")]
	temp_max: u32,
	pressure: u32,
	humidity: u32,
}

pub fn de_string_to_bytes<'de, D>(de: D) -> Result<Vec<u8>, D::Error>
where
	D: Deserializer<'de>,
{
	let s: &str = Deserialize::deserialize(de)?;
	Ok(s.as_bytes().to_vec())
}

pub fn de_f32_to_u32<'de, D>(de: D) -> Result<u32, D::Error>
where
	D: Deserializer<'de>,
{
	let f: f32 = Deserialize::deserialize(de)?;
	Ok(f as u32)
}

impl fmt::Debug for WeatherForecast {
	// `fmt` converts the vector of bytes inside the struct back to string for
	//   more friendly display.
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
		write!(
			f,
			"{{ Forecast: {:#?}, Location {:#?}}}",
			&self.main,
			str::from_utf8(&self.name).map_err(|_| fmt::Error)?,
		)
	}
}

impl fmt::Debug for WeatherInfo {
	// `fmt` converts the vector of bytes inside the struct back to string for
	//   more friendly display.
	// Convert temperature from Kelvin to Celsius
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
		write!(
			f,
			"{{ Temperature: {:#?}°C}}",
			(&self.temp - 273)
		)
	}
}

/// This is the pallet's configuration trait
pub trait Trait: system::Trait + CreateSignedTransaction<Call<Self>> {
	/// The identifier type for an offchain worker.
	type AuthorityId: AppCrypto<Self::Public, Self::Signature>;
	/// The overarching dispatch call type.
	type Call: From<Call<Self>>;
	/// The overarching event type.
	type Event: From<Event<Self>> + Into<<Self as system::Trait>::Event>;
	/// The type to sign and send transactions.
	type UnsignedPriority: Get<TransactionPriority>;
}

// Custom data type
#[derive(Debug)]
enum TransactionType {
	SignedSubmitNumber,
	HttpFetching,
	None,
}

decl_storage! {
	trait Store for Module<T: Trait> as Example {
		/// A vector of recently submitted numbers. Should be bounded
		Numbers get(fn numbers): Vec<u32>;
	}
}

decl_event!(
	/// Events generated by the module.
	pub enum Event<T>
	where
		AccountId = <T as system::Trait>::AccountId,
	{
		/// Event generated when a new number is accepted to contribute to the average.
		NewNumber(Option<AccountId>, u32),
	}
);

decl_error! {
	pub enum Error for Module<T: Trait> {
		// Error returned when making signed transactions in off-chain worker
		SignedSubmitNumberError,
		// Error returned when making remote http fetching
		HttpFetchingError,
		// Error returned when Weather-info has already been fetched
		AlreadyFetched,
	}
}

decl_module! {
	pub struct Module<T: Trait> for enum Call where origin: T::Origin {
		fn deposit_event() = default;

		#[weight = 0]
		pub fn submit_number_signed(origin, number: u32) -> DispatchResult {
			debug::info!("submit_number_signed: {:?}", number);
			let who = ensure_signed(origin.clone())?;
			Self::append_or_replace_number(Some(who), number)
		}

		fn offchain_worker(block_number: T::BlockNumber) {
			debug::info!("Entering off-chain workers");

			let result = match Self::choose_tx_type(block_number) {
				TransactionType::SignedSubmitNumber => Self::signed_submit_number(block_number.into()),
				TransactionType::HttpFetching => Self::fetch_if_needed(),
				TransactionType::None => Ok(())
			};

			if let Err(e) = result { debug::error!("Error: {:?}", e); }
		}
	}
}

impl<T: Trait> Module<T> {
	/// Add a new number to the list.
	fn append_or_replace_number(who: Option<T::AccountId>, number: u32) -> DispatchResult {
		Numbers::mutate(|numbers| {
			// The append or replace logic. The `numbers` vector is at most `NUM_VEC_LEN` long.
			let num_len = numbers.len();

			if num_len < NUM_VEC_LEN {
				numbers.push(number);
			} else {
				numbers[num_len % NUM_VEC_LEN] = number;
			}

			// displaying the average
			let num_len = numbers.len();
			let average = match num_len {
				0 => 0,
				_ => numbers.iter().sum::<u32>() / (num_len as u32),
			};

			debug::info!("Current average of numbers is: {}", average);
		});

		// Raise the NewNumber event
		Self::deposit_event(RawEvent::NewNumber(who, number));
		Ok(())
	}

	fn choose_tx_type(block_number: T::BlockNumber) -> TransactionType {
		// Decide what type of transaction to send based on block number.
		// Each block the offchain worker will send one type of transaction back to the chain.
		// First a signed transaction, then an unsigned transaction, then an http fetch and json parsing.
		match block_number.try_into().ok().unwrap() % 2 {
			0 => TransactionType::SignedSubmitNumber,
			1 => TransactionType::HttpFetching,
			_ => TransactionType::None,
		}
	}

	/// Check if we have fetched Weather info before. If yes, we use the cached version that is
	///   stored in off-chain worker storage `storage`. If no, we fetch the remote info and then
	///   write the info into the storage for future retrieval.
	fn fetch_if_needed() -> Result<(), Error<T>> {
		// Start off by creating a reference to Local Storage value.
		// Since the local storage is common for all offchain workers, it's a good practice
		// to prepend our entry with the pallet name.
		let s_info = StorageValueRef::persistent(b"ocw-weather::weather-info");
		let s_lock = StorageValueRef::persistent(b"ocw-weather::lock");

		// The local storage is persisted and shared between runs of the offchain workers,
		// and offchain workers may run concurrently. We can use the `mutate` function, to
		// write a storage entry in an atomic fashion.
		//
		// It has a similar API as `StorageValue` that offer `get`, `set`, `mutate`.
		// If we are using a get-check-set access pattern, we likely want to use `mutate` to access
		// the storage in one go.
		//
		// Ref: https://substrate.dev/rustdocs/v2.0.0-rc3/sp_runtime/offchain/storage/struct.StorageValueRef.html
		// if let Some(Some(weather_forecast)) = s_info.get::<WeatherInfo>() {
		// 	// weather-info has already been fetched. Return early.
		// 	debug::info!("cached weather-info: {:?}", weather_forecast);
		// 	return Ok(());
		// }

		// We are implementing a mutex lock here with `s_lock`
		let res: Result<Result<bool, bool>, Error<T>> = s_lock.mutate(|s: Option<Option<bool>>| {
			match s {
				// `s` can be one of the following:
				//   `None`: the lock has never been set. Treated as the lock is free
				//   `Some(None)`: unexpected case, treated it as AlreadyFetch
				//   `Some(Some(false))`: the lock is free
				//   `Some(Some(true))`: the lock is held

				// If the lock has never been set or is free (false), return true to execute `fetch_n_parse`
				None | Some(Some(false)) => Ok(true),

				// Otherwise, someone already hold the lock (true), we want to skip `fetch_n_parse`.
				// Covering cases: `Some(None)` and `Some(Some(true))`
				_ => Err(<Error<T>>::AlreadyFetched),
			}
		});

		// Cases of `res` returned result:
		//   `Err(<Error<T>>)` - lock is held, so we want to skip `fetch_n_parse` function.
		//   `Ok(Err(true))` - Another ocw is writing to the storage while we set it,
		//                     we also skip `fetch_n_parse` in this case.
		//   `Ok(Ok(true))` - successfully acquire the lock, so we run `fetch_n_parse`
		if let Ok(Ok(true)) = res {
			match Self::fetch_n_parse() {
				Ok(weather_forecast) => {
					// set weather-info into the storage and release the lock
					s_info.set(&weather_forecast);
					s_lock.set(&false);

					debug::info!("fetched weather-info: {:?}", weather_forecast);
				}
				Err(err) => {
					// release the lock
					s_lock.set(&false);
					return Err(err);
				}
			}
		}
		Ok(())
	}

	/// Fetch from remote and deserialize the JSON to a struct
	fn fetch_n_parse() -> Result<WeatherForecast, Error<T>> {
		let resp_bytes = Self::fetch_from_remote().map_err(|e| {
			debug::error!("fetch_from_remote error: {:?}", e);
			<Error<T>>::HttpFetchingError
		})?;

		let resp_str = str::from_utf8(&resp_bytes).map_err(|_| <Error<T>>::HttpFetchingError)?;
		// Print out our fetched JSON string
		//debug::info!("{}", resp_str);

		// Deserializing JSON to struct, thanks to `serde` and `serde_derive`
		let weather_forecast: WeatherForecast =
					serde_json::from_str::<WeatherForecast>(&resp_str).map_err(|_| <Error<T>>::HttpFetchingError)?;
		// Print out our fetched JSON string
		debug::info!("{:#?}", weather_forecast);

		Ok(weather_forecast)
	}

	/// This function uses the `offchain::http` API to query the remote Weather information,
	///   and returns the JSON response as vector of bytes.
	fn fetch_from_remote() -> Result<Vec<u8>, Error<T>> {
		let remote_url_bytes = HTTP_REMOTE_REQUEST_BYTES.to_vec();
		let remote_url =
			str::from_utf8(&remote_url_bytes).map_err(|_| <Error<T>>::HttpFetchingError)?;

		debug::info!("sending request to: {}", remote_url);

		// Initiate an external HTTP GET request. This is using high-level wrappers from `sp_runtime`.
		let request = rt_offchain::http::Request::get(remote_url);

		// Keeping the offchain worker execution time reasonable, so limiting the call to be within 3s.
		let timeout = sp_io::offchain::timestamp().add(rt_offchain::Duration::from_millis(3000));

		let pending = request
			.deadline(timeout) // Setting the timeout time
			.send() // Sending the request out by the host
			.map_err(|_| <Error<T>>::HttpFetchingError)?;

		// By default, the http request is async from the runtime perspective. So we are asking the
		//   runtime to wait here.
		// The returning value here is a `Result` of `Result`, so we are unwrapping it twice by two `?`
		//   ref: https://substrate.dev/rustdocs/v2.0.0-rc3/sp_runtime/offchain/http/struct.PendingRequest.html#method.try_wait
		let response = pending
			.try_wait(timeout)
			.map_err(|_| <Error<T>>::HttpFetchingError)?
			.map_err(|_| <Error<T>>::HttpFetchingError)?;

		if response.code != 200 {
			debug::error!("Unexpected http request status code: {}", response.code);
			return Err(<Error<T>>::HttpFetchingError);
		}

		// Next we fully read the response body and collect it to a vector of bytes.
		Ok(response.body().collect::<Vec<u8>>())
	}

	fn signed_submit_number(block_number: T::BlockNumber) -> Result<(), Error<T>> {
		let signer = Signer::<T, T::AuthorityId>::all_accounts();
		if !signer.can_sign() {
			debug::error!("No local account available");
			return Err(<Error<T>>::SignedSubmitNumberError);
		}

		// Using `SubmitSignedTransaction` associated type we create and submit a transaction
		// representing the call, we've just created.
		// Submit signed will return a vector of results for all accounts that were found in the
		// local keystore with expected `KEY_TYPE`.
		let submission: u32 = block_number.try_into().ok().unwrap() as u32;
		let results = signer.send_signed_transaction(|_acct| {
			// We are just submitting the current block number back on-chain
			Call::submit_number_signed(submission)
		});

		for (acc, res) in &results {
			match res {
				Ok(()) => {
					debug::native::info!(
						"off-chain send_signed: acc: {:?}| number: {}",
						acc.id,
						submission
					);
				}
				Err(e) => {
					debug::error!("[{:?}] Failed in signed_submit_number: {:?}", acc.id, e);
					return Err(<Error<T>>::SignedSubmitNumberError);
				}
			};
		}
		Ok(())
	}
}
