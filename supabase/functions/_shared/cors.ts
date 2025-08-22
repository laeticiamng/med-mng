const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export function getCorsHeaders(origin?: string | null) {
  const allowedOrigin =
    origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || '';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
  } as const;
}

export const corsHeaders = getCorsHeaders();
