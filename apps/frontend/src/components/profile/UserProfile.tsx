import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Trophy, 
  Calendar, 
  Music, 
  Brain, 
  Target,
  Zap,
  Star,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';

interface UserStats {
  totalSessions: number;
  studyHours: number;
  completedItems: number;
  currentStreak: number;
  averageScore: number;
  level: number;
  xp: number;
  nextLevelXp: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
}

export const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const userStats: UserStats = {
    totalSessions: 147,
    studyHours: 89.5,
    completedItems: 234,
    currentStreak: 12,
    averageScore: 87.3,
    level: 15,
    xp: 8750,
    nextLevelXp: 10000
  };

  const recentAchievements: Achievement[] = [
    {
      id: '1',
      name: 'Maître de la Cardiologie',
      description: 'Complétez tous les items de cardiologie avec 90%+',
      icon: Trophy,
      rarity: 'epic',
      unlockedAt: '2024-01-28'
    },
    {
      id: '2',
      name: 'Série Parfaite',
      description: 'Obtenez 10 scores parfaits consécutifs',
      icon: Target,
      rarity: 'rare',
      unlockedAt: '2024-01-25'
    },
    {
      id: '3',
      name: 'Mélomane Médical',
      description: 'Générez 50 musiques d\'étude',
      icon: Music,
      rarity: 'common',
      unlockedAt: '2024-01-20'
    }
  ];

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-purple-600';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-blue-600';
      default: return 'bg-muted';
    }
  };

  const levelProgress = (userStats.xp / userStats.nextLevelXp) * 100;

  return (
    <div className="space-y-6">
      {/* Profil principal */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src="/api/placeholder/96/96" />
              <AvatarFallback className="text-2xl font-bold">EM</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">Étudiant Médecine</h2>
                <p className="text-muted-foreground">Médecine Générale • 4ème année</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="gap-1">
                    <Star className="w-3 h-3" />
                    Niveau {userStats.level}
                  </Badge>
                  <Badge variant="secondary">{userStats.currentStreak} jours d'affilée</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression niveau {userStats.level + 1}</span>
                  <span>{userStats.xp} / {userStats.nextLevelXp} XP</span>
                </div>
                <Progress value={levelProgress} className="h-3" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold">{userStats.totalSessions}</p>
            <p className="text-sm text-muted-foreground">Sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold">{userStats.studyHours}h</p>
            <p className="text-sm text-muted-foreground">Étude</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
              <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-bold">{userStats.completedItems}</p>
            <p className="text-sm text-muted-foreground">Items</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-2xl font-bold">{userStats.averageScore}%</p>
            <p className="text-sm text-muted-foreground">Score moyen</p>
          </CardContent>
        </Card>
      </div>

      {/* Succès récents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Succès récents
          </CardTitle>
          <CardDescription>
            Vos derniers accomplissements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentAchievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center gap-4 p-3 rounded-lg border">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRarityColor(achievement.rarity)}`}>
                <achievement.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{achievement.name}</h4>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                <p className="text-xs text-muted-foreground">
                  Débloqué le {new Date(achievement.unlockedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <Badge variant="outline" className={achievement.rarity === 'legendary' ? 'border-yellow-500 text-yellow-700 dark:text-yellow-400' : 
                achievement.rarity === 'epic' ? 'border-purple-500 text-purple-700 dark:text-purple-400' :
                achievement.rarity === 'rare' ? 'border-blue-500 text-blue-700 dark:text-blue-400' : ''}>
                {achievement.rarity}
              </Badge>
            </div>
          ))}
          <Button variant="outline" className="w-full">
            Voir tous les succès
          </Button>
        </CardContent>
      </Card>

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Activité récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: 'Complété IC-234 - Insuffisance cardiaque', time: 'il y a 2h', score: '94%' },
              { action: 'Généré une musique pour IC-156', time: 'il y a 4h', score: null },
              { action: 'Complété IC-189 - Hypertension artérielle', time: 'il y a 1j', score: '87%' },
              { action: 'Débloqué le succès "Série Parfaite"', time: 'il y a 2j', score: null }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                {activity.score && (
                  <Badge variant="secondary">{activity.score}</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};