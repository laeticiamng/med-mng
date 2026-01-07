/**
 * 🎵 Suno Extend Music - Extension de musique existante
 * 
 * Endpoint: POST /api/v1/generate/extend
 * Documentation: https://docs.sunoapi.org/suno-api/quickstart
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

const SUNO_API_BASE = 'https://api.sunoapi.org/api/v1';

interface ExtendMusicRequest {
  audioId: string;
  prompt?: string;
  continueAt?: number;
  model?: 'V4' | 'V4_5' | 'V4_5PLUS' | 'V4_5ALL' | 'V5';
  defaultParamFlag?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: ExtendMusicRequest = await req.json();
    
    if (!body.audioId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'audioId is required'
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

    console.log('🎵 Extension de musique:', body.audioId);

    const payload: Record<string, any> = {
      audioId: body.audioId,
      defaultParamFlag: body.defaultParamFlag ?? true,
      model: body.model || 'V4_5ALL',
      callBackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/suno-callback`
    };

    if (body.prompt) {
      payload.prompt = body.prompt;
    }
    if (typeof body.continueAt === 'number') {
      payload.continueAt = body.continueAt;
    }

    const response = await fetch(`${SUNO_API_BASE}/generate/extend`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Suno extend error:', response.status, errorText);
      
      const errorMessages: Record<number, string> = {
        400: 'Paramètres invalides ou audioId inexistant',
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
        error: errorMessages[response.status] || `Extension failed: ${response.status}`
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('✅ Extend response:', data);

    if (data.code === 200 && data.data?.taskId) {
      return new Response(JSON.stringify({
        success: true,
        taskId: data.data.taskId,
        message: 'Music extension started. Results will be sent to callback URL.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: data.msg || 'Unknown error during extension'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Extend music error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
