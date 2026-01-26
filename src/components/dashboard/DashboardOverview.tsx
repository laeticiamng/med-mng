import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, Music, Users, TrendingUp, Clock, Target, 
  Trophy, Star, Play, HeadphonesIcon, Calendar, BarChart3, Flame, Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { useGamification, XP_PER_LEVEL } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { supabase } from '@/integrations/supabase/client';

interface QuickStat {
  label: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface Activity {
  id: string;
  type: 'study' | 'music' | 'quiz' | 'achievement';
  title: string;
  timestamp: string;
  description: string;
}

export const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const { stats: gamificationStats, loadStats } = useGamification();
  const { getTodayStats } = useActivityTracking();
  const [todayStats, setTodayStats] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
        const stats = await getTodayStats();
        setTodayStats(stats);
      }
    };
    init();
  }, [loadStats, getTodayStats]);

  const level = gamificationStats ? Math.floor((gamificationStats.currentXP || 0) / XP_PER_LEVEL) + 1 : 1;
  const xpProgress = gamificationStats ? ((gamificationStats.currentXP || 0) % XP_PER_LEVEL) / XP_PER_LEVEL * 100 : 0;

  const quickStats: QuickStat[] = [
    {
      label: 'Items Étudiés',
      value: '47',
      change: '+12 cette semaine',
      icon: BookOpen,
      color: 'text-primary'
    },
    {
      label: 'Musiques Générées',
      value: '23',
      change: '+5 aujourd\'hui',
      icon: Music,
      color: 'text-accent'
    },
    {
      label: 'Temps d\'Étude',
      value: '8h 32m',
      change: '+2h cette semaine',
      icon: Clock,
      color: 'text-success'
    },
    {
      label: 'Score Moyen',
      value: '84%',
      change: '+7% ce mois',
      icon: Target,
      color: 'text-warning'
    }
  ];

  const recentActivities: Activity[] = [
    {
      id: '1',
      type: 'music',
      title: 'Musique générée',
      timestamp: 'il y a 2h',
      description: 'IC-157 Diabète - Style LoFi'
    },
    {
      id: '2',
      type: 'study',
      title: 'Item complété',
      timestamp: 'il y a 4h',
      description: 'IC-042 Hypertension artérielle'
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Badge obtenu',
      timestamp: 'hier',
      description: 'Expert Cardiologie - 25 items complétés'
    },
    {
      id: '4',
      type: 'quiz',
      title: 'Quiz réussi',
      timestamp: 'il y a 2 jours',
      description: 'IC-001 Communication - Score: 92%'
    }
  ];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'music': return <Music className="w-4 h-4 text-accent" />;
      case 'study': return <BookOpen className="w-4 h-4 text-primary" />;
      case 'quiz': return <Target className="w-4 h-4 text-success" />;
      case 'achievement': return <Trophy className="w-4 h-4 text-warning" />;
      default: return <Star className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec gamification */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Tableau de Bord
          </h1>
          <p className="text-muted-foreground mt-1">
            Suivez votre progression et découvrez de nouveaux contenus
          </p>
        </div>
        <div className="flex items-center gap-3">
          {gamificationStats && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 py-1.5 px-3">
                <Flame className="h-4 w-4 text-warning" />
                <span className="font-semibold">{gamificationStats.currentStreak || 0}j</span>
              </Badge>
              <Badge variant="outline" className="gap-1 py-1.5 px-3">
                <Award className="h-4 w-4 text-primary" />
                <span className="font-semibold">{gamificationStats.badges?.length || 0}</span>
              </Badge>
            </div>
          )}
          <Button onClick={() => navigate(ROUTE_PATHS.ednComplete)}>
            <BookOpen className="w-4 h-4 mr-2" />
            Continuer l'étude
          </Button>
        </div>
      </div>

      {/* Gamification Card */}
      {gamificationStats && user && (
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-warning/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Niveau {level}</h3>
                  <p className="text-sm text-muted-foreground">{gamificationStats.currentXP || 0} XP total</p>
                </div>
              </div>
              <div className="flex-1 max-w-xs">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progression niveau</span>
                  <span>{Math.round(xpProgress)}%</span>
                </div>
                <Progress value={xpProgress} className="h-2" />
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-warning">{gamificationStats.currentStreak || 0}</p>
                  <p className="text-xs text-muted-foreground">Jours de suite</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{gamificationStats.badges?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Badges</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">{todayStats?.totalActivities || 0}</p>
                  <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate(ROUTE_PATHS.progressDashboard)}>
                Voir détails
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <p className="text-xs text-success mt-2">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progression actuelle */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Progression Globale
            </CardTitle>
            <CardDescription>
              Votre avancement dans le programme EDN
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Items Rang A</span>
                <span className="text-sm text-muted-foreground">47/183</span>
              </div>
              <Progress value={26} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Items Rang B</span>
                <span className="text-sm text-muted-foreground">23/184</span>
              </div>
              <Progress value={13} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Compétences OIC</span>
                <span className="text-sm text-muted-foreground">312/4872</span>
              </div>
              <Progress value={6} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
            <CardDescription>
              Accédez rapidement aux fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => navigate(ROUTE_PATHS.generator)}
            >
              <Music className="w-4 h-4 mr-2" />
              Générer une musique
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate(ROUTE_PATHS.ecosIndex)}
            >
              <Users className="w-4 h-4 mr-2" />
              Démarrer un ECOS
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate(ROUTE_PATHS.chat)}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Poser une question IA
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate(ROUTE_PATHS.medMngAnalytics)}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Voir mes statistiques
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activités récentes */}
        <Card>
          <CardHeader>
            <CardTitle>Activités Récentes</CardTitle>
            <CardDescription>
              Vos dernières actions sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommandations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommandations</CardTitle>
            <CardDescription>
              Suggestions personnalisées pour votre apprentissage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">IC-058 Schizophrénie</h4>
                <Badge variant="secondary">Psychiatrie</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Complétez ce module pour renforcer vos connaissances en psychiatrie
              </p>
              <Button size="sm" onClick={() => navigate(`${ROUTE_PATHS.ednComplete}/ic-058`)}>
                <Play className="w-3 h-3 mr-1" />
                Commencer
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Révision Cardiologie</h4>
                <Badge variant="outline">Révision</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Il est temps de réviser vos items de cardiologie étudiés il y a une semaine
              </p>
              <Button size="sm" variant="outline">
                <Calendar className="w-3 h-3 mr-1" />
                Programmer
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Playlist Urgences</h4>
                <Badge variant="secondary">Musique</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Découvrez notre playlist spécialement conçue pour les items d'urgence
              </p>
              <Button size="sm" variant="outline">
                <HeadphonesIcon className="w-3 h-3 mr-1" />
                Écouter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};