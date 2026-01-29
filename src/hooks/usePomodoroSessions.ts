import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface PomodoroSession {
  id: string;
  session_type: 'work' | 'short_break' | 'long_break';
  duration_minutes: number;
  task_name: string;
  preset: string;
  completed: boolean;
  created_at: string;
}

export function usePomodoroSessions() {
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ['pomodoro-sessions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(session => ({
        id: session.id,
        session_type: session.session_type as 'work' | 'short_break' | 'long_break',
        duration_minutes: session.duration_minutes,
        task_name: session.task_name || 'Session',
        preset: session.preset || 'classic',
        completed: session.completed,
        created_at: session.created_at,
      })) as PomodoroSession[];
    },
  });

  const logSessionMutation = useMutation({
    mutationFn: async (session: Omit<PomodoroSession, 'id' | 'created_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .insert({
          user_id: user.id,
          session_type: session.session_type,
          duration_minutes: session.duration_minutes,
          task_name: session.task_name,
          preset: session.preset,
          completed: session.completed,
        })
        .select()
        .single();

      if (error) throw error;

      // Ajouter XP pour session de travail complétée
      if (session.session_type === 'work' && session.completed) {
        const xp = Math.round(session.duration_minutes * 2); // 2 XP par minute
        await supabase.from('gamification_activities').insert({
          user_id: user.id,
          activity_type: 'pomodoro_completed',
          activity_name: `Pomodoro: ${session.task_name}`,
          points_earned: xp,
        });
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pomodoro-sessions'] });
      if (variables.session_type === 'work') {
        const xp = Math.round(variables.duration_minutes * 2);
        toast.success(`Session terminée ! +${xp} XP`);
      }
    },
    onError: (error) => {
      console.error('Error logging session:', error);
    },
  });

  const todayWorkSessions = sessions.filter(s => s.session_type === 'work').length;
  const todayMinutes = sessions
    .filter(s => s.session_type === 'work')
    .reduce((acc, s) => acc + s.duration_minutes, 0);

  return {
    sessions,
    isLoading,
    error,
    logSession: logSessionMutation.mutate,
    isLogging: logSessionMutation.isPending,
    todayWorkSessions,
    todayMinutes,
  };
}
