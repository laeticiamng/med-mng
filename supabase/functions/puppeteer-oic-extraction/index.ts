import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ⚠️ FONCTION DÉSACTIVÉE ⚠️
// Cette fonction a été remplacée par GitHub Actions + Puppeteer
// Voir: scripts/auth/generate-cas-cookie.ts et .github/workflows/update-oic.yml
// Raison: Supabase Edge Functions ne supporte pas Puppeteer

interface OICCompetence {
  objectif_id: string;
  intitule: string;
  item_parent: string;
  rang: string;
  rubrique: string;
  description?: string;
  ordre?: number;
  url_source: string;
  raw_json: any;
  hash_content: string;
  extraction_status: string;
  date_import: string;
  updated_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Fonction désactivée - rediriger vers GitHub Actions
  return new Response(
    JSON.stringify({ 
      success: false,
      error: 'Fonction désactivée - Utiliser GitHub Actions',
      message: 'Cette fonction a été remplacée par GitHub Actions + Puppeteer',
      documentation: 'Voir scripts/README.md pour la nouvelle architecture',
      alternative: 'Déclencher le workflow GitHub: .github/workflows/update-oic.yml',
      timestamp: new Date().toISOString()
    }),
    { 
      status: 410, // Gone
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
})