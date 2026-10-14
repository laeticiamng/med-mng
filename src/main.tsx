import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase } from './integrations/supabase/client'
import { installerPartageGetUser } from './lib/partageGetUser'
import { capturerJetonRecuperation } from './lib/jetonRecuperation'

// Jeton de réinitialisation du mot de passe : lu puis retiré de l'adresse AVANT toute initialisation
// d'outil de suivi (Sentry enregistre l'URL des pages et des requêtes). Voir src/lib/jetonRecuperation.ts.
capturerJetonRecuperation()

// Un seul GET /auth/v1/user partagé entre composants (voir src/lib/partageGetUser.ts).
installerPartageGetUser(supabase.auth)

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
