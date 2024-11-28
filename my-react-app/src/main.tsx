import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { Provider } from 'react-redux';
import {store} from './redux/store.tsx';

// Render the root component
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      
      <App/>
    </Provider>
  </React.StrictMode>
   
);
