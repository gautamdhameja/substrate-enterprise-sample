import React, { useState } from 'react';
import { Form, Input, Grid } from 'semantic-ui-react';
import { TxButton } from '../substrate-lib/components';

export default function Main (props) {
  const [status, setStatus] = useState(null);
  const [formState, setFormState] = useState({ orgName: null });
  const { accountPair } = props;

  const onChange = (_, data) =>
    setFormState(prev => ({ ...prev, [data.state]: data.value }));

  const { orgName } = formState;

  return (
    <Grid.Column width={8}>
      <h3>Join Organization</h3>
      <Form>
        <Form.Field>
          <Input
            fluid
            label='Name'
            type='text'
            placeholder='Organization'
            state='orgName'
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
              callable: 'joinOrganization',
              inputParams: [orgName],
              paramFields: [true]
            }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}
