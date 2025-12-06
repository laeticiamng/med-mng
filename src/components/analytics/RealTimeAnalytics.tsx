import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, Users, BookOpen, Music, Clock, 
  Activity, Target, Award, Zap, Brain
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  item_code?: string;
  duration: number;
  created_at: string;
}

interface PerformanceMetric {
  metric_name: string;
  value: number;
  previous_value: number;
  change_percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export const RealTimeAnalytics = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      metric_name: 'Utilisateurs actifs',
      value: 47,
      previous_value: 42,
      change_percentage: 11.9,
      trend: 'up'
    },
    {
      metric_name: 'Sessions d\'étude',
      value: 128,
      previous_value: 95,
      change_percentage: 34.7,
      trend: 'up'
    },
    {
      metric_name: 'Temps moyen',
      value: 23.5,
      previous_value: 21.2,
      change_percentage: 10.8,
      trend: 'up'
    },
    {
      metric_name: 'Taux de réussite',
      value: 87.3,
      previous_value: 84.1,
      change_percentage: 3.8,
      trend: 'up'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [liveData, setLiveData] = useState({
    activeUsers: 47,
    currentSessions: 12,
    todayProgress: 78,
    weeklyGoal: 85
  });

  useEffect(() => {
    fetchRecentActivities();
    
    // Simulation temps réel
    const interval = setInterval(() => {
      setLiveData(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) - 1,
        currentSessions: Math.max(1, prev.currentSessions + Math.floor(Math.random() * 3) - 1),
        todayProgress: Math.min(100, prev.todayProgress + Math.random() * 0.5)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchRecentActivities = async () => {
    setLoading(true);
    try {
      // Simulation d'activités récentes
      const mockActivities: UserActivity[] = [
        {
          id: '1',
          user_id: 'user1',
          activity_type: 'study_session',
          item_code: 'IC-1',
          duration: 1800,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: 'user2',
          activity_type: 'quiz_completed',
          item_code: 'IC-3',
          duration: 600,
          created_at: new Date(Date.now() - 300000).toISOString()
        },
        {
          id: '3',
          user_id: 'user3',
          activity_type: 'music_generated',
          item_code: 'IC-2',
          duration: 240,
          created_at: new Date(Date.now() - 600000).toISOString()
        }
      ];
      
      setActivities(mockActivities);
    } catch (error) {
      console.error('Erreur lors du chargement des activités:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'study_session': return <BookOpen className="h-4 w-4" />;
      case 'quiz_completed': return <Target className="h-4 w-4" />;
      case 'music_generated': return <Music className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}min`;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-success" />;
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Métriques en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.metric_name}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {typeof metric.value === 'number' && metric.value % 1 !== 0 
                      ? metric.value.toFixed(1) 
                      : metric.value}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-xs font-medium ${
                      metric.trend === 'up' ? 'text-success' : 'text-muted-foreground'
                    }`}>
                      +{metric.change_percentage}%
                    </span>
                  </div>
                </div>
                <div className="text-primary/60">
                  {index === 0 && <Users className="h-8 w-8" />}
                  {index === 1 && <BookOpen className="h-8 w-8" />}
                  {index === 2 && <Clock className="h-8 w-8" />}
                  {index === 3 && <Award className="h-8 w-8" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Données en direct */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Données en Direct
            </CardTitle>
            <CardDescription>
              Activité en temps réel sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Utilisateurs actifs</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <Badge variant="secondary">{liveData.activeUsers}</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sessions en cours</span>
              <Badge variant="outline">{liveData.currentSessions}</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progrès du jour</span>
                <span className="text-sm text-muted-foreground">
                  {liveData.todayProgress.toFixed(1)}%
                </span>
              </div>
              <Progress value={liveData.todayProgress} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Objectif hebdomadaire</span>
                <span className="text-sm text-muted-foreground">
                  {liveData.weeklyGoal}%
                </span>
              </div>
              <Progress value={liveData.weeklyGoal} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Activités récentes */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Activités Récentes
            </CardTitle>
            <CardDescription>
              Dernières actions des utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <div className="p-2 bg-primary/10 rounded-md text-primary">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {activity.activity_type === 'study_session' && 'Session d\'étude'}
                      {activity.activity_type === 'quiz_completed' && 'Quiz terminé'}
                      {activity.activity_type === 'music_generated' && 'Musique générée'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.item_code} • {formatDuration(activity.duration)}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              
              {activities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune activité récente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance détaillée */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle>Performance Détaillée</CardTitle>
          <CardDescription>
            Analyse approfondie des métriques de performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="engagement" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="learning">Apprentissage</TabsTrigger>
              <TabsTrigger value="system">Système</TabsTrigger>
            </TabsList>
            
            <TabsContent value="engagement" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Taux d'engagement</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quotidien</span>
                      <span>87%</span>
                    </div>
                    <Progress value={87} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Rétention utilisateurs</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>7 jours</span>
                      <span>72%</span>
                    </div>
                    <Progress value={72} />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="learning" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Progression moyenne</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Par session</span>
                      <span>15.3%</span>
                    </div>
                    <Progress value={15.3} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Taux de réussite</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quiz</span>
                      <span>84%</span>
                    </div>
                    <Progress value={84} />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="system" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Performance système</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Disponibilité</span>
                      <span>99.8%</span>
                    </div>
                    <Progress value={99.8} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Temps de réponse</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>API</span>
                      <span>145ms</span>
                    </div>
                    <Progress value={85} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};