import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Flame,
  Trophy,
  Calendar,
  TrendingUp,
  Shield,
  Zap,
  Star,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { cn } from '@/lib/utils';
import { format, subDays, isToday, isYesterday, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import logger from '@/lib/logger';

interface StreakData {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  streak_start_date: string;
  total_active_days: number;
  freeze_count: number;
  created_at: string;
  updated_at: string;
}

interface ActivityDay {
  date: string;
  hasActivity: boolean;
  isToday: boolean;
  isFuture: boolean;
}

const useStreakData = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['streak-data', userId],
    queryFn: async (): Promise<StreakData | null> => {
      if (!userId) return null;

      const { data, error } = await (supabase as any)
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error fetching streak data:', error);
        throw error;
      }

      // If no streak record exists, create one
      if (!data) {
        const today = new Date().toISOString().split('T')[0];
        const { data: newStreak, error: insertError } = await (supabase as any)
          .from('user_streaks')
          .insert({
            user_id: userId,
            current_streak: 0,
            longest_streak: 0,
            last_activity_date: null,
            streak_start_date: today,
            total_active_days: 0,
            freeze_count: 1, // Start with one freeze
          })
          .select()
          .single();

        if (insertError) {
          logger.warn('Could not create streak record:', insertError);
          return null;
        }

        return newStreak;
      }

      return data;
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
};

const useRecordActivity = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().split('T')[0];

      // Get current streak data
      const { data: currentStreak, error: fetchError } = await (supabase as any)
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (!currentStreak) {
        // Create new streak record
        const { data, error } = await (supabase as any)
          .from('user_streaks')
          .insert({
            user_id: user.id,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: today,
            streak_start_date: today,
            total_active_days: 1,
            freeze_count: 1,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // Check if already recorded today
      if (currentStreak.last_activity_date === today) {
        return currentStreak;
      }

      const lastActivity = currentStreak.last_activity_date
        ? new Date(currentStreak.last_activity_date)
        : null;
      const todayDate = new Date(today);

      let newStreak = currentStreak.current_streak;
      let newStreakStart = currentStreak.streak_start_date;

      if (lastActivity) {
        const daysDiff = differenceInDays(todayDate, lastActivity);

        if (daysDiff === 1) {
          // Consecutive day - increment streak
          newStreak += 1;
        } else if (daysDiff > 1) {
          // Streak broken - reset
          newStreak = 1;
          newStreakStart = today;
        }
      } else {
        // First activity
        newStreak = 1;
        newStreakStart = today;
      }

      const newLongest = Math.max(currentStreak.longest_streak, newStreak);

      const { data, error } = await (supabase as any)
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: today,
          streak_start_date: newStreakStart,
          total_active_days: currentStreak.total_active_days + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streak-data', user?.id] });
    },
    onError: (error) => {
      logger.error('Error recording activity:', error);
    },
  });
};

const getStreakStatus = (streakData: StreakData | null): {
  status: 'active' | 'at_risk' | 'broken' | 'none';
  message: string;
} => {
  if (!streakData || !streakData.last_activity_date) {
    return { status: 'none', message: 'Commencez votre série !' };
  }

  const lastActivity = new Date(streakData.last_activity_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastActivity.setHours(0, 0, 0, 0);

  const daysDiff = differenceInDays(today, lastActivity);

  if (daysDiff === 0) {
    return { status: 'active', message: 'Série maintenue !' };
  } else if (daysDiff === 1) {
    return { status: 'at_risk', message: 'Faites une activité pour maintenir votre série !' };
  } else {
    return { status: 'broken', message: 'Série perdue. Recommencez !' };
  }
};

const getStreakMilestone = (streak: number): { milestone: number; reward: string } | null => {
  const milestones = [
    { milestone: 7, reward: 'Badge "Une semaine"' },
    { milestone: 30, reward: 'Badge "Un mois"' },
    { milestone: 100, reward: 'Badge "Centurion"' },
    { milestone: 365, reward: 'Badge "Légende"' },
  ];

  for (const m of milestones) {
    if (streak < m.milestone) {
      return m;
    }
  }
  return null;
};

interface StreakTrackerProps {
  className?: string;
  variant?: 'compact' | 'full';
  showCalendar?: boolean;
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({
  className,
  variant = 'full',
  showCalendar = true,
}) => {
  const { user } = useAuth();
  const { data: streakData, isLoading } = useStreakData(user?.id);

  const streakStatus = useMemo(() => getStreakStatus(streakData), [streakData]);
  const nextMilestone = useMemo(
    () => getStreakMilestone(streakData?.current_streak || 0),
    [streakData]
  );

  const calendarDays = useMemo((): ActivityDay[] => {
    const days: ActivityDay[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const hasActivity =
        streakData?.last_activity_date &&
        new Date(streakData.last_activity_date) >= date &&
        differenceInDays(new Date(streakData.last_activity_date), date) <=
          (streakData.current_streak || 0);

      days.push({
        date: dateStr,
        hasActivity: hasActivity || false,
        isToday: isToday(date),
        isFuture: false,
      });
    }

    return days;
  }, [streakData]);

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <Flame className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Connectez-vous pour suivre votre série
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'p-3 rounded-full',
                  streakStatus.status === 'active'
                    ? 'bg-orange-100 dark:bg-orange-900/30'
                    : streakStatus.status === 'at_risk'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30'
                    : 'bg-gray-100 dark:bg-gray-800'
                )}
              >
                <Flame
                  className={cn(
                    'w-6 h-6',
                    streakStatus.status === 'active'
                      ? 'text-orange-500'
                      : streakStatus.status === 'at_risk'
                      ? 'text-yellow-500'
                      : 'text-gray-400'
                  )}
                />
              </div>
              <div>
                <p className="text-2xl font-bold">{streakData?.current_streak || 0}</p>
                <p className="text-xs text-muted-foreground">jours consécutifs</p>
              </div>
            </div>
            {streakStatus.status === 'at_risk' && (
              <Badge variant="destructive" className="animate-pulse">
                À risque !
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Série d'activité
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main streak display */}
        <div
          className={cn(
            'p-6 rounded-xl text-center',
            streakStatus.status === 'active'
              ? 'bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30'
              : streakStatus.status === 'at_risk'
              ? 'bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30'
              : 'bg-muted'
          )}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame
              className={cn(
                'w-8 h-8',
                streakStatus.status === 'active' ? 'text-orange-500' : 'text-gray-400'
              )}
            />
            <span className="text-5xl font-bold">
              {streakData?.current_streak || 0}
            </span>
          </div>
          <p className="text-lg font-medium mb-1">jours consécutifs</p>
          <p
            className={cn(
              'text-sm',
              streakStatus.status === 'at_risk' ? 'text-yellow-700 font-medium' : 'text-muted-foreground'
            )}
          >
            {streakStatus.message}
          </p>
        </div>

        {/* Calendar view */}
        {showCalendar && (
          <div>
            <p className="text-sm font-medium mb-3">7 derniers jours</p>
            <div className="flex justify-between gap-1">
              {calendarDays.map((day) => (
                <div key={day.date} className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                      day.hasActivity
                        ? 'bg-orange-500 text-white'
                        : day.isToday
                        ? 'border-2 border-dashed border-orange-300 dark:border-orange-700'
                        : 'bg-muted'
                    )}
                  >
                    {day.hasActivity ? (
                      <Flame className="w-4 h-4" />
                    ) : (
                      format(new Date(day.date), 'd')
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(day.date), 'EEE', { locale: fr })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
            <p className="text-lg font-bold">{streakData?.longest_streak || 0}</p>
            <p className="text-xs text-muted-foreground">Record</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <p className="text-lg font-bold">{streakData?.total_active_days || 0}</p>
            <p className="text-xs text-muted-foreground">Jours actifs</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Shield className="w-5 h-5 mx-auto mb-1 text-purple-500" />
            <p className="text-lg font-bold">{streakData?.freeze_count || 0}</p>
            <p className="text-xs text-muted-foreground">Protections</p>
          </div>
        </div>

        {/* Next milestone */}
        {nextMilestone && (
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Prochain objectif</p>
                <p className="text-xs text-muted-foreground">
                  {nextMilestone.milestone - (streakData?.current_streak || 0)} jours restants
                </p>
              </div>
              <Badge variant="outline">{nextMilestone.reward}</Badge>
            </div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    ((streakData?.current_streak || 0) / nextMilestone.milestone) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { useRecordActivity };
export default StreakTracker;
