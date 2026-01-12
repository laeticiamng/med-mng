import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Star, 
  Flame, 
  Target,
  BookOpen,
  Music,
  Brain,
  Zap,
  Award,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'flame' | 'target' | 'book' | 'music' | 'brain' | 'zap' | 'award';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
}

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
  autoCloseDelay?: number;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  flame: Flame,
  target: Target,
  book: BookOpen,
  music: Music,
  brain: Brain,
  zap: Zap,
  award: Award,
};

const rarityColors = {
  common: {
    bg: 'from-gray-500 to-gray-600',
    border: 'border-gray-400',
    text: 'text-gray-600',
    glow: 'shadow-gray-500/30',
  },
  rare: {
    bg: 'from-blue-500 to-blue-600',
    border: 'border-blue-400',
    text: 'text-blue-600',
    glow: 'shadow-blue-500/30',
  },
  epic: {
    bg: 'from-purple-500 to-purple-600',
    border: 'border-purple-400',
    text: 'text-purple-600',
    glow: 'shadow-purple-500/30',
  },
  legendary: {
    bg: 'from-yellow-400 via-orange-500 to-red-500',
    border: 'border-yellow-400',
    text: 'text-yellow-600',
    glow: 'shadow-yellow-500/50',
  },
};

const rarityLabels = {
  common: 'Commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
};

export const AchievementPopup: React.FC<AchievementPopupProps> = ({
  achievement,
  onClose,
  autoCloseDelay = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      
      // Confetti pour les achievements rares+
      if (achievement.rarity !== 'common') {
        confetti({
          particleCount: achievement.rarity === 'legendary' ? 150 : achievement.rarity === 'epic' ? 100 : 50,
          spread: 70,
          origin: { y: 0.3 },
          colors: achievement.rarity === 'legendary' 
            ? ['#FFD700', '#FFA500', '#FF6347'] 
            : achievement.rarity === 'epic'
            ? ['#9370DB', '#8A2BE2', '#DDA0DD']
            : ['#4169E1', '#00CED1', '#87CEEB'],
        });
      }

      // Auto-close
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [achievement, autoCloseDelay, onClose]);

  if (!achievement) return null;

  const IconComponent = iconMap[achievement.icon];
  const colors = rarityColors[achievement.rarity];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ 
            type: 'spring', 
            stiffness: 200, 
            damping: 20 
          }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4"
        >
          <div 
            className={`
              relative overflow-hidden rounded-2xl 
              bg-card border-2 ${colors.border} 
              shadow-xl ${colors.glow}
            `}
          >
            {/* Background glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${colors.bg} opacity-10`} />
            
            {/* Close button */}
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="relative p-4">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <motion.div
                  initial={{ rotate: -10, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className={`
                    w-14 h-14 rounded-xl 
                    bg-gradient-to-br ${colors.bg} 
                    flex items-center justify-center
                    shadow-lg ${colors.glow}
                  `}
                >
                  <IconComponent className="h-7 w-7 text-white" />
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Succès débloqué
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${colors.text} ${colors.border}`}
                      >
                        {rarityLabels[achievement.rarity]}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-foreground truncate">
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {achievement.description}
                    </p>
                  </motion.div>
                </div>

                {/* XP Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                >
                  <Badge 
                    className={`bg-gradient-to-r ${colors.bg} text-white border-0 px-3 py-1`}
                  >
                    +{achievement.xpReward} XP
                  </Badge>
                </motion.div>
              </div>

              {/* Progress bar animation */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: autoCloseDelay / 1000, ease: 'linear' }}
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.bg} origin-left`}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementPopup;
