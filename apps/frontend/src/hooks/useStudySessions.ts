import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import logger from '@/lib/logger';

export interface StudySession {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  topic?: string;
  item_numbers?: string[];
  duration_minutes: number;
  actual_duration_minutes?: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  rating?: number; // 1-5
  focus_score?: number; // 0-100
  created_at: string;
  updated_at: string;
}

export interface StudySessionStats {
  totalSessions: number;
  totalMinutes: number;
  averageRating: number;
  averageFocusScore: number;
  completedThisWeek: number;
  streakDays: number;
}

export interface CreateSessionInput {
  title: string;
  description?: string;
  topic?: string;
  item_numbers?: string[];
  duration_minutes: number;
  scheduled_at?: string;
}

// Fetch user's study sessions
export const useStudySessions = (options?: {
  status?: StudySession['status'];
  limit?: number;
  fromDate?: string;
  toDate?: string;
}) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['study-sessions', user?.id, options],
    queryFn: async (): Promise<StudySession[]> => {
      if (!user) return [];

      let query = (supabase as any)
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.fromDate) {
        query = query.gte('scheduled_at', options.fromDate);
      }

      if (options?.toDate) {
        query = query.lte('scheduled_at', options.toDate);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        if (error.code === '42P01') {
          logger.warn('Study sessions table does not exist');
          return [];
        }
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });
};

// Fetch today's sessions
export const useTodaySessions = () => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  return useStudySessions({
    fromDate: startOfDay,
    toDate: endOfDay,
  });
};

// Fetch upcoming sessions
export const useUpcomingSessions = (limit = 5) => {
  const { user } = useAuth();
  const now = new Date().toISOString();

  return useQuery({
    queryKey: ['upcoming-sessions', user?.id, limit],
    queryFn: async (): Promise<StudySession[]> => {
      if (!user) return [];

      const { data, error } = await (supabase as any)
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['planned', 'in_progress'])
        .gte('scheduled_at', now)
        .order('scheduled_at', { ascending: true })
        .limit(limit);

      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });
};

// Study session statistics
export const useStudySessionStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['study-session-stats', user?.id],
    queryFn: async (): Promise<StudySessionStats> => {
      if (!user) {
        return {
          totalSessions: 0,
          totalMinutes: 0,
          averageRating: 0,
          averageFocusScore: 0,
          completedThisWeek: 0,
          streakDays: 0,
        };
      }

      try {
        const { data: sessions, error } = await (supabase as any)
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed');

        if (error) {
          if (error.code === '42P01') {
            return {
              totalSessions: 0,
              totalMinutes: 0,
              averageRating: 0,
              averageFocusScore: 0,
              completedThisWeek: 0,
              streakDays: 0,
            };
          }
          throw error;
        }

        const completedSessions = sessions || [];

        // Calculate week's sessions
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const completedThisWeek = completedSessions.filter(
          (s: StudySession) => new Date(s.completed_at || s.created_at) >= weekAgo
        ).length;

        // Calculate totals
        const totalMinutes = completedSessions.reduce(
          (sum: number, s: StudySession) => sum + (s.actual_duration_minutes || s.duration_minutes),
          0
        );

        const ratingsSum = completedSessions
          .filter((s: StudySession) => s.rating)
          .reduce((sum: number, s: StudySession) => sum + (s.rating || 0), 0);
        const ratingsCount = completedSessions.filter((s: StudySession) => s.rating).length;

        const focusSum = completedSessions
          .filter((s: StudySession) => s.focus_score !== undefined)
          .reduce((sum: number, s: StudySession) => sum + (s.focus_score || 0), 0);
        const focusCount = completedSessions.filter(
          (s: StudySession) => s.focus_score !== undefined
        ).length;

        return {
          totalSessions: completedSessions.length,
          totalMinutes,
          averageRating: ratingsCount > 0 ? Math.round((ratingsSum / ratingsCount) * 10) / 10 : 0,
          averageFocusScore: focusCount > 0 ? Math.round(focusSum / focusCount) : 0,
          completedThisWeek,
          streakDays: 0, // Would need to calculate from daily data
        };
      } catch (error) {
        logger.error('Error fetching study stats:', error);
        return {
          totalSessions: 0,
          totalMinutes: 0,
          averageRating: 0,
          averageFocusScore: 0,
          completedThisWeek: 0,
          streakDays: 0,
        };
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};

// Create study session
export const useCreateStudySession = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateSessionInput): Promise<StudySession> => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await (supabase as any)
        .from('study_sessions')
        .insert({
          ...input,
          user_id: user.id,
          status: input.scheduled_at ? 'planned' : 'in_progress',
          started_at: input.scheduled_at ? null : new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['study-session-stats'] });
    },
  });
};

// Start a planned session
export const useStartStudySession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string): Promise<StudySession> => {
      const { data, error } = await (supabase as any)
        .from('study_sessions')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-sessions'] });
    },
  });
};

// Complete a session
export const useCompleteStudySession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      actualDuration,
      rating,
      focusScore,
      notes,
    }: {
      sessionId: string;
      actualDuration?: number;
      rating?: number;
      focusScore?: number;
      notes?: string;
    }): Promise<StudySession> => {
      const { data, error } = await (supabase as any)
        .from('study_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          actual_duration_minutes: actualDuration,
          rating,
          focus_score: focusScore,
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['study-session-stats'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-sessions'] });
    },
  });
};

// Cancel a session
export const useCancelStudySession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string): Promise<void> => {
      const { error } = await (supabase as any)
        .from('study_sessions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-sessions'] });
    },
  });
};

// Delete a session
export const useDeleteStudySession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string): Promise<void> => {
      const { error } = await (supabase as any)
        .from('study_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['study-session-stats'] });
    },
  });
};

// Update session
export const useUpdateStudySession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      updates,
    }: {
      sessionId: string;
      updates: Partial<Omit<StudySession, 'id' | 'user_id' | 'created_at'>>;
    }): Promise<StudySession> => {
      const { data, error } = await (supabase as any)
        .from('study_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-sessions'] });
    },
  });
};

export default {
  useStudySessions,
  useTodaySessions,
  useUpcomingSessions,
  useStudySessionStats,
  useCreateStudySession,
  useStartStudySession,
  useCompleteStudySession,
  useCancelStudySession,
  useDeleteStudySession,
  useUpdateStudySession,
};
