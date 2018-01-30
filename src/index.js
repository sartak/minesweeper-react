import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import rootStore from './reducers';
import registerServiceWorker from './registerServiceWorker';
import { AppContainer } from 'react-hot-loader';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

const store = createStore(rootStore, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

const render = Component => {
  ReactDOM.render(
    <Provider store={store}>
      <AppContainer>
        <App />
      </AppContainer>
    </Provider>,
    document.getElementById('root')
  );
};

registerServiceWorker();

render(App);

if (module.hot) {
  module.hot.accept('./App', () => {
    render(App);
  });

  module.hot.accept('./reducers', () => {
    const nextRootReducer = require('./reducers').default;
    store.replaceReducer(nextRootReducer);
  });
}

document.write("<hr style='border-top: 0.5px solid black; border-bottom: 0' /><p id='refreshNotice'>Page loaded at " + new Date().toLocaleTimeString() + '</p>');
setTimeout(() => document.getElementById('refreshNotice').className = 'active', 16);
setTimeout(() => document.getElementById('refreshNotice').className = '', 2000);
