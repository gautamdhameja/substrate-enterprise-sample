import React, { useEffect, useState } from 'react';
import { Dropdown, Header, Segment } from 'semantic-ui-react';
import { useSubstrate } from '../substrate-lib';

export default function Main (props) {
  const { api } = useSubstrate();
  const { accountPair, setSelectedOrganization } = props;
  const [organizations, setOrganizations] = useState([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    let unsub = null;

    async function organizations (accountPair) {
      const addr = accountPair.address;
      unsub = await api.query.registrar.organizations(async data => {
        if (data && data.map(o => o.toString()).includes(addr)) {
          // Current account is an org
          setOrganizations([{ value: addr, text: addr }]);
          setSelectedOrganization(addr);
          setSelected(addr);
          return;
        }

        // Current account is not an org
        // -> List orgs it is a delegate of (if any)
        return api.query.registrar.organizationsOf(addr, data => {
          const orgs = data.map(o => {
            const org = o.toString();
            return {
              value: org,
              text: org
            };
          });
          setOrganizations(orgs);

          const defaultOrg = (orgs[0] && orgs[0].value) || '';
          setSelectedOrganization(defaultOrg);
          setSelected(defaultOrg);
        });
      });
    }

    if (accountPair) organizations(accountPair);
    return () => unsub && unsub();
  }, [accountPair, api.query.registrar, setSelectedOrganization]);

  const onChange = org => {
    setSelected(org);
    setSelectedOrganization(org);
  };

  return (
    <Segment compact>
      <Header as="h2" content="Organization" floated="left" />
      <Dropdown inline
        selection
        placeholder="Select an organization the current account is a delegate of"
        options={organizations}
        onChange={(_, dropdown) => {
          onChange(dropdown.value);
        }}
        value={selected}
      />
    </Segment>
  );
}
