import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EdnFavorite {
  id: string;
  item_code: string;
  item_title: string | null;
  created_at: string;
}

export const useEdnFavorites = () => {
  const [favorites, setFavorites] = useState<EdnFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_edn_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback((itemCode: string) => {
    return favorites.some(f => f.item_code === itemCode);
  }, [favorites]);

  const toggleFavorite = useCallback(async (itemCode: string, itemTitle?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Connectez-vous pour ajouter des favoris",
          variant: "destructive",
        });
        return false;
      }

      const isCurrentlyFavorite = isFavorite(itemCode);

      if (isCurrentlyFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_edn_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_code', itemCode);

        if (error) throw error;

        setFavorites(prev => prev.filter(f => f.item_code !== itemCode));
        toast({
          title: "💔 Retiré des favoris",
          description: `Item ${itemCode} retiré de vos favoris`,
        });
        return false;
      } else {
        // Add to favorites
        const { data, error } = await supabase
          .from('user_edn_favorites')
          .insert({
            user_id: user.id,
            item_code: itemCode,
            item_title: itemTitle,
          })
          .select()
          .single();

        if (error) throw error;

        setFavorites(prev => [data, ...prev]);
        toast({
          title: "❤️ Ajouté aux favoris",
          description: `Item ${itemCode} ajouté à vos favoris`,
        });
        return true;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier les favoris",
        variant: "destructive",
      });
      return isFavorite(itemCode);
    }
  }, [isFavorite, toast]);

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    refreshFavorites: fetchFavorites,
  };
};
