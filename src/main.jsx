import './index.css'; // 👈 aquí importas los estilos globales de Tailwind
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

