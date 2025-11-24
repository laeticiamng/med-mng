import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  useStudyPlanProgress,
  useUpcomingSessions,
  useOverdueSessions,
  useCompleteSession,
} from '@/hooks/useStudyPlanProgress';
import logger from '@/lib/logger';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Target,
  TrendingUp,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export const StudyPlanWidget: React.FC = () => {
  const { data: stats, isLoading } = useStudyPlanProgress();
  const { data: upcomingSessions = [] } = useUpcomingSessions(7);
  const { data: overdueSessions = [] } = useOverdueSessions();
  const completeSession = useCompleteSession();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Plans d'étude
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

  if (!stats || stats.totalPlans === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Plans d'étude
          </CardTitle>
          <CardDescription>
            Créez votre premier plan d'étude
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Aucun plan d'étude</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleCompleteSession = async (sessionId: string, title: string) => {
    try {
      await completeSession.mutateAsync({ sessionId });
    } catch (error) {
      logger.error('Error completing session:', error);
    }
  };

  const getPriorityColor = (count: number) => {
    if (count === 0) return 'text-green-600';
    if (count <= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Plans actifs</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePlans}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPlans} plans au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Progression</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageProgress.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Moyenne des plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completedSessions}/{stats.totalSessions}
            </div>
            <p className="text-xs text-muted-foreground">
              Complétées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">À venir</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.upcomingSessions}
            </div>
            <p className={`text-xs ${getPriorityColor(stats.overdueSessionsCount)}`}>
              {stats.overdueSessionsCount} en retard
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vue d'ensemble</CardTitle>
          <CardDescription>
            État de vos plans d'étude
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Complétés
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.completedPlans}
              </div>
            </div>

            <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <PlayCircle className="h-4 w-4 text-blue-600" />
                En cours
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.activePlans}
              </div>
            </div>

            <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <PauseCircle className="h-4 w-4" />
                En pause
              </div>
              <div className="text-2xl font-bold">
                {stats.pausedPlans}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progression globale</span>
              <span className="font-medium">{stats.averageProgress.toFixed(1)}%</span>
            </div>
            <Progress value={stats.averageProgress} className="w-full" />
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm text-muted-foreground">
              Temps planifié total
            </div>
            <div className="text-lg font-bold">
              {Math.round(stats.totalTimeScheduled / 60)}h
              <span className="text-sm font-normal text-muted-foreground ml-1">
                ({stats.totalTimeScheduled} min)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Sessions Warning */}
      {overdueSessions.length > 0 && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Sessions en retard ({overdueSessions.length})
            </CardTitle>
            <CardDescription>
              Ces sessions devraient être complétées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueSessions.slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="font-medium text-sm">{session.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.plan_title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">
                      {format(new Date(session.scheduled_date), 'dd MMM', { locale: fr })}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCompleteSession(session.id, session.title)}
                      disabled={completeSession.isPending}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Compléter
                    </Button>
                  </div>
                </div>
              ))}
              {overdueSessions.length > 3 && (
                <p className="text-xs text-center text-muted-foreground">
                  +{overdueSessions.length - 3} autres sessions en retard
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sessions à venir (7 jours)</CardTitle>
            <CardDescription>
              Vos prochaines sessions d'étude
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingSessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{session.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.plan_title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right text-xs">
                      <div className="font-medium">
                        {format(new Date(session.scheduled_date), 'dd MMM yyyy', { locale: fr })}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.duration_minutes}min
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCompleteSession(session.id, session.title)}
                      disabled={completeSession.isPending}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Compléter
                    </Button>
                  </div>
                </div>
              ))}
              {upcomingSessions.length > 5 && (
                <p className="text-xs text-center text-muted-foreground pt-2">
                  +{upcomingSessions.length - 5} autres sessions planifiées
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
