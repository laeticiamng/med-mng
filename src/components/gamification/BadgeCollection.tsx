import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useBadgeUnlockTrigger } from '@/hooks/useBadgeUnlockTrigger';
import type { Badge as BadgeType } from '@/hooks/useGamification';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Clock, Lock, Share2, Sparkles, Zap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface BadgeCollectionProps {
  unlockedBadges: BadgeType[];
  allBadges: Omit<BadgeType, 'unlockedAt'>[];
  showStats?: boolean;
}

const RARITY_STYLES = {
  common: 'border-border bg-muted/30',
  rare: 'border-blue-500 bg-blue-500/10',
  epic: 'border-purple-500 bg-purple-500/10',
  legendary: 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20',
};

const RARITY_LABELS = {
  common: 'Commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
};

const RARITY_POINTS = {
  common: 10,
  rare: 25,
  epic: 50,
  legendary: 100,
};

export function BadgeCollection({ unlockedBadges, allBadges, showStats = true }: BadgeCollectionProps) {
  const { toast } = useToast();
  const { logActivity } = useActivityTracking();
  const { unlockedBadge, hideBadgeUnlock } = useBadgeUnlockTrigger();
  const [copiedBadge, setCopiedBadge] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [showUnlockAnimation, setShowUnlockAnimation] = useState<string | null>(null);
  const [soundEnabled, _setSoundEnabled] = useState(true);
  const unlockedIds = new Set(unlockedBadges.map(b => b.id));

  // Play unlock sound effect
  const playUnlockSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      if (import.meta.env.DEV) console.log('Audio not supported');
    }
  }, [soundEnabled]);

  // Fire confetti on unlock
  const fireConfetti = useCallback(async (rarity: string) => {
    const colors = {
      common: ['#64748b', '#94a3b8'],
      rare: ['#3b82f6', '#60a5fa'],
      epic: ['#8b5cf6', '#a78bfa'],
      legendary: ['#eab308', '#fde047', '#f59e0b'],
    };
    const canvasConfetti = (await import('canvas-confetti')).default;
    canvasConfetti({
      particleCount: rarity === 'legendary' ? 150 : rarity === 'epic' ? 100 : 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors[rarity as keyof typeof colors] || colors.common,
    });
  }, []);

  // Show unlock animation for new badges (from real-time subscription or local)
  useEffect(() => {
    if (unlockedBadge) {
      setShowUnlockAnimation(unlockedBadge.id);
      playUnlockSound();
      fireConfetti(unlockedBadge.rarity);
      setTimeout(() => {
        setShowUnlockAnimation(null);
        hideBadgeUnlock();
      }, 4000);
    }
  }, [unlockedBadge, playUnlockSound, fireConfetti, hideBadgeUnlock]);

  // Also check local badge list for recent unlocks
  useEffect(() => {
    if (unlockedBadges.length > 0 && !showUnlockAnimation) {
      const newest = unlockedBadges
        .filter(b => b.unlockedAt)
        .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())[0];
      if (newest && new Date(newest.unlockedAt!).getTime() > Date.now() - 5000) {
        setShowUnlockAnimation(newest.id);
        playUnlockSound();
        fireConfetti(newest.rarity);
        setTimeout(() => setShowUnlockAnimation(null), 4000);
      }
    }
  }, [unlockedBadges, playUnlockSound, fireConfetti, showUnlockAnimation]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalPoints = unlockedBadges.reduce((sum, b) => sum + (RARITY_POINTS[b.rarity] || 0), 0);
    const progressPercent = Math.round((unlockedBadges.length / allBadges.length) * 100);
    const recentBadges = unlockedBadges
      .filter(b => b.unlockedAt)
      .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
      .slice(0, 3);
    
    return { totalPoints, progressPercent, recentBadges };
  }, [unlockedBadges, allBadges]);

  const shareBadge = async (badge: BadgeType) => {
    const shareText = `🏆 J'ai débloqué le badge "${badge.name}" sur MED-MNG ! ${badge.icon}\n${badge.description}`;
    
    logActivity({ activity_type: 'study', metadata: { action: 'share_badge', badgeId: badge.id } });
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Badge MED-MNG', text: shareText });
      } catch (e) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopiedBadge(badge.id);
      toast({ title: 'Copié !', description: 'Le badge a été copié dans le presse-papier' });
      setTimeout(() => setCopiedBadge(null), 2000);
    }
  };

  const groupedBadges = useMemo(() => ({
    legendary: allBadges.filter(b => b.rarity === 'legendary'),
    epic: allBadges.filter(b => b.rarity === 'epic'),
    rare: allBadges.filter(b => b.rarity === 'rare'),
    common: allBadges.filter(b => b.rarity === 'common'),
  }), [allBadges]);

  const filteredBadges = (rarity: keyof typeof groupedBadges) => {
    return groupedBadges[rarity].filter(badge => {
      if (filter === 'all') return true;
      if (filter === 'unlocked') return unlockedIds.has(badge.id);
      return !unlockedIds.has(badge.id);
    });
  };

  return (
    <TooltipProvider>
      {/* Unlock Animation Overlay */}
      <AnimatePresence>
        {showUnlockAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setShowUnlockAnimation(null)}
          >
            <motion.div
              initial={{ y: 50, rotateY: -180 }}
              animate={{ y: 0, rotateY: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: 2, duration: 0.5 }}
                className="text-8xl mb-4"
              >
                {unlockedBadges.find(b => b.id === showUnlockAnimation)?.icon}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-primary mb-2">
                  Badge Débloqué !
                </h2>
                <p className="text-lg">{unlockedBadges.find(b => b.id === showUnlockAnimation)?.name}</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Zap className="h-5 w-5 text-warning" />
                  <span className="text-warning font-bold">
                    +{RARITY_POINTS[unlockedBadges.find(b => b.id === showUnlockAnimation)?.rarity || 'common']} points
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Collection de Badges
              </CardTitle>
              <CardDescription>
                {unlockedBadges.length} sur {allBadges.length} débloqués
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {stats.progressPercent}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Bar */}
          {showStats && (
            <div className="space-y-4">
              <Progress value={stats.progressPercent} className="h-2" />
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{unlockedBadges.length}</p>
                  <p className="text-xs text-muted-foreground">Débloqués</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-warning">{stats.totalPoints}</p>
                  <p className="text-xs text-muted-foreground">Points badges</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-muted-foreground">{allBadges.length - unlockedBadges.length}</p>
                  <p className="text-xs text-muted-foreground">Restants</p>
                </div>
              </div>

              {/* Recent Unlocks */}
              {stats.recentBadges.length > 0 && (
                <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
                  <p className="text-xs font-medium text-success mb-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Récemment débloqués
                  </p>
                  <div className="flex gap-2">
                    {stats.recentBadges.map(badge => (
                      <div key={badge.id} className="flex items-center gap-1 bg-background rounded px-2 py-1">
                        <span>{badge.icon}</span>
                        <span className="text-xs">{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filter buttons */}
          <div className="flex gap-2">
            {(['all', 'unlocked', 'locked'] as const).map(f => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className="text-xs"
              >
                {f === 'all' ? 'Tous' : f === 'unlocked' ? 'Débloqués' : 'Verrouillés'}
              </Button>
            ))}
          </div>

          {/* Badge Grid */}
          {(['legendary', 'epic', 'rare', 'common'] as const).map((rarity) => {
            const badges = filteredBadges(rarity);
            if (badges.length === 0) return null;
            
            return (
              <div key={rarity}>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  {RARITY_LABELS[rarity]} 
                  <Badge variant="outline" className="text-[10px]">
                    {groupedBadges[rarity].filter(b => unlockedIds.has(b.id)).length}/{groupedBadges[rarity].length}
                  </Badge>
                </h4>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {badges.map((badge) => {
                    const isUnlocked = unlockedIds.has(badge.id);
                    const unlockedData = unlockedBadges.find(b => b.id === badge.id);

                    return (
                      <Tooltip key={badge.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={`aspect-square rounded-xl border-2 flex items-center justify-center text-2xl transition-all relative group ${
                              isUnlocked 
                                ? `${RARITY_STYLES[rarity]} cursor-pointer hover:scale-110 animate-in fade-in duration-300` 
                                : 'border-border/30 bg-muted/10 opacity-40 grayscale'
                            }`}
                          >
                            {isUnlocked ? (
                              <>
                                <span className="group-hover:scale-110 transition-transform">{badge.icon}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute -top-1 -right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    shareBadge(unlockedData!);
                                  }}
                                >
                                  {copiedBadge === badge.id ? (
                                    <Check className="h-3 w-3 text-success" />
                                  ) : (
                                    <Share2 className="h-3 w-3" />
                                  )}
                                </Button>
                              </>
                            ) : (
                              <Lock className="h-5 w-5 text-muted-foreground/50" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px]">
                          <p className="font-medium">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                          {isUnlocked && unlockedData?.unlockedAt && (
                            <p className="text-[10px] text-success mt-1">
                              Débloqué le {new Date(unlockedData.unlockedAt).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={`text-[10px] ${RARITY_STYLES[rarity]}`}>
                              {RARITY_LABELS[rarity]}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">+{RARITY_POINTS[rarity]} pts</span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
