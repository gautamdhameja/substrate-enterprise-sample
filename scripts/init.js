import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { v4 as uuidv4 } from 'uuid';

import types from './types.js';

const provider = new WsProvider("ws://127.0.0.1:9944");
const api = await ApiPromise.create({ provider, types });

async function main() {
  const keyring = new Keyring({ type: 'sr25519' });
  const users = {
    admin: { key: keyring.addFromUri('//Alice', { name: 'ADMIN' }), nonce: 0 },
    bob: { key: keyring.addFromUri('//Bob', { name: 'Bob' }), nonce: 0 },
    bobBank: { key: keyring.addFromUri('//Bob//stash', { name: 'Bob-BANK' }), nonce: 0 },
    betty: { key: keyring.addFromUri('//Bert', { name: 'Bert' }), nonce: 0 },
    charlie: { key: keyring.addFromUri('//Charlie', { name: 'Charlie' }), nonce: 0 },
    charlieBank: { key: keyring.addFromUri('//Charlie//stash', { name: 'Charlie-BANK' }), nonce: 0 },
    clarice: { key: keyring.addFromUri('//Clarice', { name: 'Clarice' }), nonce: 0 },
    dave: { key: keyring.addFromUri('//Dave', { name: 'Dave' }), nonce: 0 },
    daveBank: { key: keyring.addFromUri('//Dave//stash', { name: 'Dave-BANK' }), nonce: 0 },
    daisy: { key: keyring.addFromUri('//Daisy', { name: 'Daisy' }), nonce: 0 },
    eve: { key: keyring.addFromUri('//Eve', { name: 'Eve' }), nonce: 0 },
    eveBank: { key: keyring.addFromUri('//Eve//stash', { name: 'Eve-BANL' }), nonce: 0 },
    erowid: { key: keyring.addFromUri('//Erowid', { name: 'Erowid' }), nonce: 0 },
    ferdie: { key: keyring.addFromUri('//Ferdie', { name: 'Ferdie' }), nonce: 0 },
    ferdieBank: { key: keyring.addFromUri('//Ferdie//stash', { name: 'Ferdie-BANK' }), nonce: 0 },
    francis: { key: keyring.addFromUri('//Francis', { name: 'Francis' }), nonce: 0 },
  }

  try {
    // bootstrap superuser privileges
    submitTxn(api.tx.registrar.createOrganization('Supply Chain Consortium'), users.admin);

    // creating a role has the side-effect of assigning the new role to the account that created it
    submitTxn(api.tx.rbac.createRole(`Registrar`, 'Manage'), users.admin);
    submitTxn(api.tx.rbac.createRole(`ProductRegistry`, 'Manage'), users.admin);
    submitTxn(api.tx.rbac.createRole(`ProductTracking`, 'Manage'), users.admin);
    submitTxn(api.tx.rbac.createRole(`Balances`, 'Manage'), users.admin);

    // in order to assign a role, it must be created first
    const executeRegistrar = api.registry.createType("Role", { pallet: 'Registrar', permission: 'Execute' });
    submitTxn(api.tx.rbac.createRole(`Registrar`, 'Execute'), users.admin);
    const executeProductRegistry = api.registry.createType("Role", { pallet: 'ProductRegistry', permission: 'Execute' });
    submitTxn(api.tx.rbac.createRole(`ProductRegistry`, 'Execute'), users.admin);
    const executeProductTracking = api.registry.createType("Role", { pallet: 'ProductTracking', permission: 'Execute' });
    submitTxn(api.tx.rbac.createRole(`ProductTracking`, 'Execute'), users.admin);
    const executeBalances = api.registry.createType("Role", { pallet: 'Balances', permission: 'Execute' });
    submitTxn(api.tx.rbac.createRole(`Balances`, 'Execute'), users.admin);

    const second = 1000;
    const block = 3.01 * second;
    const minute = 60 * second;
    const hour = 60 * minute;
    const day = 24 * hour;
    await new Promise(r => setTimeout(r, block));

    // assign roles
    submitTxn(api.tx.rbac.assignRole(users.bob.key.address, executeRegistrar), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.bob.key.address, executeProductRegistry), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.betty.key.address, executeProductRegistry), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.bob.key.address, executeProductTracking), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.betty.key.address, executeProductTracking), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.bobBank.key.address, executeBalances), users.admin);

    submitTxn(api.tx.rbac.assignRole(users.charlie.key.address, executeRegistrar), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.charlie.key.address, executeProductRegistry), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.clarice.key.address, executeProductRegistry), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.charlie.key.address, executeProductTracking), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.clarice.key.address, executeProductTracking), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.charlieBank.key.address, executeBalances), users.admin);

    submitTxn(api.tx.rbac.assignRole(users.dave.key.address, executeRegistrar), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.dave.key.address, executeProductRegistry), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.daisy.key.address, executeProductRegistry), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.dave.key.address, executeProductTracking), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.daisy.key.address, executeProductTracking), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.daveBank.key.address, executeBalances), users.admin);

    submitTxn(api.tx.rbac.assignRole(users.eve.key.address, executeRegistrar), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.eve.key.address, executeProductRegistry), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.erowid.key.address, executeProductRegistry), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.eve.key.address, executeProductTracking), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.erowid.key.address, executeProductTracking), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.eveBank.key.address, executeBalances), users.admin);

    submitTxn(api.tx.rbac.assignRole(users.ferdie.key.address, executeRegistrar), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.ferdie.key.address, executeProductRegistry), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.francis.key.address, executeProductRegistry), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.ferdie.key.address, executeProductTracking), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.francis.key.address, executeProductTracking), users.admin);
    submitTxn(api.tx.rbac.assignRole(users.ferdieBank.key.address, executeBalances), users.admin);

    await new Promise(r => setTimeout(r, block));

    const salary = 100_000_000_000_000;

    // create organizations & add members
    submitTxn(api.tx.registrar.createOrganization(`Bob's Burgers`), users.bob);
    submitTxn(api.tx.registrar.addToOrganization(users.betty.key.address), users.bob);
    submitTxn(api.tx.balances.transfer(users.betty.key.address, salary), users.bobBank);

    submitTxn(api.tx.registrar.createOrganization(`Charlie's Cheese`), users.charlie);
    submitTxn(api.tx.registrar.addToOrganization(users.clarice.key.address), users.charlie);
    submitTxn(api.tx.balances.transfer(users.clarice.key.address, salary), users.charlieBank);

    submitTxn(api.tx.registrar.createOrganization(`Dave's Dough`), users.dave);
    submitTxn(api.tx.registrar.addToOrganization(users.daisy.key.address), users.dave);
    submitTxn(api.tx.balances.transfer(users.daisy.key.address, salary), users.daveBank);

    submitTxn(api.tx.registrar.createOrganization(`Eve's Leaves`), users.eve);
    submitTxn(api.tx.registrar.addToOrganization(users.erowid.key.address), users.eve);
    submitTxn(api.tx.balances.transfer(users.erowid.key.address, salary), users.eveBank);

    submitTxn(api.tx.registrar.createOrganization(`Ferdie's Flowers`), users.ferdie);
    submitTxn(api.tx.registrar.addToOrganization(users.francis.key.address), users.ferdie);
    submitTxn(api.tx.balances.transfer(users.francis.key.address, salary), users.ferdieBank);

    await new Promise(r => setTimeout(r, block));

    // create products
    const beef = uuidv4();
    submitTxn(api.tx.productRegistry.registerProduct(beef, users.bob.key.address, [['desc', 'beef burger']]), users.betty);
    const veggie = uuidv4();
    submitTxn(api.tx.productRegistry.registerProduct(veggie, users.bob.key.address, [['desc', 'veggie burger']]), users.betty);

    const ricotta = uuidv4();
    submitTxn(api.tx.productRegistry.registerProduct(ricotta, users.charlie.key.address, [['desc', 'fresh ricotta']]), users.clarice);
    const gruyere = uuidv4();
    submitTxn(api.tx.productRegistry.registerProduct(gruyere, users.charlie.key.address, [['desc', 'aged gruyere']]), users.clarice);

    const bread = uuidv4();
    submitTxn(api.tx.productRegistry.registerProduct(bread, users.dave.key.address, [['desc', 'bread loaf']]), users.daisy);
    const rolls = uuidv4();
    submitTxn(api.tx.productRegistry.registerProduct(rolls, users.dave.key.address, [['desc', 'dinner rolls']]), users.daisy);

    const begonia = uuidv4();
    submitTxn(api.tx.productRegistry.registerProduct(begonia, users.eve.key.address, [['desc', 'begonia rex']]), users.erowid);
    const fern = uuidv4();
    submitTxn(api.tx.productRegistry.registerProduct(fern, users.eve.key.address, [['desc', 'sword fern']]), users.erowid);

    const iris = uuidv4();
    submitTxn(api.tx.productRegistry.registerProduct(iris, users.ferdie.key.address, [['desc', 'purple iris']]), users.francis);
    const orchid = uuidv4();
    submitTxn(api.tx.productRegistry.registerProduct(orchid, users.ferdie.key.address, [['desc', 'white orchid']]), users.francis);

    await new Promise(r => setTimeout(r, block));

    const now = Date.now() - 7 * day;
    const rand = (min, max) => Math.random() * (max - min) + min;
    const loc = () => { return { latitude: rand(-180.0, 180.0), longitude: rand(-180.0, 180.0) } };
    // Invalid Transaction: Transaction has a bad signature
    // const tilt = api.registry.createType('Reading', {
    //   device_id: 'tilt-dev',
    //   reading_type: 'Tilt',
    //   timestamp: now + 2 * hour,
    //   value: 100,
    // });

    const bobShipment = uuidv4();
    submitTxn(api.tx.productTracking.registerShipment(bobShipment, users.bob.key.address, [beef, veggie]), users.betty);
    submitTxn(api.tx.productTracking.trackShipment(bobShipment, 'Pickup', now, loc(), null), users.betty);
    submitTxn(api.tx.productTracking.trackShipment(bobShipment, 'Scan', now + day, loc(), null), users.betty);
    submitTxn(api.tx.productTracking.trackShipment(bobShipment, 'Scan', now + rand(2.5, 4.5) * day, loc(), null), users.betty);
    submitTxn(api.tx.productTracking.trackShipment(bobShipment, 'Deliver', now + rand(5.0, 6.5) * day, loc(), null), users.betty);

    const charlieShipment = uuidv4();
    submitTxn(api.tx.productTracking.registerShipment(charlieShipment, users.charlie.key.address, [ricotta, gruyere]), users.clarice);
    submitTxn(api.tx.productTracking.trackShipment(charlieShipment, 'Pickup', now + hour, loc(), null), users.clarice);
    submitTxn(api.tx.productTracking.trackShipment(charlieShipment, 'Scan', now + rand(1.0, 2.5) * day, loc(), null), users.clarice);
    submitTxn(api.tx.productTracking.trackShipment(charlieShipment, 'Scan', now + rand(3.0, 3.5) * day, loc(), null), users.clarice);
    submitTxn(api.tx.productTracking.trackShipment(charlieShipment, 'Deliver', now + rand(4.0, 6.5) * day, loc(), null), users.clarice);

    const daveShipment = uuidv4();
    submitTxn(api.tx.productTracking.registerShipment(daveShipment, users.dave.key.address, [bread, rolls]), users.daisy);
    submitTxn(api.tx.productTracking.trackShipment(daveShipment, 'Pickup', now + rand(1.0, 6.0) * hour, loc(), null), users.daisy);
    submitTxn(api.tx.productTracking.trackShipment(daveShipment, 'Scan', now + day, loc(), null), users.daisy);
    submitTxn(api.tx.productTracking.trackShipment(daveShipment, 'Scan', now + rand(1.5, 3.0) * day, loc(), null), users.daisy);
    submitTxn(api.tx.productTracking.trackShipment(daveShipment, 'Deliver', now + rand(4.0, 6.5) * day, loc(), null), users.daisy);

    const eveShipment = uuidv4();
    submitTxn(api.tx.productTracking.registerShipment(eveShipment, users.eve.key.address, [begonia, fern]), users.erowid);
    submitTxn(api.tx.productTracking.trackShipment(eveShipment, 'Pickup', now + rand(1.0, 12.0) * hour, loc(), null), users.erowid);
    submitTxn(api.tx.productTracking.trackShipment(eveShipment, 'Scan', now + rand(1.5, 3.5) * day, loc(), null), users.erowid);
    submitTxn(api.tx.productTracking.trackShipment(eveShipment, 'Scan', now + rand(4.0, 5.5) * day, loc(), null), users.erowid);
    submitTxn(api.tx.productTracking.trackShipment(eveShipment, 'Deliver', now + rand(6.0, 6.5) * day, loc(), null), users.erowid);

    const ferdieShipment = uuidv4();
    submitTxn(api.tx.productTracking.registerShipment(ferdieShipment, users.ferdie.key.address, [begonia, fern]), users.francis);
    submitTxn(api.tx.productTracking.trackShipment(ferdieShipment, 'Pickup', now + day, loc(), null), users.francis);
    submitTxn(api.tx.productTracking.trackShipment(ferdieShipment, 'Scan', now + rand(2.0, 3.0) * day, loc(), null), users.francis);
    submitTxn(api.tx.productTracking.trackShipment(ferdieShipment, 'Scan', now + rand(4.0, 5.0) * day, loc(), null), users.francis);
    submitTxn(api.tx.productTracking.trackShipment(ferdieShipment, 'Deliver', now + rand(5.0, 6.0) * day, loc(), null), users.francis);

    await new Promise(r => setTimeout(r, block));
  } catch (e) {
    throw e;
  }
}

main().catch(console.error).finally(() => process.exit());

function submitTxn(txn, sender) {
  const txnId = `${sender.key.meta.name}-${sender.nonce}`;
  const getType = (arg) => `${arg.type}` === 'Bytes' && arg.Type.name === 'Text' ? 'Text' : arg.type;
  const args = txn.args.map((arg, idx) => `${api.registry.createType(getType(txn.meta.args[idx]), arg)}`);
  console.log(` > [${txnId}] Submitting: ${txn.method.section}.${txn.method.method}(${args})`);
  return new Promise(async (resolve, reject) => {
    try {
      const drop = await txn.signAndSend(sender.key, { nonce: sender.nonce++ }, ({ status, events }) => {
        if (!status.isInBlock && !status.isFinalized) {
          return;
        }

        drop();
        if (!events.some(event => event.event.method === 'ExtrinsicFailed')) {
          console.log(` < [${txnId}] In block: ${status.asInBlock}`);
          resolve(events);
        }

        reject(` ! extrinsic failed in block ${status.asInBlock}`);
      });
    } catch (e) {
      reject(`${e}`);
    }
  });
}
