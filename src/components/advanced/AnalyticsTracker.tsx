import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, TrendingUp, Users, Clock, Eye, MousePointer,
  Calendar, Target, Zap, Heart, Brain, Award, Activity
} from 'lucide-react';

interface AnalyticsData {
  userBehavior: {
    sessionDuration: number;
    pageViews: number;
    clickRate: number;
    bounceRate: number;
    returnVisits: number;
  };
  learningMetrics: {
    completionRate: number;
    averageScore: number;
    timeSpent: number;
    modulesCompleted: number;
    streakDays: number;
  };
  contentEngagement: {
    musicGenerated: number;
    favoritesAdded: number;
    sharesCount: number;
    searchQueries: number;
    downloadCount: number;
  };
  performance: {
    loadTime: number;
    errorRate: number;
    apiResponseTime: number;
    satisfaction: number;
  };
}

interface ActivityEvent {
  id: string;
  type: 'navigation' | 'interaction' | 'achievement' | 'error';
  timestamp: Date;
  description: string;
  metadata?: Record<string, any>;
}

export const AnalyticsTracker: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userBehavior: {
      sessionDuration: 0,
      pageViews: 0,
      clickRate: 0,
      bounceRate: 0,
      returnVisits: 0
    },
    learningMetrics: {
      completionRate: 0,
      averageScore: 0,
      timeSpent: 0,
      modulesCompleted: 0,
      streakDays: 0
    },
    contentEngagement: {
      musicGenerated: 0,
      favoritesAdded: 0,
      sharesCount: 0,
      searchQueries: 0,
      downloadCount: 0
    },
    performance: {
      loadTime: 0,
      errorRate: 0,
      apiResponseTime: 0,
      satisfaction: 0
    }
  });

  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([]);
  const [sessionStartTime] = useState(Date.now());
  const [isTracking, setIsTracking] = useState(true);

  useEffect(() => {
    if (!isTracking) return;

    // Simuler le chargement des données analytics
    loadAnalyticsData();

    // Tracker la durée de session
    const sessionTimer = setInterval(() => {
      const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
      updateMetric('userBehavior.sessionDuration', sessionDuration);
    }, 1000);

    // Tracker les interactions utilisateur
    const trackInteraction = (e: Event) => {
      trackEvent('interaction', `${e.type} sur ${(e.target as HTMLElement)?.tagName}`, {
        target: (e.target as HTMLElement)?.className,
        timestamp: new Date()
      });
    };

    // Tracker les changements de page
    const trackNavigation = () => {
      updateMetric('userBehavior.pageViews', analyticsData.userBehavior.pageViews + 1);
      trackEvent('navigation', `Visite de ${window.location.pathname}`);
    };

    // Tracker les erreurs
    const trackError = (error: ErrorEvent) => {
      trackEvent('error', `Erreur: ${error.message}`, {
        filename: error.filename,
        line: error.lineno,
        column: error.colno
      });
      updateMetric('performance.errorRate', analyticsData.performance.errorRate + 1);
    };

    // Ajouter les event listeners
    document.addEventListener('click', trackInteraction);
    document.addEventListener('keydown', trackInteraction);
    window.addEventListener('popstate', trackNavigation);
    window.addEventListener('error', trackError);

    // Tracker les performances
    trackPerformanceMetrics();

    return () => {
      clearInterval(sessionTimer);
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('keydown', trackInteraction);
      window.removeEventListener('popstate', trackNavigation);
      window.removeEventListener('error', trackError);
    };
  }, [isTracking, sessionStartTime]);

  const loadAnalyticsData = () => {
    // Simuler des données analytics réalistes
    setAnalyticsData({
      userBehavior: {
        sessionDuration: Math.floor(Math.random() * 1800), // 0-30 min
        pageViews: Math.floor(Math.random() * 20) + 5,
        clickRate: Math.random() * 100,
        bounceRate: Math.random() * 50,
        returnVisits: Math.floor(Math.random() * 10)
      },
      learningMetrics: {
        completionRate: Math.random() * 100,
        averageScore: 70 + Math.random() * 30,
        timeSpent: Math.floor(Math.random() * 7200), // 0-2h en secondes
        modulesCompleted: Math.floor(Math.random() * 15),
        streakDays: Math.floor(Math.random() * 30)
      },
      contentEngagement: {
        musicGenerated: Math.floor(Math.random() * 50),
        favoritesAdded: Math.floor(Math.random() * 25),
        sharesCount: Math.floor(Math.random() * 10),
        searchQueries: Math.floor(Math.random() * 100),
        downloadCount: Math.floor(Math.random() * 20)
      },
      performance: {
        loadTime: 800 + Math.random() * 1200, // 0.8-2s
        errorRate: Math.random() * 5,
        apiResponseTime: 200 + Math.random() * 800, // 200-1000ms
        satisfaction: 80 + Math.random() * 20
      }
    });
  };

  const trackPerformanceMetrics = () => {
    // Mesurer le temps de chargement
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        updateMetric('performance.loadTime', loadTime);
      }
    }
  };

  const trackEvent = (type: ActivityEvent['type'], description: string, metadata?: Record<string, any>) => {
    const event: ActivityEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date(),
      description,
      metadata
    };

    setRecentActivity(prev => [event, ...prev.slice(0, 49)]); // Garder les 50 derniers événements
  };

  const updateMetric = (path: string, value: number) => {
    setAnalyticsData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newData;
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'navigation': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'interaction': return <MousePointer className="h-4 w-4 text-green-500" />;
      case 'achievement': return <Award className="h-4 w-4 text-yellow-500" />;
      case 'error': return <Zap className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify({
      analyticsData,
      recentActivity,
      exportedAt: new Date()
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `med-mng-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics & Suivi d'Usage
              </CardTitle>
              <CardDescription>
                Analyse en temps réel de votre utilisation de la plateforme
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={isTracking ? "default" : "secondary"}>
                {isTracking ? 'Actif' : 'Arrêté'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTracking(!isTracking)}
              >
                {isTracking ? 'Arrêter' : 'Démarrer'}
              </Button>
              <Button variant="outline" size="sm" onClick={exportData}>
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métriques principales */}
      <Tabs defaultValue="behavior" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="behavior">Comportement</TabsTrigger>
          <TabsTrigger value="learning">Apprentissage</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="behavior" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Durée de session</p>
                    <p className="text-2xl font-bold">{formatTime(analyticsData.userBehavior.sessionDuration)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pages vues</p>
                    <p className="text-2xl font-bold">{analyticsData.userBehavior.pageViews}</p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taux de clic</p>
                    <p className="text-2xl font-bold">{analyticsData.userBehavior.clickRate.toFixed(1)}%</p>
                  </div>
                  <MousePointer className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taux de rebond</p>
                    <p className="text-2xl font-bold">{analyticsData.userBehavior.bounceRate.toFixed(1)}%</p>
                    <Progress value={analyticsData.userBehavior.bounceRate} className="mt-2 h-2" />
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Visites de retour</p>
                    <p className="text-2xl font-bold">{analyticsData.userBehavior.returnVisits}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taux de completion</p>
                    <p className="text-2xl font-bold">{analyticsData.learningMetrics.completionRate.toFixed(1)}%</p>
                    <Progress value={analyticsData.learningMetrics.completionRate} className="mt-2 h-2" />
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Score moyen</p>
                    <p className="text-2xl font-bold">{analyticsData.learningMetrics.averageScore.toFixed(1)}/100</p>
                  </div>
                  <Brain className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Temps d'étude</p>
                    <p className="text-2xl font-bold">{formatTime(analyticsData.learningMetrics.timeSpent)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Modules complétés</p>
                    <p className="text-2xl font-bold">{analyticsData.learningMetrics.modulesCompleted}</p>
                  </div>
                  <Award className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Série actuelle</p>
                    <p className="text-2xl font-bold">{analyticsData.learningMetrics.streakDays} jours</p>
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(analyticsData.contentEngagement).map(([key, value]) => {
              const labels = {
                musicGenerated: { title: 'Musiques générées', icon: '🎵' },
                favoritesAdded: { title: 'Favoris ajoutés', icon: '❤️' },
                sharesCount: { title: 'Partages', icon: '📤' },
                searchQueries: { title: 'Recherches', icon: '🔍' },
                downloadCount: { title: 'Téléchargements', icon: '⬇️' }
              };

              return (
                <Card key={key}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {labels[key as keyof typeof labels].title}
                        </p>
                        <p className="text-2xl font-bold">{value}</p>
                      </div>
                      <span className="text-2xl">
                        {labels[key as keyof typeof labels].icon}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Temps de chargement</p>
                    <p className="text-2xl font-bold">{analyticsData.performance.loadTime.toFixed(0)}ms</p>
                    <Progress 
                      value={Math.min((2000 - analyticsData.performance.loadTime) / 2000 * 100, 100)} 
                      className="mt-2 h-2" 
                    />
                  </div>
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Satisfaction</p>
                    <p className="text-2xl font-bold">{analyticsData.performance.satisfaction.toFixed(1)}%</p>
                    <Progress value={analyticsData.performance.satisfaction} className="mt-2 h-2" />
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activité Récente
          </CardTitle>
          <CardDescription>
            Les dernières interactions et événements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivity.slice(0, 20).map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg border">
                {getEventIcon(event.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {event.type}
                </Badge>
              </div>
            ))}
            
            {recentActivity.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune activité récente</p>
                <p className="text-sm">Les événements apparaîtront ici en temps réel</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};