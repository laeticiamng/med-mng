/**
 * 🎙️ Whisper Transcribe - Edge Function pour transcription audio
 * 
 * Utilisations:
 * - Transcrire les notes vocales des étudiants
 * - Convertir des enregistrements de cours en texte
 * - Reconnaissance vocale pour recherche
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface TranscribeRequest {
  audioBase64?: string;
  audioUrl?: string;
  language?: string;
  prompt?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
}

interface TranscribeResponse {
  success: boolean;
  text?: string;
  duration?: number;
  language?: string;
  segments?: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
  }>;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      audioBase64, 
      audioUrl, 
      language = 'fr', 
      prompt,
      response_format = 'verbose_json',
      temperature = 0
    }: TranscribeRequest = await req.json();

    if (!audioBase64 && !audioUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Either audioBase64 or audioUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎙️ Whisper transcription starting...');

    // Get audio data
    let audioData: Uint8Array;
    let filename = 'audio.webm';

    if (audioBase64) {
      // Decode base64
      audioData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
    } else if (audioUrl) {
      // Fetch audio from URL
      const audioResponse = await fetch(audioUrl);
      if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio from URL: ${audioResponse.status}`);
      }
      audioData = new Uint8Array(await audioResponse.arrayBuffer());
      // Extract filename from URL
      const urlParts = audioUrl.split('/');
      filename = urlParts[urlParts.length - 1] || filename;
    } else {
      throw new Error('No audio data provided');
    }

    // Prepare form data
    const formData = new FormData();
    const blob = new Blob([audioData], { type: 'audio/webm' });
    formData.append('file', blob, filename);
    formData.append('model', 'whisper-1');
    formData.append('language', language);
    formData.append('response_format', response_format);
    formData.append('temperature', temperature.toString());
    
    if (prompt) {
      formData.append('prompt', prompt);
    }

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Whisper API error:', response.status, errorText);
      throw new Error(`Whisper API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    const result: TranscribeResponse = {
      success: true,
      text: data.text,
      duration: data.duration,
      language: data.language || language,
      segments: data.segments?.map((seg: any) => ({
        id: seg.id,
        start: seg.start,
        end: seg.end,
        text: seg.text,
      })),
    };

    console.log('✅ Whisper transcription completed:', {
      textLength: result.text?.length || 0,
      duration: result.duration,
      segmentsCount: result.segments?.length || 0,
    });

    // Log usage for analytics (non-blocking)
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase.from('ai_usage_logs').insert({
        provider: 'openai',
        model: 'whisper-1',
        audio_duration_seconds: data.duration || 0,
        text_length: result.text?.length || 0,
      });
    } catch (logError) {
      console.log('⚠️ Non-blocking logging error:', logError);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error with Whisper:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to transcribe audio';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
