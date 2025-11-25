import logger from '@/lib/logger';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface EdnProgressStats {
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  masteredItems: number;
  notStartedItems: number;
  completionPercentage: number;
  totalTimeSpent: number;
  averageScore: number;
}

export interface EdnItemProgress {
  id: string;
  user_id: string;
  item_number: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  score: number;
  time_spent_minutes: number;
  last_reviewed_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useEdnProgress = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['edn-progress', user?.id],
    queryFn: async (): Promise<EdnProgressStats> => {
      if (!user) {
        // Fetch total items count for non-authenticated users
        const { count: totalItems } = await supabase
          .from('edn_items' as any)
          .select('*', { count: 'exact', head: true });

        return {
          totalItems: totalItems || 367,
          completedItems: 0,
          inProgressItems: 0,
          masteredItems: 0,
          notStartedItems: totalItems || 367,
          completionPercentage: 0,
          totalTimeSpent: 0,
          averageScore: 0,
        };
      }

      // Fetch user progress summary using the database function
      const { data, error } = await (supabase as any)
        .rpc('get_user_edn_progress_summary', { target_user_id: user.id });

      if (error) {
        logger.error('Error fetching progress:', error);
        throw error;
      }

      const summary = data?.[0];
      if (!summary) {
        return {
          totalItems: 367,
          completedItems: 0,
          inProgressItems: 0,
          masteredItems: 0,
          notStartedItems: 367,
          completionPercentage: 0,
          totalTimeSpent: 0,
          averageScore: 0,
        };
      }

      return {
        totalItems: Number(summary.total_items),
        completedItems: Number(summary.completed_items),
        inProgressItems: Number(summary.in_progress_items),
        masteredItems: Number(summary.mastered_items),
        notStartedItems: Number(summary.not_started_items),
        completionPercentage: summary.total_items 
          ? (Number(summary.completed_items) / Number(summary.total_items)) * 100 
          : 0,
        totalTimeSpent: Number(summary.total_time_spent),
        averageScore: Number(summary.average_score),
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true,
  });
};

export const useUpdateItemProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      itemNumber: string;
      status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
      score?: number;
      timeSpentMinutes?: number;
      notes?: string;
    }) => {
      if (!user) throw new Error('User must be authenticated');

      const updateData: any = {
        user_id: user.id,
        item_number: params.itemNumber,
        status: params.status,
        last_reviewed_at: new Date().toISOString(),
      };

      if (params.score !== undefined) updateData.score = params.score;
      if (params.timeSpentMinutes !== undefined) {
        // Add to existing time
        const { data: existing } = await (supabase as any)
          .from('user_edn_progress')
          .select('time_spent_minutes')
          .eq('user_id', user.id)
          .eq('item_number', params.itemNumber)
          .single();

        updateData.time_spent_minutes = 
          (existing?.time_spent_minutes || 0) + params.timeSpentMinutes;
      }
      if (params.notes !== undefined) updateData.notes = params.notes;
      if (params.status === 'completed' || params.status === 'mastered') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await (supabase as any)
        .from('user_edn_progress')
        .upsert(updateData, { onConflict: 'user_id,item_number' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edn-progress', user?.id] });
      toast({
        title: 'Progression mise à jour',
        description: 'Votre progression a été enregistrée avec succès',
      });
    },
    onError: (error) => {
      logger.error('Error updating progress:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la progression',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook pour récupérer la progression de tous les items EDN
 * Utilisé pour le filtrage avancé par statut de progression
 */
export const useAllEdnItemsProgress = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['edn-items-progress', user?.id],
    queryFn: async (): Promise<Map<string, EdnItemProgress['status']>> => {
      if (!user) {
        return new Map();
      }

      const { data, error } = await (supabase as any)
        .from('user_edn_progress')
        .select('item_number, status')
        .eq('user_id', user.id);

      if (error) {
        logger.error('Error fetching items progress:', error);
        throw error;
      }

      const progressMap = new Map<string, EdnItemProgress['status']>();
      data?.forEach((item: { item_number: string; status: EdnItemProgress['status'] }) => {
        progressMap.set(item.item_number, item.status);
      });

      return progressMap;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!user,
  });
};

/**
 * Hook pour récupérer la progression détaillée d'un item spécifique
 */
export const useItemProgress = (itemNumber: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['edn-item-progress', user?.id, itemNumber],
    queryFn: async (): Promise<EdnItemProgress | null> => {
      if (!user || !itemNumber) {
        return null;
      }

      const { data, error } = await (supabase as any)
        .from('user_edn_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_number', itemNumber)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is OK
        logger.error('Error fetching item progress:', error);
        throw error;
      }

      return data || null;
    },
    staleTime: 60 * 1000, // 1 minute
    enabled: !!user && !!itemNumber,
  });
};
