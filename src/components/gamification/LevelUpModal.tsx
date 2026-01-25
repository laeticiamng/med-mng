import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import confetti from 'canvas-confetti';
import { Gift, Sparkles, Star, Trophy, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  totalXP: number;
  rewards?: {
    badge?: string;
    feature?: string;
    bonus?: number;
  };
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  newLevel,
  totalXP,
  rewards
}) => {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Déclencher le confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB']
      });

      // Animation par étapes
      const timer1 = setTimeout(() => setAnimationStep(1), 300);
      const timer2 = setTimeout(() => setAnimationStep(2), 600);
      const timer3 = setTimeout(() => setAnimationStep(3), 900);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setAnimationStep(0);
    }
  }, [isOpen]);

  const getLevelTitle = (level: number): string => {
    if (level < 5) return 'Apprenti';
    if (level < 10) return 'Étudiant';
    if (level < 20) return 'Praticien';
    if (level < 30) return 'Expert';
    if (level < 50) return 'Maître';
    return 'Légende';
  };

  const getLevelColor = (level: number): string => {
    if (level < 5) return 'from-gray-400 to-gray-600';
    if (level < 10) return 'from-green-400 to-green-600';
    if (level < 20) return 'from-blue-400 to-blue-600';
    if (level < 30) return 'from-purple-400 to-purple-600';
    if (level < 50) return 'from-yellow-400 to-yellow-600';
    return 'from-pink-400 via-purple-400 to-indigo-400';
  };
  const xpProgress = (totalXP % 1000) / 1000 * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="space-y-4">
          {/* Animation de level up */}
          <div className={`transition-all duration-500 ${animationStep >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${getLevelColor(newLevel)} flex items-center justify-center shadow-2xl`}>
              <Star className="w-12 h-12 text-white" />
            </div>
          </div>

          <DialogTitle className={`text-3xl font-bold transition-all duration-500 ${animationStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-warning" />
              Niveau {newLevel} !
              <Sparkles className="h-6 w-6 text-warning" />
            </span>
          </DialogTitle>
          
          <DialogDescription className={`transition-all duration-500 ${animationStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <Badge variant="secondary" className="text-sm px-4 py-1">
              {getLevelTitle(newLevel)}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className={`space-y-6 py-4 transition-all duration-500 ${animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {/* XP Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">XP Total</span>
              <span className="font-bold text-primary">{totalXP.toLocaleString()}</span>
            </div>
            <Progress value={xpProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {1000 - (totalXP % 1000)} XP pour le niveau {newLevel + 1}
            </p>
          </div>

          {/* Récompenses débloquées */}
          {rewards && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center justify-center gap-2">
                <Gift className="h-4 w-4 text-warning" />
                Récompenses débloquées
              </h4>
              
              <div className="grid gap-2">
                {rewards.badge && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                    <Trophy className="h-5 w-5 text-success" />
                    <div className="text-left">
                      <p className="font-medium text-sm">Nouveau badge</p>
                      <p className="text-xs text-muted-foreground">{rewards.badge}</p>
                    </div>
                  </div>
                )}
                
                {rewards.feature && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <Zap className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-sm">Fonctionnalité</p>
                      <p className="text-xs text-muted-foreground">{rewards.feature}</p>
                    </div>
                  </div>
                )}
                
                {rewards.bonus && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <Star className="h-5 w-5 text-warning" />
                    <div className="text-left">
                      <p className="font-medium text-sm">Bonus XP</p>
                      <p className="text-xs text-muted-foreground">+{rewards.bonus} XP offerts</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Message d'encouragement */}
          <div className="p-4 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">
              {newLevel < 10 
                ? "🚀 Continue comme ça ! Tu progresses rapidement !"
                : newLevel < 20
                ? "💪 Impressionnant ! Tu deviens un expert !"
                : newLevel < 50
                ? "🌟 Tu fais partie des meilleurs !"
                : "👑 Tu es une légende de la plateforme !"
              }
            </p>
          </div>
        </div>

        <Button onClick={onClose} className="w-full gap-2">
          <Star className="h-4 w-4" />
          Continuer mon parcours
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default LevelUpModal;
