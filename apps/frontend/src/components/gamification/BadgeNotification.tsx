import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BadgeNotificationProps {
  badge: {
    id: string;
    name: string;
    description: string;
    icon?: string;
    rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    xp_reward?: number;
  } | null;
  onClose: () => void;
  autoClose?: number; // milliseconds
}

const rarityConfig = {
  common: {
    gradient: 'from-gray-400 to-gray-600',
    glow: 'shadow-gray-400/50',
    border: 'border-gray-400',
    label: 'Commun',
  },
  uncommon: {
    gradient: 'from-green-400 to-green-600',
    glow: 'shadow-green-400/50',
    border: 'border-green-400',
    label: 'Peu commun',
  },
  rare: {
    gradient: 'from-blue-400 to-blue-600',
    glow: 'shadow-blue-400/50',
    border: 'border-blue-400',
    label: 'Rare',
  },
  epic: {
    gradient: 'from-purple-400 to-purple-600',
    glow: 'shadow-purple-400/50',
    border: 'border-purple-400',
    label: 'Épique',
  },
  legendary: {
    gradient: 'from-yellow-400 to-orange-500',
    glow: 'shadow-yellow-400/50',
    border: 'border-yellow-400',
    label: 'Légendaire',
  },
};

export const BadgeNotification: React.FC<BadgeNotificationProps> = ({
  badge,
  onClose,
  autoClose = 8000,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (badge) {
      setIsVisible(true);
      if (autoClose > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }, autoClose);
        return () => clearTimeout(timer);
      }
    }
  }, [badge, autoClose, onClose]);

  if (!badge) return null;

  const rarity = badge.rarity || 'common';
  const config = rarityConfig[rarity];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto"
        >
          <div
            className={cn(
              'relative bg-background/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border-2',
              config.border,
              config.glow,
              'min-w-[320px] max-w-[400px]'
            )}
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Sparkles decoration */}
            <motion.div
              className="absolute -top-2 -left-2"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="h-6 w-6 text-yellow-400" />
            </motion.div>
            <motion.div
              className="absolute -top-2 -right-8"
              animate={{ rotate: -360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="h-5 w-5 text-yellow-400" />
            </motion.div>

            {/* Content */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mb-4"
              >
                <div
                  className={cn(
                    'inline-flex items-center justify-center w-20 h-20 rounded-full',
                    'bg-gradient-to-br',
                    config.gradient,
                    'shadow-lg',
                    config.glow
                  )}
                >
                  {badge.icon ? (
                    <span className="text-4xl">{badge.icon}</span>
                  ) : (
                    <Trophy className="h-10 w-10 text-white" />
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Nouveau badge débloqué !
                </p>
                <h3 className="text-xl font-bold mb-2">{badge.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {badge.description}
                </p>

                <div className="flex items-center justify-center gap-3">
                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium text-white',
                      'bg-gradient-to-r',
                      config.gradient
                    )}
                  >
                    {config.label}
                  </span>

                  {badge.xp_reward && badge.xp_reward > 0 && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      <Star className="h-3 w-3" />
                      +{badge.xp_reward} XP
                    </span>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Progress bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r rounded-b-2xl"
              style={{
                background: `linear-gradient(to right, var(--tw-gradient-stops))`,
              }}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: autoClose / 1000, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook pour gérer les notifications de badges
export const useBadgeNotification = () => {
  const [pendingBadges, setPendingBadges] = useState<any[]>([]);
  const [currentBadge, setCurrentBadge] = useState<any | null>(null);

  const showBadge = (badge: any) => {
    setPendingBadges((prev) => [...prev, badge]);
  };

  const showMultipleBadges = (badges: any[]) => {
    setPendingBadges((prev) => [...prev, ...badges]);
  };

  useEffect(() => {
    if (!currentBadge && pendingBadges.length > 0) {
      setCurrentBadge(pendingBadges[0]);
      setPendingBadges((prev) => prev.slice(1));
    }
  }, [currentBadge, pendingBadges]);

  const closeBadge = () => {
    setCurrentBadge(null);
  };

  return {
    currentBadge,
    showBadge,
    showMultipleBadges,
    closeBadge,
    hasPendingBadges: pendingBadges.length > 0,
  };
};

export default BadgeNotification;
