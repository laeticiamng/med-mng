/**
 * CORS Headers — Restriction dynamique par origine
 * 
 * En production, seuls les domaines autorisés sont acceptés.
 * En développement, localhost est également autorisé.
 */

const ALLOWED_ORIGINS = [
  // Domaines de PRODUCTION. Sans tiret : le site est servi sur medmng.com.
  // La liste ne contenait que la variante avec tiret (med-mng.com), qui n'est
  // pas le domaine réel — toutes les requêtes du navigateur depuis medmng.com
  // étaient donc rejetées au préflight, et l'API restait injoignable en
  // production alors qu'elle fonctionnait dans l'aperçu Lovable.
  'https://medmng.com',
  'https://www.medmng.com',
  // Variante avec tiret conservée au cas où ce domaine soit aussi utilisé.
  'https://med-mng.com',
  'https://www.med-mng.com',
  // Aperçus Lovable
  'https://med-mng.lovable.app',
  /^https:\/\/.*\.lovableproject\.com$/,
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/.*\.sandbox\.lovable\.dev$/,
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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

/**
 * @deprecated Utiliser getCorsHeaders(req) pour une sécurité renforcée
 * Conservé pour compatibilité avec les fonctions existantes
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://medmng.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Max-Age': '86400',
}
