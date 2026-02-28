import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {EmployeeProvider} from './context/EmployeeContext.js'
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../src/context/ToastContext.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

    <BrowserRouter>
      <EmployeeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </EmployeeProvider>
    </BrowserRouter>
 
);

reportWebVitals();
