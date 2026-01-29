import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface UserGoal {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  category: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  is_completed: boolean;
}

export function useUserGoals() {
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ['user-goals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(goal => ({
        id: goal.id,
        title: goal.title || '',
        description: goal.description || '',
        target_value: goal.target_value || 100,
        current_value: goal.current_progress || 0,
        category: goal.category || 'study',
        priority: (goal.priority as 'low' | 'medium' | 'high') || 'medium',
        deadline: goal.end_date || '',
        is_completed: goal.completed || goal.status === 'completed',
      })) as UserGoal[];
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (newGoal: Omit<UserGoal, 'id' | 'current_value' | 'is_completed'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('user_goals')
        .insert({
          user_id: user.id,
          title: newGoal.title,
          description: newGoal.description,
          target_value: newGoal.target_value,
          current_progress: 0,
          category: newGoal.category,
          priority: newGoal.priority,
          start_date: today,
          end_date: newGoal.deadline || null,
          status: 'active',
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-goals'] });
      toast.success('Objectif créé !');
    },
    onError: (error) => {
      console.error('Error creating goal:', error);
      toast.error('Erreur lors de la création');
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<UserGoal> }) => {
      const { error } = await supabase
        .from('user_goals')
        .update({
          title: updates.title,
          description: updates.description,
          target_value: updates.target_value,
          current_progress: updates.current_value,
          category: updates.category,
          priority: updates.priority,
          end_date: updates.deadline,
          completed: updates.is_completed,
          status: updates.is_completed ? 'completed' : 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-goals'] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-goals'] });
      toast.success('Objectif supprimé');
    },
    onError: (error) => {
      console.error('Error deleting goal:', error);
      toast.error('Erreur lors de la suppression');
    },
  });

  const completeGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const goal = goals.find(g => g.id === id);
      
      const { error } = await supabase
        .from('user_goals')
        .update({
          completed: true,
          status: 'completed',
          current_progress: goal?.target_value || 100,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      // Ajouter XP pour objectif complété
      await supabase.from('gamification_activities').insert({
        user_id: user.id,
        activity_type: 'goal_completed',
        activity_name: `Objectif: ${goal?.title}`,
        points_earned: 100,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-goals'] });
      toast.success('🎉 Objectif complété ! +100 XP');
    },
    onError: (error) => {
      console.error('Error completing goal:', error);
      toast.error('Erreur lors de la complétion');
    },
  });

  return {
    goals,
    isLoading,
    error,
    createGoal: createGoalMutation.mutate,
    updateGoal: updateGoalMutation.mutate,
    deleteGoal: deleteGoalMutation.mutate,
    completeGoal: completeGoalMutation.mutate,
    isCreating: createGoalMutation.isPending,
  };
}
