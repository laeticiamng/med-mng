import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { checkAndUseCredits } from '@/hooks/useIAQuota';

export interface FavoriteSong {
  id: string;
  song_id: string;
  title: string;
  suno_audio_id: string;
  created_at: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteSong[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('med_mng_user_favorites')
        .select(`
          id,
          song_id,
          created_at,
          med_mng_songs (
            title,
            suno_audio_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedFavorites: FavoriteSong[] = data?.map(fav => ({
        id: fav.id,
        song_id: fav.song_id,
        title: (fav.med_mng_songs as any)?.title || 'Titre inconnu',
        suno_audio_id: (fav.med_mng_songs as any)?.suno_audio_id || '',
        created_at: fav.created_at
      })) || [];

      setFavorites(formattedFavorites);
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos favoris",
        variant: "destructive",
      });
    }
  };

  const toggleFavorite = async (songId: string): Promise<boolean> => {
    try {
      const canProceed = await checkAndUseCredits('music', 'stream', { song_id: songId });
      if (!canProceed) {
        toast({
          title: "Quota insuffisant",
          description: "Pas assez de crédits pour ajouter aux favoris",
          variant: "destructive",
        });
        return false;
      }

      const { data, error } = await supabase.rpc('med_mng_toggle_favorite', {
        song_id: songId
      });

      if (error) throw error;

      const isAdded = data;

      toast({
        title: isAdded ? "❤️ Ajouté aux favoris" : "💔 Retiré des favoris",
        description: isAdded ? "Cette chanson a été ajoutée à vos favoris" : "Cette chanson a été retirée de vos favoris",
      });

      await loadFavorites();
      return isAdded;
    } catch (error) {
      console.error('Erreur toggle favori:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier les favoris",
        variant: "destructive",
      });
      return false;
    }
  };

  const isFavorite = (songId: string): boolean => {
    return favorites.some(fav => fav.song_id === songId);
  };

  const removeFavorite = async (favoriteId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('med_mng_user_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      toast({
        title: "💔 Retiré des favoris",
        description: "Cette chanson a été retirée de vos favoris",
      });

      await loadFavorites();
      return true;
    } catch (error) {
      console.error('Erreur suppression favori:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le favori",
        variant: "destructive",
      });
      return false;
    }
  };

  const clearAllFavorites = async (): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('med_mng_user_favorites')
        .delete()
        .neq('id', '');

      if (error) throw error;

      toast({
        title: "🗑️ Favoris supprimés",
        description: "Tous vos favoris ont été supprimés",
      });

      setFavorites([]);
      return true;
    } catch (error) {
      console.error('Erreur suppression favoris:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer tous les favoris",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadFavorites();
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    removeFavorite,
    clearAllFavorites,
    loadFavorites
  };
};