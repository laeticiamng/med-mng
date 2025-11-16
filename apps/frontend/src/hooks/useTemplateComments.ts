import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TemplateComment {
  id: string;
  template_id: string;
  user_id: string;
  comment: string | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export const useTemplateComments = (templateId: string) => {
  const queryClient = useQueryClient();

  // Fetch comments for a template
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['template-comments', templateId],
    queryFn: async () => {
      const { data, error} = await supabase
        .from('template_comments' as any)
        .select('*')
        .eq('template_id', templateId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as TemplateComment[];
    },
    enabled: !!templateId,
  });

  // Calculate average rating
  const averageRating = comments.length > 0
    ? comments.reduce((sum, c) => sum + (c.rating || 0), 0) / comments.filter(c => c.rating).length
    : 0;

  // Add comment
  const addComment = useMutation({
    mutationFn: async ({ comment, rating }: { comment?: string; rating?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('template_comments' as any)
        .insert({
          template_id: templateId,
          user_id: user.id,
          comment: comment || null,
          rating: rating || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-comments', templateId] });
      toast.success('Commentaire ajouté avec succès');
    },
    onError: (error: any) => {
      console.error('Error adding comment:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout du commentaire');
    },
  });

  // Update comment
  const updateComment = useMutation({
    mutationFn: async ({ 
      commentId, 
      comment, 
      rating 
    }: { 
      commentId: string; 
      comment?: string; 
      rating?: number 
    }) => {
      const { data, error } = await supabase
        .from('template_comments' as any)
        .update({
          comment: comment || null,
          rating: rating || null,
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-comments', templateId] });
      toast.success('Commentaire mis à jour');
    },
    onError: (error: any) => {
      console.error('Error updating comment:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });

  // Delete comment
  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('template_comments' as any)
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-comments', templateId] });
      toast.success('Commentaire supprimé');
    },
    onError: (error: any) => {
      console.error('Error deleting comment:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });

  return {
    comments,
    averageRating,
    isLoading,
    addComment: addComment.mutate,
    updateComment: updateComment.mutate,
    deleteComment: deleteComment.mutate,
    isAdding: addComment.isPending,
    isUpdating: updateComment.isPending,
    isDeleting: deleteComment.isPending,
  };
};
