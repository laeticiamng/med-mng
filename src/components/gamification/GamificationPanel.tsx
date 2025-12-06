import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, Star, Target, Zap, Award, TrendingUp, 
  Crown, Flame, Shield, Sparkles, Calendar, Clock
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Badge {
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

export const GamificationPanel: React.FC = () => {
  // Données de démo
  const userLevel: Level = {
    current: 12,
    xp: 2450,
    xpToNext: 550,
    title: "Étudiant Avancé"
  };

  const badges: Badge[] = [
    {
      id: '1',
      name: 'Premier Pas',
      description: 'Complétez votre premier item EDN',
      icon: Star,
      rarity: 'common',
      earned: true,
      earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Mélomane',
      description: 'Générez 10 musiques',
      icon: Sparkles,
      rarity: 'rare',
      earned: true,
      earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      name: 'Expert Cardiologie',
      description: 'Maîtrisez tous les items de cardiologie',
      icon: Award,
      rarity: 'epic',
      earned: false,
      progress: 8,
      maxProgress: 15
    },
    {
      id: '4',
      name: 'Légende Médicale',
      description: 'Atteignez le niveau 50',
      icon: Crown,
      rarity: 'legendary',
      earned: false,
      progress: 12,
      maxProgress: 50
    }
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Série d\'Or',
      description: 'Étudiez 7 jours consécutifs',
      reward: '+500 XP',
      progress: 5,
      maxProgress: 7,
      category: 'streak',
      unlocked: false
    },
    {
      id: '2',
      title: 'Compositeur',
      description: 'Créez 25 musiques personnalisées',
      reward: 'Badge Rare + 200 XP',
      progress: 18,
      maxProgress: 25,
      category: 'music',
      unlocked: false
    },
    {
      id: '3',
      title: 'Mentor',
      description: 'Aidez 5 autres étudiants',
      reward: 'Titre Spécial',
      progress: 2,
      maxProgress: 5,
      category: 'social',
      unlocked: false
    }
  ];

  const dailyChallenges: Challenge[] = [
    {
      id: '1',
      title: 'Sprint Matinal',
      description: 'Complétez 3 items avant 12h',
      reward: '+100 XP',
      progress: 1,
      maxProgress: 3,
      timeLeft: '8h 23m',
      difficulty: 'easy'
    },
    {
      id: '2',
      title: 'Perfectionniste',
      description: 'Obtenez 100% à un quiz',
      reward: '+200 XP + Badge',
      progress: 0,
      maxProgress: 1,
      timeLeft: '23h 45m',
      difficulty: 'medium'
    },
    {
      id: '3',
      title: 'Maestro Musical',
      description: 'Générez une musique pour chaque spécialité (5)',
      reward: '+300 XP + Titre',
      progress: 2,
      maxProgress: 5,
      timeLeft: '23h 45m',
      difficulty: 'hard'
    }
  ];

  const getBadgeColor = (rarity: Badge['rarity']) => {
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

  return (
    <div className="space-y-6">
      {/* Niveau et XP */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Niveau {userLevel.current}</h2>
              <p className="text-primary font-medium">{userLevel.title}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">XP Total</p>
              <p className="text-xl font-bold text-foreground">{userLevel.xp.toLocaleString()}</p>
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
                Collection de Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {badges.map((badge) => {
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
                      ) : badge.progress !== undefined ? (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">
                            {badge.progress}/{badge.maxProgress}
                          </div>
                          <Progress 
                            value={(badge.progress / (badge.maxProgress || 1)) * 100} 
                            className="h-1"
                          />
                        </div>
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
                {[
                  { rank: 1, name: 'Marie Dupont', xp: 3240, avatar: '👩‍⚕️' },
                  { rank: 2, name: 'Jean Martin', xp: 2950, avatar: '👨‍⚕️' },
                  { rank: 3, name: 'Sophie Bernard', xp: 2780, avatar: '👩‍⚕️' },
                  { rank: 4, name: 'Vous', xp: 2450, avatar: '🎓', isCurrentUser: true },
                  { rank: 5, name: 'Paul Durand', xp: 2210, avatar: '👨‍⚕️' }
                ].map((user) => (
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