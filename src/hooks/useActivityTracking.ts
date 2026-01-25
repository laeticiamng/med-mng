import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';

export type ActivityType = 'srs_review' | 'exam' | 'flashcard' | 'clinical_case' | 'study' | 'ai_question' | 'music_generation' | 'ecos' | 'review' | 'clinical';

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

      const { _error } = await supabase
        .from('user_activity_log')
        .insert({
          user_id: user.id,
          activity_type: activity.activity_type,
          count: activity.count || 1,
          duration_seconds: activity.duration_seconds || 0,
          score: activity.score,
          metadata: activity.metadata || {}
        });

      if (_error) {
        console.error('Error logging activity:', _error);
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

      const { _data, _error } = await supabase
        .from('user_activity_log')
        .select('activity_date, activity_type, count')
        .eq('user_id', user.id)
        .gte('activity_date', startDate.toISOString().split('T')[0])
        .order('activity_date', { ascending: true });

      if (_error || !_data) return [];

      // Group by date
      const byDate: Record<string, HeatmapData> = {};
      
      _data.forEach(log => {
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
              study: 0,
              ai_question: 0,
              music_generation: 0,
              ecos: 0,
              review: 0,
              clinical: 0
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
          activities: { srs_review: 0, exam: 0, flashcard: 0, clinical_case: 0, study: 0, ai_question: 0, music_generation: 0, ecos: 0, review: 0, clinical: 0 }
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

      const { _data, _error } = await supabase
        .from('user_activity_log')
        .select('activity_date')
        .eq('user_id', user.id)
        .order('activity_date', { ascending: false });

      if (_error || !_data || _data.length === 0) return { current: 0, longest: 0 };

      // Get unique dates
      const uniqueDates = [...new Set(_data.map(d => d.activity_date))].sort().reverse();
      
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

      const { _data, _error } = await supabase
        .from('user_activity_log')
        .select('activity_type, count, duration_seconds, score')
        .eq('user_id', user.id)
        .eq('activity_date', today);

      if (_error || !_data) return null;

      const stats = {
        totalActivities: _data.reduce((sum, d) => sum + d.count, 0),
        totalTime: _data.reduce((sum, d) => sum + (d.duration_seconds || 0), 0),
        averageScore: _data.filter(d => d.score).length > 0
          ? Math.round(_data.filter(d => d.score).reduce((sum, d) => sum + (d.score || 0), 0) / _data.filter(d => d.score).length)
          : null,
        byType: {
          srs_review: _data.filter(d => d.activity_type === 'srs_review').reduce((sum, d) => sum + d.count, 0),
          exam: _data.filter(d => d.activity_type === 'exam').reduce((sum, d) => sum + d.count, 0),
          flashcard: _data.filter(d => d.activity_type === 'flashcard').reduce((sum, d) => sum + d.count, 0),
          clinical_case: _data.filter(d => d.activity_type === 'clinical_case').reduce((sum, d) => sum + d.count, 0),
          study: _data.filter(d => d.activity_type === 'study').reduce((sum, d) => sum + d.count, 0)
        }
      };

      return stats;
    } catch (error) {
      console.error('Error getting today stats:', error);
      return null;
    }
  }, []);

  // Get weekly summary stats
  const getWeeklySummary = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      // Current week
      const { _data: currentWeek } = await supabase
        .from('user_activity_log')
        .select('activity_type, count, duration_seconds, score')
        .eq('user_id', user.id)
        .gte('activity_date', weekAgo.toISOString().split('T')[0]);

      // Previous week
      const { _data: previousWeek } = await supabase
        .from('user_activity_log')
        .select('activity_type, count')
        .eq('user_id', user.id)
        .gte('activity_date', twoWeeksAgo.toISOString().split('T')[0])
        .lt('activity_date', weekAgo.toISOString().split('T')[0]);

      const currentTotal = currentWeek?.reduce((sum, d) => sum + d.count, 0) || 0;
      const previousTotal = previousWeek?.reduce((sum, d) => sum + d.count, 0) || 0;
      const trend = previousTotal > 0 ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100) : 100;

      const byType: Record<ActivityType, number> = {
        srs_review: 0,
        exam: 0,
        flashcard: 0,
        clinical_case: 0,
        study: 0,
        ai_question: 0,
        music_generation: 0,
        ecos: 0,
        review: 0,
        clinical: 0
      };

      currentWeek?.forEach(d => {
        byType[d.activity_type as ActivityType] += d.count;
      });

      return {
        totalActivities: currentTotal,
        totalTime: currentWeek?.reduce((sum, d) => sum + (d.duration_seconds || 0), 0) || 0,
        averageScore: currentWeek?.filter(d => d.score).length 
          ? Math.round(currentWeek.filter(d => d.score).reduce((sum, d) => sum + (d.score || 0), 0) / currentWeek.filter(d => d.score).length)
          : null,
        byType,
        trend,
        previousTotal
      };
    } catch (error) {
      console.error('Error getting weekly summary:', error);
      return null;
    }
  }, []);

  // Get activity days count
  const getActiveDaysCount = useCallback(async (days: number = 30): Promise<number> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { _data } = await supabase
        .from('user_activity_log')
        .select('activity_date')
        .eq('user_id', user.id)
        .gte('activity_date', startDate.toISOString().split('T')[0]);

      const uniqueDays = new Set(_data?.map(d => d.activity_date) || []);
      return uniqueDays.size;
    } catch (error) {
      console.error('Error getting active days:', error);
      return 0;
    }
  }, []);

  // Get monthly summary
  const getMonthlySummary = useCallback(async (month?: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const targetMonth = month || new Date();
      const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
      const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

      const { _data, _error } = await supabase
        .from('user_activity_log')
        .select('activity_type, count, duration_seconds, score, activity_date')
        .eq('user_id', user.id)
        .gte('activity_date', startOfMonth.toISOString().split('T')[0])
        .lte('activity_date', endOfMonth.toISOString().split('T')[0]);

      if (_error || !_data) return null;

      const byType: Record<ActivityType, number> = {
        srs_review: 0, exam: 0, flashcard: 0, clinical_case: 0,
        study: 0, ai_question: 0, music_generation: 0, ecos: 0,
        review: 0, clinical: 0
      };

      _data.forEach(d => {
        byType[d.activity_type as ActivityType] += d.count;
      });

      const uniqueDays = new Set(_data.map(d => d.activity_date));

      return {
        totalActivities: _data.reduce((sum, d) => sum + d.count, 0),
        totalTime: _data.reduce((sum, d) => sum + (d.duration_seconds || 0), 0),
        activeDays: uniqueDays.size,
        totalDaysInMonth: endOfMonth.getDate(),
        byType,
        averagePerDay: _data.length > 0 ? Math.round(_data.reduce((sum, d) => sum + d.count, 0) / uniqueDays.size) : 0
      };
    } catch (error) {
      console.error('Error getting monthly summary:', error);
      return null;
    }
  }, []);

  // Get activity by type
  const getActivityByType = useCallback(async (type: ActivityType, days: number = 30) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { _data, _error } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_type', type)
        .gte('activity_date', startDate.toISOString().split('T')[0])
        .order('activity_date', { ascending: false });

      if (_error) return [];
      return _data || [];
    } catch (error) {
      console.error('Error getting activity by type:', error);
      return [];
    }
  }, []);

  // Get best performing day
  const getBestDay = useCallback(async (days: number = 30): Promise<{ date: string; count: number } | null> => {
    try {
      const heatmap = await getHeatmapData(days);
      if (heatmap.length === 0) return null;

      return heatmap.reduce((best, current) =>
        current.count > best.count ? current : best
      , { date: '', count: 0 });
    } catch (error) {
      console.error('Error getting best day:', error);
      return null;
    }
  }, [getHeatmapData]);

  // Get most active time of day
  const getMostActiveTime = useCallback(async (): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { _data } = await supabase
        .from('user_activity_log')
        .select('created_at')
        .eq('user_id', user.id)
        .limit(500);

      if (!_data || _data.length < 10) return null;

      const byHour: Record<number, number> = {};
      _data.forEach(d => {
        const hour = new Date(d.created_at).getHours();
        byHour[hour] = (byHour[hour] || 0) + 1;
      });

      let maxHour = 0;
      let maxCount = 0;
      Object.entries(byHour).forEach(([hour, count]) => {
        if (count > maxCount) {
          maxCount = count;
          maxHour = parseInt(hour);
        }
      });

      const period = maxHour < 12 ? 'matin' : maxHour < 18 ? 'après-midi' : 'soir';
      return `${maxHour}h (${period})`;
    } catch (error) {
      console.error('Error getting most active time:', error);
      return null;
    }
  }, []);

  // Get goals progress
  const getGoalsProgress = useCallback(async (goals: {
    dailyActivities?: number;
    weeklyActivities?: number;
    dailyTime?: number; // minutes
  }) => {
    const today = await getTodayStats();
    const weekly = await getWeeklySummary();

    return {
      daily: {
        activities: {
          current: today?.totalActivities || 0,
          target: goals.dailyActivities || 10,
          percentage: Math.min(100, Math.round(((today?.totalActivities || 0) / (goals.dailyActivities || 10)) * 100))
        },
        time: {
          current: Math.round((today?.totalTime || 0) / 60),
          target: goals.dailyTime || 30,
          percentage: Math.min(100, Math.round(((today?.totalTime || 0) / 60) / (goals.dailyTime || 30) * 100))
        }
      },
      weekly: {
        activities: {
          current: weekly?.totalActivities || 0,
          target: goals.weeklyActivities || 50,
          percentage: Math.min(100, Math.round(((weekly?.totalActivities || 0) / (goals.weeklyActivities || 50)) * 100))
        }
      }
    };
  }, [getTodayStats, getWeeklySummary]);

  // Export activity data
  const exportActivityData = useCallback(async (days: number = 90): Promise<string> => {
    const heatmap = await getHeatmapData(days);
    const streak = await getStreak();
    const weekly = await getWeeklySummary();
    const monthly = await getMonthlySummary();

    return JSON.stringify({
      exportDate: new Date().toISOString(),
      period: `${days} derniers jours`,
      streak,
      weekly,
      monthly,
      dailyData: heatmap
    }, null, 2);
  }, [getHeatmapData, getStreak, getWeeklySummary, getMonthlySummary]);

  // Compare two periods
  const comparePeriods = useCallback(async (
    period1Start: Date,
    period1End: Date,
    period2Start: Date,
    period2End: Date
  ): Promise<{
    period1: { total: number; average: number };
    period2: { total: number; average: number };
    change: number;
  }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { period1: { total: 0, average: 0 }, period2: { total: 0, average: 0 }, change: 0 };

      const [{ _data: data1 }, { _data: data2 }] = await Promise.all([
        supabase
          .from('user_activity_log')
          .select('count')
          .eq('user_id', user.id)
          .gte('activity_date', period1Start.toISOString().split('T')[0])
          .lte('activity_date', period1End.toISOString().split('T')[0]),
        supabase
          .from('user_activity_log')
          .select('count')
          .eq('user_id', user.id)
          .gte('activity_date', period2Start.toISOString().split('T')[0])
          .lte('activity_date', period2End.toISOString().split('T')[0])
      ]);

      const total1 = data1?.reduce((sum, d) => sum + d.count, 0) || 0;
      const total2 = data2?.reduce((sum, d) => sum + d.count, 0) || 0;
      const days1 = Math.ceil((period1End.getTime() - period1Start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const days2 = Math.ceil((period2End.getTime() - period2Start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const change = total1 > 0 ? Math.round(((total2 - total1) / total1) * 100) : 100;

      return {
        period1: { total: total1, average: Math.round(total1 / days1) },
        period2: { total: total2, average: Math.round(total2 / days2) },
        change
      };
    } catch (error) {
      console.error('Error comparing periods:', error);
      return { period1: { total: 0, average: 0 }, period2: { total: 0, average: 0 }, change: 0 };
    }
  }, []);

  // Get activity insights
  const getInsights = useCallback(async (): Promise<string[]> => {
    const insights: string[] = [];

    const streak = await getStreak();
    const weekly = await getWeeklySummary();
    const bestDay = await getBestDay(30);
    const activeTime = await getMostActiveTime();

    if (streak.current >= 7) {
      insights.push(`Félicitations ! Vous avez un streak de ${streak.current} jours !`);
    } else if (streak.current === 0) {
      insights.push("Commencez une nouvelle série d'étude aujourd'hui !");
    }

    if (weekly && weekly.trend > 20) {
      insights.push(`Votre activité a augmenté de ${weekly.trend}% cette semaine !`);
    } else if (weekly && weekly.trend < -20) {
      insights.push("Votre activité a diminué cette semaine. Restez motivé !");
    }

    if (bestDay && bestDay.count > 0) {
      insights.push(`Votre meilleur jour : ${bestDay.count} activités le ${new Date(bestDay.date).toLocaleDateString('fr-FR')}`);
    }

    if (activeTime) {
      insights.push(`Vous êtes le plus actif vers ${activeTime}`);
    }

    if (insights.length === 0) {
      insights.push("Continuez à étudier régulièrement pour obtenir des insights personnalisés !");
    }

    return insights;
  }, [getStreak, getWeeklySummary, getBestDay, getMostActiveTime]);

  return {
    logActivity,
    _getHeatmapData,
    getStreak,
    getTodayStats,
    getWeeklySummary,
    getActiveDaysCount,
    getMonthlySummary,
    getActivityByType,
    getBestDay,
    getMostActiveTime,
    getGoalsProgress,
    exportActivityData,
    comparePeriods,
    getInsights
  };
};
