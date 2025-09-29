import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  Award, 
  Zap,
  Calendar,
  TrendingUp,
  Medal,
  Gift
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlockedAt?: Date;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  progress: number;
  target: number;
  reward: number;
  expiresAt: Date;
  completed: boolean;
}

interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  streak: number;
  totalStudyTime: number;
  completedItems: number;
  generatedMusic: number;
  communityContributions: number;
}

export const GamificationPanel: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats>({
    level: 12,
    xp: 2450,
    xpToNextLevel: 3000,
    totalXp: 15450,
    streak: 7,
    totalStudyTime: 124,
    completedItems: 89,
    generatedMusic: 23,
    communityContributions: 5
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Premier Pas',
      description: 'Compléter votre premier item EDN',
      icon: <Star className="h-5 w-5" />,
      unlocked: true,
      progress: 1,
      maxProgress: 1,
      rarity: 'common',
      points: 100,
      unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      title: 'Mélomane',
      description: 'Générer 10 musiques mnémotechniques',
      icon: <Award className="h-5 w-5" />,
      unlocked: true,
      progress: 23,
      maxProgress: 10,
      rarity: 'rare',
      points: 500,
      unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      title: 'Marathonien du Savoir',
      description: 'Étudier 100 heures au total',
      icon: <Trophy className="h-5 w-5" />,
      unlocked: true,
      progress: 124,
      maxProgress: 100,
      rarity: 'epic',
      points: 1000,
      unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: '4',
      title: 'Feu Sacré',
      description: 'Maintenir une série de 30 jours consécutifs',
      icon: <Flame className="h-5 w-5" />,
      unlocked: false,
      progress: 7,
      maxProgress: 30,
      rarity: 'legendary',
      points: 2500
    },
    {
      id: '5',
      title: 'Expert en Cardiologie',
      description: 'Compléter tous les items de cardiologie',
      icon: <Medal className="h-5 w-5" />,
      unlocked: false,
      progress: 12,
      maxProgress: 25,
      rarity: 'epic',
      points: 1500
    }
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Défi Quotidien',
      description: 'Compléter 3 items EDN aujourd\'hui',
      type: 'daily',
      progress: 2,
      target: 3,
      reward: 150,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
      completed: false
    },
    {
      id: '2',
      title: 'Semaine Musicale',
      description: 'Générer 5 musiques cette semaine',
      type: 'weekly',
      progress: 3,
      target: 5,
      reward: 500,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      completed: false
    },
    {
      id: '3',
      title: 'Contributeur du Mois',
      description: 'Participer à 10 discussions communautaires',
      type: 'monthly',
      progress: 5,
      target: 10,
      reward: 1000,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      completed: false
    }
  ]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-green-100 text-green-800';
      case 'weekly': return 'bg-blue-100 text-blue-800';
      case 'monthly': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const levelProgress = (userStats.xp / userStats.xpToNextLevel) * 100;

  return (
    <div className="space-y-6">
      {/* Profil Utilisateur */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Niveau {userStats.level}</CardTitle>
              <CardDescription className="text-blue-100">
                {userStats.totalXp.toLocaleString()} XP au total
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-orange-400" />
                <span className="text-lg font-bold">{userStats.streak} jours</span>
              </div>
              <p className="text-sm text-blue-100">Série actuelle</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Progrès vers niveau {userStats.level + 1}</span>
              <span>{userStats.xp} / {userStats.xpToNextLevel} XP</span>
            </div>
            <Progress value={levelProgress} className="h-3 bg-blue-800" />
          </div>
        </CardContent>
      </Card>

      {/* Statistiques Rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{userStats.completedItems}</div>
            <p className="text-sm text-muted-foreground">Items complétés</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{userStats.totalStudyTime}h</div>
            <p className="text-sm text-muted-foreground">Temps d'étude</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{userStats.generatedMusic}</div>
            <p className="text-sm text-muted-foreground">Musiques créées</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">{userStats.communityContributions}</div>
            <p className="text-sm text-muted-foreground">Contributions</p>
          </CardContent>
        </Card>
      </div>

      {/* Défis Actifs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Défis Actifs
          </CardTitle>
          <CardDescription>
            Complétez ces défis pour gagner de l'XP et des récompenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      {challenge.title}
                      <Badge className={getChallengeTypeColor(challenge.type)}>
                        {challenge.type}
                      </Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Gift className="h-4 w-4" />
                      {challenge.reward} XP
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Progrès</span>
                    <span>{challenge.progress} / {challenge.target}</span>
                  </div>
                  <Progress value={(challenge.progress / challenge.target) * 100} className="h-2" />
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-muted-foreground">
                    Expire dans {Math.ceil((challenge.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60))}h
                  </span>
                  {challenge.progress >= challenge.target && (
                    <Button size="sm" className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      Réclamer
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Succès */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Succès Récents
          </CardTitle>
          <CardDescription>
            Vos accomplissements et badges débloqués
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`p-4 border rounded-lg transition-all ${
                  achievement.unlocked 
                    ? 'bg-background border-primary/20' 
                    : 'bg-muted/50 border-muted'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    achievement.unlocked 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {achievement.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-semibold ${
                        achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {achievement.title}
                      </h4>
                      <Badge className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    
                    <p className={`text-sm mb-3 ${
                      achievement.unlocked ? 'text-muted-foreground' : 'text-muted-foreground'
                    }`}>
                      {achievement.description}
                    </p>
                    
                    {!achievement.unlocked && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>Progrès</span>
                          <span>{achievement.progress} / {achievement.maxProgress}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-2" 
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3" />
                        <span>{achievement.points} XP</span>
                      </div>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <span className="text-xs text-muted-foreground">
                          Débloqué {achievement.unlockedAt.toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};