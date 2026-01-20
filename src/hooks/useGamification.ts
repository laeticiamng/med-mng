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
  // Progression badges
  { id: 'first_item', name: 'Premier Pas', description: 'Réviser votre premier item', icon: '🎯', rarity: 'common' },
  { id: 'items_10', name: 'Apprenti', description: 'Maîtriser 10 items', icon: '📚', rarity: 'common' },
  { id: 'items_50', name: 'Érudit', description: 'Maîtriser 50 items', icon: '🎓', rarity: 'rare' },
  { id: 'items_100', name: 'Expert', description: 'Maîtriser 100 items', icon: '👨‍⚕️', rarity: 'epic' },
  { id: 'items_200', name: 'Maître EDN', description: 'Maîtriser 200 items', icon: '👑', rarity: 'legendary' },
  
  // Streak badges
  { id: 'streak_3', name: 'Régulier', description: '3 jours consécutifs', icon: '🔥', rarity: 'common' },
  { id: 'streak_7', name: 'Déterminé', description: '7 jours consécutifs', icon: '💪', rarity: 'rare' },
  { id: 'streak_14', name: 'Infatigable', description: '14 jours consécutifs', icon: '⚡', rarity: 'rare' },
  { id: 'streak_30', name: 'Machine', description: '30 jours consécutifs', icon: '🏆', rarity: 'epic' },
  { id: 'streak_100', name: 'Légende', description: '100 jours consécutifs', icon: '🌟', rarity: 'legendary' },
  
  // Exam badges
  { id: 'perfect_exam', name: 'Sans Faute', description: '100% à un examen', icon: '⭐', rarity: 'rare' },
  { id: 'exam_10', name: 'Testeur', description: 'Compléter 10 examens', icon: '📝', rarity: 'common' },
  { id: 'exam_50', name: 'Vétéran', description: 'Compléter 50 examens', icon: '🎖️', rarity: 'epic' },
  
  // Clinical badges
  { id: 'clinical_master', name: 'Clinicien', description: 'Compléter 10 cas cliniques', icon: '🏥', rarity: 'rare' },
  { id: 'clinical_expert', name: 'Praticien', description: 'Compléter 50 cas cliniques', icon: '⚕️', rarity: 'epic' },
  
  // Music badges
  { id: 'music_first', name: 'Mélomane', description: 'Générer votre première chanson', icon: '🎵', rarity: 'common' },
  { id: 'music_10', name: 'Compositeur', description: 'Générer 10 chansons', icon: '🎸', rarity: 'rare' },
  
  // AI badges
  { id: 'ai_chat', name: 'Curieux', description: 'Poser 10 questions à l\'IA', icon: '🤖', rarity: 'common' },
  { id: 'ai_expert', name: 'Explorateur IA', description: 'Poser 100 questions à l\'IA', icon: '🧠', rarity: 'rare' },
  
  // Time-based badges
  { id: 'night_owl', name: 'Noctambule', description: 'Réviser après 23h', icon: '🦉', rarity: 'common' },
  { id: 'early_bird', name: 'Lève-tôt', description: 'Réviser avant 7h', icon: '🐦', rarity: 'common' },
  { id: 'weekend_warrior', name: 'Guerrier du Weekend', description: 'Réviser 5 weekends de suite', icon: '⚔️', rarity: 'rare' },
  
  // Social badges
  { id: 'first_share', name: 'Partageur', description: 'Partager votre progression', icon: '📤', rarity: 'common' },
  { id: 'community_active', name: 'Communautaire', description: 'Publier 10 posts', icon: '💬', rarity: 'rare' },
  
  // Flashcard badges
  { id: 'flashcard_creator', name: 'Créateur', description: 'Créer 50 flashcards', icon: '🃏', rarity: 'common' },
  { id: 'flashcard_master', name: 'Maître des Cartes', description: 'Créer 200 flashcards', icon: '🎴', rarity: 'epic' },
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
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<Badge | null>(null);
  const { toast } = useToast();

  const calculateLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
  const calculateXPToNext = (xp: number) => XP_PER_LEVEL - (xp % XP_PER_LEVEL);

  // Default stats for non-authenticated users
  const getDefaultStats = (): GamificationStats => ({
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    xpToNextLevel: XP_PER_LEVEL,
    currentXP: 0,
    badges: [],
    weeklyGoalProgress: 0,
    weeklyGoal: 50,
  });

  const loadStats = useCallback(async (userId: string) => {
    if (!userId || userId === '00000000-0000-0000-0000-000000000000') {
      setStats(getDefaultStats());
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // Charger les badges depuis Supabase
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id, badge_name, badge_description, badge_icon, earned_at, unlocked')
        .eq('user_id', userId)
        .eq('unlocked', true);

      const badges: Badge[] = (userBadges || []).map(ub => {
        const def = BADGE_DEFINITIONS.find(b => b.id === ub.badge_id);
        return {
          id: ub.badge_id,
          name: ub.badge_name || def?.name || 'Badge',
          description: ub.badge_description || def?.description || '',
          icon: ub.badge_icon || def?.icon || '🏆',
          rarity: def?.rarity || 'common',
          unlockedAt: ub.earned_at,
        };
      });

      // Charger les points totaux depuis gamification_activities
      const { data: activities } = await supabase
        .from('gamification_activities')
        .select('points_earned')
        .eq('user_id', userId);
      
      const totalPoints = (activities || []).reduce((sum, a) => sum + (a.points_earned || 0), 0);

      // Calculate streak from user_activity_log
      const { data: activityLog } = await supabase
        .from('user_activity_log')
        .select('activity_date')
        .eq('user_id', userId)
        .order('activity_date', { ascending: false })
        .limit(60);

      let currentStreak = 0;
      if (activityLog && activityLog.length > 0) {
        const uniqueDates = [...new Set(activityLog.map(a => a.activity_date))];
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
          currentStreak = 1;
          for (let i = 1; i < uniqueDates.length; i++) {
            const prev = new Date(uniqueDates[i - 1]);
            const curr = new Date(uniqueDates[i]);
            const diff = (prev.getTime() - curr.getTime()) / 86400000;
            if (diff === 1) currentStreak++;
            else break;
          }
        }
      }

      // Weekly progress from activity log
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const { count: weeklyCount } = await supabase
        .from('user_activity_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('activity_date', weekStart.toISOString().split('T')[0]);

      // Récupérer le longest streak depuis Supabase
      const { data: gamificationData } = await supabase
        .from('user_gamification_stats')
        .select('longest_streak')
        .eq('user_id', userId)
        .maybeSingle();
      
      const storedLongestStreak = gamificationData?.longest_streak || 0;
      const longestStreak = Math.max(storedLongestStreak, currentStreak);

      const baseStats: GamificationStats = {
        totalPoints,
        currentStreak,
        longestStreak,
        level: calculateLevel(totalPoints),
        xpToNextLevel: calculateXPToNext(totalPoints),
        currentXP: totalPoints,
        badges,
        weeklyGoalProgress: weeklyCount || 0,
        weeklyGoal: 50,
      };

      setStats(baseStats);
      
      // Sauvegarder longestStreak dans Supabase
      if (longestStreak > storedLongestStreak) {
        await (supabase as any).from('user_gamification_stats').upsert({
          user_id: userId,
          longest_streak: longestStreak,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      }
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

    // Persister dans Supabase
    await supabase.from('gamification_activities').insert({
      user_id: userId,
      activity_type: action,
      activity_name: action,
      points_earned: points,
      created_at: new Date().toISOString(),
    } as any);

    const updatedStats: GamificationStats = {
      ...stats,
      totalPoints: stats.totalPoints + points,
      currentXP: newXP,
      level: newLevel,
      xpToNextLevel: calculateXPToNext(newXP),
    };

    setStats(updatedStats);

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

    // Persister dans Supabase user_badges
    const { error } = await supabase.from('user_badges').insert({
      user_id: userId,
      badge_id: badgeId,
      badge_name: badgeDef.name,
      badge_description: badgeDef.description,
      badge_icon: badgeDef.icon,
      badge_category: badgeDef.rarity,
      earned_at: new Date().toISOString(),
      unlocked: true,
    } as any);

    if (error) {
      console.error('Error saving badge:', error);
      return false;
    }

    const newBadge: Badge = {
      ...badgeDef,
      unlockedAt: new Date().toISOString(),
    };

    const updatedStats: GamificationStats = {
      ...stats,
      badges: [...stats.badges, newBadge],
    };

    setStats(updatedStats);

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
    if (stats.currentStreak >= 14) await unlockBadge(userId, 'streak_14');
    if (stats.currentStreak >= 30) await unlockBadge(userId, 'streak_30');
    if (stats.currentStreak >= 100) await unlockBadge(userId, 'streak_100');

    // Time-based badges
    const hour = new Date().getHours();
    if (hour >= 23 || hour < 5) await unlockBadge(userId, 'night_owl');
    if (hour >= 5 && hour < 7) await unlockBadge(userId, 'early_bird');
    
    // Fetch all activity counts in parallel for performance
    const reviewsResult = await supabase.from('user_activity_log').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('activity_type', 'review');
    const clinicalResult = await supabase.from('user_activity_log').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('activity_type', 'clinical');
    const aiResult = await supabase.from('user_activity_log').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('activity_type', 'ai_question');
    const examResult = await supabase.from('user_activity_log').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('activity_type', 'exam');
    const musicResult = await supabase.from('user_activity_log').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('activity_type', 'music_generation');
    const flashcardResult = await (supabase.from('flashcards').select('id', { count: 'exact', head: true }) as any).eq('user_id', userId);
    
    const totalReviews = reviewsResult.count || 0;
    const clinicalCount = clinicalResult.count || 0;
    const aiCount = aiResult.count || 0;
    const examCount = examResult.count || 0;
    const musicCount = musicResult.count || 0;
    const flashcardCount = flashcardResult?.count || 0;

    // Items mastery badges
    if (totalReviews >= 1) await unlockBadge(userId, 'first_item');
    if (totalReviews >= 10) await unlockBadge(userId, 'items_10');
    if (totalReviews >= 50) await unlockBadge(userId, 'items_50');
    if (totalReviews >= 100) await unlockBadge(userId, 'items_100');
    if (totalReviews >= 200) await unlockBadge(userId, 'items_200');
    
    // Clinical cases badges
    if (clinicalCount >= 10) await unlockBadge(userId, 'clinical_master');
    if (clinicalCount >= 50) await unlockBadge(userId, 'clinical_expert');
    
    // AI questions badges
    if (aiCount >= 10) await unlockBadge(userId, 'ai_chat');
    if (aiCount >= 100) await unlockBadge(userId, 'ai_expert');
    
    // Exam badges
    if (examCount >= 10) await unlockBadge(userId, 'exam_10');
    if (examCount >= 50) await unlockBadge(userId, 'exam_50');
    
    // Music badges
    if (musicCount >= 1) await unlockBadge(userId, 'music_first');
    if (musicCount >= 10) await unlockBadge(userId, 'music_10');
    
    // Flashcard badges
    if (flashcardCount >= 50) await unlockBadge(userId, 'flashcard_creator');
    if (flashcardCount >= 200) await unlockBadge(userId, 'flashcard_master');
  }, [stats, unlockBadge]);

  // Get progress to next badge - enhanced version
  const getProgressToNextBadge = useCallback((badgeId: string): number => {
    if (!stats) return 0;

    const thresholds: Record<string, number> = {
      streak_3: 3,
      streak_7: 7,
      streak_14: 14,
      streak_30: 30,
      streak_100: 100,
      items_10: 10,
      items_50: 50,
      items_100: 100,
      items_200: 200,
    };

    const threshold = thresholds[badgeId];
    if (!threshold) return 0;

    if (badgeId.startsWith('streak_')) {
      return Math.min(100, Math.round((stats.currentStreak / threshold) * 100));
    }

    return 0;
  }, [stats]);

  // Get XP multiplier based on streak
  const getMultiplier = useCallback((): number => {
    if (!stats) return 1;

    if (stats.currentStreak >= 100) return 3.0;
    if (stats.currentStreak >= 30) return 2.0;
    if (stats.currentStreak >= 14) return 1.5;
    if (stats.currentStreak >= 7) return 1.25;
    if (stats.currentStreak >= 3) return 1.1;
    return 1;
  }, [stats]);

  // Get daily challenge - enhanced with weekly challenges
  const getDailyChallenge = useCallback((): {
    type: string;
    target: number;
    description: string;
    xpReward: number;
  } => {
    const today = new Date().getDay();
    const challenges = [
      { type: 'review', target: 10, description: 'Réviser 10 items', xpReward: 100 },
      { type: 'quiz', target: 1, description: 'Compléter un quiz', xpReward: 150 },
      { type: 'flashcard', target: 20, description: 'Réviser 20 flashcards', xpReward: 120 },
      { type: 'music', target: 1, description: 'Écouter une chanson EDN', xpReward: 50 },
      { type: 'streak', target: 1, description: 'Maintenir votre streak', xpReward: 75 },
      { type: 'clinical', target: 1, description: 'Compléter un cas clinique', xpReward: 200 },
      { type: 'ai', target: 3, description: 'Poser 3 questions à l\'IA', xpReward: 60 },
    ];
    return challenges[today];
  }, []);

  // Get weekly challenges
  const getWeeklyChallenges = useCallback((): {
    id: string;
    title: string;
    description: string;
    target: number;
    current: number;
    xpReward: number;
    multiplier: number;
    endsAt: Date;
  }[] => {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
    weekEnd.setHours(23, 59, 59, 999);

    return [
      {
        id: 'weekly_mastery',
        title: '🎯 Maître de la semaine',
        description: 'Maîtriser 20 nouveaux items cette semaine',
        target: 20,
        current: stats?.weeklyGoalProgress || 0,
        xpReward: 500,
        multiplier: 2,
        endsAt: weekEnd,
      },
      {
        id: 'weekly_streak',
        title: '🔥 Flamme éternelle',
        description: 'Maintenir votre streak pendant 7 jours',
        target: 7,
        current: stats?.currentStreak || 0,
        xpReward: 300,
        multiplier: 1.5,
        endsAt: weekEnd,
      },
      {
        id: 'weekly_exams',
        title: '📝 Champion des examens',
        description: 'Compléter 5 examens cette semaine',
        target: 5,
        current: stats?.weeklyGoalProgress || 0,
        xpReward: 400,
        multiplier: 1.75,
        endsAt: weekEnd,
      },
    ];
  }, [stats]);

  // Get recent achievements
  const getRecentAchievements = useCallback(async (userId: string, limit: number = 5): Promise<Badge[]> => {
    try {
      const { data } = await supabase
        .from('user_badges')
        .select('badge_id, badge_name, badge_description, badge_icon, earned_at')
        .eq('user_id', userId)
        .eq('unlocked', true)
        .order('earned_at', { ascending: false })
        .limit(limit);

      return (data || []).map(b => {
        const def = BADGE_DEFINITIONS.find(d => d.id === b.badge_id);
        return {
          id: b.badge_id,
          name: b.badge_name || def?.name || 'Badge',
          description: b.badge_description || def?.description || '',
          icon: b.badge_icon || def?.icon || '🏆',
          rarity: def?.rarity || 'common',
          unlockedAt: b.earned_at
        };
      });
    } catch (error) {
      console.error('Error getting recent achievements:', error);
      return [];
    }
  }, []);

  // Get leaderboard
  const getLeaderboard = useCallback(async (limit: number = 10): Promise<{
    userId: string;
    displayName: string;
    totalPoints: number;
    level: number;
    badges: number;
  }[]> => {
    try {
      const { data } = await supabase
        .from('gamification_activities')
        .select('user_id, points_earned')
        .limit(1000);

      if (!data) return [];

      // Aggregate by user
      const userPoints = new Map<string, number>();
      data.forEach(d => {
        userPoints.set(d.user_id, (userPoints.get(d.user_id) || 0) + (d.points_earned || 0));
      });

      // Get user profiles
      const userIds = Array.from(userPoints.keys());
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      // Get badge counts
      const { data: badges } = await supabase
        .from('user_badges')
        .select('user_id')
        .eq('unlocked', true)
        .in('user_id', userIds);

      const badgeCounts = new Map<string, number>();
      badges?.forEach(b => {
        badgeCounts.set(b.user_id, (badgeCounts.get(b.user_id) || 0) + 1);
      });

      // Build leaderboard
      const leaderboard = userIds.map(userId => {
        const points = userPoints.get(userId) || 0;
        const profile = profiles?.find((p: any) => p.id === userId);
        return {
          userId,
          displayName: (profile as any)?.name || 'Utilisateur',
          totalPoints: points,
          level: calculateLevel(points),
          badges: badgeCounts.get(userId) || 0
        };
      });

      return leaderboard
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }, []);

  // Get XP history
  const getXPHistory = useCallback(async (userId: string, days: number = 7): Promise<{
    date: string;
    xp: number;
  }[]> => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data } = await supabase
        .from('gamification_activities')
        .select('points_earned, created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (!data) return [];

      // Group by date
      const byDate = new Map<string, number>();
      data.forEach(d => {
        const date = d.created_at.split('T')[0];
        byDate.set(date, (byDate.get(date) || 0) + (d.points_earned || 0));
      });

      return Array.from(byDate.entries()).map(([date, xp]) => ({ date, xp }));
    } catch (error) {
      console.error('Error getting XP history:', error);
      return [];
    }
  }, []);

  // Calculate total XP needed for a level
  const getXPForLevel = useCallback((level: number): number => {
    return (level - 1) * XP_PER_LEVEL;
  }, []);

  // Get badge rarity color
  const getBadgeRarityColor = useCallback((rarity: Badge['rarity']): string => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-500 bg-yellow-500/10';
      case 'epic': return 'text-purple-500 bg-purple-500/10';
      case 'rare': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  }, []);

  // Check if user can unlock a specific badge
  const canUnlockBadge = useCallback((badgeId: string): boolean => {
    if (!stats) return false;
    if (stats.badges.some(b => b.id === badgeId)) return false;
    return true;
  }, [stats]);

  // Get unlocked badges count by rarity
  const getBadgeCountByRarity = useCallback((): Record<Badge['rarity'], number> => {
    if (!stats) return { common: 0, rare: 0, epic: 0, legendary: 0 };

    return stats.badges.reduce((acc, badge) => {
      acc[badge.rarity] = (acc[badge.rarity] || 0) + 1;
      return acc;
    }, { common: 0, rare: 0, epic: 0, legendary: 0 } as Record<Badge['rarity'], number>);
  }, [stats]);

  // Reset daily streak (admin function)
  const resetStreak = useCallback(async (userId: string): Promise<boolean> => {
    try {
      await (supabase as any).from('user_gamification_stats').upsert({
        user_id: userId,
        longest_streak: 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      await loadStats(userId);
      return true;
    } catch (error) {
      console.error('Error resetting streak:', error);
      return false;
    }
  }, [loadStats]);

  return {
    stats,
    loading,
    loadStats,
    addPoints,
    unlockBadge,
    checkAndUnlockBadges,
    getProgressToNextBadge,
    getMultiplier,
    getDailyChallenge,
    getWeeklyChallenges,
    getRecentAchievements,
    getLeaderboard,
    getXPHistory,
    getXPForLevel,
    getBadgeRarityColor,
    canUnlockBadge,
    getBadgeCountByRarity,
    resetStreak,
    BADGE_DEFINITIONS,
    POINTS_CONFIG,
  };
}
