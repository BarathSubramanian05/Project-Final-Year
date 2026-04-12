import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../src/context/ToastContext.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

    <BrowserRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
    </BrowserRouter>
 
);

reportWebVitals();
