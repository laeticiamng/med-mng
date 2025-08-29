import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity,
  Clock,
  TrendingUp,
  Users,
  BookOpen,
  Music,
  Star,
  Target,
  Calendar,
  Zap,
  Heart,
  Award,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ActivityData {
  totalSessions: number;
  averageSessionTime: number;
  contentViewed: number;
  musicCreated: number;
  quizCompleted: number;
  socialInteractions: number;
  streakDays: number;
  totalPoints: number;
}

interface RecentActivity {
  id: string;
  type: 'content' | 'music' | 'quiz' | 'social' | 'achievement';
  title: string;
  description: string;
  timestamp: Date;
  points?: number;
  category?: string;
}

interface UserGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  deadline: Date;
  category: 'learning' | 'music' | 'social' | 'streak';
  priority: 'low' | 'medium' | 'high';
}

export const UniversalActivityTracker: React.FC = () => {
  const [activityData, setActivityData] = useState<ActivityData>({
    totalSessions: 0,
    averageSessionTime: 0,
    contentViewed: 0,
    musicCreated: 0,
    quizCompleted: 0,
    socialInteractions: 0,
    streakDays: 0,
    totalPoints: 0,
  });
  
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [userGoals, setUserGoals] = useState<UserGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivityData();
  }, []);

  const loadActivityData = async () => {
    try {
      setLoading(true);
      
      // Simuler les données d'activité
      setActivityData({
        totalSessions: 145,
        averageSessionTime: 42, // minutes
        contentViewed: 234,
        musicCreated: 27,
        quizCompleted: 89,
        socialInteractions: 156,
        streakDays: 14,
        totalPoints: 8547,
      });

      // Activités récentes
      setRecentActivities([
        {
          id: '1',
          type: 'content',
          title: 'Item EDN consulté',
          description: 'IC-290 - Épidémiologie et prévention des cancers',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          points: 15,
          category: 'Cancérologie'
        },
        {
          id: '2',
          type: 'music',
          title: 'Musique générée',
          description: 'Piste pédagogique pour la cardiologie',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          points: 25,
          category: 'Cardiologie'
        },
        {
          id: '3',
          type: 'quiz',
          title: 'Quiz complété',
          description: 'Score: 18/20 - Neurologie',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          points: 45,
          category: 'Neurologie'
        },
        {
          id: '4',
          type: 'achievement',
          title: 'Succès débloqué',
          description: 'Maître des Quiz - 10 scores parfaits',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          points: 100
        },
        {
          id: '5',
          type: 'social',
          title: 'Nouvel ami ajouté',
          description: 'Connection avec Dr. Sophie Martin',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          points: 10
        }
      ]);

      // Objectifs utilisateur
      setUserGoals([
        {
          id: 'daily_content',
          title: 'Contenu quotidien',
          description: 'Consulter 5 items EDN par jour',
          progress: 3,
          target: 5,
          deadline: new Date(new Date().setHours(23, 59, 59, 999)),
          category: 'learning',
          priority: 'high'
        },
        {
          id: 'weekly_music',
          title: 'Création musicale',
          description: 'Créer 3 musiques cette semaine',
          progress: 1,
          target: 3,
          deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          category: 'music',
          priority: 'medium'
        },
        {
          id: 'streak_goal',
          title: 'Streak de 30 jours',
          description: 'Maintenir une connexion quotidienne',
          progress: 14,
          target: 30,
          deadline: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
          category: 'streak',
          priority: 'medium'
        }
      ]);

    } catch (error) {
      console.error('Erreur lors du chargement des données d\'activité:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'content':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'music':
        return <Music className="h-4 w-4 text-purple-500" />;
      case 'quiz':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'social':
        return <Users className="h-4 w-4 text-orange-500" />;
      case 'achievement':
        return <Award className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: UserGoal['category']) => {
    switch (category) {
      case 'learning':
        return <BookOpen className="h-4 w-4" />;
      case 'music':
        return <Music className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
      case 'streak':
        return <Zap className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: UserGoal['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-orange-200 bg-orange-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) return `${minutes}m`;
    return `${hours}h`;
  };

  const formatTimeToDeadline = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}j restants`;
    if (hours > 0) return `${hours}h restantes`;
    return 'Bientôt fini !';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Suivi d'Activité Universel
        </CardTitle>
        <CardDescription>
          Votre progression et activité en temps réel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métriques principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">{activityData.totalSessions}</div>
            <div className="text-sm text-blue-600">Sessions</div>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
            <BookOpen className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700">{activityData.contentViewed}</div>
            <div className="text-sm text-green-600">Contenus vus</div>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <Music className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{activityData.musicCreated}</div>
            <div className="text-sm text-purple-600">Musiques créées</div>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <Zap className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-700">{activityData.streakDays}</div>
            <div className="text-sm text-orange-600">Jours de suite</div>
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Temps moyen par session</span>
              <Clock className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-xl font-bold">{activityData.averageSessionTime}min</div>
          </div>
          
          <div className="p-4 rounded-lg border bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Quiz complétés</span>
              <Target className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-xl font-bold">{activityData.quizCompleted}</div>
          </div>
          
          <div className="p-4 rounded-lg border bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Points totaux</span>
              <Star className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-xl font-bold text-yellow-600">{activityData.totalPoints.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activité récente */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activité Récente
            </h3>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-white border hover:shadow-sm transition-shadow">
                    <div className="p-2 rounded-full bg-gray-50">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 truncate">{activity.title}</h4>
                        <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {activity.category && (
                          <Badge variant="secondary" className="text-xs">
                            {activity.category}
                          </Badge>
                        )}
                        {activity.points && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs font-medium text-yellow-600">+{activity.points}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Objectifs utilisateur */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Mes Objectifs
            </h3>
            <div className="space-y-4">
              {userGoals.map((goal) => (
                <div key={goal.id} className={`p-4 rounded-lg border-2 ${getPriorityColor(goal.priority)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(goal.category)}
                      <h4 className="font-medium text-gray-900">{goal.title}</h4>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {goal.priority === 'high' ? 'Priorité haute' : 
                       goal.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progression</span>
                      <span className="font-medium">{goal.progress} / {goal.target}</span>
                    </div>
                    <Progress value={(goal.progress / goal.target) * 100} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{Math.round((goal.progress / goal.target) * 100)}% complété</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatTimeToDeadline(goal.deadline)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button size="sm" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Voir Analytics Détaillés
          </Button>
          <Button size="sm" variant="outline" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Définir Nouvel Objectif
          </Button>
          <Button size="sm" variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Planifier Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};