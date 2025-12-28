import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Trophy, 
  Flame, 
  Target, 
  Clock, 
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useGamification } from '@/hooks/useGamification';
import { QuizProgressChart } from './quiz/QuizProgressChart';
import { ProgressHeatmap } from './quiz/ProgressHeatmap';

interface RevisionDashboardProps {
  itemCode?: string;
  itemTitle?: string;
  onStartRevision?: () => void;
}

interface DashboardStats {
  totalQuizzes: number;
  avgScore: number;
  bestScore: number;
  masteredCompetences: number;
  totalCompetences: number;
  lastActivity: string | null;
  // Comparaison temporelle
  prevWeekQuizzes?: number;
  prevWeekAvgScore?: number;
}

export const RevisionDashboard: React.FC<RevisionDashboardProps> = ({
  itemCode,
  itemTitle,
  onStartRevision
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { stats: gamificationStats, loadStats } = useGamification();

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      loadStats(user.id);

      // Fetch quiz results - global or per item
      let quizQuery = supabase
        .from('quiz_results')
        .select('score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (itemCode) {
        quizQuery = quizQuery.eq('item_code', itemCode);
      }
      
      const { data: quizResults } = await quizQuery.limit(100);

      // Fetch mastery data - global or per item
      let masteryQuery = supabase
        .from('user_competence_mastery')
        .select('is_mastered')
        .eq('user_id', user.id);
      
      if (itemCode) {
        masteryQuery = masteryQuery.eq('item_code', itemCode);
      }
      
      const { data: masteryData } = await masteryQuery;

      // Calcul comparaison temporelle (semaine actuelle vs précédente)
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const currentWeekResults = quizResults?.filter(r => new Date(r.created_at) >= oneWeekAgo) || [];
      const prevWeekResults = quizResults?.filter(r => {
        const date = new Date(r.created_at);
        return date >= twoWeeksAgo && date < oneWeekAgo;
      }) || [];

      const currentWeekScores = currentWeekResults.map(r => r.score);
      const prevWeekScores = prevWeekResults.map(r => r.score);

      const scores = quizResults?.map(r => r.score) || [];
      const mastered = masteryData?.filter(m => m.is_mastered).length || 0;
      const total = masteryData?.length || 0;

      setStats({
        totalQuizzes: scores.length,
        avgScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
        bestScore: scores.length > 0 ? Math.max(...scores) : 0,
        masteredCompetences: mastered,
        totalCompetences: total,
        lastActivity: quizResults?.[0]?.created_at || null,
        prevWeekQuizzes: prevWeekResults.length,
        prevWeekAvgScore: prevWeekScores.length > 0 
          ? prevWeekScores.reduce((a, b) => a + b, 0) / prevWeekScores.length 
          : undefined
      });

      setLoading(false);
    };

    fetchStats();
  }, [itemCode, loadStats]);

  const getMasteryLevel = () => {
    if (!stats || stats.totalCompetences === 0) return 'Débutant';
    const ratio = stats.masteredCompetences / stats.totalCompetences;
    if (ratio >= 0.9) return 'Expert';
    if (ratio >= 0.7) return 'Avancé';
    if (ratio >= 0.4) return 'Intermédiaire';
    return 'Débutant';
  };

  const getMasteryColor = () => {
    if (!stats || stats.totalCompetences === 0) return 'text-muted-foreground';
    const ratio = stats.masteredCompetences / stats.totalCompetences;
    if (ratio >= 0.9) return 'text-success';
    if (ratio >= 0.7) return 'text-primary';
    if (ratio >= 0.4) return 'text-warning';
    return 'text-muted-foreground';
  };

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-20 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Tableau de bord - {itemCode}
              </CardTitle>
              {itemTitle && (
                <CardDescription className="mt-1">{itemTitle}</CardDescription>
              )}
            </div>
            {gamificationStats && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Flame className="h-3 w-3 text-warning" />
                  {gamificationStats?.currentStreak ?? 0}j
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Trophy className="h-3 w-3 text-primary" />
                  Nv.{gamificationStats?.level ?? 1}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold">{stats?.totalQuizzes || 0}</div>
              <div className="text-xs text-muted-foreground">Quiz effectués</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-success" />
              <div className="text-2xl font-bold">{Math.round(stats?.avgScore || 0)}%</div>
              <div className="text-xs text-muted-foreground">Score moyen</div>
              {stats?.prevWeekAvgScore !== undefined && (
                <div className={`text-xs mt-1 ${
                  (stats.avgScore || 0) >= stats.prevWeekAvgScore ? 'text-success' : 'text-destructive'
                }`}>
                  {(stats.avgScore || 0) >= stats.prevWeekAvgScore ? '↑' : '↓'} 
                  vs sem. préc. ({Math.round(stats.prevWeekAvgScore)}%)
                </div>
              )}
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <Trophy className="h-5 w-5 mx-auto mb-1 text-warning" />
              <div className="text-2xl font-bold">{Math.round(stats?.bestScore || 0)}%</div>
              <div className="text-xs text-muted-foreground">Meilleur score</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <CheckCircle className="h-5 w-5 mx-auto mb-1 text-success" />
              <div className="text-2xl font-bold">
                {stats?.masteredCompetences || 0}/{stats?.totalCompetences || 0}
              </div>
              <div className="text-xs text-muted-foreground">Maîtrisées</div>
            </div>
          </div>

          {/* Mastery Progress */}
          {stats && stats.totalCompetences > 0 && (
            <div className="mt-4 p-3 bg-background/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Niveau de maîtrise</span>
                <Badge className={getMasteryColor()}>{getMasteryLevel()}</Badge>
              </div>
              <Progress 
                value={(stats.masteredCompetences / stats.totalCompetences) * 100} 
                className="h-2"
              />
            </div>
          )}

          {/* CTA Button */}
          {onStartRevision && (
            <Button 
              onClick={onStartRevision} 
              className="w-full mt-4 gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Commencer la révision
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-4">
        <QuizProgressChart itemCode={itemCode} />
        <ProgressHeatmap itemCode={itemCode} days={28} />
      </div>
    </div>
  );
};
