import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BADGE_DEFINITIONS, useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import {
    Award,
    Calendar, Clock,
    Crown, Flame,
    RefreshCw,
    Shield, Sparkles,
    Star, Target,
    TrendingUp,
    Trophy,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface BadgeUI {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  reward: string;
  progress: number;
  maxProgress: number;
  category: 'study' | 'music' | 'social' | 'streak';
  unlocked: boolean;
}

interface Level {
  current: number;
  xp: number;
  xpToNext: number;
  title: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: string;
  progress: number;
  maxProgress: number;
  timeLeft: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
  isCurrentUser?: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Star, Crown, Flame, Sparkles, Award, Trophy, Shield, Target, Zap
};

const getLevelTitle = (level: number): string => {
  if (level < 5) return 'Débutant';
  if (level < 10) return 'Apprenti';
  if (level < 20) return 'Étudiant';
  if (level < 30) return 'Avancé';
  if (level < 50) return 'Expert';
  return 'Maître';
};

export const GamificationPanel: React.FC = () => {
  const { _stats, loading, loadStats, BADGE_DEFINITIONS: _badges } = useGamification();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [_userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await loadStats(user.id);
        await loadLeaderboard(user.id);
      }
    };
    init();
  }, [loadStats]);

  const loadLeaderboard = async (currentUserId: string) => {
    try {
      // Charger les top utilisateurs par XP depuis user_activity_log
      const { _data: activities } = await supabase
        .from('user_activity_log')
        .select('user_id, score, count')
        .order('score', { ascending: false });

      if (activities) {
        // Agréger les scores par utilisateur
        const userScores: Record<string, number> = {};
        activities.forEach(a => {
          userScores[a.user_id] = (userScores[a.user_id] || 0) + (a.score || 0) + (a.count || 0) * 10;
        });

        const sortedUsers = Object.entries(userScores)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([id, xp], index) => ({
            rank: index + 1,
            name: id === currentUserId ? 'Vous' : `Étudiant ${index + 1}`,
            xp: Math.round(xp),
            avatar: id === currentUserId ? '🎓' : ['👩‍⚕️', '👨‍⚕️', '👩‍🔬', '👨‍🔬'][index % 4],
            isCurrentUser: id === currentUserId
          }));

        setLeaderboard(sortedUsers.length > 0 ? sortedUsers : getDefaultLeaderboard(_stats?.totalPoints || 0));
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboard(getDefaultLeaderboard(_stats?.totalPoints || 0));
    }
  };

  const getDefaultLeaderboard = (userPoints: number): LeaderboardUser[] => [
    { rank: 1, name: 'Marie D.', xp: 3240, avatar: '👩‍⚕️' },
    { rank: 2, name: 'Jean M.', xp: 2950, avatar: '👨‍⚕️' },
    { rank: 3, name: 'Sophie B.', xp: 2780, avatar: '👩‍⚕️' },
    { rank: 4, name: 'Vous', xp: userPoints, avatar: '🎓', isCurrentUser: true },
    { rank: 5, name: 'Paul D.', xp: 2210, avatar: '👨‍⚕️' }
  ];

  // Calcul du niveau et XP
  const XP_PER_LEVEL = 500;
  const userLevel: Level = {
    current: _stats?.level || 1,
    xp: _stats?.totalPoints || 0,
    xpToNext: XP_PER_LEVEL - ((_stats?.totalPoints || 0) % XP_PER_LEVEL),
    title: getLevelTitle(_stats?.level || 1)
  };

  // Convertir les badges du hook en format UI
  const badgesUI: BadgeUI[] = BADGE_DEFINITIONS.map(badge => {
    const IconComponent = ICON_MAP[badge.icon] || Star;
    const isEarned = _stats?.badges.some(b => b.id === badge.id);
    const earnedBadge = _stats?.badges.find(b => b.id === badge.id);
    
    return {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: IconComponent,
      rarity: badge.rarity,
      earned: !!isEarned,
      earnedAt: earnedBadge?.unlockedAt ? new Date(earnedBadge.unlockedAt) : undefined
    };
  });

  // Achievements basés sur les vraies données
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Série d\'Or',
      description: 'Étudiez 7 jours consécutifs',
      reward: '+500 XP',
      progress: Math.min(_stats?.currentStreak || 0, 7),
      maxProgress: 7,
      category: 'streak',
      unlocked: (_stats?.currentStreak || 0) >= 7
    },
    {
      id: '2',
      title: 'Objectif Hebdomadaire',
      description: 'Atteignez 100% de votre objectif',
      reward: 'Badge Rare + 200 XP',
      progress: _stats?.weeklyGoalProgress || 0,
      maxProgress: 100,
      category: 'study',
      unlocked: (_stats?.weeklyGoalProgress || 0) >= 100
    },
    {
      id: '3',
      title: 'Collectionneur',
      description: 'Débloquez 10 badges',
      reward: 'Titre Spécial',
      progress: _stats?.badges.length || 0,
      maxProgress: 10,
      category: 'social',
      unlocked: (_stats?.badges.length || 0) >= 10
    }
  ];

  // Défis quotidiens dynamiques
  const now = new Date();
  const hoursLeft = 24 - now.getHours();
  const dailyChallenges: Challenge[] = [
    {
      id: '1',
      title: 'Sprint du Jour',
      description: 'Complétez 5 révisions SRS',
      reward: '+100 XP',
      progress: Math.min((_stats?.weeklyGoalProgress || 0) / 20, 5),
      maxProgress: 5,
      timeLeft: `${hoursLeft}h`,
      difficulty: 'easy'
    },
    {
      id: '2',
      title: 'Perfectionniste',
      description: 'Obtenez 100% à un quiz',
      reward: '+200 XP + Badge',
      progress: 0,
      maxProgress: 1,
      timeLeft: `${hoursLeft}h`,
      difficulty: 'medium'
    },
    {
      id: '3',
      title: 'Régularité',
      description: `Maintenez votre streak de ${_stats?.currentStreak || 0} jour(s)`,
      reward: '+300 XP',
      progress: _stats?.currentStreak || 0,
      maxProgress: (_stats?.currentStreak || 0) + 1,
      timeLeft: `${hoursLeft}h`,
      difficulty: 'hard'
    }
  ];

  const getBadgeColor = (rarity: BadgeUI['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-muted-foreground bg-muted';
      case 'rare': return 'text-primary bg-primary/10';
      case 'epic': return 'text-accent-foreground bg-accent';
      case 'legendary': return 'text-warning bg-warning/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-success';
      case 'medium': return 'bg-warning';
      case 'hard': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'study': return Target;
      case 'music': return Sparkles;
      case 'social': return Trophy;
      case 'streak': return Flame;
      default: return Star;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Niveau et XP */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Flame className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Niveau {userLevel.current}</h2>
                <p className="text-primary font-medium">{userLevel.title}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">XP Total</p>
              <p className="text-xl font-bold text-foreground">{userLevel.xp.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Streak: {_stats?.currentStreak || 0} jours 🔥</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression vers le niveau {userLevel.current + 1}</span>
              <span>{userLevel.xp}/{userLevel.xp + userLevel.xpToNext} XP</span>
            </div>
            <Progress 
              value={(userLevel.xp / (userLevel.xp + userLevel.xpToNext)) * 100} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="challenges" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="challenges">Défis</TabsTrigger>
          <TabsTrigger value="achievements">Succès</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Classement</TabsTrigger>
        </TabsList>

        {/* Défis quotidiens */}
        <TabsContent value="challenges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Défis Quotidiens
              </CardTitle>
              <CardDescription>
                Relevez ces défis pour gagner de l'XP et des récompenses exclusives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dailyChallenges.map((challenge) => (
                <div key={challenge.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{challenge.title}</h4>
                        <div className={`w-2 h-2 rounded-full ${getDifficultyColor(challenge.difficulty)}`} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {challenge.reward}
                      </Badge>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {challenge.timeLeft}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression</span>
                      <span>{challenge.progress}/{challenge.maxProgress}</span>
                    </div>
                    <Progress 
                      value={(challenge.progress / challenge.maxProgress) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Succès */}
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Succès à Débloquer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {achievements.map((achievement) => {
                const CategoryIcon = getCategoryIcon(achievement.category);
                return (
                  <div key={achievement.id} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <CategoryIcon className="w-5 h-5 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                        <Badge variant="outline" className="text-xs mb-3">
                          {achievement.reward}
                        </Badge>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progression</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges */}
        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Collection de Badges ({badgesUI.filter(b => b.earned).length}/{badgesUI.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {badgesUI.map((badge) => {
                  const BadgeIcon = badge.icon;
                  return (
                    <div 
                      key={badge.id} 
                      className={`p-4 border rounded-lg text-center transition-all hover:scale-105 ${
                        badge.earned ? 'bg-card shadow-sm' : 'bg-muted opacity-60'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${getBadgeColor(badge.rarity)}`}>
                        <BadgeIcon className="w-6 h-6" />
                      </div>
                      <h4 className="font-medium text-sm mb-1">{badge.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                      
                      {badge.earned ? (
                        <Badge variant="secondary" className="text-xs">
                          ✅ Obtenu
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Verrouillé
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classement */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Classement Hebdomadaire
              </CardTitle>
              <CardDescription>
                Top des étudiants les plus actifs cette semaine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((user) => (
                  <div 
                    key={user.rank} 
                    className={`flex items-center p-3 rounded-lg ${
                      user.isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'bg-muted'
                    }`}
                  >
                    <div className="w-8 text-center font-bold text-lg">
                      {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : user.rank}
                    </div>
                    <div className="text-2xl mx-3">{user.avatar}</div>
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.xp.toLocaleString()} XP</p>
                    </div>
                    {user.isCurrentUser && (
                      <Badge className="ml-2">C'est vous !</Badge>
                    )}
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