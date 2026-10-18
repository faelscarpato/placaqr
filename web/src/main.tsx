import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Registra o Service Worker do PWA para cache offline e instalabilidade
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker ativo, escopo:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA] Falha no registro do Service Worker:', err);
      });
  });
}

