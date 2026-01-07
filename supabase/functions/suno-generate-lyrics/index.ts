/**
 * 🎵 Suno Generate Lyrics - Génération de paroles AI
 * 
 * Endpoint: POST /api/v1/lyrics
 * Documentation: https://docs.sunoapi.org/suno-api/generate-lyrics
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

const SUNO_API_BASE = 'https://api.sunoapi.org/api/v1';

interface GenerateLyricsRequest {
  prompt: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: GenerateLyricsRequest = await req.json();
    
    if (!body.prompt) {
      return new Response(JSON.stringify({
        success: false,
        error: 'prompt is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
    
    if (!SUNO_API_KEY) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Suno API key not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📝 Génération de paroles pour:', body.prompt.substring(0, 100));

    const payload = {
      prompt: body.prompt,
      callBackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/suno-callback`
    };

    const response = await fetch(`${SUNO_API_BASE}/lyrics`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Suno lyrics error:', response.status, errorText);
      
      const errorMessages: Record<number, string> = {
        400: 'Prompt invalide',
        401: 'Clé API non autorisée',
        405: 'Limite de taux dépassée',
        413: 'Prompt trop long',
        429: 'Crédits insuffisants',
        430: 'Fréquence d\'appel trop élevée',
        455: 'Système en maintenance',
        500: 'Erreur serveur Suno'
      };
      
      return new Response(JSON.stringify({
        success: false,
        error: errorMessages[response.status] || `Lyrics generation failed: ${response.status}`
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('✅ Lyrics response:', data);

    if (data.code === 200 && data.data?.taskId) {
      return new Response(JSON.stringify({
        success: true,
        taskId: data.data.taskId,
        message: 'Lyrics generation started. Results will be sent to callback URL.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Si les paroles sont retournées immédiatement
    if (data.code === 200 && data.data?.text) {
      return new Response(JSON.stringify({
        success: true,
        lyrics: data.data.text,
        title: data.data.title || 'Generated Lyrics'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: data.msg || 'Unknown error during lyrics generation'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Lyrics generation error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
