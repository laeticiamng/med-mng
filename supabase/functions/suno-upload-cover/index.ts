/**
 * 🎵 Suno Upload & Cover - Transformer un audio avec un nouveau style
 * 
 * Endpoint: POST /api/v1/generate/upload
 * Documentation: https://docs.sunoapi.org/suno-api/quickstart#upload-and-cover
 * 
 * Permet d'uploader un audio existant et de le transformer avec un nouveau style
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

const SUNO_API_BASE = 'https://api.sunoapi.org/api/v1';

interface UploadCoverRequest {
  uploadUrl: string;          // URL de l'audio original à transformer
  customMode: boolean;        // Toujours true pour cover
  style: string;              // Nouveau style musical
  title: string;              // Titre de la cover
  prompt?: string;            // Description additionnelle
  instrumental?: boolean;     // True = instrumental only
  model?: 'V4' | 'V4_5' | 'V4_5PLUS' | 'V4_5ALL' | 'V5';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: UploadCoverRequest = await req.json();
    
    // Validation des paramètres requis
    if (!body.uploadUrl) {
      return new Response(JSON.stringify({
        success: false,
        error: 'uploadUrl is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!body.style) {
      return new Response(JSON.stringify({
        success: false,
        error: 'style is required for cover generation'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!body.title) {
      return new Response(JSON.stringify({
        success: false,
        error: 'title is required for cover generation'
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

    console.log('🎵 Upload & Cover:', {
      uploadUrl: body.uploadUrl.substring(0, 50) + '...',
      style: body.style,
      title: body.title,
      model: body.model || 'V4_5'
    });

    // Construire le payload selon la documentation Suno
    const payload: Record<string, any> = {
      uploadUrl: body.uploadUrl,
      customMode: true, // Toujours true pour cover
      style: body.style,
      title: body.title,
      instrumental: body.instrumental ?? false,
      model: body.model || 'V4_5',
      callBackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/suno-callback`
    };

    if (body.prompt) {
      payload.prompt = body.prompt;
    }

    const response = await fetch(`${SUNO_API_BASE}/generate/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Suno upload error:', response.status, errorText);
      
      const errorMessages: Record<number, string> = {
        400: 'URL audio invalide ou paramètres incorrects',
        401: 'Clé API non autorisée',
        402: 'Crédits insuffisants - rechargez votre compte',
        405: 'Limite de taux dépassée',
        413: 'Style ou prompt trop long',
        429: 'Crédits insuffisants',
        430: 'Fréquence d\'appel trop élevée - attendez 10 secondes',
        455: 'Système en maintenance',
        500: 'Erreur serveur Suno'
      };
      
      return new Response(JSON.stringify({
        success: false,
        error: errorMessages[response.status] || `Upload failed: ${response.status}`
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('✅ Upload response:', data);

    if (data.code === 200 && data.data?.taskId) {
      return new Response(JSON.stringify({
        success: true,
        taskId: data.data.taskId,
        message: 'Cover generation started. Results will be sent to callback URL.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: data.msg || 'Unknown error during upload'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Upload cover error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
