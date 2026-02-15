const ALLOWED_ORIGINS = [
  'https://med-mng.emotionscare.com',
  'https://www.med-mng.emotionscare.com',
  'http://localhost:5173',
  'http://localhost:4173',
];

export function getCorsHeaders(origin?: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Vary': 'Origin',
  };
}

// Backwards-compatible export for existing Edge Functions
export const corsHeaders = getCorsHeaders();