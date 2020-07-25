import React, { useEffect, useState } from 'react';
import { Grid, Form, Dropdown } from 'semantic-ui-react';

import { useSubstrate } from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';

function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;
  const [status, setStatus] = useState(null);
  const [palletRPCs, setPalletRPCs] = useState([]);
  const [permission, setPermission] = useState(0);

  const initFormState = {
    palletRpc: ''
  };

  const [formState, setFormState] = useState(initFormState);
  const { palletRpc } = formState;

  const permissionOptions = [
    {
      key: 'Execute',
      text: 'Execute',
      value: 'Execute'
    },
    {
      key: 'Manage',
      text: 'Manage',
      value: 'Manage'
    }
  ];

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const updatePalletRPCs = () => {
    if (!api) { return; }
    const palletRPCs = Object.keys(api.tx).sort()
      .filter(pr => Object.keys(api.tx[pr]).length > 0)
      .map(pr => ({ key: pr, value: pr, text: pr }));
    setPalletRPCs(palletRPCs);
  };

  useEffect(updatePalletRPCs, [api]);

  const onPalletCallableParamChange = (_, data) => {
    setFormState(formState => {
      let res;
      const { state, value } = data;
      if (state === 'palletRpc') {
        res = { ...formState, [state]: value };
      }
      return res;
    });
  };

  return (
    <Grid.Column width={8}>
      <h3>Create Role</h3>
      <Form>
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
            placeholder='Select Permission'
            fluid
            selection
            options={permissionOptions}
            onChange={(_, { value }) => setPermission(value) }
          />
        </Form.Field>
        <Form.Field>
          <TxButton
            accountPair={accountPair}
            label='Call'
            setStatus={setStatus}
            type='SIGNED-TX'
            attrs={{
              palletRpc: 'rbac',
              callable: 'createRole',
              inputParams: [capitalizeFirstLetter(palletRpc), permission],
              paramFields: [true, true]
            }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}

export default function CreateRole (props) {
  const { api } = useSubstrate();
  return api.tx ? <Main {...props} /> : null;
}
