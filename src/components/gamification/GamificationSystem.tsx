import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Crown, 
  Medal, 
  Award, 
  TrendingUp,
  Users,
  Calendar,
  Flame,
  Music,
  BookOpen,
  Brain,
  Heart,
  Shield,
  Sparkles,
  Gift,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'study' | 'music' | 'social' | 'performance';
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: {
    current: number;
    target: number;
  };
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: string;
  reward: {
    xp: number;
    badge?: string;
    title?: string;
  };
  progress: {
    current: number;
    target: number;
  };
  timeRemaining?: number;
  completed: boolean;
}

interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  rank: number;
  streak: number;
  achievements: number;
  totalStudyTime: number;
  songsCreated: number;
  averageScore: number;
}

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    avatar: string;
    level: number;
  };
  points: number;
  change: 'up' | 'down' | 'same';
}

export const GamificationSystem: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'challenges' | 'leaderboard'>('overview');

  const [userStats] = useState<UserStats>({
    level: 24,
    xp: 3420,
    xpToNextLevel: 1580,
    totalXp: 28950,
    rank: 47,
    streak: 12,
    achievements: 23,
    totalStudyTime: 1847,
    songsCreated: 156,
    averageScore: 87
  });

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Virtuose Musical',
      description: 'Créer 50 chansons éducatives de qualité',
      icon: '🎵',
      rarity: 'epic',
      category: 'music',
      points: 500,
      unlocked: true,
      unlockedAt: new Date('2024-01-20'),
      progress: { current: 156, target: 50 }
    },
    {
      id: '2',
      title: 'Étudiant Assidu',
      description: 'Maintenir une série de 30 jours d\'étude',
      icon: '📚',
      rarity: 'rare',
      category: 'study',
      points: 300,
      unlocked: false,
      progress: { current: 12, target: 30 }
    },
    {
      id: '3',
      title: 'Maître Cardiologue',
      description: 'Obtenir 90%+ sur tous les items de cardiologie',
      icon: '❤️',
      rarity: 'legendary',
      category: 'performance',
      points: 1000,
      unlocked: true,
      unlockedAt: new Date('2024-01-15'),
      progress: { current: 24, target: 24 }
    },
    {
      id: '4',
      title: 'Collaborateur',
      description: 'Partager 10 créations avec la communauté',
      icon: '🤝',
      rarity: 'common',
      category: 'social',
      points: 100,
      unlocked: false,
      progress: { current: 7, target: 10 }
    }
  ];

  const [challenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Révision Quotidienne',
      description: 'Étudier 3 items EDN aujourd\'hui',
      type: 'daily',
      category: 'Étude',
      reward: { xp: 50, badge: '📚' },
      progress: { current: 2, target: 3 },
      timeRemaining: 8 * 60 * 60, // 8 heures en secondes
      completed: false
    },
    {
      id: '2',
      title: 'Créateur Musical',
      description: 'Générer 5 chansons cette semaine',
      type: 'weekly',
      category: 'Musique',
      reward: { xp: 200, title: 'Compositeur Amateur' },
      progress: { current: 3, target: 5 },
      timeRemaining: 4 * 24 * 60 * 60, // 4 jours
      completed: false
    },
    {
      id: '3',
      title: 'Perfectionniste',
      description: 'Obtenir 95%+ sur 10 évaluations ce mois',
      type: 'monthly',
      category: 'Performance',
      reward: { xp: 500, badge: '🎯' },
      progress: { current: 6, target: 10 },
      timeRemaining: 12 * 24 * 60 * 60, // 12 jours
      completed: false
    }
  ];

  const [leaderboard] = useState<LeaderboardEntry[]>([
    {
      rank: 1,
      user: { id: '1', name: 'Dr. Sophie L.', avatar: '👩‍⚕️', level: 45 },
      points: 15420,
      change: 'same'
    },
    {
      rank: 2,
      user: { id: '2', name: 'Jean Martin', avatar: '👨‍🎓', level: 38 },
      points: 14890,
      change: 'up'
    },
    {
      rank: 3,
      user: { id: '3', name: 'Prof. Dubois', avatar: '👨‍🏫', level: 42 },
      points: 14567,
      change: 'down'
    },
    {
      rank: 4,
      user: { id: '4', name: 'Marie Chen', avatar: '👩‍🎓', level: 35 },
      points: 13245,
      change: 'up'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
      case 'rare': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'epic': return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'legendary': return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'weekly': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'monthly': return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'special': return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}j ${hours % 24}h`;
    }
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const claimReward = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      toast({
        title: "Récompense réclamée !",
        description: `+${challenge.reward.xp} XP gagné${challenge.reward.badge ? ` et badge ${challenge.reward.badge}` : ''}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { key: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
          { key: 'achievements', label: 'Succès', icon: Trophy },
          { key: 'challenges', label: 'Défis', icon: Target },
          { key: 'leaderboard', label: 'Classement', icon: Crown }
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={activeTab === key ? 'default' : 'outline'}
            onClick={() => setActiveTab(key as any)}
            className={`${
              activeTab === key 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                : 'text-gray-300 border-gray-600 hover:bg-white/10'
            }`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </Button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats utilisateur */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-blue-600/20 border border-purple-400/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Niveau {userStats.level}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Progression vers niveau {userStats.level + 1}</span>
                <span className="text-gray-300">{userStats.xp} / {userStats.xp + userStats.xpToNextLevel} XP</span>
              </div>
              <Progress value={(userStats.xp / (userStats.xp + userStats.xpToNextLevel)) * 100} className="h-3" />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{userStats.streak}</div>
                  <div className="text-sm text-gray-300 flex items-center justify-center gap-1">
                    <Flame className="h-3 w-3 text-orange-400" />
                    Série
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">#{userStats.rank}</div>
                  <div className="text-sm text-gray-300 flex items-center justify-center gap-1">
                    <Trophy className="h-3 w-3 text-yellow-400" />
                    Classement
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{userStats.songsCreated}</div>
                  <div className="text-sm text-gray-300 flex items-center justify-center gap-1">
                    <Music className="h-3 w-3 text-purple-400" />
                    Chansons
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{userStats.averageScore}%</div>
                  <div className="text-sm text-gray-300 flex items-center justify-center gap-1">
                    <Target className="h-3 w-3 text-green-400" />
                    Score moy.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Succès récents */}
          <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-400" />
                Succès Récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.filter(a => a.unlocked).slice(0, 4).map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm">{achievement.title}</h4>
                      <p className="text-gray-400 text-xs">{achievement.description}</p>
                      <Badge className={getRarityColor(achievement.rarity)} variant="outline">
                        {achievement.points} pts
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <Card 
              key={achievement.id}
              className={`${achievement.unlocked ? 'bg-white/10' : 'bg-black/20'} backdrop-blur-sm border ${
                achievement.unlocked ? 'border-yellow-400/30' : 'border-white/10'
              } transition-all duration-300 hover:scale-105`}
            >
              <CardContent className="p-4 text-center relative">
                {!achievement.unlocked && (
                  <div className="absolute top-2 right-2">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                
                <div className="text-4xl mb-3 opacity-75">{achievement.icon}</div>
                <h3 className="text-white font-bold mb-2">{achievement.title}</h3>
                <p className="text-gray-300 text-sm mb-3">{achievement.description}</p>
                
                <div className="flex justify-center mb-3">
                  <Badge className={getRarityColor(achievement.rarity)} variant="outline">
                    {achievement.rarity} • {achievement.points} pts
                  </Badge>
                </div>

                {achievement.progress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Progression</span>
                      <span>{achievement.progress.current}/{achievement.progress.target}</span>
                    </div>
                    <Progress 
                      value={(achievement.progress.current / achievement.progress.target) * 100} 
                      className="h-2"
                    />
                  </div>
                )}

                {achievement.unlocked && achievement.unlockedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Débloqué le {achievement.unlockedAt.toLocaleDateString('fr-FR')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="bg-black/20 backdrop-blur-sm border border-white/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-medium">{challenge.title}</h3>
                      <Badge className={getChallengeTypeColor(challenge.type)} variant="outline">
                        {challenge.type}
                      </Badge>
                      {challenge.completed && (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{challenge.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Progression</span>
                        <span>{challenge.progress.current}/{challenge.progress.target}</span>
                      </div>
                      <Progress 
                        value={(challenge.progress.current / challenge.progress.target) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="text-sm text-gray-400">
                        Récompense: {challenge.reward.xp} XP
                        {challenge.reward.badge && ` • ${challenge.reward.badge}`}
                        {challenge.reward.title && ` • "${challenge.reward.title}"`}
                      </div>
                      
                      {challenge.timeRemaining && (
                        <div className="flex items-center gap-1 text-xs text-orange-400">
                          <Calendar className="h-3 w-3" />
                          {formatTimeRemaining(challenge.timeRemaining)}
                        </div>
                      )}
                    </div>
                  </div>

                  {challenge.progress.current >= challenge.progress.target && !challenge.completed && (
                    <Button
                      onClick={() => claimReward(challenge.id)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white ml-4"
                    >
                      <Gift className="h-4 w-4 mr-1" />
                      Réclamer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              Classement Mensuel
            </CardTitle>
            <CardDescription className="text-gray-300">
              Top joueurs de ce mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div 
                  key={entry.user.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30' : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      entry.rank === 1 ? 'bg-yellow-500 text-black' :
                      entry.rank === 2 ? 'bg-gray-400 text-white' :
                      entry.rank === 3 ? 'bg-orange-600 text-white' :
                      'bg-white/20 text-white'
                    }`}>
                      {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                    </div>
                    
                    <div className="text-2xl">{entry.user.avatar}</div>
                    
                    <div>
                      <h4 className="text-white font-medium">{entry.user.name}</h4>
                      <p className="text-gray-400 text-sm">Niveau {entry.user.level}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-bold">{entry.points.toLocaleString()} pts</div>
                    <div className="flex items-center gap-1 text-xs">
                      {entry.change === 'up' && <TrendingUp className="h-3 w-3 text-green-400" />}
                      {entry.change === 'down' && <TrendingUp className="h-3 w-3 text-red-400 transform rotate-180" />}
                      <span className={`${
                        entry.change === 'up' ? 'text-green-400' :
                        entry.change === 'down' ? 'text-red-400' :
                        'text-gray-400'
                      }`}>
                        {entry.change === 'same' ? 'Stable' : entry.change === 'up' ? 'Montée' : 'Descente'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};