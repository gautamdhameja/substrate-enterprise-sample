import React, { useEffect, useState } from 'react';
import { Form, Card } from 'semantic-ui-react';

import { useSubstrate } from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import { hexToString, u8aToString } from '@polkadot/util';

function RegisterShipmentFormComponent (props) {
  const { api } = useSubstrate();
  const { accountPair, organization } = props;
  const [status, setStatus] = useState(null);
  const [paramFields, setParamFields] = useState([]);
  const [products, setProducts] = useState([]);
  const [state, setState] = useState({
    shipmentId: '',
    owner: organization,
    productId1: '',
    productId2: ''
  });

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
    let unsub = null;

    async function productsOfOrg (organization) {
      unsub = await api.query.productRegistry.productsOfOrganization(organization,
        data => setProducts(data));
    }

    if (organization) productsOfOrg(organization);
    return () => unsub && unsub();
  }, [api.query.productRegistry, organization]);

  // For updating the Owner field
  useEffect(() => {
    async function setOwner () {
      if (!organization) {
        return;
      }

      const nonce = await api.query.palletDid.attributeNonce([organization, 'Org']);
      const attrHash = api.registry.createType('(AccountId, Text, u64)', [organization, 'Org', nonce.subn(1)]).hash;
      const orgAttr = await api.query.palletDid.attributeOf([organization, attrHash]);
      setState(state => ({ ...state, owner: u8aToString(orgAttr.value) }));
    }

    setOwner();
  }, [api.query.palletDid, api.registry, organization]);

  const handleChange = (_, data) =>
    setState({ ...state, [data.state]: data.value });

  return <Card fluid color = 'blue'>
    <Card.Content style={{ flexGrow: 0 }} header = 'Register a Shipment' />
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
            required
            onChange={handleChange}
          />
          <Form.Dropdown
            placeholder='Select a product'
            fluid
            label='Product 1'
            clearable
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
            clearable
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
              label='Register'
              type='SIGNED-TX'
              style={{ display: 'block', margin: 'auto' }}
              setStatus={setStatus}
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
  </Card>;
}

export default function RegisterShipmentForm (props) {
  const { api } = useSubstrate();
  return api.tx ? <RegisterShipmentFormComponent {...props}/> : null;
}
