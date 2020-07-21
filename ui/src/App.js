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

function Main () {
  return (
    <Router>
      <Switch>
        <Route path="/demo">
          <ChainData />
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
