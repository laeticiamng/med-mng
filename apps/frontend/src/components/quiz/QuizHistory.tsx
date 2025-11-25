import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  ChevronRight,
  BarChart3,
  Award,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import logger from '@/lib/logger';

interface QuizSessionRecord {
  id: string;
  user_id: string;
  item_code: string;
  rang: 'A' | 'B' | 'mix';
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  time_spent_seconds: number;
  completed_at: string;
  created_at: string;
  questions_data?: {
    question_id: number;
    is_correct: boolean;
    time_spent: number;
  }[];
}

interface QuizHistoryStats {
  totalSessions: number;
  totalQuestions: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  streakDays: number;
}

interface QuizHistoryProps {
  itemCode?: string;
  limit?: number;
  showStats?: boolean;
  onSessionClick?: (session: QuizSessionRecord) => void;
}

const useQuizHistory = (userId: string | undefined, itemCode?: string, limit = 20) => {
  return useQuery({
    queryKey: ['quiz-history', userId, itemCode, limit],
    queryFn: async (): Promise<QuizSessionRecord[]> => {
      if (!userId) return [];

      let query = (supabase as any)
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (itemCode) {
        query = query.eq('item_code', itemCode);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error fetching quiz history:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
};

const useQuizStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['quiz-stats', userId],
    queryFn: async (): Promise<QuizHistoryStats> => {
      if (!userId) {
        return {
          totalSessions: 0,
          totalQuestions: 0,
          averageScore: 0,
          bestScore: 0,
          totalTimeSpent: 0,
          streakDays: 0,
        };
      }

      const { data, error } = await (supabase as any)
        .from('quiz_sessions')
        .select('score_percentage, total_questions, time_spent_seconds, completed_at')
        .eq('user_id', userId);

      if (error) {
        logger.error('Error fetching quiz stats:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          totalSessions: 0,
          totalQuestions: 0,
          averageScore: 0,
          bestScore: 0,
          totalTimeSpent: 0,
          streakDays: 0,
        };
      }

      const totalSessions = data.length;
      const totalQuestions = data.reduce((sum: number, s: any) => sum + (s.total_questions || 0), 0);
      const averageScore = data.reduce((sum: number, s: any) => sum + (s.score_percentage || 0), 0) / totalSessions;
      const bestScore = Math.max(...data.map((s: any) => s.score_percentage || 0));
      const totalTimeSpent = data.reduce((sum: number, s: any) => sum + (s.time_spent_seconds || 0), 0);

      // Calculate streak (consecutive days with quiz activity)
      const dates = data
        .map((s: any) => new Date(s.completed_at).toDateString())
        .filter((date: string, index: number, arr: string[]) => arr.indexOf(date) === index)
        .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());

      let streakDays = 0;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      if (dates[0] === today || dates[0] === yesterday) {
        streakDays = 1;
        for (let i = 1; i < dates.length; i++) {
          const diff = (new Date(dates[i - 1]).getTime() - new Date(dates[i]).getTime()) / 86400000;
          if (diff <= 1) {
            streakDays++;
          } else {
            break;
          }
        }
      }

      return {
        totalSessions,
        totalQuestions,
        averageScore: Math.round(averageScore * 10) / 10,
        bestScore,
        totalTimeSpent,
        streakDays,
      };
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (score >= 80) return 'default';
  if (score >= 60) return 'secondary';
  return 'destructive';
};

export const QuizHistory: React.FC<QuizHistoryProps> = ({
  itemCode,
  limit = 20,
  showStats = true,
  onSessionClick,
}) => {
  const { user } = useAuth();
  const { data: sessions, isLoading: sessionsLoading } = useQuizHistory(user?.id, itemCode, limit);
  const { data: stats, isLoading: statsLoading } = useQuizStats(user?.id);

  if (!user) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Connectez-vous pour voir votre historique de quiz
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-xs">Sessions</span>
                  </div>
                  <p className="text-2xl font-bold">{stats?.totalSessions || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-xs">Questions</span>
                  </div>
                  <p className="text-2xl font-bold">{stats?.totalQuestions || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs">Moyenne</span>
                  </div>
                  <p className={cn('text-2xl font-bold', getScoreColor(stats?.averageScore || 0))}>
                    {stats?.averageScore || 0}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Trophy className="w-4 h-4" />
                    <span className="text-xs">Meilleur</span>
                  </div>
                  <p className={cn('text-2xl font-bold', getScoreColor(stats?.bestScore || 0))}>
                    {stats?.bestScore || 0}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Temps total</span>
                  </div>
                  <p className="text-2xl font-bold">{formatDuration(stats?.totalTimeSpent || 0)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Award className="w-4 h-4" />
                    <span className="text-xs">Série</span>
                  </div>
                  <p className="text-2xl font-bold">{stats?.streakDays || 0} j</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Historique des quiz
          </CardTitle>
          <CardDescription>
            {itemCode ? `Quiz pour l'item ${itemCode}` : 'Tous vos quiz récents'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : sessions && sessions.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      'p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors',
                      onSessionClick && 'cursor-pointer'
                    )}
                    onClick={() => onSessionClick?.(session)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{session.item_code}</Badge>
                        <Badge variant="secondary">Rang {session.rang.toUpperCase()}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getScoreBadgeVariant(session.score_percentage)}>
                          {session.score_percentage}%
                        </Badge>
                        {onSessionClick && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {session.correct_answers}/{session.total_questions}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(session.time_spent_seconds)}
                        </span>
                      </div>
                      <span>
                        {formatDistanceToNow(new Date(session.completed_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>

                    <Progress
                      value={session.score_percentage}
                      className="h-1 mt-2"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">
                {itemCode
                  ? "Aucun quiz complété pour cet item"
                  : "Vous n'avez pas encore complété de quiz"}
              </p>
              <Button variant="outline">
                Commencer un quiz
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizHistory;
