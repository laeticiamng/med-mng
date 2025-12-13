import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Lazy load Sentry to avoid interfering with React initialization
const initializeSentry = async () => {
  try {
    const { initSentry } = await import('./lib/sentry');
    initSentry();
  } catch (e) {
    console.debug('Sentry initialization skipped');
  }
};

// Initialize Sentry after React is ready
initializeSentry();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
