import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes';
import App from './containers/App';
import HomePage from './containers/HomePage';
// import CounterPage from './containers/PlayerPage';
// import Test from './containers/Test';

export default () => (
  <App>
    <Switch>
      {/* <Route path={routes.PLAYER} component={PlayerPage} /> */}
      <Route path={routes.HOME} component={HomePage} />
      {/* <Route path={routes.TEST} component={Test} /> */}
    </Switch>
  </App>
);
