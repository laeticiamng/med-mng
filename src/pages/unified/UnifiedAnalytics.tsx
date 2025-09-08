// 🚀 ANALYTICS UNIFIÉES ULTRA-AVANCÉES
import React, { useState, useMemo } from 'react';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Music, 
  Brain,
  Award,
  Clock,
  Target,
  Zap,
  Activity,
  Calendar,
  Download
} from 'lucide-react';

interface AnalyticsData {
  musicGeneration: {
    total: number;
    thisMonth: number;
    growth: number;
    avgDuration: string;
  };
  learning: {
    completionRate: number;
    avgScore: number;
    itemsCompleted: number;
    studyTime: string;
  };
  engagement: {
    dailyActive: number;
    weeklyActive: number;
    retention: number;
    satisfaction: number;
  };
  performance: {
    loadTime: string;
    uptime: number;
    errorRate: number;
    apiCalls: number;
  };
}

export const UnifiedAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Données simulées mais réalistes
  const analytics: AnalyticsData = useMemo(() => ({
    musicGeneration: {
      total: 45692,
      thisMonth: 3247,
      growth: 24.5,
      avgDuration: '2m 34s'
    },
    learning: {
      completionRate: 87.3,
      avgScore: 94.2,
      itemsCompleted: 318,
      studyTime: '147h 23m'
    },
    engagement: {
      dailyActive: 2847,
      weeklyActive: 12456,
      retention: 89.4,
      satisfaction: 4.9
    },
    performance: {
      loadTime: '0.8s',
      uptime: 99.98,
      errorRate: 0.02,
      apiCalls: 1247893
    }
  }), [timeRange]);

  const quickStats = [
    {
      label: 'Utilisateurs actifs',
      value: analytics.engagement.dailyActive.toLocaleString(),
      change: '+18.2%',
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Musiques générées',
      value: analytics.musicGeneration.thisMonth.toLocaleString(),
      change: `+${analytics.musicGeneration.growth}%`,
      icon: Music,
      color: 'purple'
    },
    {
      label: 'Taux de réussite',
      value: `${analytics.learning.avgScore}%`,
      change: '+8.1%',
      icon: Award,
      color: 'green'
    },
    {
      label: 'Satisfaction',
      value: `${analytics.engagement.satisfaction}/5`,
      change: '+12.3%',
      icon: TrendingUp,
      color: 'orange'
    }
  ];

  const learningMetrics = [
    {
      title: 'Progression EDN',
      value: analytics.learning.completionRate,
      max: 100,
      color: 'bg-blue-500'
    },
    {
      title: 'Items maîtrisés',
      value: (analytics.learning.itemsCompleted / 367) * 100,
      max: 100,
      color: 'bg-purple-500'
    },
    {
      title: 'Rétention utilisateurs',
      value: analytics.engagement.retention,
      max: 100,
      color: 'bg-green-500'
    },
    {
      title: 'Performance système',
      value: analytics.performance.uptime,
      max: 100,
      color: 'bg-orange-500'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200',
      green: 'text-green-600 bg-green-50 border-green-200',
      orange: 'text-orange-600 bg-orange-50 border-orange-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <PremiumLayout variant="gradient">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Analytics Unifiées
              </h1>
              <p className="text-muted-foreground">
                Insights complets sur l'apprentissage médical et la performance
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 border">
              {['7d', '30d', '90d'].map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${getColorClasses(stat.color)}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="learning">Apprentissage</TabsTrigger>
            <TabsTrigger value="music">Génération Musicale</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Métriques Clés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {learningMetrics.map((metric, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{metric.title}</span>
                          <span className="text-muted-foreground">{metric.value.toFixed(1)}%</span>
                        </div>
                        <Progress value={metric.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    Activité Temps Réel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium">Utilisateurs connectés</div>
                        <div className="text-sm text-muted-foreground">En ce moment</div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">847</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <div className="font-medium">Générations en cours</div>
                        <div className="text-sm text-muted-foreground">Musique IA</div>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">23</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium">Items complétés</div>
                        <div className="text-sm text-muted-foreground">Dernière heure</div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">156</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="learning">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    Progression d'Apprentissage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {analytics.learning.completionRate}%
                      </div>
                      <p className="text-muted-foreground">Taux de complétion global</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {analytics.learning.itemsCompleted}/367
                        </div>
                        <div className="text-sm text-muted-foreground">Items EDN maîtrisés</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {analytics.learning.avgScore}%
                        </div>
                        <div className="text-sm text-muted-foreground">Score moyen</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Temps d'Étude
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-3xl font-bold text-orange-600">
                      {analytics.learning.studyTime}
                    </div>
                    <p className="text-sm text-muted-foreground">Temps total d'apprentissage</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Moyenne/jour</span>
                        <span className="font-medium">2h 47m</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Sessions/semaine</span>
                        <span className="font-medium">12.3</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="music">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-purple-600" />
                    Génération Musicale IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600 mb-2">
                        {analytics.musicGeneration.total.toLocaleString()}
                      </div>
                      <p className="text-muted-foreground">Total musiques générées</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                          {analytics.musicGeneration.thisMonth}
                        </div>
                        <div className="text-xs text-muted-foreground">Ce mois</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">
                          +{analytics.musicGeneration.growth}%
                        </div>
                        <div className="text-xs text-muted-foreground">Croissance</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-600" />
                    Performance Génération
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium">Durée moyenne</span>
                      <span className="text-xl font-bold text-orange-600">
                        {analytics.musicGeneration.avgDuration}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Taux de succès</span>
                      <span className="text-xl font-bold text-blue-600">98.2%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">Qualité moyenne</span>
                      <span className="text-xl font-bold text-purple-600">4.7/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Utilisateurs Actifs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {analytics.engagement.dailyActive.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Actifs quotidiens</p>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">
                        {analytics.engagement.weeklyActive.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Actifs hebdomadaires</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Rétention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-green-600">
                      {analytics.engagement.retention}%
                    </div>
                    <p className="text-sm text-muted-foreground">Taux de rétention 30j</p>
                    <Progress value={analytics.engagement.retention} className="w-full" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    Satisfaction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-yellow-600">
                      {analytics.engagement.satisfaction}/5
                    </div>
                    <p className="text-sm text-muted-foreground">Note moyenne utilisateurs</p>
                    <div className="flex justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Award
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(analytics.engagement.satisfaction)
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Performance Système
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Temps de chargement</span>
                      <span className="text-xl font-bold text-green-600">
                        {analytics.performance.loadTime}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Uptime</span>
                      <span className="text-xl font-bold text-blue-600">
                        {analytics.performance.uptime}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">Taux d'erreur</span>
                      <span className="text-xl font-bold text-red-600">
                        {analytics.performance.errorRate}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    API & Intégrations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {analytics.performance.apiCalls.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Appels API ce mois</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 bg-purple-50 rounded">
                        <span className="text-sm">OpenAI GPT</span>
                        <span className="text-sm font-medium text-purple-600">347K</span>
                      </div>
                      <div className="flex justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm">Suno Music</span>
                        <span className="text-sm font-medium text-blue-600">892K</span>
                      </div>
                      <div className="flex justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm">Supabase DB</span>
                        <span className="text-sm font-medium text-green-600">1.2M</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PremiumLayout>
  );
};

export default UnifiedAnalytics;