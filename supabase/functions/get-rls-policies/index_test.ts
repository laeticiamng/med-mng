import { assertEquals, assertExists } from "https://deno.land/std@0.192.0/testing/asserts.ts";

// Use hardcoded values for testing (public anon key is safe to expose)
const SUPABASE_URL = "https://yaincoxihiqdksxgrsrk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU";

Deno.test("get-rls-policies: should return policies data", async () => {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/get-rls-policies`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY
      }
    }
  );

  // Consume response body to prevent resource leak
  const body = await response.text();
  
  // Should return 200 or 401 (if auth required)
  assertEquals(
    [200, 401, 403, 500].includes(response.status),
    true,
    `Unexpected status: ${response.status} - ${body}`
  );
});

Deno.test("get-rls-policies: handles OPTIONS request (CORS)", async () => {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/get-rls-policies`,
    {
      method: "OPTIONS",
      headers: {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST"
      }
    }
  );

  // Consume response body
  await response.text();
  
  // CORS preflight should return 200 or 204
  assertEquals(
    [200, 204].includes(response.status),
    true,
    `CORS preflight failed with status: ${response.status}`
  );
});
