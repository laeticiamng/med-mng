import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Sparkles, Share2, X } from 'lucide-react';

// Dynamic import for confetti to avoid SSR issues
const triggerConfetti = async (colors: string[]) => {
  try {
    const confetti = (await import('canvas-confetti')).default;
    confetti({ particleCount: 50, spread: 70, colors, origin: { y: 0.6 } });
  } catch (e) {
    // Silently fail if confetti not available
  }
};

interface BadgeUnlockAnimationProps {
  badge: {
    id: string;
    name: string;
    description: string;
    icon?: string;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  };
  onClose: () => void;
  onShare?: () => void;
}

export const BadgeUnlockAnimation: React.FC<BadgeUnlockAnimationProps> = ({
  badge,
  onClose,
  onShare
}) => {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Trigger confetti animation
    const colors = getRarityColors(badge.rarity);
    triggerConfetti(colors);

    // Show details after initial animation
    const timer = setTimeout(() => setShowDetails(true), 800);
    return () => clearTimeout(timer);
  }, [badge.rarity]);

  const getRarityColors = (rarity?: string): string[] => {
    switch (rarity) {
      case 'legendary':
        return ['#FFD700', '#FFA500', '#FF8C00'];
      case 'epic':
        return ['#9B59B6', '#8E44AD', '#7D3C98'];
      case 'rare':
        return ['#3498DB', '#2980B9', '#1ABC9C'];
      default:
        return ['#2ECC71', '#27AE60', '#1ABC9C'];
    }
  };

  const getRarityGradient = (rarity?: string): string => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 via-orange-500 to-red-500';
      case 'epic':
        return 'from-purple-400 via-purple-500 to-purple-600';
      case 'rare':
        return 'from-blue-400 via-blue-500 to-cyan-500';
      default:
        return 'from-green-400 via-emerald-500 to-teal-500';
    }
  };

  const getRarityLabel = (rarity?: string): string => {
    switch (rarity) {
      case 'legendary':
        return '✨ LÉGENDAIRE';
      case 'epic':
        return '💎 ÉPIQUE';
      case 'rare':
        return '💫 RARE';
      default:
        return '🌟 COMMUN';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="relative overflow-hidden p-8 max-w-sm mx-4">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className={`absolute -inset-10 bg-gradient-to-r ${getRarityGradient(badge.rarity)} opacity-20 blur-3xl`}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center space-y-6">
              {/* Title */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-wider">
                    Nouveau Badge Débloqué !
                  </span>
                  <Sparkles className="h-5 w-5" />
                </div>
              </motion.div>

              {/* Badge icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                  delay: 0.5
                }}
                className="relative"
              >
                <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${getRarityGradient(badge.rarity)} p-1`}>
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity
                      }}
                    >
                      {badge.icon ? (
                        <span className="text-5xl">{badge.icon}</span>
                      ) : (
                        <Trophy className="h-16 w-16 text-primary" />
                      )}
                    </motion.div>
                  </div>
                </div>

                {/* Floating stars */}
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.cos((i * 72 * Math.PI) / 180) * 60,
                      y: Math.sin((i * 72 * Math.PI) / 180) * 60
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </motion.div>
                ))}
              </motion.div>

              {/* Badge details */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getRarityGradient(badge.rarity)} text-white`}>
                      {getRarityLabel(badge.rarity)}
                    </span>

                    <h2 className="text-2xl font-bold">{badge.name}</h2>
                    <p className="text-muted-foreground text-sm">
                      {badge.description}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 justify-center pt-4">
                      {onShare && (
                        <Button variant="outline" onClick={onShare}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Partager
                        </Button>
                      )}
                      <Button onClick={onClose}>
                        Continuer
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook to trigger badge unlock animation
export const useBadgeUnlock = () => {
  const [unlockedBadge, setUnlockedBadge] = useState<any>(null);

  const showBadgeUnlock = (badge: any) => {
    setUnlockedBadge(badge);
  };

  const hideBadgeUnlock = () => {
    setUnlockedBadge(null);
  };

  return {
    unlockedBadge,
    showBadgeUnlock,
    hideBadgeUnlock
  };
};
