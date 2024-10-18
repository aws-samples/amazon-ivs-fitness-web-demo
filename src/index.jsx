import { BrowserRouter as Router } from 'react-router-dom';
import React from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import * as serviceWorker from './serviceWorker';
import App from './App';
import UserProvider from './contexts/User/provider';

// Save user name and avatar selection between refreshes
const storage = sessionStorage;
const savedUserData = JSON.parse(storage.getItem('userData'));

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <UserProvider storage={storage} savedUserData={savedUserData || undefined}>
      <Router>
        <App />
      </Router>
    </UserProvider>
  </React.StrictMode>
);

serviceWorker.unregister();
