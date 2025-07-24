// ✅ src/main.jsx or index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // ✅ not './App.js'
import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
