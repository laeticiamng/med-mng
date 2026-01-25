import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { BADGE_DEFINITIONS, useGamification, XP_PER_LEVEL } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import {
    Award,
    Brain,
    Calendar,
    Clock,
    Music,
    Star,
    Target,
    TrendingUp,
    Trophy,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

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
  const [_activeTab, _setActiveTab] = useState('overview');
  const [_user, setUser] = useState<any>(null);
  const { _stats: gamificationStats, loadStats } = useGamification();
  const { getWeeklySummary } = useActivityTracking();
  const [weeklySummary, setWeeklySummary] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
        const summary = await getWeeklySummary();
        setWeeklySummary(summary);
      }
    };
    init();
  }, [loadStats, getWeeklySummary]);

  // Use real gamification data or fallback to mock
  const userStats: UserStats = {
    totalSessions: weeklySummary?.totalActivities || 147,
    studyHours: weeklySummary?.totalTime ? Math.round(weeklySummary.totalTime / 60 * 10) / 10 : 89.5,
    completedItems: 234,
    currentStreak: gamificationStats?.currentStreak || 12,
    averageScore: weeklySummary?.averageScore || 87.3,
    level: gamificationStats?.level || 15,
    xp: gamificationStats?.totalPoints || 8750,
    nextLevelXp: XP_PER_LEVEL
  };

  // Use real badges from gamification or fallback to mock
  const recentAchievements: Achievement[] = gamificationStats?.badges?.slice(0, 3).map((badge: any) => {
    const badgeDef = BADGE_DEFINITIONS.find(b => b.id === badge.id);
    return {
      id: badge.id,
      name: badgeDef?.name || badge.id,
      description: badgeDef?.description || 'Badge débloqué',
      icon: Trophy,
      rarity: badgeDef?.rarity as Achievement['rarity'] || 'common',
      unlockedAt: badge.unlockedAt || new Date().toISOString()
    };
  }) || [
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
      case 'legendary': return 'bg-gradient-to-r from-warning to-warning/80';
      case 'epic': return 'bg-gradient-to-r from-accent to-accent/80';
      case 'rare': return 'bg-gradient-to-r from-primary to-primary/80';
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
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <p className="text-2xl font-bold">{userStats.totalSessions}</p>
            <p className="text-sm text-muted-foreground">Sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-success" />
            </div>
            <p className="text-2xl font-bold">{userStats.studyHours}h</p>
            <p className="text-sm text-muted-foreground">Étude</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-2">
              <Brain className="w-6 h-6 text-accent-foreground" />
            </div>
            <p className="text-2xl font-bold">{userStats.completedItems}</p>
            <p className="text-sm text-muted-foreground">Items</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-warning" />
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
                <achievement.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{achievement.name}</h4>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                <p className="text-xs text-muted-foreground">
                  Débloqué le {new Date(achievement.unlockedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <Badge variant="outline" className={achievement.rarity === 'legendary' ? 'border-warning text-warning' : 
                achievement.rarity === 'epic' ? 'border-accent text-accent-foreground' :
                achievement.rarity === 'rare' ? 'border-primary text-primary' : ''}>
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