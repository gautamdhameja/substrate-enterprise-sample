import React from 'react';
import { Grid } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import ShipmentDetails from './ShipmentDetails';

export default function Main (props) {
  return (
    <Grid stackable columns='equal'>
      <Grid.Row stretched>
        <ShipmentDetails shipmentId='S0001'/>
      </Grid.Row>
    </Grid>
  );
}
