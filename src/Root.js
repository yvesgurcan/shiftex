import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import reducers from './reducers'
import App from './components/App'

const store = createStore(
  reducers,
  {},
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

export default () => (
  <Provider store={store}>
    <Router>
      <Switch>
        <Route path='/:year(2[0-9][0-9]{2})/:month([1-9]|0[1-9]|1[0-2])/:day([1-9]|0[1-9]|[1-2][0-9]|3[0-1])' component={App} />
        <Route path='/' component={App} />
      </Switch>
    </Router>
  </Provider>
)