import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

interface AudioProcessingRequest {
  action: 'extract_vocals' | 'convert_wav';
  audioUrl: string;
}

const SUNO_API_BASE = 'https://api.sunoapi.org/api/v1';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, audioUrl } = await req.json() as AudioProcessingRequest;

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

    if (action === 'extract_vocals') {
      // Call Suno API for vocal extraction
      const response = await fetch('https://api.sunoapi.org/api/v1/audio/extract-vocals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUNO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ audio_url: audioUrl })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Suno vocal extraction error:', errorText);
        return new Response(JSON.stringify({
          success: false,
          error: `Vocal extraction failed: ${response.status}`
        }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();
      
      return new Response(JSON.stringify({
        success: true,
        vocalsUrl: data.vocals_url || data.data?.vocals_url,
        instrumentalUrl: data.instrumental_url || data.data?.instrumental_url
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'convert_wav') {
      // Call Suno API for WAV conversion
      const response = await fetch('https://api.sunoapi.org/api/v1/audio/convert', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUNO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          audio_url: audioUrl,
          format: 'wav'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Suno WAV conversion error:', errorText);
        return new Response(JSON.stringify({
          success: false,
          error: `WAV conversion failed: ${response.status}`
        }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();
      
      return new Response(JSON.stringify({
        success: true,
        wavUrl: data.converted_url || data.data?.converted_url
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
    console.error('Audio processing error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
