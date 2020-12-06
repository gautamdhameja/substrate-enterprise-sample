export default function (api, txn, sender) {
  const txnId = `${sender.key.meta.name}-${sender.nonce}`;
  const getType = (arg) => `${arg.type}` === 'Bytes' && arg.Type.name === 'Text' ? 'Text' : arg.type;
  const args = txn.args.map((arg, idx) => `${api.registry.createType(getType(txn.meta.args[idx]), arg)}`);
  console.log(` > [${txnId}] Submitting: ${txn.method.section}.${txn.method.method}(${args})`);
  return new Promise(async (resolve, reject) => {
    try {
      const drop = await txn.signAndSend(sender.key, { nonce: sender.nonce++ }, ({ status, events, dispatchError }) => {
        if (!status.isInBlock && !status.isFinalized) {
          return;
        }

        drop();
        if (dispatchError) {
          if (!dispatchError.isModule) throw `${dispatchError}`;
          const decoded = api.registry.findMetaError(dispatchError.asModule);
          throw decoded.documentation.join(' ');
        }

        console.log(` < [${txnId}] In block: ${status.asInBlock}`);
        resolve(events);
      });
    } catch (e) {
      reject(`${e}`);
    }
  });
}
