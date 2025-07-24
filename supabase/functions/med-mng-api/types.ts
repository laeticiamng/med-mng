
export interface CreateSongRequest {
  title: string;
  suno_audio_id: string;
  meta?: any;
}

export interface CreateSubscriptionRequest {
  plan_id: string;
  gateway: string;
  subscription_id: string;
}

export interface AddToLibraryRequest {
  song_id: string;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const securityHeaders = {
  'Content-Security-Policy': "default-src 'none'; base-uri 'none'; form-action 'none'",
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'geolocation=()',
};
