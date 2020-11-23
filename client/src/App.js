import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import "antd/dist/antd.css";
import BasicLayout from "../src/layouts/basic";

import routes from "../src/config/routesConfig";
import Preview from "./pages/preview";

function App() {
  return (
    <div className="App">
      <Router basename={process.env.PUBLIC_URL}>
        <Switch>
          <Route
            key={"route.path"}
            exact
            path={"/preview"}
            component={Preview}
          />
          <Route
            key={"route.path11"}
            component={() => (
              <BasicLayout>
                {routes.map((route) => (
                  <Route
                    key={route.path}
                    exact
                    path={route.path}
                    component={route.Component}
                  />
                ))}
              </BasicLayout>
            )}
          />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
