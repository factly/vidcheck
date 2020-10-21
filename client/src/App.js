import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import "antd/dist/antd.css";
import BasicLayout from "../src/layouts/basic";

import routes from "../src/config/routesConfig";

function App() {
  return (
    <div className="App">
      <Router basename={process.env.PUBLIC_URL}>
        <BasicLayout>
          <Switch>
            {routes.map((route) => (
              <Route
                key={route.path}
                exact
                path={route.path}
                component={route.Component}
              />
            ))}
          </Switch>
        </BasicLayout>
      </Router>
    </div>
  );
}

export default App;
