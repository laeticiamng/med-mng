/**
 * CORS Headers — Restriction dynamique par origine
 * 
 * En production, seuls les domaines autorisés sont acceptés.
 * En développement, localhost est également autorisé.
 */

const ALLOWED_ORIGINS = [
  'https://med-mng.lovable.app',
  'https://med-mng.com',
  'https://www.med-mng.com',
  // Preview URLs Lovable
  /^https:\/\/.*\.lovableproject\.com$/,
  /^https:\/\/.*\.lovable\.app$/,
];

/**
 * Vérifie si une origine est autorisée
 */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  // Autoriser localhost en développement
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
    return true;
  }
  
  return ALLOWED_ORIGINS.some(allowed => {
    if (typeof allowed === 'string') {
      return origin === allowed;
    }
    return allowed.test(origin);
  });
}

/**
 * Génère les headers CORS dynamiques basés sur l'origine de la requête
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0] as string;
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
}

/**
 * @deprecated Utiliser getCorsHeaders(req) pour une sécurité renforcée
 * Conservé pour compatibilité avec les fonctions existantes
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://med-mng.lovable.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}
