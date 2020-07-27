import React, { useState } from 'react';
import { Card, Form } from 'semantic-ui-react';
import { stringToHex } from '@polkadot/util';

import { TxButton } from '../substrate-lib/components';

export default function RegisterProductForm (props) {
  const { accountPair, organization } = props;
  const [status, setStatus] = useState([]);
  const [params, setParams] = useState({ id: null, props: null });

  const onChange = (_, data) => {
    const newParams = { ...params };
    if (data.state === 'id') {
      newParams.id = (data.value.length === 0 ? null : stringToHex(data.value));
    } else if (data.state === 'desc') {
      newParams.props = (data.value.length === 0 ? null : [['0x64657363', stringToHex(data.value)]]);
    }
    setParams(newParams);
  };

  return <Card fluid color = 'blue'>
    <Card.Content style={{ flexGrow: 0 }} header = 'Register a Product' />
    <Card.Content>
      <Card.Description>
        <Form>
          <Form.Input
            fluid required
            label='Product ID'
            name='productId'
            state='id'
            onChange={onChange}
          />
          <Form.Input
            fluid required
            label='Description'
            name='productDesc'
            state='desc'
            onChange={onChange}
          />
          <Form.Field>
            <TxButton
              accountPair={accountPair}
              label='Register'
              type='SIGNED-TX'
              style={{ display: 'block', margin: 'auto' }}
              setStatus={setStatus}
              attrs={{
                palletRpc: 'productRegistry',
                callable: 'registerProduct',
                inputParams: [params.id, organization, params.props],
                paramFields: [true, true, true]
              }}
            />
          </Form.Field>
          <div style={{ overflowWrap: 'break-word' }}>{status}</div>
        </Form>
      </Card.Description>
    </Card.Content>
  </Card>;
}
