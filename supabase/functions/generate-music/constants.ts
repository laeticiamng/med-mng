
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Constantes pour l'attente audio optimisées
export const MAX_ATTEMPTS = 36; // 6 minutes au total
export const WAIT_TIME = 10000; // 10 secondes entre chaque tentative

// Timeout pour les requêtes HTTP
export const HTTP_TIMEOUT = 30000; // 30 secondes
