import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import { SubstrateContextProvider } from './substrate-lib';

import ChainData from './ChainData';
import Homepage from './Homepage';
import 'semantic-ui-css/semantic.min.css';

import Dashboard from './Dashboard';
import Homepage from './Homepage';
import 'semantic-ui-css/semantic.min.css';

export default function App () {
  return (
    <Router>
      <Switch>
        <Route path="/demo">
          <Dashboard />
        </Route>
        <Route path="/">
          <Homepage/>
        </Route>
      </Switch>
    </Router>
  );
}
