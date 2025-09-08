import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FavoriteItem {
  id: string;
  user_id: string;
  song_id: string;
  created_at: string;
  song?: {
    id: string;
    title: string;
    artist: string;
    duration?: number;
    genre?: string;
    audio_url?: string;
    thumbnail_url?: string;
  };
}

export interface UseFavoritesReturn {
  favorites: FavoriteItem[];
  loading: boolean;
  error: string | null;
  addToFavorites: (songId: string) => Promise<boolean>;
  removeFromFavorites: (songId: string) => Promise<boolean>;
  isFavorite: (songId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

export const useFavorites = (): UseFavoritesReturn => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFavorites([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('med_mng_user_favorites')
        .select(`
          id,
          user_id,
          song_id,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transform the data to match our interface (simplified without song details)
      const transformedFavorites: FavoriteItem[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        song_id: item.song_id,
        created_at: item.created_at,
        song: {
          id: item.song_id,
          title: `Musique ${item.song_id.slice(0, 8)}`,
          artist: 'MED-MNG AI',
          duration: 180,
          genre: 'Médical',
          audio_url: `/audio/${item.song_id}.mp3`,
          thumbnail_url: undefined
        }
      }));

      setFavorites(transformedFavorites);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
      toast({
        title: "Erreur",
        description: "Impossible de charger vos favoris",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addToFavorites = useCallback(async (songId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour ajouter aux favoris",
          variant: "destructive"
        });
        return false;
      }

      // Check if already in favorites
      const existingFavorite = favorites.find(fav => fav.song_id === songId);
      if (existingFavorite) {
        toast({
          title: "Déjà en favoris",
          description: "Cette musique est déjà dans vos favoris"
        });
        return false;
      }

      const { error: insertError } = await supabase
        .from('med_mng_user_favorites')
        .insert({
          user_id: user.id,
          song_id: songId
        });

      if (insertError) {
        throw insertError;
      }

      // Refresh favorites to get the updated list
      await fetchFavorites();

      toast({
        title: "Ajouté aux favoris",
        description: "La musique a été ajoutée à vos favoris"
      });

      return true;
    } catch (err) {
      console.error('Error adding to favorites:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter aux favoris",
        variant: "destructive"
      });
      return false;
    }
  }, [favorites, fetchFavorites, toast]);

  const removeFromFavorites = useCallback(async (songId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      const { error: deleteError } = await supabase
        .from('med_mng_user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('song_id', songId);

      if (deleteError) {
        throw deleteError;
      }

      // Update local state immediately for better UX
      setFavorites(prev => prev.filter(fav => fav.song_id !== songId));

      toast({
        title: "Retiré des favoris",
        description: "La musique a été retirée de vos favoris"
      });

      return true;
    } catch (err) {
      console.error('Error removing from favorites:', err);
      toast({
        title: "Erreur",
        description: "Impossible de retirer des favoris",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  const isFavorite = useCallback((songId: string): boolean => {
    return favorites.some(fav => fav.song_id === songId);
  }, [favorites]);

  const refreshFavorites = useCallback(async () => {
    await fetchFavorites();
  }, [fetchFavorites]);

  // Initial fetch
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Set up real-time subscription for favorites
  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

    const subscription = supabase
      .channel('user_favorites')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'med_mng_user_favorites',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refresh favorites when changes occur
          fetchFavorites();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchFavorites]);

  return {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    refreshFavorites
  };
};