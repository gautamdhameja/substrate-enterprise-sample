import React, { useState } from 'react';
import { Form, Grid } from 'semantic-ui-react';
import { TxButton } from '../substrate-lib/components';

export default function Main (props) {
  const [status, setStatus] = useState(null);
  const [formState, setFormState] = useState({ addressTo: null });
  const { accountPair } = props;

  const onChange = (_, data) =>
    setFormState(prev => ({ ...prev, [data.state]: data.value }));

  const { addressTo } = formState;

  return (
    <Grid.Column width={8}>
      <h3>Add To Organization</h3>
      <Form>
        <Form.Field style={{ flexGrow: 1 }}>
          <Form.Input
            fluid required
            label='For'
            type='text'
            placeholder='Address'
            state='addressTo'
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <TxButton
            accountPair={accountPair}
            label='Submit'
            type='SIGNED-TX'
            setStatus={setStatus}
            attrs={{
              palletRpc: 'registrar',
              callable: 'addToOrganization',
              inputParams: [addressTo],
              paramFields: [true]
            }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}
