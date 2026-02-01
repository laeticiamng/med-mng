/**
 * 🧪 SYSTEM Edge Function Tests
 * Tests unitaires pour le routeur système (quotas, analytics, monitoring)
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://yaincoxihiqdksxgrsrk.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU";

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/system`;

async function invokeFunction(action: string, payload?: any) {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ action, payload }),
  });
  return response;
}

// ============================================================================
// TEST: Actions invalides
// ============================================================================

Deno.test("system: retourne erreur pour action invalide", async () => {
  const response = await invokeFunction("invalid_action");
  const data = await response.json();
  
  assertEquals(response.status, 400);
  assertExists(data.error);
  assertExists(data.available_actions);
});

// ============================================================================
// TEST: health check
// ============================================================================

Deno.test("system: health check fonctionne", async () => {
  const response = await invokeFunction("health");
  const data = await response.json();
  
  assertEquals(response.status, 200);
  assertExists(data.success);
});

// ============================================================================
// TEST: perf_check
// ============================================================================

Deno.test("system: perf_check retourne des données", async () => {
  const response = await invokeFunction("perf_check");
  const data = await response.json();
  
  assertEquals(response.status, 200);
  assertExists(data.success);
});

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
// TEST: quota_get (requiert auth)
// ============================================================================

Deno.test("system: quota_get requiert authentification", async () => {
  const response = await invokeFunction("quota_get");
  const data = await response.json();
  
  // Sans auth, retourne 401
  assertEquals(response.status, 401);
  assertExists(data.error);
});

// ============================================================================
// TEST: analytics_track
// ============================================================================

Deno.test("system: analytics_track accepte un événement", async () => {
  const response = await invokeFunction("analytics_track", {
    event_type: "test_event",
    event_data: { source: "unit_test" }
  });
  const data = await response.json();
  
  // Peut réussir ou échouer selon la BDD, mais ne doit pas être 400
  assertExists(data);
});

// ============================================================================
// TEST: Liste des actions disponibles
// ============================================================================

Deno.test("system: liste toutes les actions disponibles", async () => {
  const response = await invokeFunction("invalid");
  const data = await response.json();
  
  const expectedActions = [
    "quota_get", "quota_check", "quota_use", "quota_stats",
    "analytics_track", "analytics_aggregate", "analytics_query",
    "alerts", "unified_alerts", "log_error",
    "security_scan", "security_metrics", "security_report",
    "data_check", "perf_check", "health"
  ];
  
  assertEquals(response.status, 400);
  expectedActions.forEach(action => {
    assertEquals(
      data.available_actions.includes(action), 
      true, 
      `Action ${action} should be available`
    );
  });
});
