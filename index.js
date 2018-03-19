import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";
import { Router, Route, IndexRoute, browserHistory } from "react-router";
import {
  syncHistoryWithStore,
  routerReducer,
  routerMiddleware
} from "react-router-redux";
import throttle from "lodash/throttle";
import appReducer from "./reducers";
import { loginPersistedUser } from "./reducers/auth";
import AppContainer from "./containers/AppContainer";
import { loadState, saveState, requireAuthentication } from "./utils";
import HomeContainer from "./containers/HomeContainer";
import ProcessorsContainer from "./containers/ProcessorsContainer";
import ProcessorDetailsContainer from "./containers/ProcessorDetailsContainer";
import NotificationContainer from "./containers/NotificationContainer";
import NotificationDetailsContainer from "./containers/NotificationDetailsContainer";
import InputContainer from "./containers/InputContainer";
import InputDetailsContainer from "./containers/InputDetailsContainer";
import TestContainer from "./containers/TestContainer";
import SignInContainer from "./containers/SignInContainer";

import "./style/Globals.less";

// combine all the reducers into a single reducing function
const rootReducer = combineReducers({
  sc: appReducer,
  routing: routerReducer
});

// create the redux store that holds the state for this app
// http://redux.js.org/docs/api/createStore.html
const middleware = routerMiddleware(browserHistory);
const store = createStore(
  rootReducer,
  applyMiddleware(middleware, thunk, createLogger()) // logger must be the last in the chain
);

const persistedUser = loadState();
const token = persistedUser ? persistedUser.token : null;
const user = persistedUser ? persistedUser.user : null;
if (token !== null && user !== null) {
  store.dispatch(loginPersistedUser(token, user));
}

store.subscribe(
  throttle(() => {
    saveState({
      user: store.getState().sc.auth.user,
      token: store.getState().sc.auth.token
    });
  }, 1000)
);

// create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store);

// wrap the App component with the react-redux Provider component to make the
// store available to all container components without passing it down
// explicitly as a prop
render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" name="Home" component={AppContainer}>
        <IndexRoute component={requireAuthentication(HomeContainer)} />
        <Route path="/login" name="Login" component={SignInContainer} />
        <Route
          path="/processors"
          name="Processors"
          component={requireAuthentication(ProcessorsContainer)}
        >
          <Route
            path="/processors/:id"
            staticName
            component={requireAuthentication(ProcessorDetailsContainer)}
          />
        </Route>
        <Route
          path="/notifications"
          name="Notifications"
          component={requireAuthentication(NotificationContainer)}
        >
          <Route
            path="/notifications/:id"
            staticName
            component={requireAuthentication(NotificationDetailsContainer)}
          />
        </Route>
        <Route
          path="/inputs"
          name="Inputs"
          component={requireAuthentication(InputContainer)}
        >
          <Route
            path="/inputs/:id"
            staticName
            component={requireAuthentication(InputDetailsContainer)}
          />
        </Route>
        <Route
          path="/test"
          name="Test"
          component={requireAuthentication(TestContainer)}
        />
      </Route>
    </Router>
  </Provider>,
  document.getElementById("root")
);
