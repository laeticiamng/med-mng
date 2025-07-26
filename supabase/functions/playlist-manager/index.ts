import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Authentication required
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/playlist-manager', '');
    const method = req.method;

    // GET /playlists - Liste des playlists de l'utilisateur
    if (path === '/playlists' && method === 'GET') {
      const { data: playlists, error } = await supabase
        .from('med_mng_playlists')
        .select(`
          id,
          name,
          description,
          is_public,
          cover_image_url,
          created_at,
          updated_at,
          med_mng_playlist_songs(count)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch playlists: ${error.message}`);
      }

      // Calculer le nombre de morceaux par playlist
      const playlistsWithCounts = playlists.map(playlist => ({
        ...playlist,
        song_count: playlist.med_mng_playlist_songs?.[0]?.count || 0,
        med_mng_playlist_songs: undefined
      }));

      return new Response(JSON.stringify({
        success: true,
        playlists: playlistsWithCounts
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /playlists - Créer une nouvelle playlist
    if (path === '/playlists' && method === 'POST') {
      const { name, description = '', is_public = false, cover_image_url = null } = await req.json();

      if (!name || name.trim().length === 0) {
        return new Response(JSON.stringify({ 
          error: 'Playlist name is required' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: newPlaylist, error } = await supabase
        .from('med_mng_playlists')
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description.trim(),
          is_public,
          cover_image_url
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create playlist: ${error.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        playlist: { ...newPlaylist, song_count: 0 }
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /playlists/:id - Détails d'une playlist avec ses morceaux
    const playlistIdMatch = path.match(/^\/playlists\/([a-f0-9-]+)$/);
    if (playlistIdMatch && method === 'GET') {
      const playlistId = playlistIdMatch[1];

      const { data: playlist, error: playlistError } = await supabase
        .from('med_mng_playlists')
        .select(`
          id,
          name,
          description,
          is_public,
          cover_image_url,
          created_at,
          updated_at,
          user_id
        `)
        .eq('id', playlistId)
        .single();

      if (playlistError || !playlist) {
        return new Response(JSON.stringify({ error: 'Playlist not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Vérifier les droits d'accès
      if (playlist.user_id !== user.id && !playlist.is_public) {
        return new Response(JSON.stringify({ error: 'Access denied' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Récupérer les morceaux de la playlist
      const { data: songs, error: songsError } = await supabase
        .from('med_mng_playlist_songs')
        .select(`
          position,
          added_at,
          med_mng_songs (
            id,
            title,
            suno_audio_id,
            meta,
            created_at
          )
        `)
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

      if (songsError) {
        throw new Error(`Failed to fetch playlist songs: ${songsError.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        playlist: {
          ...playlist,
          songs: songs.map(s => ({
            ...s.med_mng_songs,
            position: s.position,
            added_at: s.added_at
          })),
          song_count: songs.length
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PUT /playlists/:id - Modifier une playlist
    if (playlistIdMatch && method === 'PUT') {
      const playlistId = playlistIdMatch[1];
      const { name, description, is_public, cover_image_url } = await req.json();

      const { data: playlist, error } = await supabase
        .from('med_mng_playlists')
        .update({
          name: name?.trim(),
          description: description?.trim(),
          is_public,
          cover_image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', playlistId)
        .eq('user_id', user.id) // Sécurité : seul le propriétaire peut modifier
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return new Response(JSON.stringify({ error: 'Playlist not found or access denied' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        throw new Error(`Failed to update playlist: ${error.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        playlist
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE /playlists/:id - Supprimer une playlist
    if (playlistIdMatch && method === 'DELETE') {
      const playlistId = playlistIdMatch[1];

      const { error } = await supabase
        .from('med_mng_playlists')
        .delete()
        .eq('id', playlistId)
        .eq('user_id', user.id); // Sécurité : seul le propriétaire peut supprimer

      if (error) {
        throw new Error(`Failed to delete playlist: ${error.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Playlist deleted successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /playlists/:id/songs - Ajouter un morceau à une playlist
    const addSongMatch = path.match(/^\/playlists\/([a-f0-9-]+)\/songs$/);
    if (addSongMatch && method === 'POST') {
      const playlistId = addSongMatch[1];
      const { song_id } = await req.json();

      if (!song_id) {
        return new Response(JSON.stringify({ error: 'song_id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Vérifier que la playlist appartient à l'utilisateur
      const { data: playlist, error: playlistError } = await supabase
        .from('med_mng_playlists')
        .select('id')
        .eq('id', playlistId)
        .eq('user_id', user.id)
        .single();

      if (playlistError || !playlist) {
        return new Response(JSON.stringify({ error: 'Playlist not found or access denied' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Vérifier que le morceau existe et appartient à l'utilisateur
      const { data: userSong, error: songError } = await supabase
        .from('med_mng_user_songs')
        .select('song_id')
        .eq('song_id', song_id)
        .eq('user_id', user.id)
        .single();

      if (songError || !userSong) {
        return new Response(JSON.stringify({ error: 'Song not found in your library' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Calculer la prochaine position
      const { data: lastPosition, error: posError } = await supabase
        .from('med_mng_playlist_songs')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = (lastPosition?.[0]?.position || 0) + 1;

      // Ajouter le morceau à la playlist
      const { data: addedSong, error: addError } = await supabase
        .from('med_mng_playlist_songs')
        .insert({
          playlist_id: playlistId,
          song_id: song_id,
          added_by: user.id,
          position: nextPosition
        })
        .select()
        .single();

      if (addError) {
        if (addError.code === '23505') { // Unique constraint violation
          return new Response(JSON.stringify({ error: 'Song already in playlist' }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        throw new Error(`Failed to add song to playlist: ${addError.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Song added to playlist',
        position: nextPosition
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE /playlists/:id/songs/:songId - Retirer un morceau d'une playlist
    const removeSongMatch = path.match(/^\/playlists\/([a-f0-9-]+)\/songs\/([a-f0-9-]+)$/);
    if (removeSongMatch && method === 'DELETE') {
      const playlistId = removeSongMatch[1];
      const songId = removeSongMatch[2];

      const { error } = await supabase
        .from('med_mng_playlist_songs')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('song_id', songId)
        .eq('added_by', user.id); // Sécurité : seul celui qui a ajouté peut retirer

      if (error) {
        throw new Error(`Failed to remove song from playlist: ${error.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Song removed from playlist'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Playlist manager error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});