import React, { useEffect, useState } from 'react';
import { Card, Form } from 'semantic-ui-react';

import { useSubstrate } from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import { hexToString } from '@polkadot/util';

function RegisterShipmentFormComponent (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;
  const [status, setStatus] = useState(null);
  const [paramFields, setParamFields] = useState([]);
  const [products, setProducts] = useState([]);
  const [state, setState] = useState({ shipmentId: '', owner: accountPair.address, productId1: '', productId2: '' });

  const updateParamFields = () => {
    if (!api.tx.productTracking) {
      return;
    }
    const paramFields = api.tx.productTracking.registerShipment.meta.args.map(arg => ({
      name: arg.name.toString(),
      type: arg.type.toString()
    }));
    setParamFields(paramFields);
  };

  useEffect(updateParamFields, [api]);

  useEffect(() => {
    let unsubscribe;

    async function productsOfOrg (account) {
      await api.query.productRegistry.productsOfOrganization(account, data => setProducts(data));
    }

    if (accountPair) {
      productsOfOrg(accountPair.address);
    } else {
      setProducts([]);
      return () => unsubscribe && unsubscribe();
    }
  }, [api.query.productRegistry, accountPair]);

  const handleChange = (_, data) =>
    setState({ ...state, [data.state]: data.value });

  return (
    <Card fluid>
    <Card.Content header='Register a New Shipment' />
    <Card.Content>
      <Card.Description>
        <Form>
          <Form.Input
            name='shipmentId'
            label='Shipment ID'
            state='shipmentId'
            required
            value={state.shipmentId}
            onChange={handleChange}
          />
          <Form.Input
            name='owner'
            label='Owner'
            state='owner'
            value={state.owner}
            readOnly
            required
            onChange={handleChange}
          />
          <Form.Dropdown
            placeholder='Select a product'
            fluid
            label='Product 1'
            search
            selection
            state='productId1'
            options={products.map(p => {
              const productId = hexToString(p.toString());
              return { value: productId, text: productId };
            })}
            value={state.productId1}
            onChange={handleChange}
          />
          <Form.Dropdown
            placeholder='Select a product'
            fluid
            label='Product 2'
            search
            selection
            state='productId2'
            options={products.map(p => {
              const productId = hexToString(p.toString());
              return { value: productId, text: productId };
            })}
            value={state.productId2}
            onChange={handleChange}
          />
          <Form.Field>
            <TxButton
              accountPair={accountPair}
              label='Submit'
              setStatus={setStatus}
              type='SIGNED-TX'
              attrs={{
                palletRpc: 'productTracking',
                callable: 'registerShipment',
                inputParams: [state.shipmentId, state.owner, [state.productId1 || '', state.productId2 || ''].join(',')],
                paramFields: paramFields
              }}
            />
          </Form.Field>
          <div style={{ overflowWrap: 'break-word' }}>{status}</div>
        </Form>
      </Card.Description>
    </Card.Content>
  </Card>
  );
}

export default function RegisterShipmentForm (props) {
  const {
    api
  } = useSubstrate();
  return api.tx ? < RegisterShipmentFormComponent {
    ...props
  }
  /> : null;
}
