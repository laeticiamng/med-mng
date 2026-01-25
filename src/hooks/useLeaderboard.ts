import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  points: number;
  streak: number;
  badges: number;
  avatarUrl?: string;
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'allTime';

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);

  const loadLeaderboard = useCallback(async (period: LeaderboardPeriod = 'weekly') => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Calculate date range
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'daily':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'weekly':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'monthly':
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'allTime':
          startDate = new Date(0);
          break;
      }

      // Fetch activities
      let query = supabase
        .from('gamification_activities')
        .select('user_id, points_earned');
      
      if (period !== 'allTime') {
        query = query.gte('created_at', startDate.toISOString());
      }

      const { _data: activities } = await query;

      // Aggregate
      const userPoints: Record<string, number> = {};
      activities?.forEach((a: any) => {
        userPoints[a.user_id] = (userPoints[a.user_id] || 0) + (a.points_earned || 0);
      });

      const userIds = Object.keys(userPoints);
      if (userIds.length === 0) {
        setEntries([]);
        setLoading(false);
        return;
      }

      // Get profiles
      const { _data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .in('id', userIds);

      // Get badges count
      const { _data: badges } = await supabase
        .from('user_badges')
        .select('user_id')
        .in('user_id', userIds)
        .eq('unlocked', true);

      const badgeCounts: Record<string, number> = {};
      badges?.forEach((b: any) => {
        badgeCounts[b.user_id] = (badgeCounts[b.user_id] || 0) + 1;
      });

      // Get streaks
      const { _data: streaks } = await supabase
        .from('user_gamification_stats')
        .select('user_id, longest_streak')
        .in('user_id', userIds);

      const streakMap: Record<string, number> = {};
      streaks?.forEach((s: any) => {
        streakMap[s.user_id] = s.longest_streak || 0;
      });

      // Build entries
      const leaderboardEntries: LeaderboardEntry[] = Object.entries(userPoints)
        .map(([userId, points]) => {
          const profile = profiles?.find((p: any) => p.id === userId);
          return {
            rank: 0,
            userId,
            name: profile?.name || profile?.email?.split('@')[0] || 'Utilisateur',
            points,
            streak: streakMap[userId] || 0,
            badges: badgeCounts[userId] || 0,
            avatarUrl: profile?.avatar_url,
          };
        })
        .sort((a, b) => b.points - a.points)
        .slice(0, 100)
        .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

      setEntries(leaderboardEntries);

      // Find user rank
      if (user) {
        const userEntry = leaderboardEntries.find(e => e.userId === user.id);
        setUserRank(userEntry?.rank || null);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTopThree = useCallback(() => {
    return entries.slice(0, 3);
  }, [entries]);

  const getUserPosition = useCallback((userId: string) => {
    return entries.find(e => e.userId === userId);
  }, [entries]);

  return {
    entries,
    loading,
    userRank,
    loadLeaderboard,
    getTopThree,
    getUserPosition,
  };
}
