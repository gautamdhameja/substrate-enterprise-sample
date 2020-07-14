import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { blake2AsHex } from '@polkadot/util-crypto';
const fs = require('fs');

// config
const WEB_SOCKET = 'ws://localhost:9944';
const ALICE = '//Alice'

// For custom type to be used to connect to the substrate chain
const types = {
  Address: "AccountId",
  LookupSource: "AccountId"
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const bufferToDigest = fileReader => {
  // Turns the file content to a hexadecimal representation.
  const content = Array.from(new Uint8Array(fileReader.result))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return blake2AsHex(content, 256);
};

const parseUserDocs = (res) => {
  const ret = res
    .map(row => `${row[1].toString()} => ("${String.fromCharCode(...row[2].toU8a())}", ${row[0].toNumber()})`)
    .join(', ');

  return `{ ${ret} }`;
};

async function connect() {
  // Construct
  const wsProvider = new WsProvider(WEB_SOCKET);
  const api = await ApiPromise.create({ provider: wsProvider, types });
  return api;
}

async function submitDocInfo(filePath, comment) {
  console.debug(`submitDocInfo: ${filePath}, ${comment}`);
  try {
    const api = await connect();

    /******
     * 学员们在这里追加逻辑
     *
     * 把 filePath 档档案通过 hash 函数算出它的 hash 值。然后和 comment 一起提交个 extrinsics
     *   到 Substrate。
     ******/

    const keyring = new Keyring({ type: 'sr25519' });
    const content = fs.readFileSync(filePath, 'utf8');
    const hash = bufferToDigest(content);
    const signer = keyring.addFromUri(ALICE);

    console.log(`hash: ${hash}`);
    console.log(`signer: ${signer.address}`);

    api.tx.poeModule.createClaim(hash, comment)
      .signAndSend(signer, (res) => {
        if (!res.status.isFinalized) return;
        console.log(`You have successfully claimed file with hash ${hash} with note "${comment}"`);
      })
      .catch(err => console.log(`error: ${err}`));

    // sleep for 20 seconds to wait for transaction result, wait for 3 blocks away x 6 secs / block.
    await sleep(20000);

  } catch (err) {
    console.error(`Connect to Substrate error:`, err);
    process.exit(1);
  }

  process.exit(0);
}

// Alice address: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
async function getUserDocs(acct) {
  console.debug(`getUserDocs: ${acct}`);
  try {
    const api = await connect();

    /******
     * 学员们在这里追加逻辑
     *
     * 通过用户 addr, 取得他所有的创建文件的 hash及相关资料。返回值是：
     * {
     *   "0xabcd1234...": ["my note1", 3],
     *   "0xabcd1235...": ["my note2", 5],
     *   "0xabcd1236...": ["my note3", 7],
     *   ...
     * }
     ******/
    const res = await api.query.poeModule.usersDocs(acct);
    console.log(parseUserDocs(res));
  } catch (err) {
    console.error(`Connect to Substrate error:`, err);
  }

  process.exit(0);
}

function main() {
  const args = process.argv.slice(2, 5);
  switch (args[0]) {
    case 'submitDocInfo':
      submitDocInfo(args[1], args[2])
      break;
    case 'getUserDocs':
      getUserDocs(args[1]);
      break;
    default:
      console.error('Unknown subcommand. Please use `submitDocInfo` or `getUserDocs` only.')
  }
}

main();
