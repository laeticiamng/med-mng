import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

/**
 * auto-extract-oic — DÉSACTIVÉ
 * L'Edge Function extract-edn-objectifs a été supprimée.
 * Cette fonction est conservée comme placeholder et retourne un message d'information.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.warn('⚠️ auto-extract-oic est désactivé : extract-edn-objectifs a été supprimée.')

  return new Response(
    JSON.stringify({
      success: false,
      message: 'auto-extract-oic est désactivé. La fonction extract-edn-objectifs a été supprimée.',
      status: 'disabled'
    }),
    { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
