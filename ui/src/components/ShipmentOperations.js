import React, { useState, Fragment } from 'react';
import { Form } from 'semantic-ui-react';

import { TxButton } from '../substrate-lib/components';
import { hexToString } from '@polkadot/util';

export default function Main (props) {
  const { accountPair, shipment } = props;
  const [status, setStatus] = useState(null);
  const [state, setState] = useState({
    latitude: 0.0,
    longitude: 0.0,
    deviceId: '',
    sensorType: '',
    sensorValue: 0.0
  });
  const sensorTypes = [
    'Humidity', 'Pressure', 'Shock', 'Tilt',
    'Temperature', 'Vibration'].map(v => ({ value: v, text: v }));

  const handleChange = (_, data) =>
    setState({ ...state, [data.state]: data.value });

  if (!shipment) return null;

  return <Fragment>
    <TxButton
      accountPair={accountPair}
      label='Pickup'
      type='SIGNED-TX'
      setStatus={setStatus}
      style={{ display: shipment.status.isPending ? 'inline-block' : 'none' }}
      attrs={{
        palletRpc: 'productTracking',
        callable: 'trackShipment',
        inputParams: [hexToString(shipment.id.toString()), 'Pickup', Date.now().toString(), null, null],
        paramFields: [{ optional: false }, { optional: false }, { optional: false }, { optional: true }, { optional: true }]
      }}
    />
    <Form style={{ display: shipment.status.isInTransit ? 'inline-block' : 'none' }}>
      <Form.Input
        name='latitude'
        label='Latitude'
        state='latitude'
        value={state.latitude}
        onChange={handleChange}
      />
      <Form.Input
        name='longitude'
        label='Longitude'
        state='longitude'
        value={state.longitude}
        onChange={handleChange}
      />
      <Form.Input
        name='deviceId'
        label='Device ID'
        state='deviceId'
        value={state.deviceId}
        onChange={handleChange}
      />
      <Form.Dropdown
        placeholder='Select a sensor type'
        fluid
        label='Sensor type'
        clearable
        selection
        state='sensorType'
        options={sensorTypes}
        value={state.sensorType}
        onChange={handleChange}
      />
      <Form.Input
        name='sensorValue'
        label='Sensor value'
        state='sensorValue'
        value={state.sensorValue}
        onChange={handleChange}
      />
      <Form.Field>
        <TxButton
          accountPair={accountPair}
          label='Scan'
          type='SIGNED-TX'
          setStatus={setStatus}
          attrs={{
            palletRpc: 'productTracking',
            callable: 'trackShipment',
            inputParams: [shipment.id, 'Scan', Date.now(),
              (state.latitude !== 0.0 && state.longitude !== 0.0 ? { latitude: state.latitude, longitude: state.longitude } : null),
              (state.deviceId !== '' && state.sensorType !== '' && state.sensorValue !== 0.0
                ? [{ deviceId: state.deviceId, readingType: state.sensorType, timestamp: Date.now(), value: state.sensorValue }]
                : null)
            ],
            paramFields: [{ optional: false }, { optional: false }, { optional: false }, { optional: true }, { optional: true }]
          }}
        />
        <TxButton
          accountPair={accountPair}
          label='Deliver'
          type='SIGNED-TX'
          setStatus={setStatus}
          attrs={{
            palletRpc: 'productTracking',
            callable: 'trackShipment',
            inputParams: [shipment.id, 'Deliver', Date.now(), null, null],
            paramFields: [{ optional: false }, { optional: false }, { optional: false }, { optional: true }, { optional: true }]
          }}
        />
      </Form.Field>
      <div style={{ overflowWrap: 'break-word' }}>{status}</div>
    </Form>
    <div style={{ display: shipment.status.isDelivered ? 'inline-block' : 'none' }}>
      No operation available: Shipment has been delivered.
    </div>
  </Fragment>;
}
