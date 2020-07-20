import React from 'react';
import Homepage from './Homepage';
import 'semantic-ui-css/semantic.min.css';
import { SubstrateContextProvider } from './substrate-lib';
import ChainData from './ChainData';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import ShipmentTrackingPage from './ShipmentTrackingPage';

function Main () {
  return (
    <Router>
      <Switch>
        <Route path="/demo">
          <ChainData />
        </Route>
        <Route path="/ShipmentTracking">
          <ShipmentTrackingPage />
        </Route>
        <Route path="/">
          <Homepage/>
        </Route>
      </Switch>
    </Router>
  );
}

export default function App () {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  );
}
