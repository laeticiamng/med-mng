import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import logger from '@/lib/logger';

export interface Challenge {
  id: string;
  user_id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  type: string;
  points: number;
  target_value: number;
  progress: number | null;
  completed: boolean | null;
  completed_at: string | null;
  expires_at: string;
  created_at: string | null;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  type: string;
  points: number;
  target_value: number;
  date: string;
  is_active: boolean;
  created_at: string;
}

export interface ChallengeProgress {
  id: string;
  challenge_id: string;
  user_id: string;
  progress: Record<string, any>;
  completed: boolean | null;
  completed_at: string | null;
  streak_days: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ChallengeStats {
  activeChallenges: number;
  completedChallenges: number;
  successRate: number;
  totalPointsEarned: number;
}

export interface ChallengeWithParticipants extends Challenge {
  participantsCount: number;
  userProgress: number;
  isJoined: boolean;
}

// Fetch all available challenges
export const useChallenges = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['challenges', user?.id],
    queryFn: async (): Promise<ChallengeWithParticipants[]> => {
      try {
        // Fetch all challenges
        const { data: challenges, error } = await (supabase as any)
          .from('challenges')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          if (error.code === '42P01') return [];
          throw error;
        }

        if (!challenges) return [];

        // Count participants per challenge (unique user_ids per title)
        const challengesByTitle = new Map<string, Challenge[]>();
        challenges.forEach((c: Challenge) => {
          const existing = challengesByTitle.get(c.title) || [];
          existing.push(c);
          challengesByTitle.set(c.title, existing);
        });

        // Get unique challenges with participant counts
        const uniqueChallenges: ChallengeWithParticipants[] = [];
        const seenTitles = new Set<string>();

        for (const challenge of challenges) {
          if (seenTitles.has(challenge.title)) continue;
          seenTitles.add(challenge.title);

          const participants = challengesByTitle.get(challenge.title) || [];
          const userChallenge = user
            ? participants.find((p: Challenge) => p.user_id === user.id)
            : null;

          uniqueChallenges.push({
            ...challenge,
            participantsCount: participants.length,
            userProgress: userChallenge?.progress || 0,
            isJoined: !!userChallenge,
          });
        }

        return uniqueChallenges;
      } catch (error) {
        logger.error('Error fetching challenges:', error);
        return [];
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch user's challenges (joined ones)
export const useUserChallenges = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-challenges', user?.id],
    queryFn: async (): Promise<Challenge[]> => {
      if (!user) return [];

      try {
        const { data, error } = await (supabase as any)
          .from('challenges')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          if (error.code === '42P01') return [];
          throw error;
        }

        return data || [];
      } catch (error) {
        logger.error('Error fetching user challenges:', error);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch challenge stats for current user
export const useChallengeStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['challenge-stats', user?.id],
    queryFn: async (): Promise<ChallengeStats> => {
      if (!user) {
        return {
          activeChallenges: 0,
          completedChallenges: 0,
          successRate: 0,
          totalPointsEarned: 0,
        };
      }

      try {
        // Fetch user's challenges
        const { data: challenges, error } = await (supabase as any)
          .from('challenges')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          if (error.code === '42P01') {
            return {
              activeChallenges: 0,
              completedChallenges: 0,
              successRate: 0,
              totalPointsEarned: 0,
            };
          }
          throw error;
        }

        const allChallenges = challenges || [];
        const activeChallenges = allChallenges.filter(
          (c: Challenge) => !c.completed && new Date(c.expires_at) > new Date()
        ).length;
        const completedChallenges = allChallenges.filter(
          (c: Challenge) => c.completed
        ).length;
        const totalChallenges = allChallenges.length;
        const successRate =
          totalChallenges > 0
            ? Math.round((completedChallenges / totalChallenges) * 100)
            : 0;
        const totalPointsEarned = allChallenges
          .filter((c: Challenge) => c.completed)
          .reduce((sum: number, c: Challenge) => sum + (c.points || 0), 0);

        return {
          activeChallenges,
          completedChallenges,
          successRate,
          totalPointsEarned,
        };
      } catch (error) {
        logger.error('Error fetching challenge stats:', error);
        return {
          activeChallenges: 0,
          completedChallenges: 0,
          successRate: 0,
          totalPointsEarned: 0,
        };
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};

// Join a challenge
export const useJoinChallenge = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (challenge: {
      title: string;
      description: string;
      difficulty: string;
      category: string;
      type: string;
      points: number;
      target_value: number;
      expires_at: string;
    }): Promise<Challenge> => {
      if (!user) throw new Error('User not authenticated');

      // Check if user already joined this challenge
      const { data: existing } = await (supabase as any)
        .from('challenges')
        .select('id')
        .eq('user_id', user.id)
        .eq('title', challenge.title)
        .single();

      if (existing) {
        throw new Error('Vous participez déjà à ce challenge');
      }

      const { data, error } = await (supabase as any)
        .from('challenges')
        .insert({
          ...challenge,
          user_id: user.id,
          progress: 0,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['user-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['challenge-stats'] });
    },
  });
};

// Update challenge progress
export const useUpdateChallengeProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      challengeId,
      progress,
    }: {
      challengeId: string;
      progress: number;
    }): Promise<Challenge> => {
      const { data: challenge, error: fetchError } = await (supabase as any)
        .from('challenges')
        .select('target_value, points')
        .eq('id', challengeId)
        .single();

      if (fetchError) throw fetchError;

      const isCompleted = progress >= (challenge?.target_value || 100);

      const { data, error } = await (supabase as any)
        .from('challenges')
        .update({
          progress,
          completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', challengeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['user-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['challenge-stats'] });
    },
  });
};

// Leave/abandon a challenge
export const useLeaveChallenge = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (challengeId: string): Promise<void> => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await (supabase as any)
        .from('challenges')
        .delete()
        .eq('id', challengeId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['user-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['challenge-stats'] });
    },
  });
};

// Fetch single challenge with details
export const useChallengeDetail = (challengeId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['challenge-detail', challengeId, user?.id],
    queryFn: async () => {
      try {
        // Fetch the challenge
        const { data: challenge, error } = await (supabase as any)
          .from('challenges')
          .select('*')
          .eq('id', challengeId)
          .single();

        if (error) throw error;

        // Count all participants with same title
        const { data: participants, error: participantsError } = await (supabase as any)
          .from('challenges')
          .select('user_id, progress, completed')
          .eq('title', challenge.title);

        if (participantsError) {
          logger.warn('Could not fetch participants:', participantsError);
        }

        // Find user's version of this challenge
        const userChallenge = user
          ? (participants || []).find((p: any) => p.user_id === user.id)
          : null;

        return {
          ...challenge,
          participantsCount: (participants || []).length,
          userProgress: userChallenge?.progress || 0,
          isJoined: !!userChallenge,
          isUserChallenge: challenge.user_id === user?.id,
          leaderboard: (participants || [])
            .sort((a: any, b: any) => (b.progress || 0) - (a.progress || 0))
            .slice(0, 10),
        };
      } catch (error) {
        logger.error('Error fetching challenge detail:', error);
        throw error;
      }
    },
    enabled: !!challengeId,
    staleTime: 2 * 60 * 1000,
  });
};

// Daily challenges hooks
export const useDailyChallenges = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['daily-challenges', today],
    queryFn: async () => {
      try {
        const { data: challenges, error } = await (supabase as any)
          .from('daily_challenges')
          .select('*')
          .eq('date', today)
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (error) {
          if (error.code === '42P01') return [];
          throw error;
        }

        if (!user || !challenges) return challenges || [];

        // Get user's progress on these challenges
        const { data: progress } = await (supabase as any)
          .from('user_challenges_progress')
          .select('*')
          .eq('user_id', user.id)
          .in(
            'challenge_id',
            challenges.map((c: DailyChallenge) => c.id)
          );

        const progressMap = new Map(
          (progress || []).map((p: ChallengeProgress) => [p.challenge_id, p])
        );

        return challenges.map((challenge: DailyChallenge) => ({
          ...challenge,
          userProgress: progressMap.get(challenge.id) || null,
        }));
      } catch (error) {
        logger.error('Error fetching daily challenges:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Update daily challenge progress
export const useUpdateDailyChallengeProgress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      challengeId,
      progress,
    }: {
      challengeId: string;
      progress: Record<string, any>;
    }): Promise<ChallengeProgress> => {
      if (!user) throw new Error('User not authenticated');

      // Check if progress exists
      const { data: existing } = await (supabase as any)
        .from('user_challenges_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId)
        .single();

      if (existing) {
        // Update existing progress
        const { data, error } = await (supabase as any)
          .from('user_challenges_progress')
          .update({
            progress,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new progress entry
        const { data, error } = await (supabase as any)
          .from('user_challenges_progress')
          .insert({
            user_id: user.id,
            challenge_id: challengeId,
            progress,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['challenge-stats'] });
    },
  });
};

// Complete daily challenge
export const useCompleteDailyChallenge = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (challengeId: string): Promise<ChallengeProgress> => {
      if (!user) throw new Error('User not authenticated');

      // Check if progress exists
      const { data: existing } = await (supabase as any)
        .from('user_challenges_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId)
        .single();

      if (existing) {
        const { data, error } = await (supabase as any)
          .from('user_challenges_progress')
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await (supabase as any)
          .from('user_challenges_progress')
          .insert({
            user_id: user.id,
            challenge_id: challengeId,
            progress: { completed: true },
            completed: true,
            completed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['challenge-stats'] });
    },
  });
};

export default {
  useChallenges,
  useUserChallenges,
  useChallengeStats,
  useJoinChallenge,
  useUpdateChallengeProgress,
  useLeaveChallenge,
  useChallengeDetail,
  useDailyChallenges,
  useUpdateDailyChallengeProgress,
  useCompleteDailyChallenge,
};
