/**
 * 🏥 Medical AI Copilot - Edge Function Orchestratrice
 * 
 * RÉVOLUTIONNAIRE: Combine intelligemment tous les services premium:
 * - Perplexity: Recherche médicale temps réel avec sources
 * - Firecrawl: Extraction de contenu médical officiel
 * - Whisper: Transcription vocale médicale
 * 
 * Modes disponibles:
 * - research: Recherche approfondie avec sources vérifiées
 * - scrape-analyze: Scrape une URL et analyse le contenu
 * - voice-query: Transcrit audio + répond à la question
 * - clinical-assistant: Assistant clinique complet
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

type CopilotMode = 
  | 'research'           // Recherche médicale approfondie
  | 'scrape-analyze'     // Scrape URL + analyse
  | 'voice-query'        // Audio → Texte → Réponse
  | 'clinical-assistant' // Assistant clinique complet
  | 'quick-answer';      // Réponse rapide

interface CopilotRequest {
  mode: CopilotMode;
  query?: string;
  url?: string;
  audioBase64?: string;
  context?: {
    specialty?: string;
    itemNumber?: number;
    patientContext?: string;
  };
  options?: {
    includeGuidelines?: boolean;
    maxDepth?: number;
    language?: string;
  };
}

interface CopilotResponse {
  success: boolean;
  mode: CopilotMode;
  answer?: string;
  citations?: string[];
  extractedContent?: string;
  transcription?: string;
  guidelines?: Array<{ title: string; url: string; summary: string }>;
  relatedItems?: number[];
  processingSteps?: string[];
  metadata?: {
    totalTokens?: number;
    processingTimeMs?: number;
    sourcesCount?: number;
  };
  error?: string;
}

// Perplexity helper
async function queryPerplexity(
  messages: { role: string; content: string }[],
  model: string = 'sonar-pro',
  options: any = {}
): Promise<{ content: string; citations: string[]; usage?: any }> {
  const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
  if (!apiKey) throw new Error('PERPLEXITY_API_KEY not configured');

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: options.max_tokens || 3000,
      temperature: options.temperature ?? 0.1,
      ...(options.search_domain_filter && { search_domain_filter: options.search_domain_filter }),
      ...(options.search_mode && { search_mode: options.search_mode }),
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Perplexity error');
  
  return {
    content: data.choices?.[0]?.message?.content || '',
    citations: data.citations || [],
    usage: data.usage,
  };
}

// Firecrawl helper
async function scrapeUrl(url: string): Promise<{ markdown: string; title: string; metadata: any }> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) throw new Error('FIRECRAWL_API_KEY not configured');

  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith('http')) formattedUrl = `https://${formattedUrl}`;

  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: formattedUrl,
      formats: ['markdown'],
      onlyMainContent: true,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Firecrawl error');
  
  return {
    markdown: data.data?.markdown || '',
    title: data.data?.metadata?.title || '',
    metadata: data.data?.metadata || {},
  };
}

// Whisper helper
async function transcribeAudio(audioBase64: string, language: string = 'fr'): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const audioData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
  const formData = new FormData();
  formData.append('file', new Blob([audioData], { type: 'audio/webm' }), 'audio.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', language);

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error('Whisper transcription error');
  return data.text || '';
}

// Main handler
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const processingSteps: string[] = [];

  try {
    const request: CopilotRequest = await req.json();
    const { mode, query, url, audioBase64, context, options } = request;

    if (!mode) {
      return new Response(
        JSON.stringify({ success: false, error: 'Mode is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🏥 Medical AI Copilot - Mode: ${mode}`);
    processingSteps.push(`Started ${mode} mode`);

    let result: Partial<CopilotResponse> = { success: true, mode };

    // ═══════════════════════════════════════════════════════════════════
    // MODE: RESEARCH - Recherche médicale approfondie avec sources
    // ═══════════════════════════════════════════════════════════════════
    if (mode === 'research') {
      if (!query) throw new Error('Query is required for research mode');
      processingSteps.push('Querying Perplexity with medical context');

      const systemPrompt = context?.specialty 
        ? `Tu es un expert en ${context.specialty}. Fournis une réponse détaillée et sourcée pour les étudiants en médecine français préparant les EDN/ECOS.`
        : `Tu es un assistant médical expert. Tu fournis des réponses précises et sourcées pour les étudiants en médecine français.`;

      const perplexityResult = await queryPerplexity(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        'sonar-pro',
        {
          search_mode: 'academic',
          search_domain_filter: ['pubmed.ncbi.nlm.nih.gov', 'has-sante.fr', 'sfcardio.fr', 'uness.fr'],
        }
      );

      result.answer = perplexityResult.content;
      result.citations = perplexityResult.citations;
      result.metadata = { 
        totalTokens: perplexityResult.usage?.total_tokens,
        sourcesCount: perplexityResult.citations.length,
      };
      processingSteps.push(`Found ${perplexityResult.citations.length} citations`);
    }

    // ═══════════════════════════════════════════════════════════════════
    // MODE: SCRAPE-ANALYZE - Scrape une URL et analyse le contenu
    // ═══════════════════════════════════════════════════════════════════
    else if (mode === 'scrape-analyze') {
      if (!url) throw new Error('URL is required for scrape-analyze mode');
      processingSteps.push(`Scraping URL: ${url}`);

      const scraped = await scrapeUrl(url);
      processingSteps.push(`Scraped ${scraped.markdown.length} characters`);

      result.extractedContent = scraped.markdown;
      result.guidelines = [{ 
        title: scraped.title, 
        url, 
        summary: scraped.markdown.slice(0, 500) + '...' 
      }];

      // Optionally analyze with Perplexity
      if (query) {
        processingSteps.push('Analyzing content with AI');
        const analysisPrompt = `Basé sur ce contenu médical, réponds à: "${query}"\n\nContenu:\n${scraped.markdown.slice(0, 8000)}`;
        
        const analysis = await queryPerplexity(
          [{ role: 'user', content: analysisPrompt }],
          'sonar',
          { temperature: 0.1 }
        );
        
        result.answer = analysis.content;
        result.citations = analysis.citations;
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // MODE: VOICE-QUERY - Transcrit audio puis répond
    // ═══════════════════════════════════════════════════════════════════
    else if (mode === 'voice-query') {
      if (!audioBase64) throw new Error('Audio is required for voice-query mode');
      processingSteps.push('Transcribing audio with Whisper');

      const transcription = await transcribeAudio(audioBase64, options?.language || 'fr');
      result.transcription = transcription;
      processingSteps.push(`Transcribed: "${transcription.slice(0, 50)}..."`);

      // Answer the transcribed question
      processingSteps.push('Answering transcribed question');
      const perplexityResult = await queryPerplexity(
        [
          { role: 'system', content: 'Tu es un assistant médical expert. Réponds de manière claire et concise.' },
          { role: 'user', content: transcription }
        ],
        'sonar'
      );

      result.answer = perplexityResult.content;
      result.citations = perplexityResult.citations;
    }

    // ═══════════════════════════════════════════════════════════════════
    // MODE: CLINICAL-ASSISTANT - Assistant clinique complet
    // ═══════════════════════════════════════════════════════════════════
    else if (mode === 'clinical-assistant') {
      if (!query) throw new Error('Query is required for clinical-assistant mode');
      processingSteps.push('Processing clinical query');

      const clinicalPrompt = `
Tu es un assistant clinique expert pour étudiants en médecine.
${context?.patientContext ? `Contexte patient: ${context.patientContext}` : ''}
${context?.specialty ? `Spécialité: ${context.specialty}` : ''}

Question: ${query}

Fournis:
1. Réponse clinique structurée
2. Diagnostics différentiels si pertinent
3. Examens complémentaires recommandés
4. Sources et références
`;

      const clinicalResult = await queryPerplexity(
        [{ role: 'user', content: clinicalPrompt }],
        'sonar-reasoning-pro',
        { search_mode: 'academic', max_tokens: 4000 }
      );

      result.answer = clinicalResult.content;
      result.citations = clinicalResult.citations;
      
      // Extract related EDN items if mentioned
      const itemMatches = clinicalResult.content.match(/item\s*(\d+)/gi);
      if (itemMatches) {
        result.relatedItems = [...new Set(
          itemMatches.map(m => parseInt(m.replace(/\D/g, '')))
        )].slice(0, 10);
      }
      processingSteps.push('Clinical analysis complete');
    }

    // ═══════════════════════════════════════════════════════════════════
    // MODE: QUICK-ANSWER - Réponse rapide
    // ═══════════════════════════════════════════════════════════════════
    else if (mode === 'quick-answer') {
      if (!query) throw new Error('Query is required for quick-answer mode');
      processingSteps.push('Getting quick answer');

      const quickResult = await queryPerplexity(
        [
          { role: 'system', content: 'Réponds en 2-3 phrases maximum, de manière précise.' },
          { role: 'user', content: query }
        ],
        'sonar',
        { max_tokens: 300, temperature: 0.1 }
      );

      result.answer = quickResult.content;
      result.citations = quickResult.citations;
    }

    else {
      throw new Error(`Unknown mode: ${mode}`);
    }

    // Finalize response
    result.processingSteps = processingSteps;
    result.metadata = {
      ...result.metadata,
      processingTimeMs: Date.now() - startTime,
    };

    console.log(`✅ Medical AI Copilot completed in ${result.metadata.processingTimeMs}ms`);

    // Log usage (non-blocking)
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      await supabase.from('ai_usage_logs').insert({
        provider: 'medical-ai-copilot',
        model: mode,
        processing_time_ms: result.metadata.processingTimeMs,
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
    console.error('❌ Medical AI Copilot error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        processingSteps,
        metadata: { processingTimeMs: Date.now() - startTime }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
