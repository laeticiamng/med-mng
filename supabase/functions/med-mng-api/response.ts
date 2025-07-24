import { corsHeaders, securityHeaders } from "./types.ts";
export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...securityHeaders,
    },
  });
}

export function errorResponse(status: number, error: string, message: string) {
  return jsonResponse({ error, code: status, message }, status);
}
