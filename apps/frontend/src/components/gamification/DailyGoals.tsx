import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Target,
  Trophy,
  Flame,
  BookOpen,
  Music,
  MessageSquare,
  CheckCircle,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import logger from '@/lib/logger';

interface DailyGoal {
  id: string;
  user_id: string;
  goal_type: 'items_viewed' | 'quiz_completed' | 'study_time' | 'music_generated' | 'chat_messages';
  target_value: number;
  current_value: number;
  completed: boolean;
  xp_reward: number;
  date: string;
  completed_at?: string;
}

interface DailyGoalsConfig {
  items_viewed: { icon: React.ReactNode; label: string; unit: string };
  quiz_completed: { icon: React.ReactNode; label: string; unit: string };
  study_time: { icon: React.ReactNode; label: string; unit: string };
  music_generated: { icon: React.ReactNode; label: string; unit: string };
  chat_messages: { icon: React.ReactNode; label: string; unit: string };
}

const goalConfig: DailyGoalsConfig = {
  items_viewed: {
    icon: <BookOpen className="w-4 h-4" />,
    label: 'Items consultés',
    unit: 'items',
  },
  quiz_completed: {
    icon: <Target className="w-4 h-4" />,
    label: 'Quiz complétés',
    unit: 'quiz',
  },
  study_time: {
    icon: <Clock className="w-4 h-4" />,
    label: 'Temps d\'étude',
    unit: 'minutes',
  },
  music_generated: {
    icon: <Music className="w-4 h-4" />,
    label: 'Musiques générées',
    unit: 'chansons',
  },
  chat_messages: {
    icon: <MessageSquare className="w-4 h-4" />,
    label: 'Messages IA',
    unit: 'messages',
  },
};

const useDailyGoals = (userId: string | undefined) => {
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['daily-goals', userId, today],
    queryFn: async (): Promise<DailyGoal[]> => {
      if (!userId) return [];

      // First, check if goals exist for today
      const { data: existingGoals, error: fetchError } = await (supabase as any)
        .from('daily_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today);

      if (fetchError) {
        logger.error('Error fetching daily goals:', fetchError);
        throw fetchError;
      }

      // If goals exist, return them
      if (existingGoals && existingGoals.length > 0) {
        return existingGoals;
      }

      // Otherwise, create default goals for today
      const defaultGoals = [
        { goal_type: 'items_viewed', target_value: 5, xp_reward: 50 },
        { goal_type: 'quiz_completed', target_value: 2, xp_reward: 100 },
        { goal_type: 'study_time', target_value: 30, xp_reward: 75 },
      ];

      const goalsToInsert = defaultGoals.map((goal) => ({
        user_id: userId,
        ...goal,
        current_value: 0,
        completed: false,
        date: today,
      }));

      const { data: newGoals, error: insertError } = await (supabase as any)
        .from('daily_goals')
        .insert(goalsToInsert)
        .select();

      if (insertError) {
        // Table might not exist, return empty array
        logger.warn('Daily goals table might not exist:', insertError);
        return [];
      }

      return newGoals || [];
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
};

const useUpdateGoalProgress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  return useMutation({
    mutationFn: async ({
      goalId,
      newValue,
    }: {
      goalId: string;
      newValue: number;
    }) => {
      const { data: goal, error: fetchError } = await (supabase as any)
        .from('daily_goals')
        .select('*')
        .eq('id', goalId)
        .single();

      if (fetchError) throw fetchError;

      const completed = newValue >= goal.target_value;
      const updateData: any = {
        current_value: newValue,
        completed,
      };

      if (completed && !goal.completed) {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await (supabase as any)
        .from('daily_goals')
        .update(updateData)
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;

      // Award XP if completed
      if (completed && !goal.completed && goal.xp_reward > 0) {
        await (supabase as any).rpc('add_user_xp', {
          p_user_id: goal.user_id,
          p_xp_amount: goal.xp_reward,
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-goals', user?.id, today] });
    },
    onError: (error) => {
      logger.error('Error updating goal progress:', error);
      toast.error('Erreur lors de la mise à jour de l\'objectif');
    },
  });
};

interface DailyGoalsProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const DailyGoals: React.FC<DailyGoalsProps> = ({
  className,
  variant = 'full',
}) => {
  const { user } = useAuth();
  const { data: goals, isLoading, refetch } = useDailyGoals(user?.id);

  const stats = useMemo(() => {
    if (!goals || goals.length === 0) {
      return { completed: 0, total: 0, percentage: 0, totalXP: 0, earnedXP: 0 };
    }

    const completed = goals.filter((g) => g.completed).length;
    const total = goals.length;
    const totalXP = goals.reduce((sum, g) => sum + g.xp_reward, 0);
    const earnedXP = goals
      .filter((g) => g.completed)
      .reduce((sum, g) => sum + g.xp_reward, 0);

    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
      totalXP,
      earnedXP,
    };
  }, [goals]);

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Connectez-vous pour voir vos objectifs quotidiens
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-semibold">Objectifs du jour</span>
            </div>
            <Badge variant={stats.completed === stats.total ? 'default' : 'secondary'}>
              {stats.completed}/{stats.total}
            </Badge>
          </div>
          <Progress value={stats.percentage} className="h-2 mb-2" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{stats.percentage}% complété</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-500" />
              {stats.earnedXP}/{stats.totalXP} XP
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Objectifs quotidiens
            </CardTitle>
            <CardDescription>
              Complétez vos objectifs pour gagner des XP
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress summary */}
        <div className="mt-4 p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progression du jour</span>
            <div className="flex items-center gap-2">
              {stats.completed === stats.total && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Terminé !
                </Badge>
              )}
              <span className="text-sm font-bold">
                {stats.completed}/{stats.total}
              </span>
            </div>
          </div>
          <Progress value={stats.percentage} className="h-3 mb-2" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {stats.percentage}% complété
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              {stats.earnedXP}/{stats.totalXP} XP gagnés
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {goals && goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map((goal) => {
              const config = goalConfig[goal.goal_type];
              const progress = Math.min(100, (goal.current_value / goal.target_value) * 100);

              return (
                <div
                  key={goal.id}
                  className={cn(
                    'p-4 rounded-lg border transition-colors',
                    goal.completed
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      : 'bg-card hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'p-2 rounded-lg',
                          goal.completed
                            ? 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-400'
                            : 'bg-muted'
                        )}
                      >
                        {config?.icon || <Target className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{config?.label || goal.goal_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {goal.current_value}/{goal.target_value} {config?.unit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          goal.completed && 'bg-green-100 text-green-800 border-green-200'
                        )}
                      >
                        +{goal.xp_reward} XP
                      </Badge>
                      {goal.completed && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                  <Progress
                    value={progress}
                    className={cn('h-2', goal.completed && '[&>div]:bg-green-500')}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Aucun objectif configuré pour aujourd'hui
            </p>
          </div>
        )}

        {/* Bonus for completing all */}
        {stats.total > 0 && stats.completed === stats.total && (
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-200 dark:bg-yellow-800">
                <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-400">
                  Tous les objectifs complétés !
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-500">
                  Revenez demain pour de nouveaux défis
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-orange-600">+1</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyGoals;
