import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SavedMusic {
  id: string;
  title: string;
  audio_url: string;
  item_code?: string;
  music_style: string;
  rang: string;
  created_at: string;
  is_favorite?: boolean;
  music_id?: string;
  updated_at?: string;
  user_id?: string;
}

interface Track {
  id: string;
  title: string;
  item_code: string;
  type: 'rang_a' | 'rang_b' | 'mix';
  duration?: number;
  stream_url?: string;
  created_at: string;
  is_favorite?: boolean;
  lyrics?: any;
}

interface LibraryFilters {
  search: string;
  type: 'all' | 'rang_a' | 'rang_b' | 'mix';
  favorites: boolean;
  sortBy: 'date' | 'title' | 'item_code';
  sortOrder: 'asc' | 'desc';
}

export const useMusicLibrary = () => {
  const [savedMusics, setSavedMusics] = useState<SavedMusic[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [filters, setFilters] = useState<LibraryFilters>({
    search: '',
    type: 'all',
    favorites: false,
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSavedMusics();
  }, []);

  const fetchSavedMusics = async () => {
    try {
      const { data, error } = await supabase
        .from('user_generated_music')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger votre bibliothèque musicale",
          variant: "destructive"
        });
        return;
      }

      // Charger avec le statut favori depuis la DB
      setSavedMusics((data || []).map((music: any) => ({
        ...music,
        is_favorite: music.is_favorite || false
      })));

      // Convertir au nouveau format Track
      const convertedTracks: Track[] = (data || []).map((music: any) => ({
        id: music.id,
        title: music.title,
        item_code: music.item_code || 'N/A',
        type: music.rang === 'A' ? 'rang_a' : music.rang === 'B' ? 'rang_b' : 'mix',
        stream_url: music.audio_url,
        created_at: music.created_at,
        is_favorite: music.is_favorite || false // Charger depuis la DB
      }));
      
      setTracks(convertedTracks);
    } catch {
      // Erreur silencieuse
    } finally {
      setLoading(false);
    }
  };

  // Charger la bibliothèque via API moderne
  const loadLibrary = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('med-mng-api', {
        body: {
          endpoint: 'library',
          method: 'GET'
        }
      });

      if (error) {
        // Fallback vers l'ancienne méthode
        await fetchSavedMusics();
        return;
      }

      setTracks(data.items || []);
    } catch {
      // Fallback vers l'ancienne méthode
      await fetchSavedMusics();
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (music: SavedMusic) => {
    setPlayingId(playingId === music.id ? null : music.id);
  };

  const handleDelete = async (musicId: string) => {
    try {
      const { error } = await supabase
        .from('user_generated_music')
        .delete()
        .eq('id', musicId);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer cette musique",
          variant: "destructive"
        });
        return;
      }

      setSavedMusics(prev => prev.filter(music => music.id !== musicId));
      setTracks(prev => prev.filter(track => track.id !== musicId));
      toast({
        title: "Supprimé",
        description: "Musique supprimée de votre bibliothèque"
      });
    } catch {
      // Erreur silencieuse
    }
  };

  const handleToggleFavorite = async (musicId: string) => {
    try {
      const music = savedMusics.find(m => m.id === musicId);
      if (!music) return;

      const newFavoriteStatus = !music.is_favorite;

      // Persister le statut favori dans la base de données
      const { error } = await supabase
        .from('user_generated_music')
        .update({ is_favorite: newFavoriteStatus })
        .eq('id', musicId);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le favori",
          variant: "destructive"
        });
        return;
      }

      // Mettre à jour l'état local seulement après succès DB
      setSavedMusics(prev =>
        prev.map(m =>
          m.id === musicId
            ? { ...m, is_favorite: newFavoriteStatus }
            : m
        )
      );

      setTracks(prev =>
        prev.map(t =>
          t.id === musicId
            ? { ...t, is_favorite: newFavoriteStatus }
            : t
        )
      );

      toast({
        title: newFavoriteStatus ? "⭐ Ajouté aux favoris !" : "Retiré des favoris",
        description: newFavoriteStatus
          ? "Cette musique est maintenant dans vos favoris."
          : "Musique retirée de vos favoris."
      });
    } catch (error) {
      console.error('Erreur toggle favori:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour",
        variant: "destructive"
      });
    }
  };

  // Filtrer et trier les pistes
  const filteredTracks = tracks.filter(track => {
    // Filtre recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!track.title.toLowerCase().includes(searchLower) && 
          !track.item_code.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Filtre type
    if (filters.type !== 'all' && track.type !== filters.type) {
      return false;
    }

    // Filtre favoris
    if (filters.favorites && !track.is_favorite) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    let comparison = 0;
    
    switch (filters.sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'item_code':
        comparison = a.item_code.localeCompare(b.item_code);
        break;
      case 'date':
      default:
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }

    return filters.sortOrder === 'desc' ? -comparison : comparison;
  });

  const filteredMusics = savedMusics.filter(music => {
    if (filter === 'favorites') {
      return music.is_favorite;
    }
    return true;
  });

  // Toggle favori moderne
  const toggleFavorite = async (trackId: string) => {
    return handleToggleFavorite(trackId);
  };

  // Supprimer de la bibliothèque moderne
  const removeFromLibrary = async (trackId: string) => {
    return handleDelete(trackId);
  };

  // Obtenir l'URL de streaming sécurisé
  const getStreamUrl = async (trackId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('secure-audio-stream', {
        body: { audioId: trackId }
      });

      if (error) {
        return null;
      }

      return data.stream_url;
    } catch {
      return null;
    }
  };

  // Mettre à jour les filtres
  const updateFilters = (newFilters: Partial<LibraryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      favorites: false,
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  return {
    // Ancienne API (compatibilité)
    savedMusics: filteredMusics,
    loading,
    playingId,
    filter,
    setFilter,
    handlePlay,
    handleDelete,
    handleToggleFavorite,
    refetch: fetchSavedMusics,
    
    // Nouvelle API
    tracks: filteredTracks,
    allTracks: tracks,
    filters,
    updateFilters,
    resetFilters,
    toggleFavorite,
    removeFromLibrary,
    getStreamUrl,
    loadLibrary,
    
    // Stats
    totalTracks: tracks.length,
    favoriteTracks: tracks.filter(t => t.is_favorite).length,
    tracksByType: {
      rang_a: tracks.filter(t => t.type === 'rang_a').length,
      rang_b: tracks.filter(t => t.type === 'rang_b').length,
      mix: tracks.filter(t => t.type === 'mix').length
    }
  };
};