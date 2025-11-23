import logger from '@/lib/logger';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { NotificationFilters } from '@/components/security/SecurityNotificationsFilters';

export interface TemplateApplicationHistory {
  id: string;
  template_id: string;
  user_id: string;
  filters_applied: NotificationFilters;
  results_count: number | null;
  applied_at: string;
}

export const useTemplateHistory = (templateId?: string) => {
  const queryClient = useQueryClient();

  // Fetch history entries
  const { data: history = [], isLoading } = useQuery({
    queryKey: templateId ? ['template-history', templateId] : ['template-history'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('template_application_history' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false });

      if (templateId) {
        query = query.eq('template_id', templateId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as TemplateApplicationHistory[];
    },
  });

  // Record template application
  const recordApplication = useMutation({
    mutationFn: async ({
      templateId,
      filters,
      resultsCount,
    }: {
      templateId: string;
      filters: NotificationFilters;
      resultsCount?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('template_application_history' as any)
        .insert({
          template_id: templateId,
          user_id: user.id,
          filters_applied: filters as any,
          results_count: resultsCount || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-history'] });
    },
    onError: (error: any) => {
      logger.error('Error recording application:', error);
      // Silent error - don't show toast to user
    },
  });

  // Delete history entry
  const deleteHistoryEntry = useMutation({
    mutationFn: async (historyId: string) => {
      const { error } = await supabase
        .from('template_application_history' as any)
        .delete()
        .eq('id', historyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-history'] });
      toast.success('Entrée supprimée de l\'historique');
    },
    onError: (error: any) => {
      logger.error('Error deleting history entry:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });

  return {
    history,
    isLoading,
    recordApplication: recordApplication.mutate,
    deleteHistoryEntry: deleteHistoryEntry.mutate,
    isRecording: recordApplication.isPending,
    isDeleting: deleteHistoryEntry.isPending,
  };
};
