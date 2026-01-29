/**
 * 🏆 Weekly Challenges Hook
 * Manages weekly gamification challenges with persistence
 */

import { supabase } from '@/integrations/supabase/client';
import { useCallback, useState } from 'react';
import { useToast } from './use-toast';
import { useGamification, POINTS_CONFIG } from './useGamification';

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  challengeType: 'review' | 'exam' | 'flashcard' | 'streak' | 'clinical' | 'music';
  targetValue: number;
  currentProgress: number;
  xpReward: number;
  badgeReward?: string;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  isCompleted: boolean;
}

export function useWeeklyChallenges() {
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { addPoints, unlockBadge } = useGamification();

  // Get current week boundaries
  const getWeekBoundaries = useCallback(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return { startOfWeek, endOfWeek };
  }, []);

  // Load active challenges
  const loadChallenges = useCallback(async (userId: string) => {
    if (!userId) return;
    setLoading(true);
    
    try {
      const { startOfWeek, endOfWeek } = getWeekBoundaries();
      
      // Load from weekly_challenges table (fallback to defaults if table doesn't exist)
      const { data, error } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.debug('Weekly challenges table not found, using defaults');
        setChallenges(getDefaultChallenges());
        return;
      }

      // Map existing table structure to WeeklyChallenge format
      const mappedChallenges: WeeklyChallenge[] = (data || []).map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        challengeType: c.challenge_type as any,
        targetValue: c.target_value,
        currentProgress: 0,
        xpReward: c.xp_reward,
        badgeReward: c.badge_reward,
        startsAt: new Date(c.starts_at),
        endsAt: new Date(c.ends_at),
        isActive: c.is_active,
        isCompleted: false,
      }));

      // Load user progress from existing user_activity_log instead of separate table
      const progressPromises = mappedChallenges.map(async (challenge) => {
        // Calculate progress from user_activity_log
        const { startOfWeek } = getWeekBoundaries();
        const { data: activityData } = await supabase
          .from('user_activity_log')
          .select('count')
          .eq('user_id', userId)
          .eq('activity_type', challenge.challengeType === 'review' ? 'srs_review' : challenge.challengeType)
          .gte('activity_date', startOfWeek.toISOString().split('T')[0]);

        const progress = (activityData || []).reduce((sum, a) => sum + (a.count || 0), 0);
        const isCompleted = progress >= challenge.targetValue;

        return {
          ...challenge,
          currentProgress: progress,
          isCompleted,
        };
      });

      const challengesWithProgress = await Promise.all(progressPromises);
      setChallenges(challengesWithProgress);
    } catch (error) {
      console.error('Error loading challenges:', error);
      // Fallback to default challenges
      setChallenges(getDefaultChallenges());
    } finally {
      setLoading(false);
    }
  }, [getWeekBoundaries]);

  // Get default challenges when DB fails
  const getDefaultChallenges = useCallback((): WeeklyChallenge[] => {
    const { startOfWeek, endOfWeek } = getWeekBoundaries();
    
    return [
      {
        id: 'weekly_mastery',
        title: '🎯 Maître de la semaine',
        description: 'Maîtriser 20 nouveaux items cette semaine',
        challengeType: 'review',
        targetValue: 20,
        currentProgress: 0,
        xpReward: 500,
        startsAt: startOfWeek,
        endsAt: endOfWeek,
        isActive: true,
        isCompleted: false,
      },
      {
        id: 'weekly_streak',
        title: '🔥 Flamme éternelle',
        description: 'Maintenir votre streak pendant 7 jours',
        challengeType: 'streak',
        targetValue: 7,
        currentProgress: 0,
        xpReward: 300,
        startsAt: startOfWeek,
        endsAt: endOfWeek,
        isActive: true,
        isCompleted: false,
      },
      {
        id: 'weekly_exams',
        title: '📝 Champion des examens',
        description: 'Compléter 5 examens cette semaine',
        challengeType: 'exam',
        targetValue: 5,
        currentProgress: 0,
        xpReward: 400,
        startsAt: startOfWeek,
        endsAt: endOfWeek,
        isActive: true,
        isCompleted: false,
      },
    ];
  }, [getWeekBoundaries]);

  // Update challenge progress
  const updateProgress = useCallback(async (
    userId: string, 
    challengeType: WeeklyChallenge['challengeType'],
    increment: number = 1
  ) => {
    if (!userId) return;

    const relevantChallenges = challenges.filter(
      c => c.challengeType === challengeType && !c.isCompleted && c.isActive
    );

    for (const challenge of relevantChallenges) {
      const newProgress = Math.min(challenge.currentProgress + increment, challenge.targetValue);
      const isNowCompleted = newProgress >= challenge.targetValue;

      // Update local state
      setChallenges(prev => prev.map(c => 
        c.id === challenge.id 
          ? { ...c, currentProgress: newProgress, isCompleted: isNowCompleted }
          : c
      ));

      // Persist progress to user_activity_log instead of separate table
      // This is a read-only calculation from existing activity data
      try {
        // No need to persist - progress is calculated from existing activity logs
        console.debug(`Weekly challenge progress updated: ${challenge.id} -> ${newProgress}/${challenge.targetValue}`);
      } catch (error) {
        console.debug('Error logging challenge progress:', error);
      }

      // Award XP when completed
      if (isNowCompleted) {
        await addPoints(userId, challenge.xpReward, `weekly_challenge_${challenge.id}`);
        
        if (challenge.badgeReward) {
          await unlockBadge(userId, challenge.badgeReward);
        }

        toast({
          title: '🏆 Défi complété !',
          description: `${challenge.title} - +${challenge.xpReward} XP`,
        });
      }
    }
  }, [challenges, addPoints, unlockBadge, toast]);

  // Check if any challenges are close to completion
  const getAlmostCompleteChallenges = useCallback(() => {
    return challenges.filter(c => {
      const progress = c.currentProgress / c.targetValue;
      return progress >= 0.8 && progress < 1 && !c.isCompleted;
    });
  }, [challenges]);

  // Get completion stats
  const getCompletionStats = useCallback(() => {
    const total = challenges.length;
    const completed = challenges.filter(c => c.isCompleted).length;
    const inProgress = challenges.filter(c => c.currentProgress > 0 && !c.isCompleted).length;
    const totalXpAvailable = challenges.reduce((sum, c) => sum + c.xpReward, 0);
    const xpEarned = challenges.filter(c => c.isCompleted).reduce((sum, c) => sum + c.xpReward, 0);

    return { total, completed, inProgress, totalXpAvailable, xpEarned };
  }, [challenges]);

  return {
    challenges,
    loading,
    loadChallenges,
    updateProgress,
    getAlmostCompleteChallenges,
    getCompletionStats,
    getWeekBoundaries,
  };
}
