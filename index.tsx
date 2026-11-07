import React from 'react';
import ReactDOM from 'react-dom/client';
import './theme.css';
import App from './App';
import { startSegmented } from './services/segmented';
import { loadAccentState, applyAccent } from './services/accent';

const initialAccent = loadAccentState();
applyAccent(initialAccent.color, initialAccent.gradient);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

startSegmented();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('Service Worker Registrierung fehlgeschlagen:', err);
    });
  });
}
