import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuizResults, QuizResult } from '@/hooks/useQuizResults';
import { History, Trophy, TrendingUp, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface QuizHistoryPanelProps {
  itemCode?: string;
  compact?: boolean;
}

export const QuizHistoryPanel: React.FC<QuizHistoryPanelProps> = ({ 
  itemCode, 
  compact = false 
}) => {
  const { results, loading, fetchUserResults, getItemStats } = useQuizResults();
  const [stats, setStats] = useState<{
    attempts: number;
    avgScore: number;
    bestScore: number;
    successRate: number;
  } | null>(null);
  const [isExpanded, setIsExpanded] = useState(!compact);

  useEffect(() => {
    fetchUserResults(itemCode);
    if (itemCode) {
      getItemStats(itemCode).then(setStats);
    }
  }, [itemCode, fetchUserResults, getItemStats]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  if (loading) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="p-4 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4 text-center text-muted-foreground text-sm">
          <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
          Aucun historique de quiz
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <History className="h-4 w-4" />
            Historique Quiz {itemCode && `- ${itemCode}`}
          </CardTitle>
          {compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-2 space-y-4">
          {/* Stats globales */}
          {stats && (
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-background/60 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-primary">{stats.attempts}</div>
                <div className="text-xs text-muted-foreground">Essais</div>
              </div>
              <div className="bg-background/60 rounded-lg p-2 text-center">
                <div className={`text-lg font-bold ${getScoreColor(stats.avgScore)}`}>
                  {stats.avgScore}%
                </div>
                <div className="text-xs text-muted-foreground">Moyenne</div>
              </div>
              <div className="bg-background/60 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-success">{stats.bestScore}%</div>
                <div className="text-xs text-muted-foreground">Meilleur</div>
              </div>
              <div className="bg-background/60 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-accent-foreground">
                  {stats.successRate}%
                </div>
                <div className="text-xs text-muted-foreground">Réussite</div>
              </div>
            </div>
          )}

          {/* Liste des résultats */}
          <ScrollArea className="max-h-[200px]">
            <div className="space-y-2">
              {results.slice(0, compact ? 5 : 10).map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-2 bg-background/40 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-2">
                    {result.score >= 80 ? (
                      <Trophy className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium">{result.item_code}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={result.score >= 80 ? 'default' : result.score >= 60 ? 'secondary' : 'destructive'}
                      className="font-mono"
                    >
                      {result.score}%
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(result.time_spent)}
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {format(new Date(result.created_at), 'dd MMM', { locale: fr })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
};
