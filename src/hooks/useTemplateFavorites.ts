import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TemplateFavorite {
  id: string;
  template_id: string;
  user_id: string;
  created_at: string;
}

export const useTemplateFavorites = () => {
  const queryClient = useQueryClient();

  // Fetch user's favorite templates
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['template-favorites'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('template_favorites' as any)
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data || []) as unknown as TemplateFavorite[];
    },
  });

  // Check if a template is favorited
  const isFavorite = (templateId: string) => {
    return favorites.some((fav) => fav.template_id === templateId);
  };

  // Add to favorites
  const addFavorite = useMutation({
    mutationFn: async (templateId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('template_favorites' as any)
        .insert({
          template_id: templateId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-favorites'] });
      toast.success('Template ajouté aux favoris');
    },
    onError: (error: any) => {
      console.error('Error adding favorite:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout aux favoris');
    },
  });

  // Remove from favorites
  const removeFavorite = useMutation({
    mutationFn: async (templateId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('template_favorites' as any)
        .delete()
        .eq('template_id', templateId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-favorites'] });
      toast.success('Template retiré des favoris');
    },
    onError: (error: any) => {
      console.error('Error removing favorite:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });

  // Toggle favorite
  const toggleFavorite = (templateId: string) => {
    if (isFavorite(templateId)) {
      removeFavorite.mutate(templateId);
    } else {
      addFavorite.mutate(templateId);
    }
  };

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    addFavorite: addFavorite.mutate,
    removeFavorite: removeFavorite.mutate,
    isToggling: addFavorite.isPending || removeFavorite.isPending,
  };
};
