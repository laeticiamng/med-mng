/**
 * 🔎 Perplexity Search - Edge Function pour recherche IA avec sources
 * 
 * Utilisations:
 * - Chat IA avec recherche web temps réel
 * - Réponses médicales sourcées et vérifiables
 * - Questions-réponses avec citations
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PerplexityRequest {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  model?: 'sonar' | 'sonar-pro' | 'sonar-reasoning' | 'sonar-reasoning-pro' | 'sonar-deep-research';
  options?: {
    max_tokens?: number;
    temperature?: number;
    search_domain_filter?: string[];
    search_recency_filter?: 'day' | 'week' | 'month' | 'year';
    search_mode?: 'academic' | 'sec';
  };
}

interface PerplexityResponse {
  success: boolean;
  content?: string;
  citations?: string[];
  model?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, model = 'sonar', options }: PerplexityRequest = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!apiKey) {
      console.error('PERPLEXITY_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Perplexity connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔎 Perplexity query with model:', model);

    // Add medical context system prompt if not present
    const systemMessage = messages.find(m => m.role === 'system');
    const enhancedMessages = systemMessage ? messages : [
      { 
        role: 'system', 
        content: `Tu es un assistant médical expert. Tu fournis des réponses précises et sourcées pour les étudiants en médecine français préparant les EDN/ECOS. Cite toujours tes sources.` 
      },
      ...messages
    ];

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: enhancedMessages,
        max_tokens: options?.max_tokens || 2000,
        temperature: options?.temperature ?? 0.2,
        ...(options?.search_domain_filter && { search_domain_filter: options.search_domain_filter }),
        ...(options?.search_recency_filter && { search_recency_filter: options.search_recency_filter }),
        ...(options?.search_mode && { search_mode: options.search_mode }),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Perplexity API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error?.message || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result: PerplexityResponse = {
      success: true,
      content: data.choices?.[0]?.message?.content || '',
      citations: data.citations || [],
      model: data.model,
      usage: data.usage,
    };

    console.log('✅ Perplexity response received with', result.citations?.length || 0, 'citations');

    // Log usage for analytics (non-blocking)
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase.from('ai_usage_logs').insert({
        provider: 'perplexity',
        model,
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0,
        citations_count: result.citations?.length || 0,
      });
    } catch (logError) {
      console.log('⚠️ Non-blocking logging error:', logError);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error with Perplexity:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to query Perplexity';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
