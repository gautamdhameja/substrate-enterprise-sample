import React, { useState, Fragment } from 'react';

import { TxButton } from '../substrate-lib/components';
import { hexToString } from '@polkadot/util';

export default function Main (props) {
  const { accountPair, shipment } = props;
  const [status, setStatus] = useState(null);

  if (!shipment) return null;

  return <Fragment>
    <TxButton
      accountPair={accountPair}
      label='Pickup'
      type='SIGNED-TX'
      style={{ display: shipment.status.isPending ? 'inline-block' : 'none' }}
      setStatus={setStatus}
      attrs={{
        palletRpc: 'productTracking',
        callable: 'trackShipment',
        inputParams: [hexToString(shipment.id.toString()), 'Pickup', Date.now().toString(), null, null],
        paramFields: [{ optional: false }, { optional: false }, { optional: false }, { optional: true }, { optional: true }]
      }}
    />
    <TxButton
      accountPair={accountPair}
      label='Scan'
      type='SIGNED-TX'
      style={{ display: shipment.status.isInTransit ? 'inline-block' : 'none' }}
      setStatus={setStatus}
      attrs={{
        palletRpc: 'productTracking',
        callable: 'trackShipment',
        inputParams: [shipment.id, 'Scan', Date.now(), null, null],
        paramFields: [{ optional: false }, { optional: false }, { optional: false }, { optional: true }, { optional: true }]
      }}
    />
    <TxButton
      accountPair={accountPair}
      label='Deliver'
      type='SIGNED-TX'
      style={{ display: shipment.status.isInTransit ? 'inline-block' : 'none' }}
      setStatus={setStatus}
      attrs={{
        palletRpc: 'productTracking',
        callable: 'trackShipment',
        inputParams: [shipment.id, 'Deliver', Date.now(), null, null],
        paramFields: [{ optional: false }, { optional: false }, { optional: false }, { optional: true }, { optional: true }]
      }}
    />
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Fragment>;
}
