import { jsonResponse, errorResponse, paginatedResponse } from "../response.ts";
import { corsHeaders, securityHeaders, CreateSongRequest, ApiErrorCode } from '../types.ts';
import { Validator, validatePagination, sanitizeInput } from '../middleware/validation.ts';
import { log } from '../logger.ts';

declare const Deno: { env: { get(key: string): string | undefined } };

export async function handleSongs(req: Request, supabase: any, path: string, user?: { id: string }) {
  // GET /songs - List songs with pagination
  if (path === '/songs' && req.method === 'GET') {
    try {
      const url = new URL(req.url);
      const { page, limit } = validatePagination(url);
      const offset = (page - 1) * limit;

      // Optional search parameter
      const searchTerm = sanitizeInput(url.searchParams.get('search') || '');

      let query = supabase
        .from('med_mng_songs')
        .select('id,title,suno_audio_id,meta,created_at', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Add search filter if provided
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, count, error } = await query.range(offset, offset + limit - 1);

      if (error) {
        log('error', 'Database error in songs list', error);
        throw error;
      }

      log('info', `Retrieved ${data?.length || 0} songs (page ${page}, search: "${searchTerm}")`);

      return paginatedResponse(data || [], page, limit, count || 0, {
        search: searchTerm || undefined
      });
    } catch (error) {
      log('error', 'Error in songs list endpoint', error);
      throw error;
    }
  }

  // POST /songs - Create a new song
  if (path === '/songs' && req.method === 'POST') {
    try {
      const body = await req.json();
      
      // Validate request body
      const validationError = Validator.validate(body, [
        { field: 'title', required: true, type: 'string', minLength: 1, maxLength: 255 },
        { field: 'suno_audio_id', required: true, type: 'string', minLength: 1, maxLength: 100 },
        { field: 'meta', required: false }
      ]);

      if (validationError) return validationError;

      const { title, suno_audio_id, meta }: CreateSongRequest = body;
      
      // Sanitize inputs
      const sanitizedTitle = sanitizeInput(title);

      // Check quota first
      const { data: quota, error: quotaError } = await supabase.rpc('med_mng_get_remaining_quota');
      if (quotaError) {
        log('error', 'Quota check failed', quotaError);
        throw quotaError;
      }

      if ((quota || 0) < 1) {
        log('warn', 'Song creation blocked due to insufficient quota', { quota });
        return errorResponse(409, ApiErrorCode.QUOTA_EXCEEDED, 'Quota insuffisant pour créer une chanson');
      }

      const { data: song, error } = await supabase
        .from('med_mng_songs')
        .insert({ 
          title: sanitizedTitle, 
          suno_audio_id, 
          meta: meta || {},
          created_by: user?.id || null
        })
        .select()
        .single();

      if (error) {
        log('error', 'Song creation failed', error);
        throw error;
      }

      log('info', `Song created successfully`, { songId: song.id, title: sanitizedTitle });

      return jsonResponse(song, 201);
    } catch (error) {
      log('error', 'Error in song creation endpoint', error);
      throw error;
    }
  }

  // GET /songs/:id/stream - Proxy streaming
  if (
    path.startsWith('/songs/') &&
    path.endsWith('/stream') &&
    req.method === 'GET'
  ) {
    try {
      const songId = path.split('/')[2];

      // Validate UUID format
      if (!songId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(songId)) {
        return errorResponse(400, ApiErrorCode.INVALID_SONG_ID, 'Format d\'ID de chanson invalide');
      }

      const { data: song, error } = await supabase
        .from('med_mng_songs')
        .select('suno_audio_id')
        .eq('id', songId)
        .single();

      if (error || !song) {
        log('warn', `Song not found for streaming: ${songId}`);
        return errorResponse(404, ApiErrorCode.SONG_NOT_FOUND, 'Chanson introuvable');
      }

      // Proxy to Suno with streaming support and timeout
      const sunoUrl = `https://apibox.erweima.ai/api/v1/audio/${song.suno_audio_id}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        const sunoResponse = await fetch(sunoUrl, {
          headers: {
            Authorization: `Bearer ${Deno.env.get('SUNO_API_KEY')}`,
            Range: req.headers.get('Range') || '',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!sunoResponse.ok) {
          log('error', `Suno API error: ${sunoResponse.status}`, { songId, sunoAudioId: song.suno_audio_id });
          return errorResponse(502, ApiErrorCode.UPSTREAM_ERROR, 'Service audio indisponible');
        }

        const responseHeaders = {
          ...corsHeaders,
          ...securityHeaders,
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': 'inline',
          'Cache-Control': 'private, max-age=300',
          'X-Song-ID': songId,
        };

        // Copy range headers for streaming
        if (sunoResponse.headers.get('Content-Range')) {
          responseHeaders['Content-Range'] = sunoResponse.headers.get('Content-Range')!;
          responseHeaders['Accept-Ranges'] = 'bytes';
        }

        log('info', `Song streaming started`, { songId, status: sunoResponse.status });

        return new Response(sunoResponse.body, {
          status: sunoResponse.status,
          headers: responseHeaders,
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          log('error', 'Song streaming timeout', { songId });
          return errorResponse(504, ApiErrorCode.STREAM_TIMEOUT, 'Timeout lors du streaming audio');
        }
        throw fetchError;
      }
    } catch (error) {
      log('error', 'Error in song streaming endpoint', error);
      throw error;
    }
  }

  // POST /songs/:id/like - Toggle like
  if (path.match(/^\/songs\/[^/]+\/like$/) && req.method === 'POST') {
    const songId = path.split('/')[2];

    const { data: isLiked, error } = await supabase.rpc('med_mng_toggle_favorite', {
      song_id: songId,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ liked: isLiked }), {
      headers: {
        ...corsHeaders,
        ...securityHeaders,
        'Content-Type': 'application/json',
      },
    });
  }

  // GET /songs/:id/lyrics - Get lyrics
  if (path.match(/^\/songs\/[^/]+\/lyrics$/) && req.method === 'GET') {
    const songId = path.split('/')[2];

    const { data: song, error } = await supabase
      .from('med_mng_songs')
      .select('lyrics, suno_audio_id')
      .eq('id', songId)
      .single();

    if (error || !song) {
      return errorResponse(404, ApiErrorCode.SONG_NOT_FOUND, 'Chanson introuvable');
    }

    // If lyrics not cached, fetch from Suno
    if (!song.lyrics || Object.keys(song.lyrics).length === 0) {
      try {
        const lyricsResponse = await fetch(
          `https://apibox.erweima.ai/api/v1/get-timestamped-lyrics/${song.suno_audio_id}`,
          {
            headers: {
              Authorization: `Bearer ${Deno.env.get('SUNO_API_KEY')}`,
            },
          }
        );

        if (lyricsResponse.ok) {
          const lyricsData = await lyricsResponse.json();

          // Update song with lyrics
          await supabase
            .from('med_mng_songs')
            .update({ lyrics: lyricsData })
            .eq('id', songId);

          return new Response(JSON.stringify(lyricsData), {
            headers: {
              ...corsHeaders,
              ...securityHeaders,
              'Content-Type': 'application/json',
            },
          });
        }
      } catch (error) {
        log('error', 'Error fetching lyrics', error);
        return errorResponse(500, ApiErrorCode.LYRICS_FETCH_ERROR, 'Erreur lors de la récupération des paroles');
      }
    }

    return new Response(JSON.stringify(song.lyrics || {}), {
      headers: {
        ...corsHeaders,
        ...securityHeaders,
        'Content-Type': 'application/json',
      },
    });
  }

  return null;
}
