import React, { useEffect, useState } from 'react';
import { Header } from 'semantic-ui-react';

import { useSubstrate } from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import { hexToString } from '@polkadot/util';

export default function Main (props) {
  const { api } = useSubstrate();
  const { accountPair, shipment } = props;
  const [status, setStatus] = useState(null);
  const [paramFields, setParamFields] = useState([]);

  const updateParamFields = () => {
    if (!api.tx.productTracking) {
      return;
    }
    const paramFields = api.tx.productTracking.trackShipment.meta.args.map(arg => ({
      name: arg.name.toString(),
      type: arg.type.toString()
    }));
    setParamFields(paramFields);
  };

  useEffect(updateParamFields, [api]);

  return (
    shipment != null
      ?
      <>
        <TxButton
          accountPair={accountPair}
          label='Pickup'
          type='SIGNED-TX'
          style={{ display: 'block', margin: 'auto' }}
          setStatus={setStatus}
          attrs={{
            palletRpc: 'productTracking',
            callable: 'trackShipment',
            inputParams: [hexToString(shipment.id.toString()), 'Pickup', Date.now().toString(), null, null],
            paramFields: paramFields
          }}
          style={{ display: shipment.status.isPending ? 'inline-block' : 'none' }}
        />
        <TxButton
          accountPair={accountPair}
          label='Pickup'
          type='SIGNED-TX'
          style={{ display: 'block', margin: 'auto' }}
          setStatus={setStatus}
          attrs={{
            palletRpc: 'productTracking',
            callable: 'trackShipment',
            inputParams: [shipment.id, 'Scan', Date.now(), null, null],
            paramFields: paramFields
          }}
          style={{ display: shipment.status.isInTransit ? 'inline-block' : 'none' }}
        />
        <TxButton
          accountPair={accountPair}
          label='Pickup'
          type='SIGNED-TX'
          style={{ display: 'block', margin: 'auto' }}
          setStatus={setStatus}
          attrs={{
            palletRpc: 'productTracking',
            callable: 'trackShipment',
            inputParams: [shipment.id, 'Deliver', Date.now(), null, null],
            paramFields: paramFields
          }}
          style={{ display: shipment.status.isInTransit ? 'inline-block' : 'none' }}
        />
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </>
      : <div></div>
  );
}
