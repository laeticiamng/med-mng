import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGamification, XP_PER_LEVEL } from '@/hooks/useGamification';
import { usePersonalizedRevision } from '@/hooks/usePersonalizedRevision';
import { supabase } from '@/integrations/supabase/client';
import {
    AlertCircle,
    Award,
    BookOpen,
    Brain,
    Calendar,
    CheckCircle2,
    Clock,
    Flame,
    Target,
    TrendingUp,
    Trophy,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ProgressAnalytics } from './ProgressAnalytics';
import { ProgressHeatmap } from './ProgressHeatmap';
import { QuizProgressChart } from './QuizProgressChart';
import { RevisionPlanCreator } from './RevisionPlanCreator';
import { TodayRevisionSession } from './TodayRevisionSession';

export const RevisionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('today');
  const [revisionHistory, setRevisionHistory] = useState<any[]>([]);
  const {
    loading,
    error,
    revisionItems,
    currentPlan,
    getTodayRevisionItems,
    getProgressStats,
    analyzeUserWeaknesses
  } = usePersonalizedRevision();
  
  const { stats: gamificationStats, loadStats } = useGamification();

  // Load gamification stats and revision history from DB
  useEffect(() => {
    const loadUserStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        loadStats(user.id);
        
        // Load revision history from Supabase
        const { data: historyData } = await supabase
          .from('revision_history')
          .select('item_code, score, session_date, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (historyData && historyData.length > 0) {
          const formatted = historyData.map(h => ({
            itemCode: h.item_code,
            score: h.score,
            timestamp: h.created_at,
            date: new Date(h.session_date).toLocaleDateString('fr-FR')
          }));
          setRevisionHistory(formatted);
        } else {
          // Fallback: try localStorage for existing data
          const savedHistory = localStorage.getItem('revision-history');
          if (savedHistory) {
            try {
              const parsed = JSON.parse(savedHistory);
              setRevisionHistory(parsed.slice(0, 20));
            } catch (e) {
              console.warn('Failed to parse revision history');
            }
          }
        }
      }
    };
    loadUserStats();
  }, [loadStats]);

  // Track revision session completion - save to DB
  const todayItems = getTodayRevisionItems();
  const stats = getProgressStats();
  const level = gamificationStats ? Math.floor((gamificationStats.currentXP || 0) / XP_PER_LEVEL) + 1 : 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2">Analyse de vos besoins de révision...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Erreur: {error}</span>
          </div>
          <Button 
            onClick={analyzeUserWeaknesses} 
            variant="outline" 
            className="mt-4"
          >
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gamification Banner */}
      {gamificationStats && (
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-warning/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Niveau {level}</p>
                  <p className="text-lg font-bold">{gamificationStats.currentXP || 0} XP</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-warning" />
                    <span className="text-xl font-bold">{gamificationStats.currentStreak || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Jours</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="text-xl font-bold">{gamificationStats.badges?.length || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Badges</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* En-tête avec statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary font-medium">Maîtrise globale</p>
                <p className="text-2xl font-bold text-primary">{stats.masteryRate}%</p>
              </div>
              <Trophy className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-success font-medium">Concepts maîtrisés</p>
                <p className="text-2xl font-bold text-success">{stats.masteredItems}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-warning-foreground font-medium">À réviser aujourd'hui</p>
                <p className="text-2xl font-bold text-warning-foreground">{todayItems.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-accent font-medium">Objectif quotidien</p>
                <p className="text-2xl font-bold text-accent">{currentPlan?.daily_target || 0}</p>
              </div>
              <Target className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal avec onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Aujourd'hui
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Plan de révision
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Progression
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Analyses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Session de révision du jour
              </CardTitle>
              <CardDescription>
                {todayItems.length > 0 
                  ? `${todayItems.length} concept(s) à réviser selon votre planning personnalisé`
                  : "Aucune révision programmée pour aujourd'hui - Excellent travail !"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayItems.length > 0 ? (
                <TodayRevisionSession items={todayItems} />
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-success mb-4" />
                  <p className="text-lg font-medium text-success">
                    Toutes vos révisions sont à jour !
                  </p>
                  <p className="text-success/80 mt-2">
                    Revenez demain pour continuer votre progression.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan" className="space-y-4">
          {currentPlan ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {currentPlan.plan_name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {currentPlan.completion_rate}% terminé
                  </span>
                </CardTitle>
                <CardDescription>
                  Plan de {currentPlan.estimated_duration_days} jours • 
                  {currentPlan.daily_target} concepts/jour
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={currentPlan.completion_rate} className="w-full" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <span className="font-medium text-primary">Concepts ciblés</span>
                    <p className="text-primary/80">{currentPlan.target_items.length}</p>
                  </div>
                  <div className="bg-success/10 rounded-lg p-3">
                    <span className="font-medium text-success">Jours restants</span>
                    <p className="text-success/80">
                      {Math.max(0, currentPlan.estimated_duration_days - Math.floor((new Date().getTime() - new Date(currentPlan.created_at).getTime()) / (1000 * 60 * 60 * 24)))}
                    </p>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-3">
                    <span className="font-medium text-accent-foreground">Objectif quotidien</span>
                    <p className="text-accent-foreground/80">{currentPlan.daily_target} concepts</p>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab('today')}
                >
                  Commencer la révision du jour
                </Button>
              </CardContent>
            </Card>
          ) : (
            <RevisionPlanCreator />
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          {/* Heatmap de progression */}
          <ProgressHeatmap 
            data={revisionHistory.map(entry => ({
              date: entry.timestamp?.split('T')[0] || new Date().toISOString().split('T')[0],
              count: 1,
              score: entry.score
            })).reduce((acc, curr) => {
              const existing = acc.find(a => a.date === curr.date);
              if (existing) {
                existing.count += 1;
                existing.score = Math.round((existing.score + curr.score) / 2);
              } else {
                acc.push(curr);
              }
              return acc;
            }, [] as Array<{date: string; count: number; score: number}>)}
          />
          
          <ProgressAnalytics 
            revisionItems={revisionItems}
            stats={stats}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Graphiques de progression des quiz */}
          <QuizProgressChart />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Répartition par difficulté */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Répartition par difficulté</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(['easy', 'medium', 'hard'] as const).map((level) => {
                  const count = revisionItems.filter(item => item.difficulty_level === level).length;
                  const percentage = revisionItems.length > 0 ? (count / revisionItems.length) * 100 : 0;
                  const colors = {
                    easy: 'bg-success',
                    medium: 'bg-warning', 
                    hard: 'bg-destructive'
                  };
                  
                  return (
                    <div key={level} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{level === 'easy' ? 'Facile' : level === 'medium' ? 'Moyen' : 'Difficile'}</span>
                        <span>{count} concepts</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${colors[level]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Top concepts à réviser */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Concepts prioritaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {revisionItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.concept}</p>
                        <p className="text-xs text-muted-foreground">{item.item_code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{item.priority_score}</p>
                        <p className="text-xs text-muted-foreground">priorité</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Historique de révision */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Historique des révisions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {revisionHistory.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {revisionHistory.slice(0, 10).map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm">
                        <div>
                          <span className="font-medium">{entry.itemCode}</span>
                          <span className="text-muted-foreground ml-2">{entry.date}</span>
                        </div>
                        <Badge variant={entry.score >= 80 ? "default" : entry.score >= 50 ? "secondary" : "destructive"}>
                          {entry.score}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Aucun historique de révision. Commencez une session !
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};