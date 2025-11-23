import logger from '@/lib/logger';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface StudyPlanStats {
  totalPlans: number;
  activePlans: number;
  completedPlans: number;
  pausedPlans: number;
  totalSessions: number;
  completedSessions: number;
  averageProgress: number;
  totalTimeScheduled: number; // in minutes
  upcomingSessions: number;
  overdueSessionsCount: number;
}

export interface StudyPlanSummary {
  id: string;
  title: string;
  description: string;
  target_date: string;
  status: 'active' | 'completed' | 'paused';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  sessions_completed: number;
  total_sessions: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface StudySessionDetail {
  id: string;
  plan_id: string;
  title: string;
  duration_minutes: number;
  scheduled_date: string;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  plan_title?: string;
}

/**
 * Hook to fetch user study plan statistics
 */
export const useStudyPlanProgress = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['study-plan-progress', user?.id],
    queryFn: async (): Promise<StudyPlanStats> => {
      if (!user) {
        return {
          totalPlans: 0,
          activePlans: 0,
          completedPlans: 0,
          pausedPlans: 0,
          totalSessions: 0,
          completedSessions: 0,
          averageProgress: 0,
          totalTimeScheduled: 0,
          upcomingSessions: 0,
          overdueSessionsCount: 0,
        };
      }

      // Fetch all plans
      const { data: plans, error: plansError } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', user.id);

      if (plansError) {
        logger.error('Error fetching study plans:', plansError);
        throw plansError;
      }

      // Fetch all sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id);

      if (sessionsError) {
        logger.error('Error fetching study sessions:', sessionsError);
        throw sessionsError;
      }

      const plansData = plans || [];
      const sessionsData = sessions || [];

      // Calculate stats
      const totalPlans = plansData.length;
      const activePlans = plansData.filter(p => p.status === 'active').length;
      const completedPlans = plansData.filter(p => p.status === 'completed').length;
      const pausedPlans = plansData.filter(p => p.status === 'paused').length;

      const totalSessions = sessionsData.length;
      const completedSessions = sessionsData.filter(s => s.completed).length;

      const averageProgress = totalPlans > 0
        ? plansData.reduce((sum, p) => sum + (p.progress || 0), 0) / totalPlans
        : 0;

      const totalTimeScheduled = sessionsData.reduce(
        (sum, s) => sum + (s.duration_minutes || 0),
        0
      );

      // Upcoming sessions (today or future, not completed)
      const today = new Date().toISOString().split('T')[0];
      const upcomingSessions = sessionsData.filter(
        s => !s.completed && s.scheduled_date >= today
      ).length;

      // Overdue sessions (past date, not completed)
      const overdueSessionsCount = sessionsData.filter(
        s => !s.completed && s.scheduled_date < today
      ).length;

      return {
        totalPlans,
        activePlans,
        completedPlans,
        pausedPlans,
        totalSessions,
        completedSessions,
        averageProgress,
        totalTimeScheduled,
        upcomingSessions,
        overdueSessionsCount,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!user,
  });
};

/**
 * Hook to fetch all user study plans
 */
export const useStudyPlans = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['study-plans', user?.id],
    queryFn: async (): Promise<StudyPlanSummary[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching study plans:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!user,
  });
};

/**
 * Hook to fetch upcoming study sessions
 */
export const useUpcomingSessions = (days: number = 7) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['upcoming-sessions', user?.id, days],
    queryFn: async (): Promise<StudySessionDetail[]> => {
      if (!user) return [];

      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('study_sessions')
        .select(`
          *,
          study_plans!inner (
            title
          )
        `)
        .eq('user_id', user.id)
        .eq('completed', false)
        .gte('scheduled_date', today)
        .lte('scheduled_date', futureDateStr)
        .order('scheduled_date', { ascending: true });

      if (error) {
        logger.error('Error fetching upcoming sessions:', error);
        throw error;
      }

      // Flatten the nested structure
      return (data || []).map(session => ({
        ...session,
        plan_title: (session as any).study_plans?.title,
      }));
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!user,
  });
};

/**
 * Hook to fetch overdue study sessions
 */
export const useOverdueSessions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['overdue-sessions', user?.id],
    queryFn: async (): Promise<StudySessionDetail[]> => {
      if (!user) return [];

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('study_sessions')
        .select(`
          *,
          study_plans!inner (
            title
          )
        `)
        .eq('user_id', user.id)
        .eq('completed', false)
        .lt('scheduled_date', today)
        .order('scheduled_date', { ascending: true });

      if (error) {
        logger.error('Error fetching overdue sessions:', error);
        throw error;
      }

      return (data || []).map(session => ({
        ...session,
        plan_title: (session as any).study_plans?.title,
      }));
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!user,
  });
};

/**
 * Hook to complete a study session
 */
export const useCompleteSession = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      sessionId: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('User must be authenticated');

      const { data, error } = await supabase
        .from('study_sessions')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          notes: params.notes || null,
        })
        .eq('id', params.sessionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plan-progress', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-sessions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['overdue-sessions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['study-plans', user?.id] });

      toast({
        title: 'Session complétée',
        description: 'Votre session d\'étude a été marquée comme terminée',
      });
    },
    onError: (error) => {
      logger.error('Error completing session:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de compléter la session',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to update study plan status
 */
export const useUpdatePlanStatus = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      planId: string;
      status: 'active' | 'completed' | 'paused';
    }) => {
      if (!user) throw new Error('User must be authenticated');

      const updateData: any = {
        status: params.status,
      };

      if (params.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.progress = 100;
      }

      const { data, error } = await supabase
        .from('study_plans')
        .update(updateData)
        .eq('id', params.planId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['study-plan-progress', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['study-plans', user?.id] });

      const statusLabels = {
        active: 'activé',
        completed: 'complété',
        paused: 'mis en pause',
      };

      toast({
        title: 'Plan mis à jour',
        description: `Le plan a été ${statusLabels[variables.status]}`,
      });
    },
    onError: (error) => {
      logger.error('Error updating plan status:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le plan',
        variant: 'destructive',
      });
    },
  });
};
