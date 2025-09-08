import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  Brain, 
  Target, 
  Calendar,
  Music,
  Award,
  BookOpen,
  Clock,
  BarChart3,
  Lightbulb,
  Zap,
  Star,
  RefreshCw
} from 'lucide-react';

interface Analytics {
  user_id: string;
  timeframe: string;
  summary: {
    total_generations: number;
    completed_generations: number;
    success_rate: number;
    current_streak: number;
    active_days_count: number;
    favorite_specialty: string;
  };
  specialty_breakdown: Record<string, {
    total: number;
    completed: number;
    rang_a: number;
    rang_b: number;
    recent_activity: any[];
  }>;
  recent_activity: any[];
  performance_trends: {
    daily_activity: Array<{
      date: string;
      generations: number;
    }>;
    success_rate_trend: Array<{
      date: string;
      success_rate: number;
      total_generations: number;
    }>;
  };
  recommendations: string[];
  learning_insights: {
    most_challenging_items: string[];
    preferred_styles: string[];
    optimal_study_times: string[];
  };
}

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('med-analytics-dashboard', {
        body: { timeframe }
      });

      if (error) throw error;

      if (data?.success) {
        setAnalytics(data.analytics);
        setLastUpdated(new Date());
      } else {
        throw new Error(data?.error || 'Erreur de chargement des analytics');
      }
    } catch (error) {
      console.error('Analytics error:', error);
      toast({
        title: "Erreur de chargement",
        description: error instanceof Error ? error.message : "Impossible de charger les analytics",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak === 0) return 'text-gray-500';
    if (streak < 7) return 'text-yellow-600';
    if (streak < 30) return 'text-orange-600';
    return 'text-green-600';
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate < 50) return 'text-red-600';
    if (rate < 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucune donnée d'analytics disponible</p>
          <Button onClick={loadAnalytics} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recharger
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tableau de Bord Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Suivez vos progrès d'apprentissage médical
            {lastUpdated && (
              <span className="ml-2 text-xs">
                • Mis à jour {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">7 jours</SelectItem>
              <SelectItem value="month">30 jours</SelectItem>
              <SelectItem value="year">1 an</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={loadAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Music className="h-4 w-4" />
              Générés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {analytics.summary.total_generations}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {analytics.summary.completed_generations} complétés
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Taux de succès
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSuccessRateColor(analytics.summary.success_rate)}`}>
              {analytics.summary.success_rate}%
            </div>
            <Progress 
              value={analytics.summary.success_rate} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Série actuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStreakColor(analytics.summary.current_streak)}`}>
              {analytics.summary.current_streak}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              jours consécutifs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Spécialité favorite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-purple-900 truncate">
              {analytics.summary.favorite_specialty || 'N/A'}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              {analytics.summary.active_days_count} jours actifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="specialties">Spécialités</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Activité récente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recent_activity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{activity.title || activity.item_code}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Badge 
                        variant={activity.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {activity.status === 'completed' ? 'Terminé' : 'En cours'}
                      </Badge>
                    </div>
                  ))}
                  {analytics.recent_activity.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Aucune activité récente
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Recommandations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recommendations.map((recommendation, index) => (
                    <div key={index} className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                      <p className="text-sm text-blue-800">{recommendation}</p>
                    </div>
                  ))}
                  {analytics.recommendations.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Continuez comme ça ! 🎉
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="specialties" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analytics.specialty_breakdown).map(([specialty, stats]) => (
              <Card key={specialty}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{specialty}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    {stats.total} générations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Complétés</span>
                    <Badge variant="secondary">{stats.completed}/{stats.total}</Badge>
                  </div>
                  
                  <Progress value={(stats.completed / Math.max(stats.total, 1)) * 100} />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Rang A: {stats.rang_a}</span>
                    <span>Rang B: {stats.rang_b}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Activité quotidienne (7 derniers jours)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.performance_trends.daily_activity.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">
                        {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit' })}
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(day.generations / Math.max(...analytics.performance_trends.daily_activity.map(d => d.generations), 1)) * 100}
                          className="w-20 h-2"
                        />
                        <span className="text-sm font-medium w-6">{day.generations}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Success Rate Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution du taux de succès</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.performance_trends.success_rate_trend.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">
                        {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit' })}
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={day.success_rate}
                          className="w-20 h-2"
                        />
                        <span className={`text-sm font-medium w-12 ${getSuccessRateColor(day.success_rate)}`}>
                          {Math.round(day.success_rate)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Most Challenging */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Target className="h-5 w-5" />
                  Items difficiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.learning_insights.most_challenging_items.map((item, index) => (
                    <Badge key={index} variant="destructive" className="block w-full justify-center">
                      {item}
                    </Badge>
                  ))}
                  {analytics.learning_insights.most_challenging_items.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      Aucun problème détecté 👍
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preferred Styles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Star className="h-5 w-5" />
                  Styles préférés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.learning_insights.preferred_styles.map((style, index) => (
                    <Badge key={index} variant="secondary" className="block w-full justify-center">
                      {style}
                    </Badge>
                  ))}
                  {analytics.learning_insights.preferred_styles.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      Explorez différents styles
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Optimal Study Times */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Calendar className="h-5 w-5" />
                  Moments optimaux
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.learning_insights.optimal_study_times.map((time, index) => (
                    <Badge key={index} variant="outline" className="block w-full justify-center">
                      {time}
                    </Badge>
                  ))}
                  {analytics.learning_insights.optimal_study_times.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      Données insuffisantes
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};