import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useQuizHistory } from '@/hooks/useQuizHistory';

interface QuizProgressChartProps {
  itemCode: string;
}

export const QuizProgressChart: React.FC<QuizProgressChartProps> = ({ itemCode }) => {
  const { history, loading } = useQuizHistory(itemCode);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="h-24 flex items-center justify-center">
            <div className="animate-pulse bg-muted rounded h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return null;
  }

  // Calculate trend
  const scores = history.map(h => h.score);
  const recentScores = scores.slice(0, 5);
  const olderScores = scores.slice(5, 10);
  
  const recentAvg = recentScores.length > 0 
    ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length 
    : 0;
  const olderAvg = olderScores.length > 0 
    ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length 
    : recentAvg;
  
  const trend = recentAvg - olderAvg;
  const maxScore = Math.max(...scores, 100);

  const getTrendIcon = () => {
    if (trend > 5) return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend < -5) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendText = () => {
    if (trend > 5) return 'En progression';
    if (trend < -5) return 'En baisse';
    return 'Stable';
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Progression
          </span>
          <span className="flex items-center gap-1 text-xs font-normal">
            {getTrendIcon()}
            {getTrendText()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mini bar chart */}
        <div className="flex items-end gap-1 h-16">
          {recentScores.slice().reverse().map((score, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-t transition-all hover:opacity-80"
              style={{
                height: `${(score / maxScore) * 100}%`,
                backgroundColor: score >= 80 
                  ? 'hsl(var(--success))' 
                  : score >= 60 
                    ? 'hsl(var(--warning))' 
                    : 'hsl(var(--destructive))',
                minHeight: '4px'
              }}
              title={`${Math.round(score)}%`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Plus ancien</span>
          <span>Récent</span>
        </div>
      </CardContent>
    </Card>
  );
};
