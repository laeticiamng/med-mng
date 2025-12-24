import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Clock, Brain, Award, Flame, Star, Trophy } from 'lucide-react';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';

interface LearningStats {
  overall_progress: number;
  strong_areas: string[];
  improvement_areas: string[];
  avg_engagement: number;
  total_time_spent: number;
  completed_sessions: number;
  weeklyTrend: number;
  averageScore: number;
  mostProductiveHour: string;
  learningVelocity: number;
  retentionRate: number;
  streakBonus: number;
}

export const LearningAnalytics: React.FC = () => {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { logActivity } = useActivityTracking();
  const { stats: gamificationStats, loadStats } = useGamification();

  useEffect(() => {
    loadLearningStats();
    const initGamification = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        loadStats(user.id);
        logActivity({ activity_type: 'study', metadata: { action: 'view_learning_analytics' } });
      }
    };
    initGamification();
  }, [loadStats, logActivity]);

  const loadLearningStats = async () => {
    try {
      const { data: analyticsData, error } = await supabase
        .from('edn_analytics_advanced')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (analyticsData && analyticsData.length > 0) {
        // Calculer les statistiques
        const totalSessions = analyticsData.length;
        const avgProgress = analyticsData.reduce((sum, item) => sum + (item.completion_rate || 0), 0) / totalSessions;
        const avgEngagement = analyticsData.reduce((sum, item) => sum + (item.engagement_score || 0), 0) / totalSessions;
        const totalTime = analyticsData.reduce((sum, item) => sum + (item.time_spent_minutes || 0), 0);
        
        // Identifier les domaines forts (>80% completion)
        const strongItems = analyticsData
          .filter(item => (item.completion_rate || 0) > 0.8)
          .map(item => item.item_code);
        
        // Identifier les domaines à améliorer (<50% completion)
        const improvementItems = analyticsData
          .filter(item => (item.completion_rate || 0) < 0.5)
          .map(item => item.item_code);

        setStats({
          overall_progress: avgProgress * 100,
          strong_areas: [...new Set(strongItems)].slice(0, 5),
          improvement_areas: [...new Set(improvementItems)].slice(0, 5),
          avg_engagement: avgEngagement * 100,
          total_time_spent: totalTime,
          completed_sessions: totalSessions
        });
        // Calculate weekly trend
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const thisWeekData = analyticsData.filter(d => new Date(d.created_at) >= weekAgo);
        const lastWeekData = analyticsData.filter(d =>
          new Date(d.created_at) >= twoWeeksAgo && new Date(d.created_at) < weekAgo
        );

        const thisWeekAvg = thisWeekData.length > 0
          ? thisWeekData.reduce((sum, d) => sum + (d.completion_rate || 0), 0) / thisWeekData.length
          : 0;
        const lastWeekAvg = lastWeekData.length > 0
          ? lastWeekData.reduce((sum, d) => sum + (d.completion_rate || 0), 0) / lastWeekData.length
          : 0;
        const weeklyTrend = lastWeekAvg > 0
          ? Math.round(((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100)
          : 0;

        // Calculate average score
        const scoresWithData = analyticsData.filter(d => d.score);
        const averageScore = scoresWithData.length > 0
          ? Math.round(scoresWithData.reduce((sum, d) => sum + (d.score || 0), 0) / scoresWithData.length)
          : 0;

        // Calculate most productive hour
        const hourCounts: Record<number, number> = {};
        analyticsData.forEach(d => {
          const hour = new Date(d.created_at).getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + (d.completion_rate || 0);
        });
        const mostProductiveHour = Object.entries(hourCounts).length > 0
          ? Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0][0] + 'h'
          : '14h';

        // Calculate learning velocity (items per day)
        const uniqueDays = new Set(analyticsData.map(d => d.created_at.split('T')[0]));
        const learningVelocity = uniqueDays.size > 0
          ? Math.round(totalSessions / uniqueDays.size * 10) / 10
          : 0;

        // Retention rate (approximation based on repeat views)
        const itemViewCounts: Record<string, number> = {};
        analyticsData.forEach(d => {
          itemViewCounts[d.item_code] = (itemViewCounts[d.item_code] || 0) + 1;
        });
        const reviewedItems = Object.values(itemViewCounts).filter(c => c > 1).length;
        const retentionRate = Object.keys(itemViewCounts).length > 0
          ? Math.round((reviewedItems / Object.keys(itemViewCounts).length) * 100)
          : 0;

        // Streak bonus
        const streakBonus = gamificationStats?.currentStreak
          ? Math.min(gamificationStats.currentStreak * 2, 50)
          : 0;

        setStats({
          overall_progress: avgProgress * 100,
          strong_areas: [...new Set(strongItems)].slice(0, 5),
          improvement_areas: [...new Set(improvementItems)].slice(0, 5),
          avg_engagement: avgEngagement * 100,
          total_time_spent: totalTime,
          completed_sessions: totalSessions,
          weeklyTrend,
          averageScore,
          mostProductiveHour,
          learningVelocity,
          retentionRate,
          streakBonus
        });
      } else {
        // Données de démonstration si aucune donnée
        setStats({
          overall_progress: 75,
          strong_areas: ['IC-001', 'IC-015', 'IC-033'],
          improvement_areas: ['IC-087', 'IC-156'],
          avg_engagement: 85,
          total_time_spent: 420,
          completed_sessions: 28,
          weeklyTrend: 12,
          averageScore: 78,
          mostProductiveHour: '14h',
          learningVelocity: 3.5,
          retentionRate: 72,
          streakBonus: 10
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Chargement des analytics...</div>;
  }

  if (!stats) {
    return <div>Aucune donnée disponible</div>;
  }

  return (
    <div className="space-y-6">
      {/* Gamification Stats Banner */}
      {gamificationStats && (
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-warning/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-warning" />
                  <span className="text-lg font-bold text-warning">{gamificationStats.currentStreak}</span>
                  <span className="text-sm text-muted-foreground">jours</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span className="text-lg font-bold text-primary">Niv. {gamificationStats.level}</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-success" />
                  <span className="text-lg font-bold text-success">{gamificationStats.badges?.length || 0}</span>
                  <span className="text-sm text-muted-foreground">badges</span>
                </div>
              </div>
              <Badge variant="outline">{gamificationStats.totalPoints} XP</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Analytics d'Apprentissage</h2>
        <p className="text-muted-foreground">Suivez votre progression et optimisez votre apprentissage</p>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progression Globale</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.overall_progress)}%</div>
            <Progress value={stats.overall_progress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avg_engagement)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.avg_engagement > 80 ? 'Excellent' : stats.avg_engagement > 60 ? 'Bon' : 'À améliorer'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps d'Étude</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.total_time_spent / 60)}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completed_sessions} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réussite</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.strong_areas.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Items maîtrisés</p>
          </CardContent>
        </Card>
      </div>

      {/* Domaines forts et à améliorer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Domaines Forts
            </CardTitle>
            <CardDescription>
              Items où vous excellez (&gt;80% de réussite)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.strong_areas.length > 0 ? (
                stats.strong_areas.map((item, index) => (
                  <Badge key={index} variant="outline" className="mr-2 mb-2">
                    {item}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">Continuez vos efforts pour identifier vos domaines forts !</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-warning" />
              À Améliorer
            </CardTitle>
            <CardDescription>
              Items nécessitant plus de travail (&lt;50% de réussite)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.improvement_areas.length > 0 ? (
                stats.improvement_areas.map((item, index) => (
                  <Badge key={index} variant="secondary" className="mr-2 mb-2">
                    {item}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">Excellent ! Aucun domaine spécifique à améliorer détecté.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tendance</p>
                <p className="text-xl font-bold flex items-center gap-1">
                  {stats.weeklyTrend >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  {stats.weeklyTrend > 0 ? '+' : ''}{stats.weeklyTrend}%
                </p>
              </div>
              <div className="text-xs text-muted-foreground">vs semaine dernière</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Moyen</p>
                <p className="text-xl font-bold">{stats.averageScore}%</p>
              </div>
              <div className="text-xs text-muted-foreground">sur les examens</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Heure Productive</p>
                <p className="text-xl font-bold">{stats.mostProductiveHour}</p>
              </div>
              <div className="text-xs text-muted-foreground">meilleure performance</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vélocité</p>
                <p className="text-xl font-bold">{stats.learningVelocity}/jour</p>
              </div>
              <div className="text-xs text-muted-foreground">items complétés</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Retention & Streak */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Taux de Rétention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">{stats.retentionRate}%</div>
              <div className="flex-1">
                <Progress value={stats.retentionRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Items révisés plusieurs fois
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="h-4 w-4 text-warning" />
              Bonus de Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-warning">+{stats.streakBonus}%</div>
              <div className="flex-1">
                <Progress value={stats.streakBonus * 2} className="h-2 bg-warning/20" />
                <p className="text-xs text-muted-foreground mt-1">
                  XP bonus grâce à votre streak
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommandations Personnalisées</CardTitle>
          <CardDescription>
            Basées sur votre profil d'apprentissage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.avg_engagement < 70 && (
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm">
                  💡 <strong>Augmentez votre engagement :</strong> Essayez les modules musicaux et immersifs pour rendre l&apos;apprentissage plus interactif.
                </p>
              </div>
            )}

            {stats.improvement_areas.length > 2 && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm">
                  📚 <strong>Focus sur les bases :</strong> Concentrez-vous sur 2-3 items à la fois pour un apprentissage plus efficace.
                </p>
              </div>
            )}

            {stats.overall_progress > 80 && (
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-sm">
                  🎉 <strong>Excellent travail !</strong> Vous maîtrisez bien le contenu. Pensez à réviser régulièrement pour consolider vos acquis.
                </p>
              </div>
            )}

            {stats.retentionRate < 50 && (
              <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                <p className="text-sm">
                  🔄 <strong>Révisez plus souvent :</strong> Votre taux de rétention est faible. Utilisez les flashcards et le SRS pour améliorer la mémorisation.
                </p>
              </div>
            )}

            {stats.learningVelocity < 2 && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm">
                  🚀 <strong>Augmentez votre rythme :</strong> Essayez de compléter au moins 3 items par jour pour atteindre vos objectifs.
                </p>
              </div>
            )}

            {stats.weeklyTrend < -10 && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm">
                  ⚠️ <strong>Attention :</strong> Votre activité a diminué cette semaine. Planifiez des sessions régulières pour maintenir votre progression.
                </p>
              </div>
            )}

            {stats.weeklyTrend > 20 && (
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-sm">
                  📈 <strong>Progression remarquable !</strong> Votre activité a augmenté de {stats.weeklyTrend}% cette semaine. Continuez sur cette lancée !
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};