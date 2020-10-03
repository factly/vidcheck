import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import 'antd/dist/antd.css';

import routes from "./App/Router";


function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          {routes.map((route) => (
              <Route
                  key={route.path}
                  exact={route.exact}
                  path={route.path}
                  component={route.component}
              />
          ))}
        </Switch>
      </Router>
    </div>
  );
}

export default App;
