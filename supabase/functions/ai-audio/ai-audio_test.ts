/**
 * 🧪 AI-AUDIO Edge Function Tests
 * Tests unitaires pour le routeur audio consolidé
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://yaincoxihiqdksxgrsrk.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU";

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/ai-audio`;

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

Deno.test("ai-audio: retourne erreur pour action invalide", async () => {
  const response = await invokeFunction("invalid_action");
  const data = await response.json();
  
  assertEquals(response.status, 400);
  assertExists(data.error);
  assertExists(data.available_actions);
});

// ============================================================================
// TEST: get_credits
// ============================================================================

Deno.test("ai-audio: get_credits retourne les crédits", async () => {
  const response = await invokeFunction("get_credits");
  const data = await response.json();
  
  assertEquals(response.status, 200);
  assertExists(data.credits);
  // credits peut être -1 si API key manquante
  assertEquals(typeof data.credits, "number");
});

// ============================================================================
// TEST: get_status (avec taskId fictif)
// ============================================================================

Deno.test("ai-audio: get_status requiert taskId", async () => {
  const response = await invokeFunction("get_status", {});
  const data = await response.json();
  
  // Doit retourner une erreur car taskId manquant
  assertEquals(response.status, 400);
});

Deno.test("ai-audio: get_status avec taskId valide", async () => {
  const response = await invokeFunction("get_status", { taskId: "test-task-123" });
  const data = await response.json();
  
  // Même avec un taskId fictif, doit retourner un statut (generating ou failed)
  assertEquals(response.status, 200);
  assertExists(data.status);
});

// ============================================================================
// TEST: CORS headers
// ============================================================================

Deno.test("ai-audio: OPTIONS retourne CORS headers", async () => {
  const response = await fetch(FUNCTION_URL, { method: "OPTIONS" });
  await response.text(); // Consume body to prevent leak
  
  assertEquals(response.status, 200);
  assertExists(response.headers.get("access-control-allow-origin"));
});

// ============================================================================
// TEST: Liste des actions disponibles
// ============================================================================

Deno.test("ai-audio: liste toutes les actions disponibles", async () => {
  const response = await invokeFunction("invalid");
  const data = await response.json();
  
  const expectedActions = [
    "generate_music", "get_status", "extend", "generate_lyrics",
    "get_credits", "process_audio", "generate_voice", "callback",
    "stream", "sync_lyrics", "manage_playlist"
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
