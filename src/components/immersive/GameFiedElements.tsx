import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Award,
  Crown,
  Gem,
  Sparkles,
  Heart,
  ThumbsUp,
  Music
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
}

interface LevelInfo {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  levelTitle: string;
}

interface ComboStreak {
  count: number;
  multiplier: number;
  active: boolean;
}

export const GamefiedElements: React.FC = () => {
  const { toast } = useToast();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showCombo, setShowCombo] = useState(false);
  const [recentPoints, setRecentPoints] = useState(0);

  const [levelInfo] = useState<LevelInfo>({
    currentLevel: 12,
    currentXP: 2450,
    xpToNextLevel: 3000,
    levelTitle: "Apprenti Virtuose"
  });

  const [comboStreak] = useState<ComboStreak>({
    count: 5,
    multiplier: 2.5,
    active: true
  });

  const [achievements] = useState<Achievement[]>([
    {
      id: 'first-song',
      title: 'Premier Compositeur',
      description: 'Créer votre première musique',
      icon: Music,
      points: 100,
      rarity: 'common',
      unlocked: true,
      unlockedAt: new Date(Date.now() - 86400000)
    },
    {
      id: 'streak-master',
      title: 'Maître de la Régularité',
      description: 'Étudier 7 jours consécutifs',
      icon: Target,
      points: 500,
      rarity: 'rare',
      unlocked: true,
      unlockedAt: new Date(Date.now() - 3600000)
    },
    {
      id: 'knowledge-collector',
      title: 'Collectionneur de Savoir',
      description: 'Maîtriser 50 items EDN',
      icon: Crown,
      points: 1000,
      rarity: 'epic',
      unlocked: false
    }
  ]);

  // Simuler un gain de points
  const triggerPointsGain = (points: number) => {
    setRecentPoints(points);
    setTimeout(() => setRecentPoints(0), 2000);
    
    toast({
      title: `+${points} XP ! 🎉`,
      description: "Excellent travail ! Continuez comme ça !",
    });
  };

  // Simuler un level up
  const triggerLevelUp = () => {
    setShowLevelUp(true);
    setTimeout(() => setShowLevelUp(false), 3000);
  };

  // Simuler un combo
  const triggerCombo = () => {
    setShowCombo(true);
    setTimeout(() => setShowCombo(false), 2000);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre de niveau et XP */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {levelInfo.currentLevel}
              </div>
              <div>
                <h3 className="font-bold text-lg">{levelInfo.levelTitle}</h3>
                <p className="text-sm text-muted-foreground">
                  {levelInfo.currentXP} / {levelInfo.xpToNextLevel} XP
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Niveau {levelInfo.currentLevel}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={(levelInfo.currentXP / levelInfo.xpToNextLevel) * 100} 
              className="h-3 bg-gray-200"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(((levelInfo.currentXP / levelInfo.xpToNextLevel) * 100))}% vers le prochain niveau</span>
              <span>{levelInfo.xpToNextLevel - levelInfo.currentXP} XP restants</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Combo streak */}
      {comboStreak.active && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center"
        >
          <Card className="relative overflow-hidden border-2 border-orange-300">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 animate-pulse" />
            <CardContent className="p-4 text-center relative">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-6 w-6 text-orange-500" />
                <span className="font-bold text-lg">COMBO x{comboStreak.multiplier}</span>
                <Zap className="h-6 w-6 text-orange-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                {comboStreak.count} actions consécutives ! Continuez !
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Succès récents */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Succès Récents
            </h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => triggerPointsGain(250)}>
                +250 XP
              </Button>
              <Button size="sm" variant="outline" onClick={triggerLevelUp}>
                Level Up!
              </Button>
              <Button size="sm" variant="outline" onClick={triggerCombo}>
                Combo!
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.filter(a => a.unlocked).map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative p-4 rounded-lg border-2 border-green-200 bg-green-50"
              >
                <div className="text-center">
                  <div className={`
                    w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center
                    bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white shadow-lg
                  `}>
                    <achievement.icon className="h-6 w-6" />
                  </div>
                  
                  <h4 className="font-medium mb-1">{achievement.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                  
                  <div className="flex items-center justify-center gap-2">
                    <Badge className={getRarityBadgeColor(achievement.rarity)}>
                      {achievement.rarity}
                    </Badge>
                    <Badge variant="outline">
                      +{achievement.points} XP
                    </Badge>
                  </div>

                  {achievement.unlockedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Débloqué {achievement.unlockedAt.toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -skew-x-12 animate-shimmer opacity-50" />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Animations des gains de points */}
      <AnimatePresence>
        {recentPoints > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -50, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-2xl">
              +{recentPoints} XP!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animation Level Up */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-8 rounded-2xl shadow-2xl text-center">
              <Crown className="h-16 w-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">NIVEAU SUPÉRIEUR !</h2>
              <p className="text-xl">Niveau {levelInfo.currentLevel + 1}</p>
              <p className="text-lg opacity-90">{levelInfo.levelTitle}</p>
              
              {/* Confettis */}
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -100, -200],
                      x: [(Math.random() - 0.5) * 100],
                      rotate: [0, 360],
                      opacity: [1, 0],
                    }}
                    transition={{
                      duration: 2,
                      ease: "easeOut",
                      delay: Math.random() * 0.5,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animation Combo */}
      <AnimatePresence>
        {showCombo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed bottom-20 right-20 z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-4 rounded-xl shadow-2xl">
              <div className="flex items-center gap-2">
                <Zap className="h-8 w-8" />
                <div>
                  <p className="font-bold text-xl">COMBO!</p>
                  <p className="text-sm">x{comboStreak.multiplier} multiplicateur</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};