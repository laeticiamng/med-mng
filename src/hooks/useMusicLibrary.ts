
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
}

export const useMusicLibrary = () => {
  const [savedMusics, setSavedMusics] = useState<SavedMusic[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
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
        console.error('Erreur lors du chargement des musiques:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger votre bibliothèque musicale",
          variant: "destructive"
        });
        return;
      }

      setSavedMusics(data || []);
    } catch (error) {
      console.error('Erreur:', error);
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
      toast({
        title: "Supprimé",
        description: "Musique supprimée de votre bibliothèque"
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleToggleFavorite = async (musicId: string) => {
    try {
      const music = savedMusics.find(m => m.id === musicId);
      if (!music) return;

      const newFavoriteStatus = !music.is_favorite;

      // Ici, vous pourriez ajouter une table séparée pour les favoris
      // Pour l'instant, on met à jour localement
      setSavedMusics(prev => 
        prev.map(m => 
          m.id === musicId 
            ? { ...m, is_favorite: newFavoriteStatus }
            : m
        )
      );

      toast({
        title: newFavoriteStatus ? "⭐ Ajouté aux favoris !" : "Retiré des favoris",
        description: newFavoriteStatus 
          ? "Cette musique est maintenant dans vos favoris." 
          : "Musique retirée de vos favoris."
      });
    } catch (error) {
      console.error('Erreur lors de la modification des favoris:', error);
    }
  };

  const filteredMusics = savedMusics.filter(music => {
    if (filter === 'favorites') {
      return music.is_favorite;
    }
    return true;
  });

  return {
    savedMusics: filteredMusics,
    loading,
    playingId,
    filter,
    setFilter,
    handlePlay,
    handleDelete,
    handleToggleFavorite,
    refetch: fetchSavedMusics
  };
};
