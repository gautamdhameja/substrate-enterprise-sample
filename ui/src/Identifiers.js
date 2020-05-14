import React, { useEffect, useState } from 'react';
import { Grid, Form, Dropdown } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

function Main (props) {
  const { api } = useSubstrate();
  const [status, setStatus] = useState(null);
  const [storageFunctions, setStorageFunctionList] = useState([]);
  const [callableFunctionList, setCallableFunctionList] = useState([]);
  const { accountPair } = props;

  const [formState, setFormState] = useState({
    callableFunction: '',
    input: [''],
    index: 0
  });
  const { callableFunction, input } = formState;

  useEffect(() => {
    const section = api.tx.palletDid;
    const callableFunctions = Object.keys(api.tx.palletDid)
      .sort()
      .map(callable => ({
        key: callable,
        value: callable,
        text: callable,
        data: JSON.stringify(section[callable])
      }));
    console.log(callableFunctions);
    setCallableFunctionList(callableFunctions);
  }, [api]);

  useEffect(() => {
    const section = api.query.palletDid;
    const storageFunctions = Object.keys(api.query.palletDid)
      .sort()
      .map(data => ({
        key: data,
        value: data,
        text: data,
        data: JSON.stringify(section[data])
      }));
    console.log(storageFunctions);
    setStorageFunctionList(storageFunctions);
  }, [api]);

  const onChange = (_, data) => {
    var i;
    for (i in callableFunctionList) {
      if (JSON.parse(callableFunctionList[i].data)
        .name
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .toLowerCase() === data.value.toLowerCase()
      ) {
        break;
      }
    }

    setFormState(formState => ({ ...formState, [data.state]: data.value, index: i }));
    console.log(JSON.parse(callableFunctionList[i].data));
  };

  return (
    <Grid.Column>
      <h1>DIDs</h1>
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
        <Form.Field>
          <label>Identity Account</label>
          <input
            label='Input'
            placeholder='identity'
            state='input'
            type='text'
          />
        </Form.Field>
        <Form.Field>
          <TxButton
            accountPair={accountPair}
            label='Call'
            setStatus={setStatus}
            type='TRANSACTION'
            attrs={{
              params: input ? [input] : null,
              tx: api.tx.palletDid[callableFunction]
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
