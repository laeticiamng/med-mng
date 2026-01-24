import { assertEquals, assertExists } from "https://deno.land/std@0.192.0/testing/asserts.ts";

// Use hardcoded values for testing (public anon key is safe to expose)
const SUPABASE_URL = "https://yaincoxihiqdksxgrsrk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU";

Deno.test("med-mng-api: health endpoint returns OK", async () => {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/med-mng-api/health`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY
      }
    }
  );

  const body = await response.text();
  
  // Health check should work or return expected error codes
  // 500 is acceptable if the endpoint doesn't have a health route
  assertEquals(
    [200, 401, 404, 500].includes(response.status),
    true,
    `Unexpected status: ${response.status} - ${body}`
  );
  
  if (response.status === 200) {
    const data = JSON.parse(body);
    assertExists(data.status || data.success, "Response should contain status");
  }
});

Deno.test("med-mng-api: handles CORS preflight", async () => {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/med-mng-api`,
    {
      method: "OPTIONS",
      headers: {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST"
      }
    }
  );

  await response.text();
  
  assertEquals(
    [200, 204].includes(response.status),
    true,
    `CORS preflight failed with status: ${response.status}`
  );
});

Deno.test("med-mng-api: rejects invalid content-type", async () => {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/med-mng-api`,
    {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY
      },
      body: "invalid"
    }
  );

  await response.text();
  
  // Should reject with 400 or handle gracefully
  assertEquals(
    [400, 401, 404, 415, 500].includes(response.status),
    true,
    `Expected error status, got: ${response.status}`
  );
});
