import React, { useEffect, useState } from 'react';
import { Segment, Form } from 'semantic-ui-react';
import { useSubstrate } from '../substrate-lib';

export default function Main (props) {
  const { api } = useSubstrate();
  const { accountPair, setSelectedOrganization } = props;
  const [organizations, setOrganizations] = useState([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    let unsub1 = null;
    let unsub2 = null;
    const addr = accountPair ? accountPair.address : null;

    async function membersOf (addr) {
      unsub2 = await api.query.registrar.membersOf(addr, rawData => {
        const orgs = rawData.map(r => ({ value: r.toString(), text: r.toString() }));

        const defaultOrg = orgs.length > 0 ? orgs[0].value : '';
        setOrganizations(orgs);
        setSelectedOrganization(defaultOrg);
        setSelected(defaultOrg);
      });
    }

    async function organizations (addr) {
      unsub1 = await api.query.registrar.organizations(rawData => {
        const strData = rawData.map(r => r.toString());

        if (strData.includes(addr)) {
          // Current account is an org
          setOrganizations([{ value: addr, text: addr }]);
          setSelectedOrganization(addr);
          setSelected(addr);
        } else {
          membersOf(addr);
        }
      });
    }

    if (addr) organizations(addr);
    return () => {
      unsub1 && unsub1();
      unsub2 && unsub2();
    };
  }, [accountPair, api.query.registrar, setSelectedOrganization]);

  const onChange = org => {
    setSelected(org);
    setSelectedOrganization(org);
  };

  return <Segment>
    <Form>
      <Form.Field>
        <h3>Organization</h3>
        <Form.Dropdown selection fluid
          placeholder='Select Organization'
          options={organizations}
          onChange={(_, dropdown) => onChange(dropdown.value)}
          value={selected}
        />
      </Form.Field>
    </Form>
  </Segment>;
}
