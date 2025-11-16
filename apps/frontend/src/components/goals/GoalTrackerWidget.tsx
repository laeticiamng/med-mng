import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Trophy,
  Flame,
} from 'lucide-react';
import {
  useActiveGoals,
  useGoalStats,
  useGoalsByCategory,
  useUpdateGoalProgress,
} from '@/hooks/useGoals';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export const GoalTrackerWidget: React.FC = () => {
  const { data: activeGoals = [], isLoading: goalsLoading } = useActiveGoals();
  const { data: stats, isLoading: statsLoading } = useGoalStats();
  const { data: categoryStats = [] } = useGoalsByCategory();

  if (goalsLoading || statsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Mes Objectifs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalGoals === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Mes Objectifs
          </CardTitle>
          <CardDescription>
            Définissez vos objectifs d'apprentissage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm mb-4">Aucun objectif défini</p>
            <Link to="/goals">
              <Button size="sm">
                <Target className="mr-2 h-4 w-4" />
                Créer un objectif
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const urgentGoals = activeGoals.filter(goal => {
    const daysRemaining = differenceInDays(new Date(goal.target_date), new Date());
    return daysRemaining >= 0 && daysRemaining <= 7;
  });

  const overdueGoals = activeGoals.filter(goal => {
    const daysRemaining = differenceInDays(new Date(goal.target_date), new Date());
    return daysRemaining < 0;
  });

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Objectifs actifs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeGoals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalGoals} au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taux de réussite</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completionRate.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.completedGoals} complétés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">XP gagnés</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalXpEarned}
            </div>
            <p className="text-xs text-muted-foreground">
              Total accumulé
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Temps moyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageDaysToComplete.toFixed(0)}j
            </div>
            <p className="text-xs text-muted-foreground">
              Pour compléter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Urgent/Overdue Alerts */}
      {(urgentGoals.length > 0 || overdueGoals.length > 0) && (
        <div className="space-y-3">
          {overdueGoals.length > 0 && (
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Objectifs en retard ({overdueGoals.length})
                </CardTitle>
                <CardDescription>
                  Ces objectifs ont dépassé leur date d'échéance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overdueGoals.slice(0, 3).map((goal) => {
                    const daysOverdue = Math.abs(differenceInDays(new Date(goal.target_date), new Date()));
                    return (
                      <div
                        key={goal.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20"
                      >
                        <div>
                          <p className="font-medium text-sm">{goal.title}</p>
                          <p className="text-xs text-muted-foreground">
                            En retard de {daysOverdue} jour{daysOverdue > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{goal.progress_percentage}%</div>
                          <Progress value={goal.progress_percentage} className="w-20 h-2 mt-1" />
                        </div>
                      </div>
                    );
                  })}
                  {overdueGoals.length > 3 && (
                    <p className="text-xs text-center text-muted-foreground">
                      +{overdueGoals.length - 3} autres objectifs en retard
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {urgentGoals.length > 0 && (
            <Card className="border-yellow-200 dark:border-yellow-900">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-yellow-600">
                  <Clock className="h-5 w-5" />
                  Objectifs urgents ({urgentGoals.length})
                </CardTitle>
                <CardDescription>
                  Échéance dans moins de 7 jours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {urgentGoals.slice(0, 3).map((goal) => {
                    const daysRemaining = differenceInDays(new Date(goal.target_date), new Date());
                    return (
                      <div
                        key={goal.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">{goal.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{goal.progress_percentage}%</div>
                          <Progress value={goal.progress_percentage} className="w-20 h-2 mt-1" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Active Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Objectifs en cours</CardTitle>
          <CardDescription>
            Vos {activeGoals.length} objectif{activeGoals.length > 1 ? 's' : ''} actif{activeGoals.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeGoals.length > 0 ? (
            <div className="space-y-3">
              {activeGoals.slice(0, 5).map((goal) => (
                <GoalProgressCard key={goal.id} goal={goal} />
              ))}
              {activeGoals.length > 5 && (
                <Link to="/goals">
                  <Button variant="outline" className="w-full">
                    Voir tous les objectifs ({activeGoals.length})
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-600 opacity-50" />
              <p className="text-sm">Tous les objectifs sont complétés !</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Distribution */}
      {categoryStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progression par catégorie</CardTitle>
            <CardDescription>
              Distribution de vos objectifs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((cat) => {
                const getCategoryIcon = (category: string) => {
                  switch (category) {
                    case 'edn': return '📚';
                    case 'quiz': return '📝';
                    case 'study_time': return '⏱️';
                    case 'streak': return '🔥';
                    case 'badge': return '🏆';
                    default: return '🎯';
                  }
                };

                return (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(cat.category)}</span>
                        <span className="font-medium capitalize">{cat.category}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {cat.completedGoals}/{cat.totalGoals} complétés
                      </span>
                    </div>
                    <Progress value={cat.avgProgress} className="w-full" />
                    <div className="text-xs text-muted-foreground text-right">
                      {cat.avgProgress.toFixed(0)}% en moyenne
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardContent className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="font-semibold">Définissez de nouveaux objectifs</h3>
              <p className="text-sm text-muted-foreground">
                Restez motivé et suivez votre progression
              </p>
            </div>
          </div>
          <Link to="/goals">
            <Button>
              <Target className="mr-2 h-4 w-4" />
              Gérer mes objectifs
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

interface GoalProgressCardProps {
  goal: {
    id: string;
    title: string;
    progress_percentage: number;
    current_value: number;
    target_value: number;
    unit: string | null;
    category: string;
  };
}

const GoalProgressCard: React.FC<GoalProgressCardProps> = ({ goal }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'edn': return '📚';
      case 'quiz': return '📝';
      case 'study_time': return '⏱️';
      case 'streak': return '🔥';
      case 'badge': return '🏆';
      default: return '🎯';
    }
  };

  return (
    <div className="p-4 rounded-lg border hover:bg-accent transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getCategoryIcon(goal.category)}</span>
          <div>
            <p className="font-medium text-sm">{goal.title}</p>
            <p className="text-xs text-muted-foreground">
              {goal.current_value} / {goal.target_value} {goal.unit || ''}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold">{goal.progress_percentage}%</div>
        </div>
      </div>
      <Progress value={goal.progress_percentage} className="w-full" />
    </div>
  );
};
