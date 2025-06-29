
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Constantes pour l'attente audio optimisées pour génération rapide
export const MAX_ATTEMPTS = 12; // 2 minutes au total (plus réaliste pour génération rapide)
export const WAIT_TIME = 5000; // 5 secondes entre chaque tentative (plus réactif)

// Timeout pour les requêtes HTTP
export const HTTP_TIMEOUT = 20000; // 20 secondes (réduit)

// Durée par défaut pour la validation
export const DEFAULT_DURATION = 240; // 4 minutes par défaut
