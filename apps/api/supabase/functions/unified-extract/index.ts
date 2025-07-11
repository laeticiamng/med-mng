import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface Payload {
  mode?: "batch" | "single" | "report";
}

serve(async (req) => {
  const { mode = "single" } = (await req.json().catch(() => ({}))) as Payload;

  switch (mode) {
    case "batch":
      // TODO: call batch extraction logic
      break;
    case "report":
      // TODO: generate extraction report
      break;
    default:
      // TODO: call single extraction logic
  }

  return new Response(
    JSON.stringify({ success: true, mode }),
    { headers: { "Content-Type": "application/json" } },
  );
});
