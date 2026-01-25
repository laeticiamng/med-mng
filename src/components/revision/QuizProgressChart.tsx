import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Calendar, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface QuizResult {
  id: string;
  item_code: string;
  item_title: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_spent: number;
  created_at: string;
  performance: any;
}

export const QuizProgressChart: React.FC = () => {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    const loadQuizResults = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { _data, _error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (_data) {
        setQuizResults(_data as QuizResult[]);
      }
      setLoading(false);
    };

    loadQuizResults();
  }, []);

  // Préparer les données pour le graphique par jour
  const getChartData = () => {
    const now = new Date();
    let startDate = new Date();
    
    if (viewMode === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (viewMode === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setMonth(now.getMonth() - 3);
    }

    const filteredResults = quizResults.filter(r => 
      new Date(r.created_at) >= startDate
    );

    // Grouper par jour
    const dailyData: { [key: string]: { date: string; quizCount: number; avgScore: number; totalScore: number } } = {};
    
    filteredResults.forEach(result => {
      const dateKey = new Date(result.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { date: dateKey, quizCount: 0, avgScore: 0, totalScore: 0 };
      }
      dailyData[dateKey].quizCount++;
      dailyData[dateKey].totalScore += result.score;
      dailyData[dateKey].avgScore = Math.round(dailyData[dateKey].totalScore / dailyData[dateKey].quizCount);
    });

    return Object.values(dailyData).reverse();
  };

  // Stats globales
  const getStats = () => {
    if (quizResults.length === 0) return null;

    const totalQuizzes = quizResults.length;
    const avgScore = Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / totalQuizzes);
    const bestScore = Math.max(...quizResults.map(r => r.score));
    const totalQuestions = quizResults.reduce((sum, r) => sum + r.total_questions, 0);
    const totalCorrect = quizResults.reduce((sum, r) => sum + r.correct_answers, 0);
    const avgTimePerQuiz = Math.round(quizResults.reduce((sum, r) => sum + (r.time_spent || 0), 0) / totalQuizzes / 60);

    // Items uniques révisés
    const uniqueItems = new Set(quizResults.map(r => r.item_code)).size;

    return { totalQuizzes, avgScore, bestScore, totalQuestions, totalCorrect, avgTimePerQuiz, uniqueItems };
  };

  const chartData = getChartData();
  const stats = getStats();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-2" />
          <span className="text-muted-foreground">Chargement des résultats...</span>
        </CardContent>
      </Card>
    );
  }

  if (quizResults.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Historique des Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucun quiz complété pour le moment.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Commencez à réviser pour voir votre progression !
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats rapides */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalQuizzes}</div>
              <div className="text-sm text-muted-foreground">Quiz complétés</div>
            </CardContent>
          </Card>
          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{stats.avgScore}%</div>
              <div className="text-sm text-muted-foreground">Score moyen</div>
            </CardContent>
          </Card>
          <Card className="bg-warning/5 border-warning/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">{stats.bestScore}%</div>
              <div className="text-sm text-muted-foreground">Meilleur score</div>
            </CardContent>
          </Card>
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent-foreground">{stats.uniqueItems}</div>
              <div className="text-sm text-muted-foreground">Items révisés</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Graphique de progression */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Évolution des scores
              </CardTitle>
              <CardDescription>Votre progression au fil du temps</CardDescription>
            </div>
            <div className="flex gap-1">
              <Button 
                variant={viewMode === 'week' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('week')}
              >
                7j
              </Button>
              <Button 
                variant={viewMode === 'month' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('month')}
              >
                30j
              </Button>
              <Button 
                variant={viewMode === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('all')}
              >
                Tout
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis domain={[0, 100]} className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'avgScore' ? `${value}%` : value,
                    name === 'avgScore' ? 'Score moyen' : 'Quiz'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="hsl(var(--primary))" 
                  fill="url(#scoreGradient)"
                  strokeWidth={2}
                />
                <Bar dataKey="quizCount" fill="hsl(var(--accent))" opacity={0.5} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Pas de données pour cette période
            </div>
          )}
        </CardContent>
      </Card>

      {/* Derniers quiz */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Derniers quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {quizResults.slice(0, 5).map((result) => (
              <div 
                key={result.id} 
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{result.item_code}</Badge>
                    <span className="font-medium text-sm truncate">
                      {result.item_title || 'Quiz EDN'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{result.correct_answers}/{result.total_questions} bonnes réponses</span>
                    <span>{new Date(result.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <div className={`text-lg font-bold ${
                  result.score >= 80 ? 'text-success' : 
                  result.score >= 60 ? 'text-warning' : 'text-destructive'
                }`}>
                  {result.score}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
