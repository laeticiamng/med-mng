import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

export interface GamificationStats {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  xpToNextLevel: number;
  currentXP: number;
  badges: Badge[];
  weeklyGoalProgress: number;
  weeklyGoal: number;
}

export const BADGE_DEFINITIONS: Omit<Badge, 'unlockedAt'>[] = [
  { id: 'first_item', name: 'Premier Pas', description: 'Réviser votre premier item', icon: '🎯', rarity: 'common' },
  { id: 'streak_3', name: 'Régulier', description: '3 jours consécutifs', icon: '🔥', rarity: 'common' },
  { id: 'streak_7', name: 'Déterminé', description: '7 jours consécutifs', icon: '💪', rarity: 'rare' },
  { id: 'streak_30', name: 'Machine', description: '30 jours consécutifs', icon: '🏆', rarity: 'epic' },
  { id: 'perfect_exam', name: 'Sans Faute', description: '100% à un examen', icon: '⭐', rarity: 'rare' },
  { id: 'items_10', name: 'Apprenti', description: 'Maîtriser 10 items', icon: '📚', rarity: 'common' },
  { id: 'items_50', name: 'Érudit', description: 'Maîtriser 50 items', icon: '🎓', rarity: 'rare' },
  { id: 'items_100', name: 'Expert', description: 'Maîtriser 100 items', icon: '👨‍⚕️', rarity: 'epic' },
  { id: 'items_200', name: 'Maître EDN', description: 'Maîtriser 200 items', icon: '👑', rarity: 'legendary' },
  { id: 'night_owl', name: 'Noctambule', description: 'Réviser après 23h', icon: '🦉', rarity: 'common' },
  { id: 'early_bird', name: 'Lève-tôt', description: 'Réviser avant 7h', icon: '🐦', rarity: 'common' },
  { id: 'ai_chat', name: 'Curieux', description: 'Poser 10 questions à l\'IA', icon: '🤖', rarity: 'common' },
  { id: 'clinical_master', name: 'Clinicien', description: 'Compléter 10 cas cliniques', icon: '🏥', rarity: 'rare' },
];

export const XP_PER_LEVEL = 1000;
export const POINTS_CONFIG = {
  itemReviewed: 10,
  itemMastered: 50,
  examCompleted: 100,
  perfectExam: 200,
  dailyStreak: 25,
  clinicalCase: 75,
  aiQuestion: 5,
};

export function useGamification() {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const calculateLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
  const calculateXPToNext = (xp: number) => XP_PER_LEVEL - (xp % XP_PER_LEVEL);

  const loadStats = useCallback(async (userId: string) => {
    try {
      // Load from localStorage as fallback (could be moved to Supabase)
      const stored = localStorage.getItem(`gamification_${userId}`);
      const baseStats: GamificationStats = stored ? JSON.parse(stored) : {
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        level: 1,
        xpToNextLevel: XP_PER_LEVEL,
        currentXP: 0,
        badges: [],
        weeklyGoalProgress: 0,
        weeklyGoal: 50,
      };

      // Calculate streak from activity log
      const { data: activities } = await supabase
        .from('user_activity_log')
        .select('activity_date')
        .eq('user_id', userId)
        .order('activity_date', { ascending: false })
        .limit(60);

      if (activities && activities.length > 0) {
        const uniqueDates = [...new Set(activities.map(a => a.activity_date))];
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
          streak = 1;
          for (let i = 1; i < uniqueDates.length; i++) {
            const prev = new Date(uniqueDates[i - 1]);
            const curr = new Date(uniqueDates[i]);
            const diff = (prev.getTime() - curr.getTime()) / 86400000;
            if (diff === 1) streak++;
            else break;
          }
        }
        baseStats.currentStreak = streak;
        baseStats.longestStreak = Math.max(baseStats.longestStreak, streak);
      }

      // Weekly progress from activity log
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const { count: weeklyCount } = await supabase
        .from('user_activity_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('activity_date', weekStart.toISOString().split('T')[0]);

      baseStats.weeklyGoalProgress = weeklyCount || 0;
      baseStats.level = calculateLevel(baseStats.currentXP);
      baseStats.xpToNextLevel = calculateXPToNext(baseStats.currentXP);

      setStats(baseStats);
      localStorage.setItem(`gamification_${userId}`, JSON.stringify(baseStats));
    } catch (error) {
      console.error('Error loading gamification stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPoints = useCallback(async (userId: string, action: keyof typeof POINTS_CONFIG, multiplier = 1) => {
    if (!stats) return;

    const points = POINTS_CONFIG[action] * multiplier;
    const newXP = stats.currentXP + points;
    const newLevel = calculateLevel(newXP);
    const leveledUp = newLevel > stats.level;

    const updatedStats: GamificationStats = {
      ...stats,
      totalPoints: stats.totalPoints + points,
      currentXP: newXP,
      level: newLevel,
      xpToNextLevel: calculateXPToNext(newXP),
    };

    setStats(updatedStats);
    localStorage.setItem(`gamification_${userId}`, JSON.stringify(updatedStats));

    if (leveledUp) {
      toast({
        title: `🎉 Niveau ${newLevel} atteint !`,
        description: `Vous avez gagné ${points} XP`,
      });
    }

    return points;
  }, [stats, toast]);

  const unlockBadge = useCallback(async (userId: string, badgeId: string) => {
    if (!stats) return false;

    const badgeDef = BADGE_DEFINITIONS.find(b => b.id === badgeId);
    if (!badgeDef) return false;
    if (stats.badges.some(b => b.id === badgeId)) return false;

    const newBadge: Badge = {
      ...badgeDef,
      unlockedAt: new Date().toISOString(),
    };

    const updatedStats: GamificationStats = {
      ...stats,
      badges: [...stats.badges, newBadge],
    };

    setStats(updatedStats);
    localStorage.setItem(`gamification_${userId}`, JSON.stringify(updatedStats));

    toast({
      title: `${badgeDef.icon} Badge débloqué !`,
      description: badgeDef.name,
    });

    return true;
  }, [stats, toast]);

  const checkAndUnlockBadges = useCallback(async (userId: string) => {
    if (!stats) return;

    // Streak badges
    if (stats.currentStreak >= 3) await unlockBadge(userId, 'streak_3');
    if (stats.currentStreak >= 7) await unlockBadge(userId, 'streak_7');
    if (stats.currentStreak >= 30) await unlockBadge(userId, 'streak_30');

    // Time-based badges
    const hour = new Date().getHours();
    if (hour >= 23 || hour < 5) await unlockBadge(userId, 'night_owl');
    if (hour >= 5 && hour < 7) await unlockBadge(userId, 'early_bird');
  }, [stats, unlockBadge]);

  return {
    stats,
    loading,
    loadStats,
    addPoints,
    unlockBadge,
    checkAndUnlockBadges,
    BADGE_DEFINITIONS,
    POINTS_CONFIG,
  };
}
