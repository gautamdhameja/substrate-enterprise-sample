import React, { useState } from 'react';
import { Form, Card } from 'semantic-ui-react';
import { TxButton } from '../substrate-lib/components';

export default function Main (props) {
  const [status, setStatus] = useState(null);
  const [formState, setFormState] = useState({ addressTo: null });
  const { accountPair } = props;

  const onChange = (_, data) =>
    setFormState(prev => ({ ...prev, [data.state]: data.value }));

  const flexStyle = { display: 'flex', flexDirection: 'column' };
  const flexGrowStyle = { display: 'flex', flexDirection: 'column', flexGrow: 1 };

  const { addressTo } = formState;

  return <Card fluid color='blue'>
    <Card.Content style={{ flexGrow: 0 }} header='Add Admin' />
    <Card.Content style={ flexStyle }>
      <Card.Description style={ flexGrowStyle }>
        <Form style={ flexGrowStyle }>
          <Form.Field style={{ flexGrow: 1 }}>
            <Form.Input
              fluid required
              label='To'
              type='text'
              placeholder='Address'
              state='addressTo'
              onChange={onChange}
            />
          </Form.Field>
          <Form.Field style={{ flexGrow: 0 }}>
            <TxButton
              accountPair={accountPair}
              label='Add'
              type='SUDO-TX'
              setStatus={setStatus}
              style={{ display: 'block', margin: 'auto' }}
              attrs={{
                palletRpc: 'rbac',
                callable: 'addSuperAdmin',
                inputParams: [addressTo],
                paramFields: [true]
              }}
            />
          </Form.Field>
          <div style={{ overflowWrap: 'break-word', flexGrow: 0 }}>{status}</div>
        </Form>
      </Card.Description>
    </Card.Content>
  </Card>;
}
