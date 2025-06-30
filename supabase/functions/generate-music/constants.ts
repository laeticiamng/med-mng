
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const HTTP_TIMEOUT = 300000; // 5 minutes
export const POLL_INTERVAL = 2000; // 2 secondes
export const MAX_POLL_ATTEMPTS = 24; // 48 secondes max
