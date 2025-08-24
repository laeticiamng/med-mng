import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Clock, TrendingUp, Target, Award, Calendar, 
  Music, Brain, Zap, Users, Star, ChevronRight
} from 'lucide-react';
import { ImmersiveCard } from './ImmersiveCard';
import { AnimatedStats } from './AnimatedStats';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface UserStats {
  totalStudyTime: number;
  completedItems: number;
  currentStreak: number;
  level: number;
  experience: number;
  nextLevelExp: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface RecentActivity {
  id: string;
  type: 'study' | 'complete' | 'achievement';
  title: string;
  timestamp: Date;
  duration?: number;
}

interface RecommendedContent {
  id: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  matchScore: number;
}

interface PersonalizedDashboardProps {
  userStats: UserStats;
  achievements: Achievement[];
  recentActivities: RecentActivity[];
  recommendations: RecommendedContent[];
  onNavigate: (path: string, item?: any) => void;
  className?: string;
}

export const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({
  userStats,
  achievements,
  recentActivities,
  recommendations,
  onNavigate,
  className = ''
}) => {
  const [greeting, setGreeting] = useState('');
  const [dailyGoalProgress, setDailyGoalProgress] = useState(0);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bonjour');
    else if (hour < 18) setGreeting('Bon après-midi');
    else setGreeting('Bonsoir');

    // Simulate daily goal progress (could be real data)
    setDailyGoalProgress(Math.min(100, (userStats.totalStudyTime % 120) / 120 * 100));
  }, [userStats.totalStudyTime]);

  const levelProgress = (userStats.experience / userStats.nextLevelExp) * 100;

  const statsData = [
    {
      label: 'Temps d\'étude total',
      value: Math.floor(userStats.totalStudyTime / 60),
      icon: <Clock className="h-4 w-4" />,
      color: 'blue' as const,
      suffix: 'h',
      format: 'number' as const
    },
    {
      label: 'Items complétés',
      value: userStats.completedItems,
      icon: <BookOpen className="h-4 w-4" />,
      color: 'green' as const,
      format: 'number' as const
    },
    {
      label: 'Série actuelle',
      value: userStats.currentStreak,
      icon: <Zap className="h-4 w-4" />,
      color: 'orange' as const,
      suffix: ' jours',
      format: 'number' as const
    },
    {
      label: 'Niveau',
      value: userStats.level,
      icon: <Star className="h-4 w-4" />,
      color: 'purple' as const,
      format: 'number' as const
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-orange-400 bg-orange-500/20';
      case 'hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const recentUnlockedAchievements = achievements
    .filter(a => a.unlocked)
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 3);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Welcome Header */}
      <ImmersiveCard variant="gradient" glow="purple" size="lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {greeting} ! 👋
            </h2>
            <p className="text-gray-300">
              Continuez votre parcours d'apprentissage médical
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-purple-600/20 text-purple-300 border-purple-400/30">
                Niveau {userStats.level}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-400">
                {userStats.experience} / {userStats.nextLevelExp} XP
              </div>
              <Progress value={levelProgress} className="w-32 h-2" />
            </div>
          </div>
        </div>
      </ImmersiveCard>

      {/* Stats Overview */}
      <AnimatedStats stats={statsData} className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Goal */}
        <ImmersiveCard variant="glass" glow="blue">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Target className="h-5 w-5" />
                Objectif quotidien
              </h3>
              <span className="text-sm text-gray-400">2h / jour</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Progression</span>
                <span className="text-white font-medium">{dailyGoalProgress.toFixed(0)}%</span>
              </div>
              <Progress value={dailyGoalProgress} className="h-3" />
            </div>

            {dailyGoalProgress >= 100 ? (
              <div className="p-3 bg-green-500/20 border border-green-400/30 rounded-lg">
                <div className="flex items-center gap-2 text-green-300">
                  <Award className="h-4 w-4" />
                  <span className="text-sm font-medium">Objectif atteint ! 🎉</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Encore {Math.ceil((120 - (userStats.totalStudyTime % 120)) / 60)}h pour atteindre votre objectif
              </p>
            )}
          </div>
        </ImmersiveCard>

        {/* Recent Achievements */}
        <ImmersiveCard variant="glass" glow="orange">
          <div className="space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements récents
            </h3>
            
            <div className="space-y-3">
              {recentUnlockedAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{achievement.title}</div>
                    <div className="text-xs text-gray-400">{achievement.description}</div>
                  </div>
                </div>
              ))}
              
              {recentUnlockedAchievements.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  Continuez à apprendre pour débloquer des achievements !
                </p>
              )}
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-white/20 text-white hover:bg-white/10"
              onClick={() => onNavigate('/achievements')}
            >
              Voir tous les achievements
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </ImmersiveCard>
      </div>

      {/* Recommendations */}
      <ImmersiveCard variant="glass" glow="green">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Recommandé pour vous
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('/recommendations')}
              className="text-gray-400 hover:text-white"
            >
              Voir tout
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate(`/edn/${item.id}`, item)}
                className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/10 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <Badge className={`text-xs ${getDifficultyColor(item.difficulty)}`}>
                    {item.difficulty}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{item.estimatedTime}min</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-green-400 rounded-full" />
                      <span className="text-green-400">{item.matchScore}% match</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ImmersiveCard>

      {/* Recent Activity */}
      <ImmersiveCard variant="glass" glow="purple">
        <div className="space-y-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Activité récente
          </h3>

          <div className="space-y-3">
            {recentActivities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full shrink-0" />
                <span className="text-gray-300 flex-1">{activity.title}</span>
                <span className="text-gray-400 text-xs">
                  {activity.timestamp.toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-white/20 text-white hover:bg-white/10"
            onClick={() => onNavigate('/activity')}
          >
            Voir l'historique complet
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </ImmersiveCard>
    </div>
  );
};