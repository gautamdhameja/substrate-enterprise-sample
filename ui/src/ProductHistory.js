import React, { useEffect, useState } from 'react';
import { Table, Grid, Button } from 'semantic-ui-react';
import { useSubstrate } from './substrate-lib';

function Main (props) {
  const { api } = useSubstrate();
  const [currentValue, setCurrentValue] = useState(0);
  const [storageFunctions, setStorageFunctionList] = useState([]);
  const [trackMap, setTrack] = useState({});
  const { accountPair } = props;

  useEffect(() => {
    const section = api.query.productTracking;
    const storageFunctions = Object.keys(section)
      .sort()
      .map(data => ({
        key: data,
        value: data,
        text: data,
        data: JSON.stringify(section[data])
      }));
    setStorageFunctionList(storageFunctions);
  }, [api]);

  useEffect(() => {
    let unsubscribe;
    console.log(accountPair);
    let selectedAddress = accountPair.address;
    async function anyNameFunction(selectedAddress) {
      await api.query.productTracking.shipmentsOfOrganization(selectedAddress, newValue => {
        if (newValue) {
          setCurrentValue(newValue);
          const trackMap = newValue.reduce((acc, shipmentId, index) => ({
            ...acc, [shipmentId]: trackMap[index]
          }), {});
          setTrack(trackMap);
        } else {
          setCurrentValue('<None>');
        }
      })
    }

    anyNameFunction(accountPair);

    //  api.query.productTracking.shipmentsOfOrganization(accountPair.address, newValue => {
    //   if (newValue) {
    //     setCurrentValue(newValue);
    //     const trackMap = newValue.reduce((acc, shipmentId, index) => ({
    //       ...acc, [shipmentId]: trackMap[index]
    //     }), {});
    //     setTrack(trackMap);
    //   } else {
    //     setCurrentValue('<None>');
    //   }
    // }).then(unsub => {
    //   unsubscribe = unsub;
    // }).catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api.query.productTracking, accountPair]);

  return (
    <Grid.Column>
      <h1>Products from Org</h1>
      <Table celled striped size='small'>
        <Table.Body>{storageFunctions.map(data =>
          <Table.Row key={data.key}>
            <Table.Cell width={3} textAlign='right'>{data.value}</Table.Cell>
            <Table.Cell width={10}>
              <span style={{ display: 'inline-block', minWidth: '31em' }}>
                {data.value}
              </span>
            </Table.Cell>
          </Table.Row>
        )}
        </Table.Body>
      </Table>
    </Grid.Column>
  );
}

export default function ProductTrack (props) {
  const { api } = useSubstrate();
  return api.tx ? <Main {...props} /> : null;
}
