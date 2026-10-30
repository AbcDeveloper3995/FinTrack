import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for PWA (Installable on mobile/desktop)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('FinTrack PWA Service Worker registrado con éxito:', reg.scope);
      })
      .catch((err) => {
        console.warn('Error al registrar el Service Worker PWA:', err);
      });
  });
}

