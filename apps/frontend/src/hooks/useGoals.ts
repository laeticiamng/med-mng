import logger from '@/lib/logger';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface UserGoal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: 'edn' | 'quiz' | 'study_time' | 'streak' | 'badge' | 'custom';
  goal_type: 'completion' | 'score' | 'time' | 'streak' | 'count';
  target_value: number;
  current_value: number;
  unit: string | null;
  start_date: string;
  target_date: string;
  completed_at: string | null;
  status: 'active' | 'completed' | 'failed' | 'paused';
  priority: 'low' | 'medium' | 'high';
  progress_percentage: number;
  metadata: Record<string, any>;
  reminder_enabled: boolean;
  reminder_frequency: 'daily' | 'weekly' | 'never';
  created_at: string;
  updated_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_value: number;
  order_index: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalAchievement {
  id: string;
  goal_id: string;
  user_id: string;
  achieved_at: string;
  days_to_complete: number | null;
  completion_rate: number | null;
  xp_earned: number;
  badge_earned: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface GoalStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  failedGoals: number;
  completionRate: number;
  averageDaysToComplete: number;
  totalXpEarned: number;
  currentStreak: number;
}

export interface GoalCategoryStats {
  category: string;
  totalGoals: number;
  completedGoals: number;
  avgProgress: number;
}

/**
 * Hook to fetch all user goals
 */
export const useUserGoals = (filters?: {
  status?: UserGoal['status'];
  category?: UserGoal['category'];
  priority?: UserGoal['priority'];
}) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-goals', user?.id, filters],
    queryFn: async (): Promise<UserGoal[]> => {
      if (!user) return [];

      let query = supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error fetching goals:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!user,
  });
};

/**
 * Hook to fetch active goals
 */
export const useActiveGoals = () => {
  return useUserGoals({ status: 'active' });
};

/**
 * Hook to fetch user goal statistics
 */
export const useGoalStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['goal-stats', user?.id],
    queryFn: async (): Promise<GoalStats> => {
      if (!user) {
        return {
          totalGoals: 0,
          activeGoals: 0,
          completedGoals: 0,
          failedGoals: 0,
          completionRate: 0,
          averageDaysToComplete: 0,
          totalXpEarned: 0,
          currentStreak: 0,
        };
      }

      const { data, error } = await supabase.rpc('get_user_goal_stats', {
        p_user_id: user.id,
      });

      if (error) {
        logger.error('Error fetching goal stats:', error);
        throw error;
      }

      const stats = data?.[0];
      if (!stats) {
        return {
          totalGoals: 0,
          activeGoals: 0,
          completedGoals: 0,
          failedGoals: 0,
          completionRate: 0,
          averageDaysToComplete: 0,
          totalXpEarned: 0,
          currentStreak: 0,
        };
      }

      return {
        totalGoals: Number(stats.total_goals) || 0,
        activeGoals: Number(stats.active_goals) || 0,
        completedGoals: Number(stats.completed_goals) || 0,
        failedGoals: Number(stats.failed_goals) || 0,
        completionRate: Number(stats.completion_rate) || 0,
        averageDaysToComplete: Number(stats.average_days_to_complete) || 0,
        totalXpEarned: Number(stats.total_xp_earned) || 0,
        currentStreak: Number(stats.current_streak) || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!user,
  });
};

/**
 * Hook to fetch goals by category
 */
export const useGoalsByCategory = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['goals-by-category', user?.id],
    queryFn: async (): Promise<GoalCategoryStats[]> => {
      if (!user) return [];

      const { data, error } = await supabase.rpc('get_goals_by_category', {
        p_user_id: user.id,
      });

      if (error) {
        logger.error('Error fetching goals by category:', error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        category: item.category,
        totalGoals: Number(item.total_goals) || 0,
        completedGoals: Number(item.completed_goals) || 0,
        avgProgress: Number(item.avg_progress) || 0,
      }));
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  });
};

/**
 * Hook to fetch goal milestones
 */
export const useGoalMilestones = (goalId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['goal-milestones', goalId, user?.id],
    queryFn: async (): Promise<GoalMilestone[]> => {
      if (!user || !goalId) return [];

      const { data, error } = await supabase
        .from('goal_milestones')
        .select('*')
        .eq('goal_id', goalId)
        .order('order_index', { ascending: true });

      if (error) {
        logger.error('Error fetching milestones:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!user && !!goalId,
  });
};

/**
 * Hook to fetch user achievements
 */
export const useGoalAchievements = (limit: number = 20) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['goal-achievements', user?.id, limit],
    queryFn: async (): Promise<GoalAchievement[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('goal_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('achieved_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error fetching achievements:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  });
};

/**
 * Hook to create a new goal
 */
export const useCreateGoal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: Omit<UserGoal, 'id' | 'user_id' | 'current_value' | 'progress_percentage' | 'completed_at' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User must be authenticated');

      const { data, error } = await supabase
        .from('user_goals')
        .insert({
          user_id: user.id,
          ...goal,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-goals', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['goal-stats', user?.id] });
      toast({
        title: 'Objectif créé',
        description: 'Votre nouvel objectif a été créé avec succès',
      });
    },
    onError: (error) => {
      logger.error('Error creating goal:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'objectif',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to update goal progress
 */
export const useUpdateGoalProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { goalId: string; progressIncrement: number }) => {
      if (!user) throw new Error('User must be authenticated');

      const { data, error } = await supabase.rpc('update_goal_progress', {
        p_goal_id: params.goalId,
        p_progress_increment: params.progressIncrement,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-goals', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['goal-stats', user?.id] });

      // If goal was completed by this update
      if (data?.status === 'completed') {
        toast({
          title: '🎉 Objectif atteint !',
          description: `Vous avez complété "${data.title}"`,
        });
      }
    },
    onError: (error) => {
      logger.error('Error updating goal progress:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la progression',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to update goal status
 */
export const useUpdateGoal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { goalId: string; updates: Partial<UserGoal> }) => {
      if (!user) throw new Error('User must be authenticated');

      const { data, error } = await supabase
        .from('user_goals')
        .update(params.updates)
        .eq('id', params.goalId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-goals', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['goal-stats', user?.id] });
      toast({
        title: 'Objectif mis à jour',
        description: 'Les modifications ont été enregistrées',
      });
    },
    onError: (error) => {
      logger.error('Error updating goal:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'objectif',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to delete a goal
 */
export const useDeleteGoal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: string) => {
      if (!user) throw new Error('User must be authenticated');

      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-goals', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['goal-stats', user?.id] });
      toast({
        title: 'Objectif supprimé',
        description: 'L\'objectif a été supprimé avec succès',
      });
    },
    onError: (error) => {
      logger.error('Error deleting goal:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'objectif',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to create a milestone
 */
export const useCreateMilestone = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (milestone: Omit<GoalMilestone, 'id' | 'user_id' | 'completed' | 'completed_at' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User must be authenticated');

      const { data, error } = await supabase
        .from('goal_milestones')
        .insert({
          user_id: user.id,
          ...milestone,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goal-milestones', variables.goal_id, user?.id] });
      toast({
        title: 'Étape ajoutée',
        description: 'L\'étape intermédiaire a été créée',
      });
    },
    onError: (error) => {
      logger.error('Error creating milestone:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'étape',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to complete a milestone
 */
export const useCompleteMilestone = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { milestoneId: string; goalId: string }) => {
      if (!user) throw new Error('User must be authenticated');

      const { data, error } = await supabase
        .from('goal_milestones')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', params.milestoneId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goal-milestones', variables.goalId, user?.id] });
      toast({
        title: '✅ Étape complétée',
        description: 'Continuez comme ça !',
      });
    },
    onError: (error) => {
      logger.error('Error completing milestone:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de compléter l\'étape',
        variant: 'destructive',
      });
    },
  });
};
