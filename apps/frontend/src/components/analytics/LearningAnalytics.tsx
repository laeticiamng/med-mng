import logger from '@/lib/logger';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Clock, Brain, Award } from 'lucide-react';

interface LearningStats {
  overall_progress: number;
  strong_areas: string[];
  improvement_areas: string[];
  avg_engagement: number;
  total_time_spent: number;
  completed_sessions: number;
}

export const LearningAnalytics: React.FC = () => {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLearningStats();
  }, []);

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
      } else {
        // Données de démonstration si aucune donnée
        setStats({
          overall_progress: 75,
          strong_areas: ['IC-001', 'IC-015', 'IC-033'],
          improvement_areas: ['IC-087', 'IC-156'],
          avg_engagement: 85,
          total_time_spent: 420,
          completed_sessions: 28
        });
      }
    } catch (error) {
      logger.error('Erreur lors du chargement des analytics:', error);
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
              <TrendingUp className="h-5 w-5 text-green-500" />
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
              <TrendingDown className="h-5 w-5 text-orange-500" />
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
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm">
                  💡 <strong>Augmentez votre engagement :</strong> Essayez les modules musicaux et immersifs pour rendre l&apos;apprentissage plus interactif.
                </p>
              </div>
            )}
            
            {stats.improvement_areas.length > 2 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm">
                  📚 <strong>Focus sur les bases :</strong> Concentrez-vous sur 2-3 items à la fois pour un apprentissage plus efficace.
                </p>
              </div>
            )}
            
            {stats.overall_progress > 80 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm">
                  🎉 <strong>Excellent travail !</strong> Vous maîtrisez bien le contenu. Pensez à réviser régulièrement pour consolider vos acquis.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};