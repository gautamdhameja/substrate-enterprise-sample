import React, { useState } from 'react';
import { Form, Card } from 'semantic-ui-react';
import { TxButton } from '../substrate-lib/components';

export default function Main (props) {
  const [status, setStatus] = useState(null);
  const [formState, setFormState] = useState({ addressTo: null });
  const { accountPair } = props;

  const onChange = (_, data) =>
    setFormState(prev => ({ ...prev, [data.state]: data.value }));

  const { addressTo } = formState;

  return <Card fluid color = 'blue'>
    <Card.Content style={{ flexGrow: 0 }} header='Add To Organization' />
    <Card.Content>
      <Card.Description>
        <Form>
          <Form.Input
            fluid required
            label='Who'
            type='text'
            placeholder='Address'
            state='addressTo'
            onChange={onChange}
          />
          <Form.Field>
            <TxButton
              accountPair={accountPair}
              label='Submit'
              type='SIGNED-TX'
              setStatus={setStatus}
              style={{ display: 'block', margin: 'auto' }}
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
      </Card.Description>
    </Card.Content>
  </Card>;
}
