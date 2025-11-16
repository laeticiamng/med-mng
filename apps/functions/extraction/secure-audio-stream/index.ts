import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

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
  const requestStart = performance.now();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const audioId = url.searchParams.get('id');
    const token = url.searchParams.get('token');
    const clientInfo = req.headers.get('x-client-info') || 'unknown';

    console.log(`🎵 [STREAM] Demande streaming: ${audioId} - Client: ${clientInfo}`);

    if (!audioId || !token) {
      console.error('❌ [STREAM] Paramètres manquants');
      return new Response('Missing audio ID or token', { 
        status: 400,
        headers: { ...corsHeaders, ...securityHeaders }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // OPTIMISATION 1: Authentification et autorisation en parallèle
    const authTime = performance.now();
    
    const [authResult, songResult] = await Promise.all([
      supabase.auth.getUser(token),
      supabase
        .from('med_mng_songs')
        .select('suno_audio_id, title')
        .eq('id', audioId)
        .single()
    ]);

    const authDuration = performance.now() - authTime;
    console.log(`📊 [STREAM] Auth + Song query: ${authDuration.toFixed(2)}ms`);

    const { data: { user }, error: authError } = authResult;
    const { data: song, error: songError } = songResult;
    
    if (authError || !user) {
      console.error('❌ [STREAM] Auth failed:', authError?.message);
      return new Response('Unauthorized', { 
        status: 401,
        headers: { ...corsHeaders, ...securityHeaders }
      });
    }

    if (songError || !song) {
      console.error('❌ [STREAM] Song not found:', songError?.message);
      return new Response('Song not found', { 
        status: 404,
        headers: { ...corsHeaders, ...securityHeaders }
      });
    }

    // OPTIMISATION 2: Vérification d'accès avec cache potentiel
    const accessTime = performance.now();
    const { data: userSong, error: userSongError } = await supabase
      .from('med_mng_user_songs')
      .select('id')
      .eq('user_id', user.id)
      .eq('song_id', audioId)
      .single();

    const accessDuration = performance.now() - accessTime;
    console.log(`📊 [STREAM] Access check: ${accessDuration.toFixed(2)}ms`);

    if (userSongError || !userSong) {
      console.error('❌ [STREAM] Access denied');
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

    // OPTIMISATION 3: Streaming optimisé avec logging de performance
    const sunoApiKey = Deno.env.get('SUNO_API_KEY');
    if (!sunoApiKey) {
      throw new Error('Suno API key not configured');
    }

    // URL sécurisée pour le streaming depuis Suno  
    const sunoStreamUrl = `https://api.suno.ai/v1/audio/${song.suno_audio_id}/stream`;
    
    const rangeHeader = req.headers.get('range');
    const sunoHeaders: HeadersInit = {
      'Authorization': `Bearer ${sunoApiKey}`,
      'User-Agent': 'MedMng-SecureStream/1.0',
      'Accept': 'audio/mpeg,audio/*',
      'Cache-Control': 'no-cache'
    };

    if (rangeHeader) {
      sunoHeaders['Range'] = rangeHeader;
      console.log(`📊 [STREAM] Range request: ${rangeHeader}`);
    }

    const streamTime = performance.now();
    const sunoResponse = await fetch(sunoStreamUrl, {
      method: 'GET',
      headers: sunoHeaders,
      signal: AbortSignal.timeout(15000) // Timeout réduit à 15s
    });

    const streamDuration = performance.now() - streamTime;
    console.log(`📊 [STREAM] Suno response: ${streamDuration.toFixed(2)}ms - Status: ${sunoResponse.status}`);

    if (!sunoResponse.ok) {
      console.error(`❌ [STREAM] Suno error: ${sunoResponse.status} - ${sunoResponse.statusText}`);
      return new Response('Audio stream unavailable', { 
        status: 503,
        headers: { ...corsHeaders, ...securityHeaders }
      });
    }

    // OPTIMISATION 4: Headers optimisés pour le streaming
    const responseHeaders = new Headers({
      ...corsHeaders,
      ...securityHeaders,
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'inline; filename="audio.mp3"',
      'Accept-Ranges': 'bytes',
      'X-Audio-Title': song.title,
      'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
      'X-Stream-Optimized': 'true',
      'Cache-Control': 'public, max-age=3600' // Cache 1h pour les chunks
    });

    // Copier headers de range et optimisations
    const contentLength = sunoResponse.headers.get('content-length');
    const contentRange = sunoResponse.headers.get('content-range');
    
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
      console.log(`📊 [STREAM] Content-Length: ${contentLength} bytes`);
    }
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }

    const status = sunoResponse.status === 206 ? 206 : 200;
    const totalDuration = performance.now() - requestStart;
    
    console.log(`✅ [STREAM] Total request time: ${totalDuration.toFixed(2)}ms - Status: ${status}`);

    // Log async pour éviter de bloquer la réponse
    setTimeout(() => {
      supabase.rpc('log_audio_access', {
        user_id: user.id,
        song_id: audioId,
        access_type: 'stream',
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      }).catch(e => console.warn('Log failed:', e));
    }, 0);

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