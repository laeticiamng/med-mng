import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Crown, 
  Target, 
  Zap,
  Flame,
  Award,
  Medal,
  Gem,
  Shield,
  Sword,
  Heart,
  Brain,
  BookOpen,
  Activity,
  Clock,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Lock,
  CheckCircle2
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'study' | 'skill' | 'milestone' | 'social' | 'special';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  xpReward: number;
  color: string;
  prerequisites?: string[];
}

interface UserStats {
  totalXP: number;
  level: number;
  studyStreak: number;
  itemsCompleted: number;
  perfectScores: number;
  studyTime: number;
  collaborations: number;
}

export const AchievementSystem: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalXP: 2450,
    level: 12,
    studyStreak: 15,
    itemsCompleted: 89,
    perfectScores: 23,
    studyTime: 4320, // en minutes
    collaborations: 7
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        title: 'Premier Pas',
        description: 'Compléter votre premier item EDN',
        icon: BookOpen,
        rarity: 'common',
        category: 'milestone',
        progress: 1,
        maxProgress: 1,
        unlocked: true,
        unlockedAt: new Date('2024-01-15'),
        xpReward: 50,
        color: 'from-green-500 to-emerald-600'
      },
      {
        id: '2',
        title: 'Érudit',
        description: 'Obtenir un score parfait sur 10 items',
        icon: Crown,
        rarity: 'rare',
        category: 'skill',
        progress: 23,
        maxProgress: 10,
        unlocked: true,
        unlockedAt: new Date('2024-02-03'),
        xpReward: 200,
        color: 'from-yellow-500 to-orange-600'
      },
      {
        id: '3',
        title: 'Marathonien',
        description: 'Étudier pendant 100 heures au total',
        icon: Clock,
        rarity: 'epic',
        category: 'study',
        progress: 72,
        maxProgress: 100,
        unlocked: false,
        xpReward: 500,
        color: 'from-purple-500 to-indigo-600'
      },
      {
        id: '4',
        title: 'Maître de la Régularité',
        description: 'Maintenir une série de 30 jours consécutifs',
        icon: Flame,
        rarity: 'epic',
        category: 'study',
        progress: 15,
        maxProgress: 30,
        unlocked: false,
        xpReward: 750,
        color: 'from-red-500 to-pink-600'
      },
      {
        id: '5',
        title: 'Légende Médicale',
        description: 'Compléter tous les 367 items EDN',
        icon: Trophy,
        rarity: 'legendary',
        category: 'milestone',
        progress: 89,
        maxProgress: 367,
        unlocked: false,
        xpReward: 2000,
        color: 'from-amber-500 to-yellow-500'
      },
      {
        id: '6',
        title: 'Collaborateur',
        description: 'Participer à 5 sessions d\'étude collaborative',
        icon: Heart,
        rarity: 'rare',
        category: 'social',
        progress: 7,
        maxProgress: 5,
        unlocked: true,
        unlockedAt: new Date('2024-02-20'),
        xpReward: 300,
        color: 'from-pink-500 to-rose-600'
      },
      {
        id: '7',
        title: 'Cerveau d\'Acier',
        description: 'Réussir 50 quiz consécutifs sans erreur',
        icon: Brain,
        rarity: 'legendary',
        category: 'skill',
        progress: 12,
        maxProgress: 50,
        unlocked: false,
        xpReward: 1500,
        color: 'from-cyan-500 to-blue-600'
      },
      {
        id: '8',
        title: 'Vitesse de l\'Éclair',
        description: 'Compléter un item en moins de 5 minutes',
        icon: Zap,
        rarity: 'rare',
        category: 'skill',
        progress: 0,
        maxProgress: 1,
        unlocked: false,
        xpReward: 150,
        color: 'from-yellow-500 to-amber-600'
      }
    ];

    setAchievements(mockAchievements);
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500 text-gray-300';
      case 'rare': return 'border-blue-500 text-blue-300';
      case 'epic': return 'border-purple-500 text-purple-300';
      case 'legendary': return 'border-yellow-500 text-yellow-300';
      default: return 'border-gray-500 text-gray-300';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'rare': return 'shadow-blue-500/20';
      case 'epic': return 'shadow-purple-500/20';
      case 'legendary': return 'shadow-yellow-500/20';
      default: return '';
    }
  };

  const categories = [
    { id: 'all', label: 'Tous', icon: Trophy },
    { id: 'milestone', label: 'Étapes', icon: Target },
    { id: 'skill', label: 'Compétences', icon: Star },
    { id: 'study', label: 'Étude', icon: BookOpen },
    { id: 'social', label: 'Social', icon: Heart },
    { id: 'special', label: 'Spécial', icon: Crown }
  ];

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
    const statusMatch = !showOnlyUnlocked || achievement.unlocked;
    return categoryMatch && statusMatch;
  });

  const calculateNextLevel = () => {
    const xpForNextLevel = userStats.level * 200;
    const currentLevelXP = (userStats.level - 1) * 200;
    const progressToNext = userStats.totalXP - currentLevelXP;
    return {
      required: xpForNextLevel - currentLevelXP,
      progress: progressToNext,
      percentage: (progressToNext / (xpForNextLevel - currentLevelXP)) * 100
    };
  };

  const levelProgress = calculateNextLevel();

  // Simulate achievement unlock
  const simulateAchievementUnlock = () => {
    const lockedAchievements = achievements.filter(a => !a.unlocked);
    if (lockedAchievements.length > 0) {
      const randomAchievement = lockedAchievements[Math.floor(Math.random() * lockedAchievements.length)];
      setNewAchievement(randomAchievement);
      setAchievements(prev => prev.map(a => 
        a.id === randomAchievement.id 
          ? { ...a, unlocked: true, unlockedAt: new Date() }
          : a
      ));
      setTimeout(() => setNewAchievement(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* User Level & Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-white/10 p-6"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-2xl font-bold text-black">
                {userStats.level}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Niveau {userStats.level}</h2>
                <p className="text-purple-200">Étudiant Avancé</p>
              </div>
            </div>
            <Button onClick={simulateAchievementUnlock} className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <Sparkles className="h-4 w-4 mr-2" />
              Test Achievement
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Progression vers niveau {userStats.level + 1}</span>
              <span className="text-purple-200">{levelProgress.progress}/{levelProgress.required} XP</span>
            </div>
            <Progress value={levelProgress.percentage} className="h-3" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-3 rounded-lg bg-white/10">
              <div className="text-2xl font-bold text-white">{userStats.totalXP.toLocaleString()}</div>
              <p className="text-gray-300 text-sm">XP Total</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/10">
              <div className="text-2xl font-bold text-white">{userStats.studyStreak}</div>
              <p className="text-gray-300 text-sm">Jours consécutifs</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/10">
              <div className="text-2xl font-bold text-white">{userStats.itemsCompleted}</div>
              <p className="text-gray-300 text-sm">Items complétés</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/10">
              <div className="text-2xl font-bold text-white">{Math.floor(userStats.studyTime / 60)}h</div>
              <p className="text-gray-300 text-sm">Temps d'étude</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            className={`${
              selectedCategory === category.id 
                ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                : 'border-white/20 text-white hover:bg-white/10'
            }`}
          >
            <category.icon className="h-4 w-4 mr-2" />
            {category.label}
          </Button>
        ))}
        
        <Button
          onClick={() => setShowOnlyUnlocked(!showOnlyUnlocked)}
          variant="outline"
          size="sm"
          className={`border-white/20 text-white hover:bg-white/10 ${
            showOnlyUnlocked ? 'bg-white/10' : ''
          }`}
        >
          {showOnlyUnlocked ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
          {showOnlyUnlocked ? 'Débloqués' : 'Tous'}
        </Button>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 ${
                achievement.unlocked ? getRarityGlow(achievement.rarity) : 'opacity-60'
              }`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${achievement.color} opacity-0 hover:opacity-10 transition-opacity duration-300`} />
                
                <CardHeader className="relative z-10 pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${achievement.color} flex items-center justify-center ${
                      !achievement.unlocked ? 'grayscale' : ''
                    }`}>
                      <achievement.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${getRarityColor(achievement.rarity)} border`}>
                        {achievement.rarity.toUpperCase()}
                      </Badge>
                      {achievement.unlocked && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-400"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4">
                  <div>
                    <CardTitle className="text-white text-lg mb-2">{achievement.title}</CardTitle>
                    <p className="text-gray-300 text-sm">{achievement.description}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Progression</span>
                      <span className="text-white font-medium">
                        {Math.min(achievement.progress, achievement.maxProgress)}/{achievement.maxProgress}
                      </span>
                    </div>
                    <Progress 
                      value={(Math.min(achievement.progress, achievement.maxProgress) / achievement.maxProgress) * 100} 
                      className="h-2" 
                    />
                  </div>

                  {/* Rewards */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gem className="h-4 w-4 text-yellow-400" />
                      <span className="text-yellow-300 font-medium">{achievement.xpReward} XP</span>
                    </div>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <span className="text-gray-400 text-xs">
                        Débloqué le {achievement.unlockedAt.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Achievement Unlock Notification */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Card className="bg-gradient-to-r from-yellow-600 to-amber-600 border-yellow-400 shadow-2xl max-w-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                    <newAchievement.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="h-4 w-4 text-yellow-200" />
                      <span className="text-yellow-200 font-medium text-sm">Achievement Débloqué!</span>
                    </div>
                    <h4 className="text-white font-bold">{newAchievement.title}</h4>
                    <p className="text-yellow-100 text-sm">{newAchievement.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Gem className="h-3 w-3 text-yellow-200" />
                      <span className="text-yellow-200 text-sm font-medium">+{newAchievement.xpReward} XP</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};