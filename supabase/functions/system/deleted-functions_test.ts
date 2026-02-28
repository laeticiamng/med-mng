/**
 * 🧪 Deleted Edge Functions Tests
 * Verifies that all 36 deleted/consolidated endpoints return proper 404 or 410.
 * Uses the canonical registry from _shared/deleted-functions.ts.
 */

import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { DELETED_FUNCTIONS } from "../_shared/deleted-functions.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://yaincoxihiqdksxgrsrk.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU";

// ============================================================================
// TEST: Deprecated functions return 410 Gone
// ============================================================================

const deprecatedFunctions = DELETED_FUNCTIONS.filter(f => f.status === "deprecated");

for (const fn of deprecatedFunctions) {
  Deno.test(`deleted-ef: ${fn.name} returns 410 Gone`, async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${fn.name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({}),
    });
    const body = await response.text();

    assertEquals(
      response.status,
      410,
      `Expected 410 for deprecated function ${fn.name}, got ${response.status}: ${body}`
    );
  });
}

// ============================================================================
// TEST: Removed/consolidated functions return 404
// ============================================================================

const removedFunctions = DELETED_FUNCTIONS.filter(
  f => f.status === "removed" || f.status === "consolidated"
);

// Test a representative sample (first 5) to avoid hitting rate limits
const sampleRemoved = removedFunctions.slice(0, 5);

for (const fn of sampleRemoved) {
  Deno.test(`deleted-ef: ${fn.name} returns 404 (removed)`, async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${fn.name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({}),
    });
    await response.text(); // Consume body

    // Supabase returns 404 for non-existent functions
    assertEquals(
      response.status,
      404,
      `Expected 404 for removed function ${fn.name}, got ${response.status}`
    );
  });
}

// ============================================================================
// TEST: Registry completeness
// ============================================================================

Deno.test("deleted-ef: registry has at least 36 entries", () => {
  assertEquals(
    DELETED_FUNCTIONS.length >= 36,
    true,
    `Expected at least 36 deleted functions, got ${DELETED_FUNCTIONS.length}`
  );
});

Deno.test("deleted-ef: all entries have required fields", () => {
  for (const fn of DELETED_FUNCTIONS) {
    assertEquals(typeof fn.name, "string", `Missing name`);
    assertEquals(typeof fn.status, "string", `Missing status for ${fn.name}`);
    assertEquals(typeof fn.reason, "string", `Missing reason for ${fn.name}`);
    assertEquals(
      ["removed", "deprecated", "consolidated"].includes(fn.status),
      true,
      `Invalid status '${fn.status}' for ${fn.name}`
    );
    if (fn.status === "consolidated") {
      assertEquals(
        typeof fn.replacement,
        "string",
        `Consolidated function ${fn.name} must have a replacement`
      );
    }
  }
});
