import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { startOfDay, endOfDay, subDays, format, isToday, differenceInDays } from 'date-fns';
import logger from '@/lib/logger';

export interface Ritual {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  time: string; // HH:mm format
  duration_minutes: number;
  category: 'morning' | 'afternoon' | 'evening' | 'anytime';
  icon?: string;
  color?: string;
  is_active: boolean;
  reminder_enabled: boolean;
  reminder_minutes_before: number;
  created_at: string;
  updated_at: string;
}

export interface RitualCompletion {
  id: string;
  ritual_id: string;
  user_id: string;
  completed_at: string;
  duration_minutes?: number;
  notes?: string;
  mood_rating?: number; // 1-5
}

export interface RitualStats {
  totalRituals: number;
  activeRituals: number;
  completedToday: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // percentage over last 30 days
  totalCompletions: number;
}

export interface RitualWithStats extends Ritual {
  completedToday: boolean;
  currentStreak: number;
  completionRate: number; // last 7 days
  lastCompletedAt?: string;
}

// Fetch all user rituals with today's completion status
export const useRituals = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['rituals', user?.id],
    queryFn: async (): Promise<RitualWithStats[]> => {
      if (!user) return [];

      try {
        // Fetch rituals
        const { data: rituals, error: ritualsError } = await (supabase as any)
          .from('rituals')
          .select('*')
          .eq('user_id', user.id)
          .order('time', { ascending: true });

        if (ritualsError) {
          if (ritualsError.code === '42P01') {
            logger.warn('Rituals table does not exist');
            return [];
          }
          throw ritualsError;
        }

        if (!rituals || rituals.length === 0) return [];

        // Fetch completions for last 7 days
        const sevenDaysAgo = subDays(new Date(), 7).toISOString();
        const { data: completions, error: completionsError } = await (supabase as any)
          .from('ritual_completions')
          .select('*')
          .eq('user_id', user.id)
          .gte('completed_at', sevenDaysAgo);

        if (completionsError && completionsError.code !== '42P01') {
          throw completionsError;
        }

        const completionsByRitual = new Map<string, RitualCompletion[]>();
        (completions || []).forEach((c: RitualCompletion) => {
          const existing = completionsByRitual.get(c.ritual_id) || [];
          existing.push(c);
          completionsByRitual.set(c.ritual_id, existing);
        });

        // Calculate stats for each ritual
        return rituals.map((ritual: Ritual) => {
          const ritualCompletions = completionsByRitual.get(ritual.id) || [];

          // Check if completed today
          const completedToday = ritualCompletions.some((c) =>
            c.completed_at.startsWith(today)
          );

          // Calculate completion rate (last 7 days)
          const completionRate = ritualCompletions.length > 0
            ? Math.round((ritualCompletions.length / 7) * 100)
            : 0;

          // Calculate current streak
          let currentStreak = 0;
          const sortedCompletions = ritualCompletions
            .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

          if (sortedCompletions.length > 0) {
            let checkDate = new Date();
            if (!completedToday) {
              checkDate = subDays(checkDate, 1);
            }

            for (const completion of sortedCompletions) {
              const completionDate = new Date(completion.completed_at);
              const daysDiff = differenceInDays(checkDate, completionDate);

              if (daysDiff <= 1) {
                currentStreak++;
                checkDate = subDays(completionDate, 1);
              } else {
                break;
              }
            }
          }

          const lastCompletion = sortedCompletions[0];

          return {
            ...ritual,
            completedToday,
            currentStreak,
            completionRate,
            lastCompletedAt: lastCompletion?.completed_at,
          };
        });
      } catch (error) {
        logger.error('Error fetching rituals:', error);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });
};

// Fetch ritual statistics
export const useRitualStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ritual-stats', user?.id],
    queryFn: async (): Promise<RitualStats> => {
      if (!user) {
        return {
          totalRituals: 0,
          activeRituals: 0,
          completedToday: 0,
          currentStreak: 0,
          longestStreak: 0,
          completionRate: 0,
          totalCompletions: 0,
        };
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

        // Fetch rituals count
        const { data: rituals, error: ritualsError } = await (supabase as any)
          .from('rituals')
          .select('id, is_active')
          .eq('user_id', user.id);

        if (ritualsError && ritualsError.code !== '42P01') {
          throw ritualsError;
        }

        const totalRituals = rituals?.length || 0;
        const activeRituals = rituals?.filter((r: Ritual) => r.is_active).length || 0;

        // Fetch completions
        const { data: completions, error: completionsError } = await (supabase as any)
          .from('ritual_completions')
          .select('completed_at')
          .eq('user_id', user.id)
          .gte('completed_at', thirtyDaysAgo);

        if (completionsError && completionsError.code !== '42P01') {
          throw completionsError;
        }

        const allCompletions = completions || [];
        const completedToday = allCompletions.filter((c: RitualCompletion) =>
          c.completed_at.startsWith(today)
        ).length;

        // Calculate completion rate (completions / (active rituals * 30 days))
        const expectedCompletions = activeRituals * 30;
        const completionRate = expectedCompletions > 0
          ? Math.round((allCompletions.length / expectedCompletions) * 100)
          : 0;

        // Calculate streaks (days with at least one completion)
        const completionDays = new Set(
          allCompletions.map((c: RitualCompletion) => c.completed_at.split('T')[0])
        );

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let checkDate = new Date();

        for (let i = 0; i < 30; i++) {
          const dateStr = format(checkDate, 'yyyy-MM-dd');
          if (completionDays.has(dateStr)) {
            tempStreak++;
            if (i === 0 || currentStreak > 0) {
              currentStreak = tempStreak;
            }
            longestStreak = Math.max(longestStreak, tempStreak);
          } else {
            if (i === 0) currentStreak = 0;
            tempStreak = 0;
          }
          checkDate = subDays(checkDate, 1);
        }

        return {
          totalRituals,
          activeRituals,
          completedToday,
          currentStreak,
          longestStreak,
          completionRate: Math.min(100, completionRate),
          totalCompletions: allCompletions.length,
        };
      } catch (error) {
        logger.error('Error fetching ritual stats:', error);
        return {
          totalRituals: 0,
          activeRituals: 0,
          completedToday: 0,
          currentStreak: 0,
          longestStreak: 0,
          completionRate: 0,
          totalCompletions: 0,
        };
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};

// Create ritual mutation
export const useCreateRitual = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      ritual: Omit<Ritual, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    ): Promise<Ritual> => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await (supabase as any)
        .from('rituals')
        .insert({
          ...ritual,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rituals'] });
      queryClient.invalidateQueries({ queryKey: ['ritual-stats'] });
    },
  });
};

// Update ritual mutation
export const useUpdateRitual = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Ritual, 'id' | 'user_id' | 'created_at'>>;
    }): Promise<Ritual> => {
      const { data, error } = await (supabase as any)
        .from('rituals')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rituals'] });
    },
  });
};

// Toggle ritual active status
export const useToggleRitual = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }): Promise<Ritual> => {
      const { data, error } = await (supabase as any)
        .from('rituals')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rituals'] });
      queryClient.invalidateQueries({ queryKey: ['ritual-stats'] });
    },
  });
};

// Delete ritual mutation
export const useDeleteRitual = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await (supabase as any)
        .from('rituals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rituals'] });
      queryClient.invalidateQueries({ queryKey: ['ritual-stats'] });
    },
  });
};

// Complete ritual mutation
export const useCompleteRitual = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      ritualId,
      durationMinutes,
      notes,
      moodRating,
    }: {
      ritualId: string;
      durationMinutes?: number;
      notes?: string;
      moodRating?: number;
    }): Promise<RitualCompletion> => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await (supabase as any)
        .from('ritual_completions')
        .insert({
          ritual_id: ritualId,
          user_id: user.id,
          completed_at: new Date().toISOString(),
          duration_minutes: durationMinutes,
          notes,
          mood_rating: moodRating,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rituals'] });
      queryClient.invalidateQueries({ queryKey: ['ritual-stats'] });
      queryClient.invalidateQueries({ queryKey: ['ritual-history'] });
    },
  });
};

// Uncomplete ritual (remove today's completion)
export const useUncompleteRitual = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (ritualId: string): Promise<void> => {
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().split('T')[0];

      const { error } = await (supabase as any)
        .from('ritual_completions')
        .delete()
        .eq('ritual_id', ritualId)
        .eq('user_id', user.id)
        .gte('completed_at', `${today}T00:00:00`)
        .lte('completed_at', `${today}T23:59:59`);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rituals'] });
      queryClient.invalidateQueries({ queryKey: ['ritual-stats'] });
    },
  });
};

// Fetch ritual history
export const useRitualHistory = (ritualId?: string, days = 30) => {
  const { user } = useAuth();
  const startDate = subDays(new Date(), days).toISOString();

  return useQuery({
    queryKey: ['ritual-history', user?.id, ritualId, days],
    queryFn: async (): Promise<RitualCompletion[]> => {
      if (!user) return [];

      let query = (supabase as any)
        .from('ritual_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', startDate)
        .order('completed_at', { ascending: false });

      if (ritualId) {
        query = query.eq('ritual_id', ritualId);
      }

      const { data, error } = await query;

      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};

// Get today's rituals (active only)
export const useTodayRituals = () => {
  const { data: allRituals, ...rest } = useRituals();

  return {
    ...rest,
    data: allRituals?.filter((r) => r.is_active),
  };
};

export default {
  useRituals,
  useRitualStats,
  useCreateRitual,
  useUpdateRitual,
  useToggleRitual,
  useDeleteRitual,
  useCompleteRitual,
  useUncompleteRitual,
  useRitualHistory,
  useTodayRituals,
};
