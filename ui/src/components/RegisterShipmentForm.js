import React, { useEffect, useState } from 'react';
import { Grid, Button, Form, Header, Dropdown, Input, Message } from 'semantic-ui-react';

import { useSubstrate } from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';

function RegisterShipmentFormComponent(props) {
  const { api } = useSubstrate();
  const { accountPair } = props;
  const [status, setStatus] = useState(null);
  const [paramFields, setParamFields] = useState([]);
  const [shipmentId, setShipmentId] = useState([]);
  const [productId1, setProductId1] = useState([]);
  const [productId2, setProductId2] = useState([]);

  // Note: hard-coded list of products for now,
  // waiting for https://github.com/stiiifff/pallet-product-registry/issues/14
  // to be implemented to make it dynamic
  const products = [
    { value: '00012345600012', text: '00012345600012' },
    { value: '17350053850016', text: '17350053850016' }
  ];

  const updateParamFields = () => {
    if (!api.tx.productTracking) {
      return;
    }
    const paramFields = api.tx.productTracking['registerShipment'].meta.args.map(arg => ({
      name: arg.name.toString(),
      type: arg.type.toString()
    }));

    setParamFields(paramFields);
  };

  useEffect(updateParamFields, [api]);

  return (
    <>
      <Header as="h2">Register a shipment</Header>
      <Form>
        <Form.Input
          name="shipmentId"
          label="Shipment ID"
          state='shipmentId'
          required
        />
        <Dropdown
          placeholder='Select a function to product'
          fluid
          label='Product'
          search
          selection
          state='productId1'
          options={products}
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
              inputParams: [
                shipmentId,
                account,
                [productId1]
              ],
              paramFields: new Array(paramFields.length).fill(true)
            }}
          />
        </Form.Field>
      </Form>
    </>
  );
}

export default function RegisterShipmentForm(props) {
  const { api } = useSubstrate();
  return api.tx ? <RegisterShipmentFormComponent {...props} /> : null;
}
