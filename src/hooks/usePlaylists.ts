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

      // Calculer le song_count dynamiquement pour chaque playlist
      const playlistsWithCount = await Promise.all((data || []).map(async (playlist) => {
        const { count, error: countError } = await supabase
          .from('med_mng_playlist_songs')
          .select('*', { count: 'exact', head: true })
          .eq('playlist_id', playlist.id);

        return {
          ...playlist,
          song_count: countError ? 0 : (count || 0)
        };
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
        .maybeSingle();

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

  // Dupliquer une playlist
  const duplicatePlaylist = async (playlistId: string, newName?: string): Promise<string | null> => {
    try {
      const original = await getPlaylistDetails(playlistId);
      if (!original) {
        toast({
          title: "Erreur",
          description: "Playlist originale non trouvée",
          variant: "destructive",
        });
        return null;
      }

      const duplicateName = newName || `${original.name} (copie)`;
      const newPlaylistId = await createPlaylist(duplicateName, original.description, original.is_public);

      if (newPlaylistId && original.songs) {
        for (const song of original.songs) {
          await addSongToPlaylist(newPlaylistId, song.song_id);
        }
      }

      toast({
        title: "Playlist dupliquée",
        description: `"${duplicateName}" a été créée`,
      });

      return newPlaylistId;
    } catch (error) {
      console.error('Erreur duplication playlist:', error);
      toast({
        title: "Erreur",
        description: "Impossible de dupliquer la playlist",
        variant: "destructive",
      });
      return null;
    }
  };

  // Fusionner deux playlists
  const mergePlaylists = async (targetId: string, sourceId: string): Promise<boolean> => {
    try {
      const source = await getPlaylistDetails(sourceId);
      if (!source?.songs) {
        return false;
      }

      for (const song of source.songs) {
        await addSongToPlaylist(targetId, song.song_id);
      }

      toast({
        title: "Playlists fusionnées",
        description: `${source.songs.length} chanson(s) ajoutée(s)`,
      });

      await loadPlaylists();
      return true;
    } catch (error) {
      console.error('Erreur fusion playlists:', error);
      return false;
    }
  };

  // Obtenir les statistiques des playlists
  const getPlaylistsStats = () => {
    const totalPlaylists = playlists.length;
    const totalSongs = playlists.reduce((sum, p) => sum + p.song_count, 0);
    const publicPlaylists = playlists.filter(p => p.is_public).length;
    const privatePlaylists = totalPlaylists - publicPlaylists;
    const averageSongsPerPlaylist = totalPlaylists > 0 ? Math.round(totalSongs / totalPlaylists) : 0;

    return {
      totalPlaylists,
      totalSongs,
      publicPlaylists,
      privatePlaylists,
      averageSongsPerPlaylist
    };
  };

  // Rechercher dans les playlists
  const searchPlaylists = (query: string): Playlist[] => {
    if (!query.trim()) return playlists;

    const queryLower = query.toLowerCase();
    return playlists.filter(p =>
      p.name.toLowerCase().includes(queryLower) ||
      (p.description?.toLowerCase().includes(queryLower) ?? false)
    );
  };

  // Trier les playlists
  const sortPlaylists = (sortBy: 'name' | 'date' | 'songs', order: 'asc' | 'desc' = 'asc'): Playlist[] => {
    const sorted = [...playlists].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case 'songs':
          comparison = a.song_count - b.song_count;
          break;
      }
      return order === 'desc' ? -comparison : comparison;
    });
    return sorted;
  };

  // Exporter une playlist en JSON
  const exportPlaylist = async (playlistId: string): Promise<string | null> => {
    try {
      const playlist = await getPlaylistDetails(playlistId);
      if (!playlist) return null;

      const exportData = {
        name: playlist.name,
        description: playlist.description,
        songs: playlist.songs?.map(s => ({
          title: s.title,
          position: s.position
        })) || [],
        exportedAt: new Date().toISOString()
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Erreur export playlist:', error);
      return null;
    }
  };

  // Vérifier si une chanson est dans une playlist
  const isSongInPlaylist = async (playlistId: string, songId: string): Promise<boolean> => {
    const details = await getPlaylistDetails(playlistId);
    return details?.songs?.some(s => s.song_id === songId) || false;
  };

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
    loadPlaylists,
    duplicatePlaylist,
    mergePlaylists,
    getPlaylistsStats,
    searchPlaylists,
    sortPlaylists,
    exportPlaylist,
    isSongInPlaylist
  };
};