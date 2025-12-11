import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ActivityType = 'srs_review' | 'exam' | 'flashcard' | 'clinical_case' | 'study';

interface ActivityLog {
  activity_type: ActivityType;
  count?: number;
  duration_seconds?: number;
  score?: number;
  metadata?: Record<string, any>;
}

interface HeatmapData {
  date: string;
  count: number;
  activities: Record<ActivityType, number>;
}

export const useActivityTracking = () => {
  // Log an activity
  const logActivity = useCallback(async (activity: ActivityLog) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_activity_log')
        .insert({
          user_id: user.id,
          activity_type: activity.activity_type,
          count: activity.count || 1,
          duration_seconds: activity.duration_seconds || 0,
          score: activity.score,
          metadata: activity.metadata || {}
        });

      if (error) {
        console.error('Error logging activity:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in logActivity:', error);
      return false;
    }
  }, []);

  // Get heatmap data for last N days
  const getHeatmapData = useCallback(async (days: number = 90): Promise<HeatmapData[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('user_activity_log')
        .select('activity_date, activity_type, count')
        .eq('user_id', user.id)
        .gte('activity_date', startDate.toISOString().split('T')[0])
        .order('activity_date', { ascending: true });

      if (error || !data) return [];

      // Group by date
      const byDate: Record<string, HeatmapData> = {};
      
      data.forEach(log => {
        const dateStr = log.activity_date;
        if (!byDate[dateStr]) {
          byDate[dateStr] = {
            date: dateStr,
            count: 0,
            activities: {
              srs_review: 0,
              exam: 0,
              flashcard: 0,
              clinical_case: 0,
              study: 0
            }
          };
        }
        byDate[dateStr].count += log.count;
        byDate[dateStr].activities[log.activity_type as ActivityType] += log.count;
      });

      // Fill in missing dates
      const result: HeatmapData[] = [];
      const current = new Date(startDate);
      const today = new Date();
      
      while (current <= today) {
        const dateStr = current.toISOString().split('T')[0];
        result.push(byDate[dateStr] || {
          date: dateStr,
          count: 0,
          activities: { srs_review: 0, exam: 0, flashcard: 0, clinical_case: 0, study: 0 }
        });
        current.setDate(current.getDate() + 1);
      }

      return result;
    } catch (error) {
      console.error('Error getting heatmap data:', error);
      return [];
    }
  }, []);

  // Get streak info
  const getStreak = useCallback(async (): Promise<{ current: number; longest: number }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { current: 0, longest: 0 };

      const { data, error } = await supabase
        .from('user_activity_log')
        .select('activity_date')
        .eq('user_id', user.id)
        .order('activity_date', { ascending: false });

      if (error || !data || data.length === 0) return { current: 0, longest: 0 };

      // Get unique dates
      const uniqueDates = [...new Set(data.map(d => d.activity_date))].sort().reverse();
      
      // Calculate current streak
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Check if streak is active (today or yesterday has activity)
      if (uniqueDates[0] === today || uniqueDates[0] === yesterdayStr) {
        let checkDate = new Date(uniqueDates[0]);
        for (const dateStr of uniqueDates) {
          const date = new Date(dateStr);
          const checkStr = checkDate.toISOString().split('T')[0];
          
          if (dateStr === checkStr) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 1;
      
      for (let i = 1; i < uniqueDates.length; i++) {
        const prev = new Date(uniqueDates[i - 1]);
        const curr = new Date(uniqueDates[i]);
        const diffDays = Math.floor((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      return { current: currentStreak, longest: longestStreak };
    } catch (error) {
      console.error('Error getting streak:', error);
      return { current: 0, longest: 0 };
    }
  }, []);

  // Get today's stats
  const getTodayStats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('user_activity_log')
        .select('activity_type, count, duration_seconds, score')
        .eq('user_id', user.id)
        .eq('activity_date', today);

      if (error || !data) return null;

      const stats = {
        totalActivities: data.reduce((sum, d) => sum + d.count, 0),
        totalTime: data.reduce((sum, d) => sum + (d.duration_seconds || 0), 0),
        averageScore: data.filter(d => d.score).length > 0
          ? Math.round(data.filter(d => d.score).reduce((sum, d) => sum + (d.score || 0), 0) / data.filter(d => d.score).length)
          : null,
        byType: {
          srs_review: data.filter(d => d.activity_type === 'srs_review').reduce((sum, d) => sum + d.count, 0),
          exam: data.filter(d => d.activity_type === 'exam').reduce((sum, d) => sum + d.count, 0),
          flashcard: data.filter(d => d.activity_type === 'flashcard').reduce((sum, d) => sum + d.count, 0),
          clinical_case: data.filter(d => d.activity_type === 'clinical_case').reduce((sum, d) => sum + d.count, 0),
          study: data.filter(d => d.activity_type === 'study').reduce((sum, d) => sum + d.count, 0)
        }
      };

      return stats;
    } catch (error) {
      console.error('Error getting today stats:', error);
      return null;
    }
  }, []);

  return {
    logActivity,
    getHeatmapData,
    getStreak,
    getTodayStats
  };
};
