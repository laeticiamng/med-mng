import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Flame, ArrowLeft, Calendar, Trophy, TrendingUp, Sparkles } from 'lucide-react';
import { useRitualStats, useRitualHistory } from '@/hooks/useRituals';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { cn } from '@/lib/utils';
import { format, subDays, eachDayOfInterval, isSameDay, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import logger from '@/lib/logger';

// Hook for getting user streak data from user_streaks table
const useUserStreak = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-streak', user?.id],
    queryFn: async () => {
      if (!user) return null;

      try {
        const { data, error } = await (supabase as any)
          .from('user_streaks')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === '42P01' || error.code === 'PGRST116') {
            return null;
          }
          throw error;
        }

        return data;
      } catch (error) {
        logger.error('Error fetching user streak:', error);
        return null;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for getting 49 days of ritual completion history (7 weeks)
const useStreakHistory = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['streak-history', user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        const endDate = new Date();
        const startDate = subDays(endDate, 48); // 49 days total (today + 48 previous)

        const { data, error } = await (supabase as any)
          .from('ritual_completions')
          .select('completed_at')
          .eq('user_id', user.id)
          .gte('completed_at', startDate.toISOString())
          .lte('completed_at', endDate.toISOString());

        if (error) {
          if (error.code === '42P01') return [];
          throw error;
        }

        // Get unique completion dates
        const completionDates = new Set(
          (data || []).map((c: { completed_at: string }) =>
            format(new Date(c.completed_at), 'yyyy-MM-dd')
          )
        );

        // Generate array of 49 days
        const days = eachDayOfInterval({ start: startDate, end: endDate });

        return days.map((day) => ({
          date: day,
          completed: completionDates.has(format(day, 'yyyy-MM-dd')),
          isToday: isSameDay(day, new Date()),
        }));
      } catch (error) {
        logger.error('Error fetching streak history:', error);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};

export default function WellnessStreak() {
  const { user } = useAuth();
  const { data: streakData, isLoading: streakLoading } = useUserStreak();
  const { data: ritualStats } = useRitualStats();
  const { data: historyData, isLoading: historyLoading } = useStreakHistory();

  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  // Calculate stats from data
  const stats = useMemo(() => {
    const currentStreak = streakData?.current_streak || ritualStats?.currentStreak || 0;
    const longestStreak = streakData?.longest_streak || ritualStats?.longestStreak || 0;
    const totalDays = streakData?.total_active_days || ritualStats?.totalCompletions || 0;

    return {
      currentStreak,
      longestStreak,
      totalDays,
    };
  }, [streakData, ritualStats]);

  // Calculate next milestone
  const nextMilestone = useMemo(() => {
    const milestones = [7, 14, 21, 30, 50, 75, 100, 150, 200, 365];
    const nextGoal = milestones.find((m) => m > stats.currentStreak) || stats.currentStreak + 50;
    const progress = Math.round((stats.currentStreak / nextGoal) * 100);
    const daysRemaining = nextGoal - stats.currentStreak;

    const badgeNames: Record<number, string> = {
      7: 'Débutant',
      14: 'Habitué',
      21: 'Motivé',
      30: 'Champion',
      50: 'Champion 50',
      75: 'Expert',
      100: 'Maître',
      150: 'Légende',
      200: 'Titan',
      365: 'Invincible',
    };

    return {
      goal: nextGoal,
      progress: Math.min(progress, 100),
      daysRemaining,
      badgeName: badgeNames[nextGoal] || `Champion ${nextGoal}`,
    };
  }, [stats.currentStreak]);

  const isLoading = streakLoading || historyLoading;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Card>
            <CardContent className="py-12 text-center">
              <Flame className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Connectez-vous pour voir votre série de jours
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Série de Jours | Med-Mng</title>
        <meta name="description" content="Maintenez votre motivation avec votre série quotidienne" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Link to={ROUTE_PATHS.wellness}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au Bien-être
            </Button>
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Série de Jours</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-300">
                  <Flame className="w-6 h-6 text-orange-600" />
                  Série Actuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-16 w-24" />
                ) : (
                  <>
                    <div className="text-5xl font-bold text-orange-600 mb-1">
                      {stats.currentStreak}
                    </div>
                    <div className="text-orange-900 dark:text-orange-300">jours consécutifs</div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                  Record Personnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-16 w-24" />
                ) : (
                  <>
                    <div className="text-5xl font-bold text-yellow-600 mb-1">
                      {stats.longestStreak}
                    </div>
                    <div className="text-muted-foreground">jours maximum</div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-16 w-24" />
                ) : (
                  <>
                    <div className="text-5xl font-bold text-green-600 mb-1">{stats.totalDays}</div>
                    <div className="text-muted-foreground">jours au total</div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Historique des 7 Dernières Semaines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {Array.from({ length: 56 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {weekDays.map((day, i) => (
                      <div key={i} className="text-center text-xs text-muted-foreground font-medium">
                        {day}
                      </div>
                    ))}
                    {historyData?.map((entry, index) => (
                      <div
                        key={index}
                        className={cn(
                          'aspect-square rounded transition-colors cursor-pointer',
                          entry.completed
                            ? 'bg-orange-500 hover:bg-orange-600'
                            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600',
                          entry.isToday && 'ring-2 ring-primary'
                        )}
                        title={`${format(entry.date, 'dd MMM', { locale: fr })} ${
                          entry.completed ? '✓' : '✗'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-orange-500"></div>
                      <span>Complété</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
                      <span>Manqué</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Next milestone card */}
          <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="py-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    Prochaine récompense
                  </h3>
                  <p className="text-muted-foreground">
                    {nextMilestone.daysRemaining > 0 ? (
                      <>
                        Plus que <strong>{nextMilestone.daysRemaining} jours</strong> pour atteindre{' '}
                        {nextMilestone.goal} jours et débloquer le badge "
                        <strong>{nextMilestone.badgeName}</strong>" !
                      </>
                    ) : (
                      <>
                        Félicitations ! Vous avez atteint {nextMilestone.goal} jours !
                      </>
                    )}
                  </p>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  {nextMilestone.goal} jours
                </Badge>
              </div>
              <Progress value={nextMilestone.progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2 text-right">
                {stats.currentStreak} / {nextMilestone.goal} jours
              </p>
            </CardContent>
          </Card>

          {/* Achievements section */}
          {stats.currentStreak >= 7 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Badges débloqués
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {[
                    { days: 7, name: 'Débutant', icon: '🌱' },
                    { days: 14, name: 'Habitué', icon: '🌿' },
                    { days: 21, name: 'Motivé', icon: '🌳' },
                    { days: 30, name: 'Champion', icon: '🏆' },
                    { days: 50, name: 'Champion 50', icon: '⭐' },
                    { days: 75, name: 'Expert', icon: '💎' },
                    { days: 100, name: 'Maître', icon: '👑' },
                  ]
                    .filter((badge) => stats.longestStreak >= badge.days)
                    .map((badge) => (
                      <Badge
                        key={badge.days}
                        variant="secondary"
                        className="py-2 px-3 text-sm"
                      >
                        <span className="mr-2">{badge.icon}</span>
                        {badge.name}
                      </Badge>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
