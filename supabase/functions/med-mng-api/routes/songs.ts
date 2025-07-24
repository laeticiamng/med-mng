import { errorResponse } from "../response.ts";
import { corsHeaders, securityHeaders, CreateSongRequest } from '../types.ts';
import { log } from '../logger.ts';

declare const Deno: { env: { get(key: string): string | undefined } };

export async function handleSongs(req: Request, supabase: any, path: string) {
  // GET /songs - List songs with pagination
  if (path === '/songs' && req.method === 'GET') {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(url.searchParams.get('limit') || '20'));
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('med_mng_songs')
      .select('id,title,suno_audio_id,meta,created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return new Response(
      JSON.stringify({ items: data, page, limit, totalCount: count || 0 }),
      {
        headers: {
          ...corsHeaders,
          ...securityHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // POST /songs - Create a new song
  if (path === '/songs' && req.method === 'POST') {
    const { title, suno_audio_id, meta }: CreateSongRequest = await req.json();

    // Check user quota first
    const { data: quotaData } = await supabase.rpc(
      'med_mng_get_remaining_quota'
    );

    if (!quotaData || quotaData <= 0) {
      return errorResponse(403, 'QUOTA_EXCEEDED', 'Quota insuffisant');
    }

    // Insert song (trigger will decrement quota)
    const { data, error } = await supabase
      .from('med_mng_songs')
      .insert({ title, suno_audio_id, meta })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        ...securityHeaders,
        'Content-Type': 'application/json',
      },
    });
  }

  // GET /songs/:id/stream - Proxy streaming
  if (
    path.startsWith('/songs/') &&
    path.endsWith('/stream') &&
    req.method === 'GET'
  ) {
    const songId = path.split('/')[2];

    const { data: song, error } = await supabase
      .from('med_mng_songs')
      .select('suno_audio_id')
      .eq('id', songId)
      .single();

    if (error || !song) {
      return errorResponse(404, 'SONG_NOT_FOUND', 'Song not found');
    }

    // Proxy to Suno with streaming support
    const sunoUrl = `https://apibox.erweima.ai/api/v1/audio/${song.suno_audio_id}`;
    const sunoResponse = await fetch(sunoUrl, {
      headers: {
        Authorization: `Bearer ${Deno.env.get('SUNO_API_KEY')}`,
        Range: req.headers.get('Range') || '',
      },
    });

    const responseHeaders = {
      ...corsHeaders,
      ...securityHeaders,
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, max-age=300',
    };

    // Copy range headers for streaming
    if (sunoResponse.headers.get('Content-Range')) {
      responseHeaders['Content-Range'] =
        sunoResponse.headers.get('Content-Range')!;
      responseHeaders['Accept-Ranges'] = 'bytes';
    }

    return new Response(sunoResponse.body, {
      status: sunoResponse.status,
      headers: responseHeaders,
    });
  }

  // POST /songs/:id/like - Toggle like
  if (path.match(/^\/songs\/[^/]+\/like$/) && req.method === 'POST') {
    const songId = path.split('/')[2];

    const { data: isLiked, error } = await supabase.rpc('med_mng_toggle_like', {
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
      return errorResponse(404, 'SONG_NOT_FOUND', 'Song not found');
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
        return errorResponse(500, 'LYRICS_FETCH_ERROR', 'Erreur récupération paroles');
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
