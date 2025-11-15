import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuizProgress, useQuizHistory } from '@/hooks/useQuizProgress';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  Clock,
  TrendingUp,
  Award,
  BookCheck,
  BarChart3,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const QuizStatsWidget: React.FC = () => {
  const { data: stats, isLoading } = useQuizProgress();
  const { data: recentQuizzes = [] } = useQuizHistory(5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Statistiques de Quiz
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

  if (!stats || stats.totalQuizzes === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Statistiques de Quiz
          </CardTitle>
          <CardDescription>
            Commencez à pratiquer pour voir vos statistiques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BookCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Aucun quiz complété</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quiz complétés</CardTitle>
            <BookCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">
              {stats.itemsPracticed} items pratiqués
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
              {stats.averageScore.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Taux de réussite: {stats.successRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalCorrect}/{stats.totalQuestions}
            </div>
            <p className="text-xs text-muted-foreground">
              Bonnes réponses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Temps total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalTimeHours.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(stats.totalTimeHours * 60)} minutes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Globale</CardTitle>
          <CardDescription>
            Votre progression dans les quiz EDN
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Taux de réussite</span>
              <span className="font-medium">{stats.successRate.toFixed(1)}%</span>
            </div>
            <Progress value={stats.successRate} className="w-full" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Meilleur score
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.bestScore}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                Score minimum
              </div>
              <div className="text-2xl font-bold">
                {stats.worstScore}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Quiz History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quiz récents</CardTitle>
          <CardDescription>
            Vos 5 derniers quiz complétés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  {quiz.score >= 70 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{quiz.item_code}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(quiz.completed_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getScoreBadgeVariant(quiz.score)}>
                    {quiz.score}%
                  </Badge>
                  <Badge variant="outline">
                    Rang {quiz.rang}
                  </Badge>
                  <div className="text-xs text-muted-foreground text-right">
                    {quiz.correct_answers}/{quiz.questions_count}
                    {quiz.time_spent_seconds && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.round(quiz.time_spent_seconds / 60)}min
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
