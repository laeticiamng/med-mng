import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Music, 
  Play, 
  Headphones, 
  TrendingUp, 
  Calendar, 
  Target,
  Zap,
  Star,
  Trophy,
  Clock,
  BarChart3,
  Users,
  BookOpen,
  Heart,
  Flame,
  ArrowRight,
  Music2,
  Library,
  Settings
} from 'lucide-react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useUnifiedMedicalMusicGeneration } from '@/hooks/useUnifiedMedicalMusicGeneration';
import { UnifiedMedicalMusicPlayer } from '@/components/UnifiedMedicalMusicPlayer';

interface DashboardStats {
  totalTracks: number;
  totalListeningTime: number;
  streakDays: number;
  completedSessions: number;
  favoriteGenre: string;
  weeklyProgress: number;
  monthlyGoal: number;
  achievements: number;
}

interface RecentActivity {
  id: string;
  type: 'listen' | 'create' | 'complete';
  title: string;
  time: string;
  duration?: number;
}

interface QuickStats {
  label: string;
  value: string;
  change: number;
  icon: any;
  color: string;
}

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    generateMedicalMusic,
    activeGenerations,
    generatedTracks,
    isGenerating,
    stats: unifiedStats
  } = useUnifiedMedicalMusicGeneration();

  // Stats utilisateur (combinées des vraies données et simulées)
  const [stats] = useState<DashboardStats>({
    totalTracks: unifiedStats.completedCount || 24,
    totalListeningTime: 847, // minutes
    streakDays: 12,
    completedSessions: 18,
    favoriteGenre: 'Trap Médical',
    weeklyProgress: Math.round(unifiedStats.totalProgress) || 75,
    monthlyGoal: 30,
    achievements: 8
  });

  // Activité récente (simulée)
  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'create',
      title: 'Cardiologie Trap - IC-230',
      time: 'il y a 2 heures',
      duration: 240
    },
    {
      id: '2',
      type: 'listen',
      title: 'Neurologie Lo-Fi - IC-103',
      time: 'il y a 4 heures',
      duration: 180
    },
    {
      id: '3',
      type: 'complete',
      title: 'Session Pneumologie complétée',
      time: 'hier',
    },
    {
      id: '4',
      type: 'create',
      title: 'Endocrinologie Pop - IC-267',
      time: 'il y a 2 jours',
      duration: 195
    }
  ]);

  // Stats rapides
  const quickStats: QuickStats[] = [
    {
      label: 'Musiques créées',
      value: stats.totalTracks.toString(),
      change: +12,
      icon: Music,
      color: 'text-blue-600'
    },
    {
      label: 'Temps d\'écoute',
      value: `${Math.floor(stats.totalListeningTime / 60)}h ${stats.totalListeningTime % 60}m`,
      change: +8,
      icon: Headphones,
      color: 'text-green-600'
    },
    {
      label: 'Série active',
      value: `${stats.streakDays} jours`,
      change: +1,
      icon: Flame,
      color: 'text-orange-600'
    },
    {
      label: 'Sessions terminées',
      value: stats.completedSessions.toString(),
      change: +5,
      icon: Target,
      color: 'text-purple-600'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create': return Music;
      case 'listen': return Headphones;
      case 'complete': return Trophy;
      default: return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'create': return 'text-blue-600 bg-blue-100';
      case 'listen': return 'text-green-600 bg-green-100';
      case 'complete': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create':
        navigate('/med-mng/create');
        break;
      case 'library':
        navigate('/med-mng/library');
        break;
      case 'player':
        navigate('/med-mng/player/1');
        break;
      case 'profile':
        navigate('/med-mng/profile');
        break;
      default:
        toast({
          title: "Action en cours de développement",
          description: "Cette fonctionnalité sera bientôt disponible."
        });
    }
  };

  return (
    <MedMngLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Bienvenue dans votre espace d'apprentissage musical
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <Flame className="h-3 w-3 mr-1" />
                  {stats.streakDays} jours
                </Badge>
                <Button 
                  onClick={() => handleQuickAction('create')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Music className="h-4 w-4 mr-2" />
                  Créer
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Stats rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-xs text-green-600">+{stat.change} ce mois</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Objectifs et progression */}
            <div className="lg:col-span-2 space-y-6">
              {/* Objectif mensuel */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span>Objectif Mensuel</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Progression vers 30 musiques</span>
                      <span className="text-sm font-medium">{stats.totalTracks}/{stats.monthlyGoal}</span>
                    </div>
                    <Progress value={stats.weeklyProgress} className="h-3" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Début du mois</span>
                      <span>{stats.weeklyProgress}% accompli</span>
                      <span>Fin du mois</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions rapides */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    <span>Actions Rapides</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={() => handleQuickAction('create')}
                      className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex flex-col items-center justify-center"
                    >
                      <Music className="h-6 w-6 mb-2" />
                      <span>Créer</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('library')}
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center"
                    >
                      <BookOpen className="h-6 w-6 mb-2" />
                      <span>Bibliothèque</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('player')}
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center"
                    >
                      <Play className="h-6 w-6 mb-2" />
                      <span>Lecteur</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('profile')}
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center"
                    >
                      <Users className="h-6 w-6 mb-2" />
                      <span>Profil</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activité récente */}
            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    <span>Activité Récente</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => {
                      const Icon = getActivityIcon(activity.type);
                      return (
                        <div key={activity.id} className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                          {activity.duration && (
                            <Badge variant="outline" className="text-xs">
                              {Math.floor(activity.duration / 60)}:{(activity.duration % 60).toString().padStart(2, '0')}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Achievements récents */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    <span>Succès Récents</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                        <Star className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Série de 10 jours</p>
                        <p className="text-xs text-gray-500">Débloqué il y a 2 jours</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                        <Music className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">25 créations musicales</p>
                        <p className="text-xs text-gray-500">En progression</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                        <Heart className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Mélomane Expert</p>
                        <p className="text-xs text-gray-500">100+ écoutes</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleQuickAction('profile')}
                    variant="outline" 
                    className="w-full mt-4"
                  >
                    Voir tous les succès
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Générations actives intégrées */}
          {activeGenerations.length > 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Music2 className="h-5 w-5 text-primary animate-pulse" />
                  <span>Générations en cours</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeGenerations.map((generation) => (
                    <div key={generation.taskId} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{generation.taskId}</h4>
                          <p className="text-sm text-muted-foreground">{generation.stage}</p>
                        </div>
                        <Badge variant={generation.status === 'generating' ? 'default' : 'secondary'}>
                          {generation.status}
                        </Badge>
                      </div>
                      <Progress value={generation.progress} className="mb-2" />
                      <div className="text-xs text-muted-foreground">
                        {generation.progress}% - {Math.ceil(generation.estimatedTime / 60)}min restantes
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lecteur unifié */}
          <div className="mt-8">
            <UnifiedMedicalMusicPlayer />
          </div>
        </div>
      </div>
    </MedMngLayout>
  );
};

export default Dashboard;