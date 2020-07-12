import React, { useEffect, useState } from 'react';
import { Table, Grid, Button } from 'semantic-ui-react';
import { useSubstrate } from './substrate-lib';

function Main (props) {
  const { api } = useSubstrate();
  const [shipmentIdList, setTrack] = useState([]);
  const { accountPair } = props;

  useEffect(() => {
    let unsubscribe;

    async function orgShipments (accountPair) {
      await api.query.productTracking.shipmentsOfOrganization(accountPair.address, logs => {
        if (logs) {
          const ids = logs.reduce((id, shipmentId, index) => ({
            ...id, [shipmentId]: index
          }), {});
          const map = Object.keys(ids)
            .sort()
            .map((data, index) => ({
              key: index,
              value: data
            }));
          setTrack(map);
        } else {
          setTrack({});
        }
      });
    }

    if (accountPair) {
      orgShipments(accountPair);
    } else {
      return () => unsubscribe && unsubscribe();
    }
  }, [api.query.productTracking, accountPair]);

  return (
    <Grid.Column>
      <h1>Products from Org</h1>
      <Table celled striped size='small'>
        <Table.Body>{shipmentIdList.map(data =>
          <Table.Row key={data.key}>
            <Table.Cell width={3} textAlign='right'>{data.key}</Table.Cell>
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

export default function ProductLog (props) {
  const { api } = useSubstrate();
  return api.tx ? <Main {...props} /> : null;
}
