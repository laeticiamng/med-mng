import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { useOptimizedAccessibility } from '@/hooks/useOptimizedAccessibility';
import { useEnhancedPerformance } from '@/hooks/useEnhancedPerformance';
import { logger } from '@/utils/structuredLogger';
import { 
  Activity,
  BarChart3, 
  TrendingUp, 
  Users, 
  Music, 
  BookOpen,
  Zap,
  Target,
  Clock,
  Award,
  Brain,
  HeartHandshake,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

const UnifiedDashboard: React.FC = () => {
  const { announceToScreenReader, isScreenReader } = useOptimizedAccessibility();
  const { 
    startRenderMeasurement, 
    endRenderMeasurement,
    getPerformanceScore,
    isPerformant 
  } = useEnhancedPerformance('UnifiedDashboard');

  const [stats, setStats] = useState({
    totalUsers: 12847,
    activeToday: 3421,
    musicGenerated: 8765,
    edmItems: 367,
    successRate: 94.2,
    learningHours: 15320,
    weeklyGrowth: 12.5,
    platformHealth: 98.7
  });

  const [isLoading, setIsLoading] = useState(true);

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'music_generation',
      title: 'Nouvelle musique générée',
      description: 'IC-15 - Cardiologie',
      time: '2 minutes',
      icon: Music,
      color: 'text-blue-500'
    },
    {
      id: 2,
      type: 'edn_completion',
      title: 'Item EDN complété',
      description: 'IC-23 - Gynécologie',
      time: '5 minutes',
      icon: BookOpen,
      color: 'text-green-500'
    },
    {
      id: 3,
      type: 'user_milestone',
      title: 'Objectif atteint',
      description: '50 items étudiés ce mois',
      time: '1 heure',
      icon: Award,
      color: 'text-yellow-500'
    }
  ]);

  const quickActions = [
    {
      title: 'Générer Musique',
      description: 'Créer une nouvelle musique d\'apprentissage',
      href: '/generator',
      icon: Music,
      color: 'from-blue-500 to-purple-600'
    },
    {
      title: 'Explorer EDN',
      description: 'Parcourir les 367 items EDN',
      href: '/edn',
      icon: BookOpen,
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Analytics',
      description: 'Voir les performances détaillées',
      href: '/analytics',
      icon: BarChart3,
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Communauté',
      description: 'Rejoindre les discussions',
      href: '/community',
      icon: Users,
      color: 'from-orange-500 to-red-600'
    }
  ];

  const performanceMetrics = useMemo(() => [
    { 
      label: 'Utilisateurs actifs', 
      value: stats.activeToday, 
      icon: Users, 
      trend: '+12%',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      label: 'Musiques générées', 
      value: stats.musicGenerated, 
      icon: Music, 
      trend: '+8%',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    { 
      label: 'Taux de réussite', 
      value: `${stats.successRate}%`, 
      icon: Target, 
      trend: '+2.1%',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    { 
      label: 'Heures d\'apprentissage', 
      value: stats.learningHours, 
      icon: Clock, 
      trend: '+15%',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ], [stats]);

  // Effect de performance et accessibilité
  useEffect(() => {
    startRenderMeasurement();
    
    const loadData = async () => {
      try {
        logger.info('Chargement du dashboard unifié', { component: 'UnifiedDashboard' });
        
        // Simulation du chargement des données
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setIsLoading(false);
        
        if (isScreenReader) {
          announceToScreenReader(
            'Dashboard unifié chargé. Vous pouvez naviguer entre les différentes sections avec Tab.',
            'polite'
          );
        }
        
        logger.info('Dashboard unifié chargé avec succès', { 
          component: 'UnifiedDashboard',
          metadata: { performanceScore: getPerformanceScore() }
        });
        
      } catch (error) {
        logger.error('Erreur lors du chargement du dashboard', 
          { component: 'UnifiedDashboard' }, error as Error);
      }
    };

    loadData();
    endRenderMeasurement();
  }, [startRenderMeasurement, endRenderMeasurement, isScreenReader, announceToScreenReader, getPerformanceScore]);

  return (
    <ConsistentBackground>
      <Helmet>
        <title>Dashboard Unifié | MED-MNG</title>
        <meta name="description" content="Tableau de bord principal de la plateforme MED-MNG avec analytics et vue d'ensemble." />
      </Helmet>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Dashboard Unifié
            </h1>
            <p className="text-muted-foreground">
              Vue d'ensemble de votre plateforme d'apprentissage médical
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button asChild className="bg-gradient-to-r from-primary to-accent">
              <Link to="/generator">
                <Zap className="w-4 h-4 mr-2" />
                Générer Contenu
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {performanceMetrics.map((metric, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {metric.value}
                    </p>
                    <p className="text-sm text-green-600 font-medium">
                      {metric.trend}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-primary/10">
                    <metric.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Actions Rapides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.href}
                      className="group block"
                    >
                      <div className="p-4 rounded-lg border hover:border-primary/50 transition-all duration-200 group-hover:shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color}`}>
                            <action.icon className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {action.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Analytics Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Aperçu Analytics
                  </CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/analytics">
                      Voir tout
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="learning" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="learning">Apprentissage</TabsTrigger>
                    <TabsTrigger value="content">Contenu</TabsTrigger>
                    <TabsTrigger value="engagement">Engagement</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="learning" className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Brain className="w-8 h-8 text-blue-500" />
                        <div>
                          <h4 className="font-semibold">Progression Globale</h4>
                          <p className="text-sm text-muted-foreground">67% des objectifs atteints</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">245/367</p>
                        <p className="text-sm text-green-600">+15 cette semaine</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Music className="w-8 h-8 text-purple-500" />
                        <div>
                          <h4 className="font-semibold">Contenu Généré</h4>
                          <p className="text-sm text-muted-foreground">Musiques et ressources</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">1,247</p>
                        <p className="text-sm text-blue-600">+23 aujourd'hui</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="engagement" className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <HeartHandshake className="w-8 h-8 text-pink-500" />
                        <div>
                          <h4 className="font-semibold">Engagement Communauté</h4>
                          <p className="text-sm text-muted-foreground">Interactions et partages</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">94.2%</p>
                        <p className="text-sm text-green-600">Excellent</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Activité Récente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`p-2 rounded-full bg-background border ${activity.color}`}>
                        <activity.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm">
                          {activity.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-1">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Il y a {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  État Système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Performance</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600">Excellent</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Disponibilité</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600">99.9%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Dernière MAJ</span>
                    <span className="text-sm text-muted-foreground">Il y a 2h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default UnifiedDashboard;