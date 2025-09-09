import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, TrendingUp, TrendingDown, Clock, Target, Trophy, 
  Users, Music, BookOpen, Brain, Calendar, Download, Filter,
  Eye, ThumbsUp, Share2, Play, Headphones, Star, Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AnalyticsData {
  overview: {
    totalStudyTime: number;
    averageSessionDuration: number;
    completionRate: number;
    improvementRate: number;
  };
  performance: {
    weeklyScores: number[];
    subjectPerformance: { subject: string; score: number; trend: 'up' | 'down' | 'stable' }[];
    strongAreas: string[];
    improvementAreas: string[];
  };
  engagement: {
    studySessions: number;
    musicGenerated: number;
    communityInteractions: number;
    streakDays: number;
  };
  music: {
    totalTracksGenerated: number;
    totalListeningTime: number;
    popularGenres: { genre: string; count: number }[];
    engagementRate: number;
  };
}

const UnifiedAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    overview: {
      totalStudyTime: 248,
      averageSessionDuration: 45,
      completionRate: 87,
      improvementRate: 23
    },
    performance: {
      weeklyScores: [78, 82, 85, 88, 84, 90, 87],
      subjectPerformance: [
        { subject: 'Cardiologie', score: 92, trend: 'up' },
        { subject: 'Neurologie', score: 78, trend: 'down' },
        { subject: 'Pneumologie', score: 85, trend: 'stable' },
        { subject: 'Gastroentérologie', score: 88, trend: 'up' }
      ],
      strongAreas: ['Diagnostic', 'Thérapeutique', 'Prévention'],
      improvementAreas: ['Anatomie', 'Pharmacologie']
    },
    engagement: {
      studySessions: 156,
      musicGenerated: 24,
      communityInteractions: 45,
      streakDays: 12
    },
    music: {
      totalTracksGenerated: 24,
      totalListeningTime: 1847,
      popularGenres: [
        { genre: 'Lo-Fi', count: 8 },
        { genre: 'Ambiant', count: 6 },
        { genre: 'Classical', count: 5 },
        { genre: 'Nature', count: 5 }
      ],
      engagementRate: 94
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simule le chargement des données
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [selectedPeriod]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <div className="w-4 h-4 bg-yellow-500 rounded-full" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-500 bg-green-500/10';
      case 'down': return 'text-red-500 bg-red-500/10';
      default: return 'text-yellow-500 bg-yellow-500/10';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const exportData = () => {
    // Logique d'export des données
    const dataToExport = {
      period: selectedPeriod,
      exportDate: new Date().toISOString(),
      data: analyticsData
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `med-mng-analytics-${selectedPeriod}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Helmet>
        <title>Analytics Unifiées - MED-MNG</title>
        <meta name="description" content="Analyses détaillées de vos performances d'apprentissage, temps d'étude et engagement" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Analytics Unifiées
              </h1>
              <p className="text-muted-foreground mt-2">
                Analyses détaillées de vos performances et de votre progression
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 jours</SelectItem>
                  <SelectItem value="30d">30 jours</SelectItem>
                  <SelectItem value="3m">3 mois</SelectItem>
                  <SelectItem value="1y">1 an</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
              
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
            </div>
          </motion.div>

          {/* Métriques principales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              {
                icon: Clock,
                label: 'Temps total',
                value: formatTime(analyticsData.overview.totalStudyTime * 60),
                trend: '+12%',
                trendType: 'up'
              },
              {
                icon: Target,
                label: 'Taux de réussite',
                value: `${analyticsData.overview.completionRate}%`,
                trend: '+5%',
                trendType: 'up'
              },
              {
                icon: Trophy,
                label: 'Sessions moyenne',
                value: `${analyticsData.overview.averageSessionDuration}min`,
                trend: '+8min',
                trendType: 'up'
              },
              {
                icon: TrendingUp,
                label: 'Amélioration',
                value: `+${analyticsData.overview.improvementRate}%`,
                trend: 'Ce mois',
                trendType: 'up'
              }
            ].map((metric, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <metric.icon className="w-5 h-5 text-primary" />
                      <Badge variant="secondary" className={getTrendColor(metric.trendType)}>
                        {metric.trend}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold mb-1">{metric.value}</div>
                    <div className="text-sm text-muted-foreground">{metric.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Contenu avec onglets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="performance" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="music">Musique</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Graphique de performance */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Évolution des Scores</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                        <div className="text-center">
                          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">Graphique de performance</p>
                          <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                            {analyticsData.performance.weeklyScores.map((score, index) => (
                              <div key={index} className="text-center">
                                <div className="w-8 h-16 bg-primary/20 rounded flex items-end">
                                  <div 
                                    className="w-full bg-primary rounded-b"
                                    style={{ height: `${(score / 100) * 100}%` }}
                                  />
                                </div>
                                <p className="mt-1">{score}%</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance par matière */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance par Matière</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analyticsData.performance.subjectPerformance.map((subject, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{subject.subject}</span>
                              {getTrendIcon(subject.trend)}
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-500"
                                style={{ width: `${subject.score}%` }}
                              />
                            </div>
                          </div>
                          <div className="ml-4 text-sm font-medium">
                            {subject.score}%
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Points forts et axes d'amélioration */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <Trophy className="w-5 h-5" />
                        Points Forts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analyticsData.performance.strongAreas.map((area, index) => (
                          <Badge key={index} className="mr-2 mb-2 bg-green-500/10 text-green-600">
                            <Star className="w-3 h-3 mr-1" />
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-600">
                        <Target className="w-5 h-5" />
                        À Améliorer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analyticsData.performance.improvementAreas.map((area, index) => (
                          <Badge key={index} className="mr-2 mb-2 bg-orange-500/10 text-orange-600">
                            <Target className="w-3 h-3 mr-1" />
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="engagement" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      icon: BookOpen,
                      title: 'Sessions d\'étude',
                      value: analyticsData.engagement.studySessions,
                      description: 'Sessions complétées',
                      color: 'text-blue-500'
                    },
                    {
                      icon: Music,
                      title: 'Musiques générées',
                      value: analyticsData.engagement.musicGenerated,
                      description: 'Tracks créées',
                      color: 'text-purple-500'
                    },
                    {
                      icon: Users,
                      title: 'Interactions',
                      value: analyticsData.engagement.communityInteractions,
                      description: 'Dans la communauté',
                      color: 'text-green-500'
                    },
                    {
                      icon: Calendar,
                      title: 'Série actuelle',
                      value: `${analyticsData.engagement.streakDays} jours`,
                      description: 'Jours consécutifs',
                      color: 'text-orange-500'
                    }
                  ].map((metric, index) => (
                    <Card key={index}>
                      <CardContent className="p-6 text-center">
                        <metric.icon className={`w-8 h-8 mx-auto mb-4 ${metric.color}`} />
                        <div className="text-2xl font-bold mb-2">{metric.value}</div>
                        <div className="font-medium mb-1">{metric.title}</div>
                        <div className="text-sm text-muted-foreground">{metric.description}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="music" className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Statistiques Musicales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center">
                          <Music className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                          <div className="text-2xl font-bold">{analyticsData.music.totalTracksGenerated}</div>
                          <div className="text-sm text-muted-foreground">Musiques créées</div>
                        </div>
                        <div className="text-center">
                          <Headphones className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                          <div className="text-2xl font-bold">{formatTime(analyticsData.music.totalListeningTime)}</div>
                          <div className="text-sm text-muted-foreground">Temps d'écoute</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Engagement Musical</h4>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
                            style={{ width: `${analyticsData.music.engagementRate}%` }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {analyticsData.music.engagementRate}% des musiques générées sont écoutées
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Genres Populaires</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analyticsData.music.popularGenres.map((genre, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-medium">{genre.genre}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${(genre.count / 8) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{genre.count}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        Insights IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <h4 className="font-medium text-blue-700 mb-2">📈 Tendance Positive</h4>
                        <p className="text-sm">
                          Vos performances en cardiologie s'améliorent de 23% ce mois-ci. 
                          Continuez à utiliser la méthode musicale !
                        </p>
                      </div>
                      
                      <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <h4 className="font-medium text-orange-700 mb-2">⚠️ Zone d'Attention</h4>
                        <p className="text-sm">
                          Temps de révision en neurologie inférieur à la moyenne. 
                          Recommandation : 2 sessions supplémentaires cette semaine.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                        <h4 className="font-medium text-green-700 mb-2">🎯 Objectif Atteignable</h4>
                        <p className="text-sm">
                          Vous êtes à 87% de votre objectif mensuel. 
                          Plus que 3 sessions pour l'atteindre !
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Recommandations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        {
                          type: 'study',
                          title: 'Réviser la neurologie',
                          description: 'Planifiez 2 sessions cette semaine',
                          priority: 'high'
                        },
                        {
                          type: 'music',
                          title: 'Créer musique de concentration',
                          description: 'Style Lo-Fi recommandé pour vos prochaines sessions',
                          priority: 'medium'
                        },
                        {
                          type: 'community',
                          title: 'Participer au forum',
                          description: 'Aidez d\'autres étudiants en cardiologie',
                          priority: 'low'
                        }
                      ].map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            recommendation.priority === 'high' ? 'bg-red-500' :
                            recommendation.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <div className="flex-1">
                            <h4 className="font-medium">{recommendation.title}</h4>
                            <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default UnifiedAnalytics;