import React, { useEffect, useState } from 'react';
import { Grid, Form, Dropdown, Input } from 'semantic-ui-react';

import { useSubstrate } from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';

function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;
  const [status, setStatus] = useState(null);
  const [roles, setRoles] = useState([]);
  const [formState, setFormState] = useState({ addressTo: null, pallet: null, permission: null });
  const { addressTo, pallet, permission } = formState;

  const hex_to_ascii = (str1) => {
    var hex  = str1.toString();
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
      str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str.slice(1, str.lenght);
  }

  const onPalletParamChange = (_, data) => {
    setFormState(formState => {
      let res;
      const { state, value } = data;
      if (state === 'palletRpc') {
        res = { ...formState, [state]: value };
      }
      return res;
    });
  };

  useEffect(() => {
    let unsub = null;

    const getRoles = async () => {
      unsub = await api.query.rbac.roles( roles => {
        const validRoles = roles
          .map(role => ({ key: hex_to_ascii(role.pallet.toString()), value: role.permission.toString()}));
          setRoles(validRoles);
          console.log(validRoles);
      });
    };

    if (accountPair) {
      getRoles();
    }

    return () => unsub && unsub();
  }, [accountPair, api, setRoles]);

  const onChange = (_, data) =>
  setFormState(prev => ({ ...prev, [data.state]: data.value }));

  return (
    <Grid.Column width={8}>
      <h3>Assign Role</h3>
      <Form>
      <Form.Field>
          <Input
            fluid
            label='To'
            type='text'
            placeholder='address'
            state='addressTo'
            onChange={onChange}
          />
        </Form.Field>
        {/* <Form.Field>
          <Dropdown
            placeholder='Pallets'
            fluid
            label='Pallet'
            onChange={onPalletParamChange}
            search
            selection
            state='palletRpc'
            value={pallet}
            options={roles}
          />
        </Form.Field> */}
        {roles.map((role, ind) =>
          <Form.Field key={`${role.name}-${role.type}`}>
            <Input
              placeholder={role.type}
              fluid
              type='text'
              label={role.name}
              state={ind}
              onChange={onChange}
            />
          </Form.Field>
        )}
        <Form.Field>
          <TxButton
            accountPair={accountPair}
            label='Call'
            setStatus={setStatus}
            type='SIGNED-TX'
            attrs={{
              palletRpc: 'rbac',
              callable: 'assignRole',
              inputParams: [addressTo, [pallet, permission]],
              paramFields: [true, true]
            }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}

export default function AssignRole (props) {
  const { api } = useSubstrate();
  return api.tx ? <Main {...props} /> : null;
}
