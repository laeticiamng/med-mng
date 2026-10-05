/**
 * 🧪 SYSTEM Edge Function Tests
 *
 * Vague sécurité F66-MM (05.10.2026) : le routeur « system » (quotas, statistiques, alertes,
 * journal d'erreurs, analyses de sécurité) s'exécutait avec la clé de service et acceptait la
 * seule clé publique ; aucun appelant. Il est retiré : toute requête reçoit 410 RETIREE.
 *
 * Les anciens tests vérifiaient le comportement retiré en envoyant du JSON VALIDE à la
 * production avec la clé publique (« analytics_track accepte un événement » ÉCRIVAIT en base).
 * Ils sont remplacés par le contrat de la fonction retirée, sondé avec un corps INVALIDE
 * (« { », octets bruts) : l'ancienne version échoue à la lecture du corps sans rien écrire,
 * la nouvelle répond 410 avant de le lire.
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://yaincoxihiqdksxgrsrk.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU";

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/system`;

async function sonder(corps: string, auth: boolean) {
  const headers: Record<string, string> = { "Content-Type": "text/plain" };
  if (auth) headers["Authorization"] = `Bearer ${SUPABASE_ANON_KEY}`;
  return await fetch(FUNCTION_URL, { method: "POST", headers, body: corps });
}

// ============================================================================
// TEST: CORS headers
// ============================================================================

Deno.test("system: OPTIONS retourne CORS headers", async () => {
  const response = await fetch(FUNCTION_URL, { method: "OPTIONS" });
  await response.text(); // Consume body to prevent leak

  assertEquals(response.status, 200);
  assertExists(response.headers.get("access-control-allow-origin"));
});

// ============================================================================
// TEST: fonction retirée (F66-MM)
// ============================================================================

Deno.test("system: retirée — 410 RETIREE avec la clé publique, corps non lu", async () => {
  const response = await sonder("{", true);
  const data = await response.json();

  assertEquals(response.status, 410);
  assertEquals(data.code, "RETIREE");
});

Deno.test("system: retirée — sans en-tête, jamais de succès (410, ou 401 de la passerelle)", async () => {
  const response = await sonder("{", false);
  await response.text();

  assertEquals([401, 410].includes(response.status), true, `statut ${response.status}`);
});
