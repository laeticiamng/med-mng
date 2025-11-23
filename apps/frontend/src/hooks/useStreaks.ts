import logger from '@/lib/logger';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  isActiveToday: boolean;
}

export const useStreaks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['streaks', user?.id],
    queryFn: async (): Promise<StreakData> => {
      if (!user) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
          isActiveToday: false,
        };
      }

      const { data, error } = await (supabase as any)
        .from('user_edn_progress')
        .select('updated_at, last_reviewed_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        logger.error('Error fetching streaks:', error);
        return {
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
          isActiveToday: false,
        };
      }

      if (!data || data.length === 0) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
          isActiveToday: false,
        };
      }

      // Calculate streaks from activity dates
      const uniqueDates = [...new Set(
        data
          .map((item: any) => item.last_reviewed_at || item.updated_at)
          .filter(Boolean)
          .map((date: string) => new Date(date).toDateString())
      )].sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());

      if (uniqueDates.length === 0) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
          isActiveToday: false,
        };
      }

      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const isActiveToday = uniqueDates[0] === today;

      // Calculate current streak
      let currentStreak = 0;
      let checkDate = isActiveToday ? today : yesterday;
      
      for (const date of uniqueDates) {
        if (date === checkDate) {
          currentStreak++;
          const prevDate = new Date(checkDate);
          prevDate.setDate(prevDate.getDate() - 1);
          checkDate = prevDate.toDateString();
        } else {
          break;
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 1;
      
      for (let i = 0; i < uniqueDates.length - 1; i++) {
        const currentDate = new Date(uniqueDates[i] as string);
        const nextDate = new Date(uniqueDates[i + 1] as string);
        const daysDiff = Math.floor(
          (currentDate.getTime() - nextDate.getTime()) / 86400000
        );

        if (daysDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      return {
        currentStreak,
        longestStreak,
        lastActivityDate: uniqueDates[0] as string,
        isActiveToday,
      };
    },
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
  });
};
