import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { blake2AsHex } from '@polkadot/util-crypto';
import config from './config/index';

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
    id: "0x534530303031", // "SE0001"
    event_type: "ShipmentPickup",
    shipment_id: NEW_SHIPMENTS.TUNA_N_PINEAPPLE.id,
    location: {
      latitude: 5250186,
      longitude: 5250186,
    },
    readings: null,
    timestamp: 1593586800, // 20200701-15:00:00 GMT+8
  },
  TRANSIT_01: {
    id: "0x534530303032", // "SE0002"
    event_type: "ShipmentInTransit",
    shipment_id: NEW_SHIPMENTS.TUNA_N_PINEAPPLE.id,
    location: {
      latitude: 7777777,
      longitude: 7777777,
    },
    readings: null,
    timestamp: 1593673200, // 20200702-15:00:00 GMT+8
  },
  TRANSIT_02: {
    id: "0x534530303033", // "SE0003"
    event_type: "ShipmentInTransit",
    shipment_id: NEW_SHIPMENTS.TUNA_N_PINEAPPLE.id,
    location: {
      latitude: 8888888,
      longitude: 8888888,
    },
    readings: null,
    timestamp: 1593689400, // 20200702-19:30:00 GMT+8
  },
  DELIVERED: {
    id: "0x534530303034", // "SE0004"
    event_type: "ShipmentDelivered",
    shipment_id: NEW_SHIPMENTS.TUNA_N_PINEAPPLE.id,
    location: {
      latitude: 9999999,
      longitude: 9999999,
    },
    readings: null,
    timestamp: 1593736200, // 20200703-08:30:00 GMT+8
  }
};

const SENSOR_READINGS = {};

const SLEEP_SEC = 8;
const LAST_SLEEP_SEC = SLEEP_SEC + 5;

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
      const ev = api.createType('ShippingEvent', SHIPMENT_EVS[k]);

      await sendTx(`Shipment Event ${k}`,
        api.tx.productTracking.recordEvent, ev, { wrapAndSpread: false });
    }

  } catch (err) {
    console.error(`Error init-chain-story:`, err);
    process.exit(1);
  }

  await sleep(LAST_SLEEP_SEC);
  process.exit(0);
}

initChainStory();
