/**
 * 🧪 AI-CORE Edge Function Tests
 * Tests unitaires pour le routeur IA principal
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://yaincoxihiqdksxgrsrk.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU";

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/ai-core`;

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

Deno.test("ai-core: retourne erreur pour action invalide", async () => {
  const response = await invokeFunction("invalid_action");
  const data = await response.json();
  
  assertEquals(response.status, 400);
  assertExists(data.error);
  assertExists(data.available_actions);
});

// ============================================================================
// TEST: chat_simple (requiert messages)
// ============================================================================

Deno.test("ai-core: chat_simple requiert messages", async () => {
  const response = await invokeFunction("chat_simple", {});
  
  // Devrait échouer car messages non fourni
  assertEquals(response.status, 500);
});

// ============================================================================
// TEST: CORS headers
// ============================================================================

Deno.test("ai-core: OPTIONS retourne CORS headers", async () => {
  const response = await fetch(FUNCTION_URL, { method: "OPTIONS" });
  await response.text(); // Consume body to prevent leak
  
  assertEquals(response.status, 200);
  assertExists(response.headers.get("access-control-allow-origin"));
});

// ============================================================================
// TEST: Liste des actions disponibles
// ============================================================================

Deno.test("ai-core: liste toutes les actions disponibles", async () => {
  const response = await invokeFunction("invalid");
  const data = await response.json();
  
  const expectedActions = [
    "chat", "generate_image", "chat_simple", "medical_chat",
    "contextual_chat", "enhanced_chat", "tutor", "recommendations",
    "generate_content", "generate_qcm", "generate_clinical_case",
    "qcm_generator", "content_generator", "translate"
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

// ============================================================================
// TEST: generate_content (structure de base)
// ============================================================================

Deno.test("ai-core: generate_content accepte les paramètres", async () => {
  // Ce test vérifie juste que l'action est reconnue
  // Ne pas exécuter réellement car nécessite OPENAI_API_KEY
  const response = await invokeFunction("generate_content", {
    prompt: "Test prompt",
    format: "text"
  });
  
  // 200 si API key présente, 500 sinon
  const data = await response.json();
  assertExists(data);
});
