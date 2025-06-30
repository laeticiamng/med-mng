
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Constantes pour l'attente audio optimisées pour la VITESSE MAXIMALE
export const MAX_ATTEMPTS = 24; // Augmenté pour compenser les intervalles plus courts
export const WAIT_TIME = 5000; // Réduit à 5 secondes pour plus de réactivité

// Timeout pour les requêtes HTTP - réduit pour éviter les blocages
export const HTTP_TIMEOUT = 20000; // 20 secondes

// Durée par défaut pour la validation - optimisée
export const DEFAULT_DURATION = 240; // 4 minutes par défaut

// Nouvelles constantes pour le mode ultra-rapide
export const FAST_MODE_ENABLED = true;
export const FAST_POLLING_INTERVAL = 2000; // 2 secondes en mode rapide
export const ULTRA_FAST_POLLING_INTERVAL = 1000; // 1 seconde pour les premières tentatives
export const MAX_ULTRA_FAST_ATTEMPTS = 8; // 8 tentatives à 1 seconde puis passage au mode rapide
