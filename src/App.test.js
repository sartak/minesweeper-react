import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import rootStore from './reducers';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

const store = createStore(rootStore);
let reducers = rootStore;

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Provider store={store}><App /></Provider>, div);
  ReactDOM.unmountComponentAtNode(div);
});

