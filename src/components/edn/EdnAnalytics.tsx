import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  Award,
  Brain,
  Music,
  BookOpen,
  Zap,
  Calendar,
  Eye
} from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

interface AnalyticsData {
  totalStudents: number;
  completionRate: number;
  averageScore: number;
  totalTimeSpent: number;
  popularItems: Array<{
    id: string;
    title: string;
    completions: number;
    avgScore: number;
    avgTime: number;
  }>;
  activityByDay: Array<{
    date: string;
    completions: number;
    newUsers: number;
  }>;
  modulePerformance: Array<{
    module: string;
    completions: number;
    avgScore: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
}

interface EdnAnalyticsProps {
  itemId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

export const EdnAnalytics: React.FC<EdnAnalyticsProps> = ({
  itemId,
  timeRange = '30d'
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<'overview' | 'performance' | 'engagement'>('overview');

  // Simulation des données analytiques
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: AnalyticsData = {
        totalStudents: 1247,
        completionRate: 78.5,
        averageScore: 84.2,
        totalTimeSpent: 15420, // minutes
        popularItems: [
          {
            id: 'item-001',
            title: 'Cardiologie - Insuffisance cardiaque',
            completions: 342,
            avgScore: 87.3,
            avgTime: 45
          },
          {
            id: 'item-002', 
            title: 'Pneumologie - Asthme aigu',
            completions: 298,
            avgScore: 82.1,
            avgTime: 38
          },
          {
            id: 'item-003',
            title: 'Neurologie - AVC ischémique',
            completions: 267,
            avgScore: 79.8,
            avgTime: 52
          }
        ],
        activityByDay: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completions: Math.floor(Math.random() * 50) + 10,
          newUsers: Math.floor(Math.random() * 15) + 2
        })).reverse(),
        modulePerformance: [
          { module: 'Tableaux OIC', completions: 892, avgScore: 85.3, difficulty: 'medium' },
          { module: 'Scènes immersives', completions: 634, avgScore: 88.7, difficulty: 'easy' },
          { module: 'Quiz interactifs', completions: 743, avgScore: 76.2, difficulty: 'hard' },
          { module: 'Génération musicale', completions: 567, avgScore: 91.4, difficulty: 'easy' },
          { module: 'Bandes dessinées', completions: 445, avgScore: 83.9, difficulty: 'medium' }
        ]
      };
      
      setAnalytics(mockData);
      setLoading(false);
    };

    fetchAnalytics();
  }, [itemId, timeRange]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-muted-foreground">Chargement des analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucune donnée analytique disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Analytics */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-3">
                <BarChart3 className="h-7 w-7" />
                Analytics EDN
              </CardTitle>
              <CardDescription className="text-blue-100 mt-2">
                Tableau de bord des performances d'apprentissage
              </CardDescription>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-blue-200 mb-1">Période</div>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {timeRange === '7d' ? '7 jours' : 
                 timeRange === '30d' ? '30 jours' : 
                 timeRange === '90d' ? '3 mois' : '1 an'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation des métriques */}
      <Tabs value={activeMetric} onValueChange={(value) => setActiveMetric(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Performances
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Engagement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-blue-700 mb-1">
                  {formatNumber(analytics.totalStudents)}
                </div>
                <div className="text-sm text-blue-600">Étudiants actifs</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-700 mb-1">
                  {analytics.completionRate}%
                </div>
                <div className="text-sm text-green-600">Taux de completion</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6 text-center">
                <Award className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-purple-700 mb-1">
                  {analytics.averageScore}%
                </div>
                <div className="text-sm text-purple-600">Score moyen</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-orange-700 mb-1">
                  {Math.round(analytics.totalTimeSpent / 60)}h
                </div>
                <div className="text-sm text-orange-600">Temps total</div>
              </CardContent>
            </Card>
          </div>

          {/* Items populaires */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Items les plus populaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.popularItems.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <div className="text-sm text-muted-foreground">
                          {item.completions} completions • Temps moyen: {item.avgTime} min
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">{item.avgScore}%</div>
                      <div className="text-xs text-muted-foreground">Score moyen</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance par module */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Performance par module
              </CardTitle>
              <CardDescription>
                Analyse détaillée des résultats par type de contenu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analytics.modulePerformance.map((module) => (
                  <div key={module.module} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {module.module === 'Tableaux OIC' && <Brain className="h-4 w-4 text-blue-600" />}
                          {module.module === 'Scènes immersives' && <Eye className="h-4 w-4 text-green-600" />}
                          {module.module === 'Quiz interactifs' && <Zap className="h-4 w-4 text-purple-600" />}
                          {module.module === 'Génération musicale' && <Music className="h-4 w-4 text-pink-600" />}
                          {module.module === 'Bandes dessinées' && <BookOpen className="h-4 w-4 text-orange-600" />}
                          <h4 className="font-medium">{module.module}</h4>
                        </div>
                        <Badge className={getDifficultyColor(module.difficulty)}>
                          {module.difficulty === 'easy' ? 'Facile' : 
                           module.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{module.completions}</div>
                          <div className="text-muted-foreground">Completions</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{module.avgScore}%</div>
                          <div className="text-muted-foreground">Score</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Performance</span>
                        <span>{module.avgScore}% • {module.completions} utilisateurs</span>
                      </div>
                      <Progress value={module.avgScore} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Répartition des scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Répartition des scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { range: '90-100%', count: 234, color: 'bg-green-500' },
                    { range: '80-89%', count: 398, color: 'bg-blue-500' },
                    { range: '70-79%', count: 287, color: 'bg-orange-500' },
                    { range: '60-69%', count: 156, color: 'bg-red-500' },
                    { range: '<60%', count: 89, color: 'bg-gray-500' }
                  ].map((score) => (
                    <div key={score.range} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded ${score.color}`}></div>
                      <div className="flex-1 flex justify-between">
                        <span className="text-sm">{score.range}</span>
                        <span className="text-sm font-medium">{score.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Temps d'apprentissage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Temps moyen par session</span>
                    <span className="font-medium">32 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sessions par utilisateur</span>
                    <span className="font-medium">4.2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taux d'abandon</span>
                    <span className="font-medium text-red-600">12%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Retention 7 jours</span>
                    <span className="font-medium text-green-600">68%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          {/* Activité quotidienne */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Activité des 30 derniers jours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {analytics.activityByDay.slice(-28).map((day, index) => (
                  <div
                    key={index}
                    className="aspect-square flex items-center justify-center text-xs rounded"
                    style={{
                      backgroundColor: `rgba(59, 130, 246, ${Math.min(day.completions / 50, 1)})`,
                      color: day.completions > 25 ? 'white' : 'black'
                    }}
                    title={`${day.date}: ${day.completions} completions`}
                  >
                    {day.completions}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Moins d'activité</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-100 rounded"></div>
                  <div className="w-3 h-3 bg-blue-200 rounded"></div>
                  <div className="w-3 h-3 bg-blue-400 rounded"></div>
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                </div>
                <span>Plus d'activité</span>
              </div>
            </CardContent>
          </Card>

          {/* Métriques d'engagement */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {analytics.activityByDay.reduce((sum, day) => sum + day.newUsers, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Nouveaux utilisateurs</div>
                <div className="text-xs text-green-600 mt-1">
                  +{Math.round(analytics.activityByDay.reduce((sum, day) => sum + day.newUsers, 0) / 30)} par jour
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {Math.round(analytics.activityByDay.reduce((sum, day) => sum + day.completions, 0) / 30)}
                </div>
                <div className="text-sm text-muted-foreground">Completions par jour</div>
                <div className="text-xs text-blue-600 mt-1">
                  Tendance stable
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  85%
                </div>
                <div className="text-sm text-muted-foreground">Satisfaction utilisateurs</div>
                <div className="text-xs text-purple-600 mt-1">
                  +3% ce mois
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button variant="outline" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Exporter le rapport
        </Button>
        
        <Button variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Planifier un rapport
        </Button>
      </div>
    </div>
  );
};