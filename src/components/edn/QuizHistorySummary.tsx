import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Trophy, Target, Clock, Loader2 } from 'lucide-react';
import { useQuizHistory } from '@/hooks/useQuizHistory';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface QuizHistorySummaryProps {
  itemCode: string;
}

export const QuizHistorySummary: React.FC<QuizHistorySummaryProps> = ({ itemCode }) => {
  const { summary, loading } = useQuizHistory(itemCode);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!summary) {
    return (
      <Card className="border-muted">
        <CardContent className="p-4 text-center">
          <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Aucun quiz complété pour cet item
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Faites le quiz pour voir vos statistiques ici
          </p>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'bg-success/10 text-success border-success/20';
    if (score >= 60) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-destructive/10 text-destructive border-destructive/20';
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Historique des quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Trophy className="h-4 w-4 mx-auto mb-1 text-warning" />
            <div className={`text-lg font-bold ${getScoreColor(summary.bestScore)}`}>
              {Math.round(summary.bestScore)}%
            </div>
            <div className="text-xs text-muted-foreground">Meilleur</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Target className="h-4 w-4 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold text-foreground">
              {Math.round(summary.averageScore)}%
            </div>
            <div className="text-xs text-muted-foreground">Moyenne</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Clock className="h-4 w-4 mx-auto mb-1 text-accent" />
            <div className="text-lg font-bold text-foreground">
              {summary.totalAttempts}
            </div>
            <div className="text-xs text-muted-foreground">Essais</div>
          </div>
        </div>

        {summary.recentScores.length > 1 && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Derniers scores:</div>
            <div className="flex gap-1 flex-wrap">
              {summary.recentScores.map((score, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className={`text-xs ${getScoreBadgeVariant(score)}`}
                >
                  {Math.round(score)}%
                </Badge>
              ))}
            </div>
          </div>
        )}

        {summary.lastAttempt && (
          <p className="text-xs text-muted-foreground text-center pt-1 border-t">
            Dernier essai: {formatDistanceToNow(new Date(summary.lastAttempt), { addSuffix: true, locale: fr })}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
