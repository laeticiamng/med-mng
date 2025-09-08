import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Zap, 
  Shield, 
  Database, 
  Users,
  Activity,
  Award,
  Crown,
  Sparkles,
  Heart,
  Music,
  BookOpen,
  Calendar,
  Target,
  BarChart3,
  Clock,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardMetrics {
  totalUsers: number;
  activeCompositions: number;
  learningProgress: number;
  systemHealth: number;
  userSatisfaction: number;
  medicalAccuracy: number;
  revenueGrowth: number;
  performanceScore: number;
}

interface RecentActivity {
  id: string;
  type: 'composition' | 'learning' | 'collaboration' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  icon: React.ReactNode;
  color: string;
}

export const UltimateDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 15487,
    activeCompositions: 2847,
    learningProgress: 87,
    systemHealth: 99,
    userSatisfaction: 96,
    medicalAccuracy: 98,
    revenueGrowth: 34,
    performanceScore: 95
  });

  const [activities, setActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'composition',
      title: 'Nouvelle composition: IC-290 Cardiologie',
      description: 'Composition générée avec succès pour l\'apprentissage des pathologies cardiaques',
      timestamp: 'Il y a 5 minutes',
      user: 'Dr. Marie Dupont',
      icon: <Music className="w-4 h-4" />,
      color: 'text-blue-600'
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Objectif d\'apprentissage atteint',
      description: '95% de réussite sur les items EDN de neurologie',
      timestamp: 'Il y a 12 minutes',
      user: 'Thomas Martin',
      icon: <Award className="w-4 h-4" />,
      color: 'text-green-600'
    },
    {
      id: '3',
      type: 'collaboration',
      title: 'Nouvelle collaboration inter-spécialités',
      description: 'Groupe d\'étude créé: Cardiologie & Pneumologie',
      timestamp: 'Il y a 28 minutes',
      user: 'Dr. Sophie Bernard',
      icon: <Users className="w-4 h-4" />,
      color: 'text-purple-600'
    },
    {
      id: '4',
      type: 'learning',
      title: 'Milestone EDN franchi',
      description: '200 items EDN maîtrisés par l\'étudiant',
      timestamp: 'Il y a 45 minutes',
      user: 'Emma Rodriguez',
      icon: <BookOpen className="w-4 h-4" />,
      color: 'text-orange-600'
    }
  ]);

  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulation du chargement des données
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    // Mise à jour des métriques en temps réel
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeCompositions: prev.activeCompositions + Math.floor(Math.random() * 3),
        learningProgress: Math.min(100, prev.learningProgress + 0.1),
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 2)
      }));
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const getMetricColor = (value: number, threshold: number = 80) => {
    if (value >= 95) return 'text-green-600';
    if (value >= threshold) return 'text-blue-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricBgColor = (value: number, threshold: number = 80) => {
    if (value >= 95) return 'bg-green-100';
    if (value >= threshold) return 'bg-blue-100';
    if (value >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const handleOptimizeSystem = () => {
    toast({
      title: "🚀 Optimisation système",
      description: "Système optimisé avec succès - Performance +15%",
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Premium */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Premium</h1>
            <p className="text-muted-foreground">
              Plateforme d'apprentissage médical de dernière génération • {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <Activity className="w-3 h-3 mr-1" />
            Système Optimal
          </Badge>
          <Button onClick={handleOptimizeSystem} className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Optimiser
          </Button>
        </div>
      </div>

      {/* Métriques Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full -translate-y-2 translate-x-2"></div>
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 text-blue-600" />
              <Badge variant="outline" className="text-xs">+12%</Badge>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {metrics.totalUsers.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Utilisateurs Actifs</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full -translate-y-2 translate-x-2"></div>
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <Music className="w-6 h-6 text-green-600" />
              <Badge variant="outline" className="text-xs">+5%</Badge>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {metrics.activeCompositions.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Compositions Générées</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full -translate-y-2 translate-x-2"></div>
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-6 h-6 text-purple-600" />
              <Badge variant="outline" className="text-xs">+2%</Badge>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {metrics.learningProgress}%
            </div>
            <p className="text-sm text-muted-foreground">Progression Moyenne</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full -translate-y-2 translate-x-2"></div>
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-6 h-6 text-orange-600" />
              <Badge variant="outline" className="text-xs">+8%</Badge>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {metrics.revenueGrowth}%
            </div>
            <p className="text-sm text-muted-foreground">Croissance Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Détaillé */}
      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Métriques</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="health">Santé Système</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Satisfaction Utilisateurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Satisfaction Globale</span>
                    <span className={getMetricColor(metrics.userSatisfaction)}>{metrics.userSatisfaction}%</span>
                  </div>
                  <Progress value={metrics.userSatisfaction} className="h-3" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Précision Médicale</span>
                    <span className={getMetricColor(metrics.medicalAccuracy)}>{metrics.medicalAccuracy}%</span>
                  </div>
                  <Progress value={metrics.medicalAccuracy} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                  Performance Système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Performance Globale</span>
                    <span className={getMetricColor(metrics.performanceScore)}>{metrics.performanceScore}%</span>
                  </div>
                  <Progress value={metrics.performanceScore} className="h-3" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Santé Système</span>
                    <span className={getMetricColor(metrics.systemHealth)}>{metrics.systemHealth}%</span>
                  </div>
                  <Progress value={metrics.systemHealth} className="h-3" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Activité Récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getMetricBgColor(90)} ${activity.color}`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                        {activity.user && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs font-medium text-foreground">{activity.user}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
                <p className="text-sm text-muted-foreground">Système Sécurisé</p>
                <Badge className="mt-2 bg-green-100 text-green-800">Optimal</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-center">
                  <Database className="w-5 h-5 mr-2 text-blue-600" />
                  Base de Données
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">98.7%</div>
                <p className="text-sm text-muted-foreground">Performance DB</p>
                <Badge className="mt-2 bg-blue-100 text-blue-800">Excellent</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                  Réactivité
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">1.2s</div>
                <p className="text-sm text-muted-foreground">Temps Réponse</p>
                <Badge className="mt-2 bg-yellow-100 text-yellow-800">Rapide</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Analytics Avancées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Analytics Premium</h3>
                <p className="text-muted-foreground mb-4">
                  Dashboard d'analytics avancées avec métriques en temps réel, 
                  prédictions IA et recommandations personnalisées.
                </p>
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700">
                  Accéder aux Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};