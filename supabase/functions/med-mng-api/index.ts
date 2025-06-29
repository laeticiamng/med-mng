
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Authorization header required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Verify JWT token
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'Invalid authentication' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const url = new URL(req.url);
  const path = url.pathname.replace('/functions/v1/med-mng-api', '');

  try {
    // Route: POST /subscriptions - Create subscription
    if (path === '/subscriptions' && req.method === 'POST') {
      const { plan_id, gateway, subscription_id } = await req.json();
      
      const { error } = await supabase.rpc('med_mng_create_user_sub', {
        plan_name: plan_id,
        gateway_name: gateway,
        subscription_id: subscription_id
      });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: POST /songs - Create a new song
    if (path === '/songs' && req.method === 'POST') {
      const { title, suno_audio_id, meta } = await req.json();
      
      // Check user quota first
      const { data: quotaData } = await supabase.rpc('med_mng_get_remaining_quota');
      
      if (!quotaData || quotaData <= 0) {
        return new Response(
          JSON.stringify({ error: 'Quota insuffisant' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert song (trigger will decrement quota)
      const { data, error } = await supabase
        .from('med_mng_songs')
        .insert({ title, suno_audio_id, meta })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /songs/:id/stream - Proxy streaming
    if (path.startsWith('/songs/') && path.endsWith('/stream') && req.method === 'GET') {
      const songId = path.split('/')[2];
      
      const { data: song, error } = await supabase
        .from('med_mng_songs')
        .select('suno_audio_id')
        .eq('id', songId)
        .single();

      if (error || !song) {
        return new Response(
          JSON.stringify({ error: 'Song not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Proxy to Suno with streaming support
      const sunoUrl = `https://apibox.erweima.ai/api/v1/audio/${song.suno_audio_id}`;
      const sunoResponse = await fetch(sunoUrl, {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUNO_API_KEY')}`,
          'Range': req.headers.get('Range') || '',
        },
      });

      const responseHeaders = {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, max-age=300',
      };

      // Copy range headers for streaming
      if (sunoResponse.headers.get('Content-Range')) {
        responseHeaders['Content-Range'] = sunoResponse.headers.get('Content-Range')!;
        responseHeaders['Accept-Ranges'] = 'bytes';
      }

      return new Response(sunoResponse.body, {
        status: sunoResponse.status,
        headers: responseHeaders,
      });
    }

    // Route: POST /library - Add to library
    if (path === '/library' && req.method === 'POST') {
      const { song_id } = await req.json();
      
      const { error } = await supabase.rpc('med_mng_add_to_library', { song_id });
      
      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: DELETE /library/:songId - Remove from library
    if (path.startsWith('/library/') && req.method === 'DELETE') {
      const songId = path.split('/')[2];
      
      const { error } = await supabase.rpc('med_mng_remove_from_library', { song_id: songId });
      
      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: POST /songs/:id/like - Toggle like
    if (path.match(/^\/songs\/[^/]+\/like$/) && req.method === 'POST') {
      const songId = path.split('/')[2];
      
      const { data: isLiked, error } = await supabase.rpc('med_mng_toggle_like', { song_id: songId });
      
      if (error) throw error;

      return new Response(
        JSON.stringify({ liked: isLiked }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /library - Get user library
    if (path === '/library' && req.method === 'GET') {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const offset = (page - 1) * limit;

      const { data, error } = await supabase
        .from('med_mng_view_library')
        .select('*')
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /songs/:id/lyrics - Get lyrics
    if (path.match(/^\/songs\/[^/]+\/lyrics$/) && req.method === 'GET') {
      const songId = path.split('/')[2];
      
      const { data: song, error } = await supabase
        .from('med_mng_songs')
        .select('lyrics, suno_audio_id')
        .eq('id', songId)
        .single();

      if (error || !song) {
        return new Response(
          JSON.stringify({ error: 'Song not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // If lyrics not cached, fetch from Suno
      if (!song.lyrics || Object.keys(song.lyrics).length === 0) {
        try {
          const lyricsResponse = await fetch(`https://apibox.erweima.ai/api/v1/get-timestamped-lyrics/${song.suno_audio_id}`, {
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUNO_API_KEY')}`,
            },
          });
          
          if (lyricsResponse.ok) {
            const lyricsData = await lyricsResponse.json();
            
            // Update song with lyrics
            await supabase
              .from('med_mng_songs')
              .update({ lyrics: lyricsData })
              .eq('id', songId);
            
            return new Response(
              JSON.stringify(lyricsData),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } catch (error) {
          console.error('Error fetching lyrics:', error);
        }
      }

      return new Response(
        JSON.stringify(song.lyrics || {}),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /quota - Get remaining quota
    if (path === '/quota' && req.method === 'GET') {
      const { data: quota, error } = await supabase.rpc('med_mng_get_remaining_quota');
      
      if (error) throw error;

      return new Response(
        JSON.stringify({ remaining_credits: quota || 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
