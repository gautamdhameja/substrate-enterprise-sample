import React, { useEffect, useState } from 'react';
import { Grid, Button, Form, Dropdown, Input, Message } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

function RegisterProductFormComponent(props) {
  const { api } = useSubstrate();
  // const [shipmentIdList, setTrack] = useState([]);
  const [status, setStatus] = useState(null);
  const { accountPair } = props;

  const [formState, setFormState] = useState({
    callableFunction: '',
    input: []
  });
  const { callableFunction, input } = formState;

  const paramFields = api.tx.productRegistry['registerProduct'].meta.args.map(arg => ({
    name: arg.name.toString(),
    type: arg.type.toString()
  }));

  const onChange = (_, data) => {
    setFormState(formState => {
      let res;
      if (Number.isInteger(data.state)) {
        formState.input[data.state] = data.value;
        res = { ...formState };
        console.log(res)
      } else {
        res = { ...formState, [data.state]: data.value, input: [] };
      }
      return res;
    });
  };

  return (<Form>
    <Form.Input
      name="productID"
      label="Product ID"
      required
      onChange={onChange}
    />
    {/* <Message
          success
          header="Success !"
          content="Thanks so much for giving us feedback!"
      />
      <Message
          error
          header="Error !"
          content="An expected error has occured."
      /> */}

    <Form.Field>
      <TxButton
        accountPair={accountPair}
        label='Submit'
        setStatus={setStatus}
        type='SIGNED-TX'
        attrs={{
          palletRpc: 'productRegistry',
          callable: 'registerProduct',
          inputParams: [
            '00012345600012',
            '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            '' // [{ desc: 'product:canned-tuna' }]
          ],
          paramFields: new Array(paramFields.length).fill(true)
        }}
      />
    </Form.Field>
  </Form>);
}

export default function RegisterProductForm(props) {
  const { api } = useSubstrate();
  return api.tx ? <RegisterProductFormComponent {...props} /> : null;
}
