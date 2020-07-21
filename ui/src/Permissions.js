import React, { useEffect, useState } from 'react';
import { Grid, Form, Dropdown, Input } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;
  const [status, setStatus] = useState(null);
  const [formAddress, setFormAddress] = useState(null);
  const [palletRPCs, setPalletRPCs] = useState([]);
  const [callables, setCallables] = useState([]);

  const initFormState = {
    palletRpc: '',
    callable: '',
    inputParams: []
  };

  const [formState, setFormState] = useState(initFormState);
  const { palletRpc, callable } = formState;

  const updatePalletRPCs = () => {
    if (!api) { return; }
    const palletRPCs = Object.keys(api.tx).sort()
      .filter(pr => Object.keys(api.tx[pr]).length > 0)
      .map(pr => ({ key: pr, value: pr, text: pr }));
    setPalletRPCs(palletRPCs);
  };

  const updateCallables = () => {
    if (!api || palletRpc === '') { return; }
    const section = api.tx[palletRpc];
    const callables = Object.keys(section).sort()
      .map(c => ({ key: c, value: c, text: c }));
    setCallables(callables);
  };

  useEffect(updatePalletRPCs, [api]);
  useEffect(updateCallables, [api, palletRpc]);

  const onPalletCallableParamChange = (_, data) => {
    setFormState(formState => {
      let res;
      const { state, value } = data;
      if (typeof state === 'object') {
        // Input parameter updated
        const { ind, paramField: { type } } = state;
        const inputParams = [...formState.inputParams];
        inputParams[ind] = { type, value };
        res = { ...formState, inputParams };
      } else if (state === 'palletRpc') {
        res = { ...formState, [state]: value, callable: '', inputParams: [] };
      } else if (state === 'callable') {
        res = { ...formState, [state]: value, inputParams: [] };
      }
      return res;
    });
  };

  return (
    <Grid.Column width={8}>
      <h1>Permissions</h1>
      <Form>
        <Form.Field>
          <Input
            fluid
            label='To'
            type='text'
            placeholder='address'
            state='formAddress'
            onChange={(_, { value }) => setFormAddress(value)}
          />
        </Form.Field>
        <Form.Field>
          <Dropdown
            placeholder='Pallets'
            fluid
            label='Pallet'
            onChange={onPalletCallableParamChange}
            search
            selection
            state='palletRpc'
            value={palletRpc}
            options={palletRPCs}
          />
        </Form.Field>
        <Form.Field>
          <Dropdown
            placeholder='Callables'
            fluid
            label='Callable'
            onChange={onPalletCallableParamChange}
            search
            selection
            state='callable'
            value={callable}
            options={callables}
          />
        </Form.Field>
        <Form.Field>
          <TxButton
            accountPair={accountPair}
            label='Call'
            setStatus={setStatus}
            type='SIGNED-TX'
            attrs={{
              palletRpc: 'permissions',
              callable: 'add_account',
              inputParams: [formAddress, palletRpc, callable],
              paramFields: [true, true, true]
            }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}

export default function Permissions (props) {
  const { api } = useSubstrate();
  return api.tx ? <Main {...props} /> : null;
}
