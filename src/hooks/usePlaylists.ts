import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  song_count: number;
  created_at: string;
  updated_at: string;
  songs?: PlaylistSong[];
}

export interface PlaylistSong {
  song_id: string;
  position: number;
  added_at: string;
  title: string;
  suno_audio_id: string;
}

export const usePlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('med_mng_playlists')
        .select(`
          id,
          user_id,
          name,
          description,
          is_public,
          created_at,
          updated_at
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      // Ajouter song_count par défaut à 0 car la colonne n'existe pas encore
      const playlistsWithCount = (data || []).map(playlist => ({
        ...playlist,
        song_count: 0
      }));
      setPlaylists(playlistsWithCount);
    } catch (error) {
      console.error('Erreur chargement playlists:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos playlists",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async (name: string, description?: string, isPublic = false) => {
    try {
      const { data, error } = await supabase
        .rpc('med_mng_create_playlist', {
          playlist_name: name,
          playlist_description: description,
          is_public: isPublic
        });

      if (error) throw error;

      toast({
        title: "🎵 Playlist créée !",
        description: `"${name}" a été ajoutée à votre collection`,
      });

      await loadPlaylists();
      return data;
    } catch (error) {
      console.error('Erreur création playlist:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la playlist",
        variant: "destructive",
      });
      return null;
    }
  };

  const updatePlaylist = async (id: string, updates: Partial<Pick<Playlist, 'name' | 'description' | 'is_public'>>) => {
    try {
      const { error } = await supabase
        .from('med_mng_playlists')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "✅ Playlist mise à jour",
        description: "Les modifications ont été sauvegardées",
      });

      await loadPlaylists();
      return true;
    } catch (error) {
      console.error('Erreur mise à jour playlist:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la playlist",
        variant: "destructive",
      });
      return false;
    }
  };

  const deletePlaylist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('med_mng_playlists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "🗑️ Playlist supprimée",
        description: "La playlist a été supprimée définitivement",
      });

      await loadPlaylists();
      return true;
    } catch (error) {
      console.error('Erreur suppression playlist:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la playlist",
        variant: "destructive",
      });
      return false;
    }
  };

  const addSongToPlaylist = async (playlistId: string, songId: string) => {
    try {
      const { error } = await supabase
        .rpc('med_mng_add_song_to_playlist', {
          playlist_id: playlistId,
          song_id: songId
        });

      if (error) throw error;

      toast({
        title: "🎵 Chanson ajoutée",
        description: "La chanson a été ajoutée à votre playlist",
      });

      await loadPlaylists();
      return true;
    } catch (error) {
      console.error('Erreur ajout chanson:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la chanson à la playlist",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    try {
      // Utiliser une requête directe car la fonction RPC n'est pas encore définie
      const { error } = await supabase
        .from('med_mng_playlist_songs')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('song_id', songId);

      if (error) throw error;

      toast({
        title: "🎵 Chanson retirée",
        description: "La chanson a été retirée de la playlist",
      });

      await loadPlaylists();
      return true;
    } catch (error) {
      console.error('Erreur retrait chanson:', error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer la chanson de la playlist",
        variant: "destructive",
      });
      return false;
    }
  };

  const reorderPlaylistSongs = async (playlistId: string, songOrders: { song_id: string; position: number }[]) => {
    try {
      // Mettre à jour chaque position individuellement
      for (const { song_id, position } of songOrders) {
        await supabase
          .from('med_mng_playlist_songs')
          .update({ position })
          .eq('playlist_id', playlistId)
          .eq('song_id', song_id);
      }

      toast({
        title: "🔄 Ordre mis à jour",
        description: "L'ordre des chansons a été sauvegardé",
      });

      return true;
    } catch (error) {
      console.error('Erreur réorganisation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de réorganiser les chansons",
        variant: "destructive",
      });
      return false;
    }
  };

  const getPlaylistDetails = async (playlistId: string): Promise<Playlist | null> => {
    try {
      // Récupérer les détails de la playlist
      const { data: playlist, error: playlistError } = await supabase
        .from('med_mng_playlists')
        .select('*')
        .eq('id', playlistId)
        .single();

      if (playlistError) throw playlistError;

      // Récupérer les chansons de la playlist
      const { data: songs, error: songsError } = await supabase
        .from('med_mng_playlist_songs')
        .select(`
          song_id,
          position,
          added_at,
          med_mng_songs (
            title,
            suno_audio_id
          )
        `)
        .eq('playlist_id', playlistId)
        .order('position');

      if (songsError) throw songsError;

      const formattedSongs: PlaylistSong[] = songs?.map(song => ({
        song_id: song.song_id,
        position: song.position,
        added_at: song.added_at,
        title: (song.med_mng_songs as any)?.title || 'Titre inconnu',
        suno_audio_id: (song.med_mng_songs as any)?.suno_audio_id || ''
      })) || [];

      return {
        ...playlist,
        song_count: formattedSongs.length,
        songs: formattedSongs
      };
    } catch (error) {
      console.error('Erreur récupération détails playlist:', error);
      return null;
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  return {
    playlists,
    loading,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    reorderPlaylistSongs,
    getPlaylistDetails,
    loadPlaylists
  };
};