/**
 * Constantes Supabase centralisées
 * Ces valeurs sont les clés publiques anon key, sécurisées via RLS
 * Pour les appels REST directs (performance, pagination)
 */
export const SUPABASE_URL = "https://yaincoxihiqdksxgrsrk.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU";

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
