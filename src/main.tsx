import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize analytics and error tracking
const initializeAnalytics = async () => {
  try {
    // Initialize Sentry for error tracking
    const { initSentry } = await import('./lib/sentry');
    initSentry();
    
    // Initialize Google Analytics
    const { initGoogleAnalytics } = await import('./lib/analytics');
    initGoogleAnalytics();
  } catch (e) {
    console.debug('Analytics initialization skipped');
  }
};

// Initialize after React is ready
initializeAnalytics();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
