/**
 * Constantes Supabase centralisées
 * Ces valeurs sont les clés publiques anon key, sécurisées via RLS
 * Pour les appels REST directs (performance, pagination)
 */
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/**
 * Headers standards pour les appels REST Supabase
 */
export const getSupabaseHeaders = (noCache = false) => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  ...(noCache ? { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } : {})
});

/**
 * Construire une URL REST Supabase
 */
export const buildSupabaseRestUrl = (table: string, query?: string) => {
  const base = `${SUPABASE_URL}/rest/v1/${table}`;
  return query ? `${base}?${query}` : base;
};
