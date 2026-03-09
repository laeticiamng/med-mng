import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const checks: Record<string, { status: string; latency_ms?: number; error?: string }> = {};
  const startTotal = Date.now();

  // 1. Database check
  try {
    const dbStart = Date.now();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const { error } = await supabase.from("edn_items_complete").select("id").limit(1);
    checks.database = {
      status: error ? "degraded" : "operational",
      latency_ms: Date.now() - dbStart,
      ...(error && { error: error.message }),
    };
  } catch (e) {
    checks.database = { status: "down", error: (e as Error).message };
  }

  // 2. Storage check
  try {
    const storageStart = Date.now();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const { error } = await supabase.storage.listBuckets();
    checks.storage = {
      status: error ? "degraded" : "operational",
      latency_ms: Date.now() - storageStart,
      ...(error && { error: error.message }),
    };
  } catch (e) {
    checks.storage = { status: "down", error: (e as Error).message };
  }

  // 3. Edge functions check (self-check = if this runs, functions work)
  checks.edge_functions = { status: "operational", latency_ms: 0 };

  // Overall status
  const allStatuses = Object.values(checks).map((c) => c.status);
  const overall = allStatuses.every((s) => s === "operational")
    ? "operational"
    : allStatuses.some((s) => s === "down")
    ? "down"
    : "degraded";

  return new Response(
    JSON.stringify({
      status: overall,
      timestamp: new Date().toISOString(),
      total_latency_ms: Date.now() - startTotal,
      checks,
      version: "1.0.0",
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: overall === "down" ? 503 : 200,
    }
  );
});
