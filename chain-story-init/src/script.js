import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { blake2AsHex } from '@polkadot/util-crypto';
import config from './config/index';

const ONE_HOUR = 60*60*1000;

// App constant
const ALICE = '//Alice'
const ALICE_ADDR = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'

const PRODUCTS = {
  CANNED_TUNA: {
    id: "0x3030303132333435363030303132", // GTIN-14: 00012345600012
    owner: ALICE_ADDR,
    props: [[
      "0x64657363", // "desc"
      "0x70726f647563743a63616e6e65642d74756e61", // "product:canned-tuna"
    ]],
  },
  PINEAPPLE_PACKAGE: {
    id: "0x3137333530303533383530303136", // GTIN-14: 17350053850016
    owner: ALICE_ADDR,
    props: [[
      "0x64657363", // "desc"
      "0x7061636b6167653a70696e656170706c65", // "package:pineapple"
    ]],
  }
}

const NEW_SHIPMENTS = {
  TUNA_N_PINEAPPLE: {
    id: "0x5330303031", // "S0001"
    owner: ALICE_ADDR,
    products: ["0x3030303132333435363030303132", "0x3137333530303533383530303136"]
  }
};

const SHIPMENT_EVS = {
  PICKUP: {
    id: NEW_SHIPMENTS.TUNA_N_PINEAPPLE.id,
    operation: "Pickup",
    timestamp: Date.now() + (1 * ONE_HOUR),
    location: {
      latitude: 5250186,
      longitude: 5250186,
    },
    readings: null,
  },
  SCAN_01: {
    id: NEW_SHIPMENTS.TUNA_N_PINEAPPLE.id,
    operation: "Scan",
    timestamp: Date.now() + (2 * ONE_HOUR),
    location: {
      latitude: 7777777,
      longitude: 7777777,
    },
    readings: null,
  },
  SCAN_02: {
    id: NEW_SHIPMENTS.TUNA_N_PINEAPPLE.id,
    operation: "Scan",
    timestamp: Date.now() + (3 * ONE_HOUR),
    location: {
      latitude: 8888888,
      longitude: 8888888,
    },
    readings: null,
  },
  DELIVER: {
    id: NEW_SHIPMENTS.TUNA_N_PINEAPPLE.id,
    operation: "Deliver",
    timestamp: Date.now() + (4 * ONE_HOUR),
    location: {
      latitude: 9999999,
      longitude: 9999999,
    },
    readings: null,
  }
};

const SENSOR_READINGS = {};

const SLEEP_SEC = 1;
const LAST_SLEEP_SEC = SLEEP_SEC + 9;

function sleep(sec) {
  console.log(`sleep for ${sec} sec...`);
  return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

let _nonce = 0;
function getNextNonce() {
  let now = _nonce;
  _nonce += 1;
  return now;
}

async function connect() {
  // Construct
  const wsProvider = new WsProvider(config.PROVIDER_SOCKET);
  const api = await ApiPromise.create({ provider: wsProvider, types: config.CUSTOM_TYPES });
  return api;
}

const sendTxBy = signer => async (subject, tx, txParam, opts = { wrapAndSpread: true }) => {
  console.log(subject);
  const txAndParams = opts.wrapAndSpread ? tx(...Object.values(txParam)) : tx(txParam);
  const unsub = await txAndParams.signAndSend(signer, { nonce: getNextNonce() }, res => {
      console.log(`${subject}: status: ${res.status}`);
      res.status.isFinalized && unsub();
    });
  await sleep(SLEEP_SEC);
};

async function initChainStory() {
  console.debug('Initiatizing chain story...');

  try {
    const api = await connect();
    const keyring = new Keyring({ type: 'sr25519' });
    const signer = keyring.addFromUri(ALICE);
    console.log(`Signing by: ${ALICE}, addr: ${signer.address}`);

    const sendTx = sendTxBy(signer);

    await sendTx('Create CANNED_TUNA',
      api.tx.productRegistry.registerProduct, PRODUCTS.CANNED_TUNA);

    await sendTx('Create PINEAPPLE_PACKAGE',
      api.tx.productRegistry.registerProduct, PRODUCTS.PINEAPPLE_PACKAGE);

    await sendTx('Register a new shipment of TUNA_N_PINEAPPLE',
      api.tx.productTracking.registerShipment, NEW_SHIPMENTS.TUNA_N_PINEAPPLE);

    // Register all shipping events
    for (const k in SHIPMENT_EVS) {
      await sendTx(`Shipment Event ${k}`,
        api.tx.productTracking.trackShipment, SHIPMENT_EVS[k]);
    }

  } catch (err) {
    console.error(`Error init-chain-story:`, err);
    process.exit(1);
  }

  await sleep(LAST_SLEEP_SEC);
  process.exit(0);
}

initChainStory();
