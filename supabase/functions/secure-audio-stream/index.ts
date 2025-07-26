import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, range',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
};

const securityHeaders = {
  'Content-Security-Policy': "default-src 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const audioId = url.searchParams.get('id');
    const token = url.searchParams.get('token');

    if (!audioId || !token) {
      return new Response('Missing audio ID or token', { 
        status: 400,
        headers: { ...corsHeaders, ...securityHeaders }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Vérifier l'authentification avec le token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response('Unauthorized', { 
        status: 401,
        headers: { ...corsHeaders, ...securityHeaders }
      });
    }

    // Vérifier que l'utilisateur a accès à ce morceau
    const { data: song, error: songError } = await supabase
      .from('med_mng_songs')
      .select('suno_audio_id, title')
      .eq('id', audioId)
      .single();

    if (songError || !song) {
      return new Response('Song not found', { 
        status: 404,
        headers: { ...corsHeaders, ...securityHeaders }
      });
    }

    // Vérifier que l'utilisateur a ce morceau dans sa bibliothèque
    const { data: userSong, error: userSongError } = await supabase
      .from('med_mng_user_songs')
      .select('id')
      .eq('user_id', user.id)
      .eq('song_id', audioId)
      .single();

    if (userSongError || !userSong) {
      return new Response('Access denied to this song', { 
        status: 403,
        headers: { ...corsHeaders, ...securityHeaders }
      });
    }

    // Log de l'accès pour monitoring
    await supabase.rpc('log_audio_access', {
      user_id: user.id,
      song_id: audioId,
      access_type: 'stream',
      ip_address: req.headers.get('x-forwarded-for') || 'unknown'
    });

    // Proxy sécurisé vers Suno pour le streaming
    const sunoApiKey = Deno.env.get('SUNO_API_KEY');
    if (!sunoApiKey) {
      throw new Error('Suno API key not configured');
    }

    // URL sécurisée pour le streaming depuis Suno
    const sunoStreamUrl = `https://api.suno.ai/v1/audio/${song.suno_audio_id}/stream`;
    
    const rangeHeader = req.headers.get('range');
    const sunoHeaders: HeadersInit = {
      'Authorization': `Bearer ${sunoApiKey}`,
      'User-Agent': 'MedMng-SecureStream/1.0'
    };

    if (rangeHeader) {
      sunoHeaders['Range'] = rangeHeader;
    }

    const sunoResponse = await fetch(sunoStreamUrl, {
      method: 'GET',
      headers: sunoHeaders,
      signal: AbortSignal.timeout(30000) // Timeout 30s
    });

    if (!sunoResponse.ok) {
      console.error(`Suno stream error: ${sunoResponse.status}`);
      return new Response('Audio stream unavailable', { 
        status: 503,
        headers: { ...corsHeaders, ...securityHeaders }
      });
    }

    // Headers de streaming sécurisé - JAMAIS de téléchargement
    const responseHeaders = new Headers({
      ...corsHeaders,
      ...securityHeaders,
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'inline; filename="audio.mp3"', // INLINE forcé
      'Accept-Ranges': 'bytes',
      'X-Audio-Title': song.title,
      'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet'
    });

    // Copier headers de range si présents
    const contentLength = sunoResponse.headers.get('content-length');
    const contentRange = sunoResponse.headers.get('content-range');
    
    if (contentLength) responseHeaders.set('Content-Length', contentLength);
    if (contentRange) responseHeaders.set('Content-Range', contentRange);

    const status = sunoResponse.status === 206 ? 206 : 200;

    return new Response(sunoResponse.body, {
      status,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('Secure audio stream error:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: { ...corsHeaders, ...securityHeaders }
    });
  }
});