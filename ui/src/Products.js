import React, { useEffect, useState } from 'react';
import { Grid, Form, Dropdown, Input } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

function Main (props) {
  const { api } = useSubstrate();
  const [status, setStatus] = useState(null);
  const [paramFields, setParamFields] = useState([]);
  const [callableFunctionList, setCallableFunctionList] = useState([]);
  const { accountPair } = props;

  const [formState, setFormState] = useState({
    callableFunction: '',
    input: []
  });
  const { callableFunction, input } = formState;

  const updateParamFields = () => {
    if (callableFunction === '' || !api.tx.productRegistry) {
      return;
    }

    const paramFields = api.tx.productRegistry[callableFunction].meta.args.map(arg => ({
      name: arg.name.toString(),
      type: arg.type.toString()
    }));

    setParamFields(paramFields);
  };

  useEffect(() => {
    const section = api.tx.productRegistry;
    const callableFunctions = Object.keys(section)
      .sort()
      .map(callable => ({
        key: callable,
        value: callable,
        text: callable,
        data: JSON.stringify(section[callable])
      }));
    setCallableFunctionList(callableFunctions);
  }, [api]);

  useEffect(updateParamFields, [api, callableFunction]);

  const onChange = (_, data) => {
    setFormState(formState => {
      let res;
      if (Number.isInteger(data.state)) {
        formState.input[data.state] = data.value;
        res = formState;
      } else if (data.state === 'callableFunction') {
        res = { ...formState, [data.state]: data.value, input: [] };
      }
      return res;
    });
  };

  return (
    <Grid.Column>
      <h1>Products</h1>
      <Form>
        <Form.Field>
          <Dropdown
            placeholder='Select a function to call'
            fluid
            label='Callable Function'
            onChange={onChange}
            search
            selection
            state='callableFunction'
            options={callableFunctionList}
          />
        </Form.Field>
        {paramFields.map((paramField, ind) =>
          <Form.Field key={`${paramField.name}-${paramField.type}`}>
            <Input
              placeholder={paramField.type}
              fluid
              type='text'
              label={paramField.name}
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
              params: input,
              tx: api.tx.productRegistry && api.tx.productRegistry[callableFunction]
            }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}

export default function Identifiers (props) {
  const { api } = useSubstrate();
  return api.tx ? <Main {...props} /> : null;
}
