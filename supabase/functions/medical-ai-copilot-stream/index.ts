/**
 * 🏥 Medical AI Copilot STREAMING - Token-by-Token
 * 
 * RÉVOLUTIONNAIRE: Streaming temps réel pour une UX exceptionnelle
 * Les tokens s'affichent au fur et à mesure de la génération
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface StreamRequest {
  query: string;
  mode?: 'research' | 'clinical' | 'quick';
  specialty?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, mode = 'quick', specialty }: StreamRequest = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'PERPLEXITY_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🏥 Medical Copilot Stream - Mode: ${mode}`);

    // Build system prompt based on mode
    let systemPrompt = 'Tu es un assistant médical expert pour étudiants en médecine français.';
    let model = 'sonar';
    
    if (mode === 'research') {
      systemPrompt = specialty 
        ? `Tu es un expert en ${specialty}. Fournis une réponse détaillée et structurée avec sources pour les EDN/ECOS.`
        : 'Tu es un médecin expert. Fournis des réponses complètes avec sources académiques.';
      model = 'sonar-pro';
    } else if (mode === 'clinical') {
      systemPrompt = `Tu es un assistant clinique expert. Fournis:
1. Réponse structurée
2. Diagnostics différentiels 
3. Examens complémentaires
4. Références actuelles`;
      model = 'sonar-reasoning-pro';
    }

    // Call Perplexity with streaming enabled
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        stream: true,
        max_tokens: mode === 'quick' ? 500 : 3000,
        temperature: 0.1,
        ...(mode === 'research' && { 
          search_mode: 'academic',
          search_domain_filter: ['pubmed.ncbi.nlm.nih.gov', 'has-sante.fr', 'sfcardio.fr']
        }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Stream the response directly to client
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('❌ Stream error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
