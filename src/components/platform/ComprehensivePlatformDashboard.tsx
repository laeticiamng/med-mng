import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Music, 
  TrendingUp, 
  Zap, 
  Heart,
  Star,
  Clock,
  Target,
  Award,
  Brain,
  Headphones,
  MessageSquare,
  Settings,
  Play,
  Download,
  Share2,
  Bookmark,
  Calendar,
  Activity,
  Globe,
  Shield,
  Sparkles,
  Rocket
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalContent: number;
  totalMusic: number;
  totalPlays: number;
  avgEngagement: number;
}

interface UserActivity {
  id: string;
  type: 'learning' | 'music' | 'quiz' | 'social';
  title: string;
  description: string;
  timestamp: Date;
  points?: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  total: number;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const ComprehensivePlatformDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalContent: 0,
    totalMusic: 0,
    totalPlays: 0,
    avgEngagement: 0,
  });
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState(12);
  const [userXP, setUserXP] = useState(2847);
  const [nextLevelXP, setNextLevelXP] = useState(3000);

  // Charger les données de la plateforme
  useEffect(() => {
    loadPlatformData();
  }, []);

  const loadPlatformData = async () => {
    try {
      setLoading(true);
      
      // Simuler les statistiques de la plateforme
      setStats({
        totalUsers: 15420,
        activeUsers: 8934,
        totalContent: 2847,
        totalMusic: 1205,
        totalPlays: 45892,
        avgEngagement: 87.5,
      });

      // Activités récentes
      setRecentActivities([
        {
          id: '1',
          type: 'learning',
          title: 'Nouveau contenu EDN',
          description: 'Vous avez consulté l\'item IC-234',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          points: 15
        },
        {
          id: '2',
          type: 'music',
          title: 'Musique générée',
          description: 'Création d\'une nouvelle piste pédagogique',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          points: 25
        },
        {
          id: '3',
          type: 'quiz',
          title: 'Quiz complété',
          description: 'Score parfait sur le quiz de cardiologie',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          points: 50
        },
        {
          id: '4',
          type: 'social',
          title: 'Nouvel ami',
          description: 'Connection avec Dr. Martin',
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
          points: 10
        }
      ]);

      // Achievements
      setAchievements([
        {
          id: 'first_music',
          name: 'Premier Compositeur',
          description: 'Créez votre première musique pédagogique',
          icon: <Music className="h-6 w-6" />,
          progress: 1,
          total: 1,
          unlocked: true,
          rarity: 'common'
        },
        {
          id: 'quiz_master',
          name: 'Maître des Quiz',
          description: 'Obtenez 10 scores parfaits',
          icon: <Brain className="h-6 w-6" />,
          progress: 7,
          total: 10,
          unlocked: false,
          rarity: 'rare'
        },
        {
          id: 'social_butterfly',
          name: 'Papillon Social',
          description: 'Connectez-vous avec 50 utilisateurs',
          icon: <Users className="h-6 w-6" />,
          progress: 23,
          total: 50,
          unlocked: false,
          rarity: 'epic'
        },
        {
          id: 'legend',
          name: 'Légende Médicale',
          description: 'Atteignez le niveau 25',
          icon: <Award className="h-6 w-6" />,
          progress: userLevel,
          total: 25,
          unlocked: false,
          rarity: 'legendary'
        }
      ]);

    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Créer Musique',
      description: 'Nouveau contenu musical',
      icon: <Music className="h-5 w-5" />,
      action: () => navigate('/med-mng/create'),
      color: 'bg-purple-500',
      isNew: true
    },
    {
      title: 'Explorer EDN',
      description: 'Parcourir les contenus',
      icon: <BookOpen className="h-5 w-5" />,
      action: () => navigate('/edn'),
      color: 'bg-blue-500',
      isPopular: true
    },
    {
      title: 'Voir Analytics',
      description: 'Suivre vos progrès',
      icon: <BarChart3 className="h-5 w-5" />,
      action: () => navigate('/analytics'),
      color: 'bg-green-500'
    },
    {
      title: 'Rejoindre Chat',
      description: 'IA médicale conversationnelle',
      icon: <MessageSquare className="h-5 w-5" />,
      action: () => navigate('/chat'),
      color: 'bg-orange-500',
      isNew: true
    },
    {
      title: 'Ma Bibliothèque',
      description: 'Contenus sauvegardés',
      icon: <Bookmark className="h-5 w-5" />,
      action: () => navigate('/med-mng/library'),
      color: 'bg-indigo-500'
    },
    {
      title: 'Communauté',
      description: 'Connecter avec d\'autres',
      icon: <Users className="h-5 w-5" />,
      action: () => navigate('/med-mng/community'),
      color: 'bg-pink-500'
    }
  ];

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
    }
  };

  const getActivityIcon = (type: UserActivity['type']) => {
    switch (type) {
      case 'learning': return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'music': return <Music className="h-4 w-4 text-purple-500" />;
      case 'quiz': return <Brain className="h-4 w-4 text-green-500" />;
      case 'social': return <Users className="h-4 w-4 text-orange-500" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `Il y a ${minutes}m`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header avec niveau utilisateur */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard Complet</h1>
            <p className="text-purple-100">Votre centre de contrôle MED-MNG</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-300" />
              <span className="text-xl font-bold">Niveau {userLevel}</span>
            </div>
            <Progress value={(userXP / nextLevelXP) * 100} className="w-40 mb-2" />
            <p className="text-sm text-purple-100">{userXP} / {nextLevelXP} XP</p>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Utilisateurs Actifs</p>
                <p className="text-3xl font-bold">{stats.activeUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Contenus EDN</p>
                <p className="text-3xl font-bold">{stats.totalContent.toLocaleString()}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Musiques Créées</p>
                <p className="text-3xl font-bold">{stats.totalMusic.toLocaleString()}</p>
              </div>
              <Music className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Engagement</p>
                <p className="text-3xl font-bold">{stats.avgEngagement}%</p>
              </div>
              <Activity className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Actions Rapides
          </CardTitle>
          <CardDescription>
            Accédez rapidement à vos fonctionnalités préférées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 relative group hover:scale-105 transition-all"
                onClick={action.action}
              >
                {action.isNew && (
                  <Badge className="absolute -top-2 -right-2 bg-green-500 text-xs px-1 py-0">
                    Nouveau
                  </Badge>
                )}
                {action.isPopular && (
                  <Badge className="absolute -top-2 -right-2 bg-orange-500 text-xs px-1 py-0">
                    Populaire
                  </Badge>
                )}
                <div className={`p-2 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contenu principal avec onglets */}
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Activité Récente</TabsTrigger>
          <TabsTrigger value="achievements">Succès</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Activité Récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="p-2 rounded-full bg-white shadow-sm">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{activity.title}</h4>
                          <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        {activity.points && (
                          <div className="flex items-center gap-1 mt-2">
                            <Sparkles className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs font-medium text-yellow-600">+{activity.points} XP</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Succès & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)} ${
                      achievement.unlocked ? 'opacity-100' : 'opacity-60'
                    } transition-all hover:scale-105`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        achievement.unlocked ? 'bg-white shadow-sm' : 'bg-gray-200'
                      }`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900">{achievement.name}</h4>
                          {achievement.unlocked && <Badge className="bg-green-100 text-green-700">Débloqué</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Progression</span>
                            <span className="font-medium">{achievement.progress} / {achievement.total}</span>
                          </div>
                          <Progress value={(achievement.progress / achievement.total) * 100} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progression d'apprentissage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Items EDN complétés</span>
                      <span>234 / 367</span>
                    </div>
                    <Progress value={64} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Quiz réussis</span>
                      <span>89 / 120</span>
                    </div>
                    <Progress value={74} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Musiques créées</span>
                      <span>27 / ∞</span>
                    </div>
                    <Progress value={100} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temps d'étude</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">124h 32m</div>
                    <p className="text-sm text-gray-600">Cette semaine</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Lundi</span>
                      <span>2h 45m</span>
                    </div>
                    <Progress value={85} />
                    <div className="flex justify-between text-sm">
                      <span>Mardi</span>
                      <span>3h 12m</span>
                    </div>
                    <Progress value={95} />
                    <div className="flex justify-between text-sm">
                      <span>Aujourd'hui</span>
                      <span>1h 23m</span>
                    </div>
                    <Progress value={45} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recommandations Personnalisées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: 'Réviser la Cardiologie',
                    description: 'Basé sur vos derniers scores de quiz',
                    action: 'Commencer la révision',
                    priority: 'high',
                    icon: <Heart className="h-4 w-4" />
                  },
                  {
                    title: 'Créer une playlist d\'étude',
                    description: 'Organisez vos musiques pédagogiques favorites',
                    action: 'Créer une playlist',
                    priority: 'medium',
                    icon: <Music className="h-4 w-4" />
                  },
                  {
                    title: 'Rejoindre un groupe d\'étude',
                    description: 'Connectez-vous avec d\'autres étudiants',
                    action: 'Découvrir les groupes',
                    priority: 'low',
                    icon: <Users className="h-4 w-4" />
                  }
                ].map((rec, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-full ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-600' :
                      rec.priority === 'medium' ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {rec.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      {rec.action}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};