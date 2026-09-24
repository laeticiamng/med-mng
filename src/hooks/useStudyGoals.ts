import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface StudyGoal {
  id: string;
  title: string;
  description: string | null;
  target_type: string;
  target_value: number;
  current_value: number;
  deadline: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export function useStudyGoals() {
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ['study-goals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('study_goals' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as StudyGoal[];
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goal: Omit<StudyGoal, 'id' | 'current_value' | 'status' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('study_goals' as any)
        .insert({
          user_id: user.id,
          title: goal.title,
          description: goal.description,
          target_type: goal.target_type,
          target_value: goal.target_value,
          deadline: goal.deadline,
          priority: goal.priority,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-goals'] });
      toast.success('Objectif créé !');
    },
    onError: (error) => {
      console.error('Error creating goal:', error);
      toast.error('Erreur lors de la création');
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<StudyGoal> }) => {
      const { error } = await supabase
        .from('study_goals' as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-goals'] });
    },
  });

  const incrementProgressMutation = useMutation({
    mutationFn: async ({ goalId, increment }: { goalId: string; increment: number }) => {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newValue = Math.min(goal.current_value + increment, goal.target_value);
      const isCompleted = newValue >= goal.target_value;

      const { error } = await supabase
        .from('study_goals' as any)
        .update({
          current_value: newValue,
          status: isCompleted ? 'completed' : 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', goalId);

      if (error) throw error;

      if (isCompleted) {
        // Ajouter XP pour objectif atteint
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('gamification_activities').insert({
            user_id: user.id,
            activity_type: 'goal_completed',
            activity_name: `Objectif: ${goal.title}`,
            points_earned: 100,
          });
        }
        toast.success('🎉 Objectif atteint ! +100 XP');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-goals'] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('study_goals' as any)
        .delete()
        .eq('id', goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-goals'] });
      toast.success('Objectif supprimé');
    },
  });

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const completionRate = goals.length > 0 
    ? Math.round((completedGoals.length / goals.length) * 100) 
    : 0;

  return {
    goals,
    activeGoals,
    completedGoals,
    completionRate,
    isLoading,
    error,
    createGoal: createGoalMutation.mutate,
    updateGoal: updateGoalMutation.mutate,
    incrementProgress: incrementProgressMutation.mutate,
    deleteGoal: deleteGoalMutation.mutate,
    isCreating: createGoalMutation.isPending,
  };
}
