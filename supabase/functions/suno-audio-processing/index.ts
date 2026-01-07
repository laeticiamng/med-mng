/**
 * 🎵 Suno Audio Processing - Traitement audio avancé
 * 
 * Endpoints utilisés selon la documentation officielle Suno API:
 * - Séparation vocale: POST /api/v1/separate-vocals
 * - Conversion WAV: POST /api/v1/audio/wav
 * 
 * Documentation: https://docs.sunoapi.org/suno-api/separate-vocals-from-music
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

interface AudioProcessingRequest {
  action: 'extract_vocals' | 'convert_wav';
  audioUrl: string;     // Requis pour convert_wav
  taskId?: string;      // Requis pour extract_vocals selon doc Suno
  audioId?: string;     // Requis pour extract_vocals selon doc Suno
}

const SUNO_API_BASE = 'https://api.sunoapi.org/api/v1';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, audioUrl, taskId, audioId } = await req.json() as AudioProcessingRequest;

    if (!audioUrl) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Audio URL is required'
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

    console.log(`🎵 Audio processing: ${action} for ${audioUrl}`);

    if (action === 'extract_vocals') {
      // ✅ CORRECTION selon doc officielle Suno:
      // POST /api/v1/vocal-removal/generate requiert taskId + audioId (pas audioUrl)
      // https://docs.sunoapi.org/suno-api/quickstart#separate-vocals
      
      if (!taskId || !audioId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'taskId et audioId sont requis pour la séparation vocale'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const response = await fetch(`${SUNO_API_BASE}/vocal-removal/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUNO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          taskId: taskId,
          audioId: audioId,
          callBackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/suno-callback`
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Suno vocal extraction error:', response.status, errorText);
        
        // Mapper les codes d'erreur selon documentation
        const errorMessages: Record<number, string> = {
          400: 'URL audio invalide',
          401: 'Clé API non autorisée',
          405: 'Limite de taux dépassée',
          413: 'Fichier audio trop volumineux',
          429: 'Crédits insuffisants',
          430: 'Fréquence d\'appel trop élevée - attendez avant de réessayer',
          455: 'Système en maintenance',
          500: 'Erreur serveur Suno'
        };
        
        return new Response(JSON.stringify({
          success: false,
          error: errorMessages[response.status] || `Vocal extraction failed: ${response.status}`
        }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();
      console.log('✅ Vocal extraction response:', data);
      
      // Structure de réponse selon documentation Suno
      if (data.code === 200 && data.data?.taskId) {
        return new Response(JSON.stringify({
          success: true,
          taskId: data.data.taskId,
          message: 'Vocal extraction started. Results will be sent to callback URL.'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({
        success: true,
        vocalsUrl: data.data?.vocalsUrl || data.vocals_url,
        instrumentalUrl: data.data?.instrumentalUrl || data.instrumental_url
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'convert_wav') {
      // ✅ CORRECTION: Endpoint correct selon documentation Suno
      // POST /api/v1/audio/convert-wav (selon doc officielle)
      const response = await fetch(`${SUNO_API_BASE}/audio/convert-wav`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUNO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          audioUrl: audioUrl,
          callBackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/suno-callback`
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Suno WAV conversion error:', response.status, errorText);
        
        const errorMessages: Record<number, string> = {
          400: 'URL audio invalide',
          401: 'Clé API non autorisée',
          405: 'Limite de taux dépassée',
          413: 'Fichier audio trop volumineux',
          429: 'Crédits insuffisants',
          430: 'Fréquence d\'appel trop élevée - attendez avant de réessayer',
          455: 'Système en maintenance',
          500: 'Erreur serveur Suno'
        };
        
        return new Response(JSON.stringify({
          success: false,
          error: errorMessages[response.status] || `WAV conversion failed: ${response.status}`
        }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();
      console.log('✅ WAV conversion response:', data);
      
      // Structure de réponse selon documentation Suno
      if (data.code === 200 && data.data?.taskId) {
        return new Response(JSON.stringify({
          success: true,
          taskId: data.data.taskId,
          message: 'WAV conversion started. Results will be sent to callback URL.'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({
        success: true,
        wavUrl: data.data?.wavUrl || data.wav_url || data.converted_url
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid action. Use "extract_vocals" or "convert_wav"'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Audio processing error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
