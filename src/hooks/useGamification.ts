import { jourLocal, serieActuelle } from '@/lib/jourLocal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useEffect, useRef, useState } from 'react';

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

/**
 * Badges ATTEIGNABLES avec les activités réellement disponibles (audit du
 * 07.10.2026, MM-A10). Retirés car impossibles à obtenir : ai_chat / ai_expert
 * (assistant IA retiré), first_share / community_active (ni partage ni
 * publications), weekend_warrior (jamais attribué), clinical_expert (aucune
 * activité « clinical » n'est enregistrée). Un badge déjà obtenu reste affiché
 * depuis user_badges (nom et icône y sont copiés).
 */
export const BADGE_DEFINITIONS: Omit<Badge, 'unlockedAt'>[] = [
  // Répétition espacée (activités « srs_review »)
  { id: 'first_item', name: 'Premier Pas', description: 'Réviser votre premier item', icon: '🎯', rarity: 'common' },
  { id: 'items_10', name: 'Apprenti', description: '10 révisions espacées', icon: '📚', rarity: 'common' },
  { id: 'items_50', name: 'Érudit', description: '50 révisions espacées', icon: '🎓', rarity: 'rare' },
  { id: 'items_100', name: 'Expert', description: '100 révisions espacées', icon: '👨‍⚕️', rarity: 'epic' },
  { id: 'items_200', name: 'Maître EDN', description: '200 révisions espacées', icon: '👑', rarity: 'legendary' },

  // Séries
  { id: 'streak_3', name: 'Régulier', description: '3 jours consécutifs', icon: '🔥', rarity: 'common' },
  { id: 'streak_7', name: 'Déterminé', description: '7 jours consécutifs', icon: '💪', rarity: 'rare' },
  { id: 'streak_14', name: 'Infatigable', description: '14 jours consécutifs', icon: '⚡', rarity: 'rare' },
  { id: 'streak_30', name: 'Machine', description: '30 jours consécutifs', icon: '🏆', rarity: 'epic' },
  { id: 'streak_100', name: 'Légende', description: '100 jours consécutifs', icon: '🌟', rarity: 'legendary' },

  // Quiz d'item (activités « exam » écrites à la fin du quiz)
  { id: 'perfect_exam', name: 'Sans Faute', description: "100 % à un quiz d'item", icon: '⭐', rarity: 'rare' },
  { id: 'exam_10', name: 'Testeur', description: "Terminer 10 quiz d'item", icon: '📝', rarity: 'common' },
  { id: 'exam_50', name: 'Vétéran', description: "Terminer 50 quiz d'item", icon: '🎖️', rarity: 'epic' },

  // Situations ECOS
  { id: 'clinical_master', name: 'Clinicien', description: 'Terminer une situation ECOS', icon: '🏥', rarity: 'rare' },

  // Musique (génération audio, Med MNG Premium)
  { id: 'music_first', name: 'Mélomane', description: 'Générer votre première chanson', icon: '🎵', rarity: 'common' },
  { id: 'music_10', name: 'Compositeur', description: 'Générer 10 chansons', icon: '🎸', rarity: 'rare' },

  // Horaires
  { id: 'night_owl', name: 'Noctambule', description: 'Réviser après 23h', icon: '🦉', rarity: 'common' },
  { id: 'early_bird', name: 'Lève-tôt', description: 'Réviser avant 7h', icon: '🐦', rarity: 'common' },

  // Flashcards (paquets créés par l'utilisateur, /flashcards)
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

/** Libellé enregistré dans gamification_activities.activity_name (colonne obligatoire). */
const LIBELLES_ACTIVITE: Record<string, string> = {
  itemReviewed: 'Item révisé',
  itemMastered: 'Item maîtrisé',
  examCompleted: 'Quiz terminé',
  perfectExam: 'Quiz parfait',
  dailyStreak: 'Série quotidienne',
  clinicalCase: 'Situation ECOS terminée',
  aiQuestion: "Question à l'assistant",
};

// ---------------------------------------------------------------------------
// Statistiques partagées entre composants.
//
// CONSTAT (test en production du 09.10.2026) : ~97 requêtes en 12 s à l'ouverture de
// /edn-complete. Une quarantaine de composants (navigation, pied de page, barre mobile,
// cartes…) appellent chacun useGamification().loadStats(userId) : 5 requêtes par instance.
// Et 2 × 401 sur user_gamification_stats à la déconnexion : un chargement commencé avant la
// déconnexion finissait par une écriture (upsert) sans session.
//
// Désormais : un seul chargement par utilisateur (partagé s'il est en cours, réutilisé
// pendant 30 s), diffusé à toutes les instances ; la déconnexion vide le cache, et aucun
// résultat ni aucune écriture d'un chargement commencé avant elle n'est conservé.
// ---------------------------------------------------------------------------
const DUREE_CACHE_STATS_MS = 30_000;
const cacheStats = new Map<string, { a: number; stats: GamificationStats }>();
const chargementsEnCours = new Map<string, Promise<GamificationStats | null>>();
const abonnesStats = new Set<(userId: string, stats: GamificationStats) => void>();
let generationAuth = 0;

/** Vide le cache partagé (déconnexion ; tests). */
export function viderCacheGamification(): void {
  generationAuth += 1;
  cacheStats.clear();
  chargementsEnCours.clear();
}

try {
  supabase.auth?.onAuthStateChange?.((evenement) => {
    if (evenement === 'SIGNED_OUT') viderCacheGamification();
  });
} catch {
  // Client simulé (tests) : pas d'invalidation automatique.
}

const calculerNiveau = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
const calculerXPAvantNiveau = (xp: number) => XP_PER_LEVEL - (xp % XP_PER_LEVEL);

function publierStats(userId: string, stats: GamificationStats): void {
  cacheStats.set(userId, { a: Date.now(), stats });
  abonnesStats.forEach((f) => f(userId, stats));
}

function statsEnCache(userId: string): GamificationStats | null {
  const entree = cacheStats.get(userId);
  return entree && Date.now() - entree.a < DUREE_CACHE_STATS_MS ? entree.stats : null;
}

/** Vrai si la session locale (sans requête réseau) est toujours celle de `userId`. */
async function sessionToujoursActive(userId: string, generation: number): Promise<boolean> {
  if (generation !== generationAuth) return false;
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user?.id === userId && generation === generationAuth;
  } catch {
    return false;
  }
}

async function lireStatsServeur(userId: string, generation: number): Promise<GamificationStats | null> {
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

  // Jours locaux (activity_date est écrit en jour local) : série calendaire.
  const currentStreak = serieActuelle((activityLog ?? []).map(a => a.activity_date));

  // Weekly progress from activity log
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const { count: weeklyCount } = await supabase
    .from('user_activity_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('activity_date', jourLocal(weekStart));

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
    level: calculerNiveau(totalPoints),
    xpToNextLevel: calculerXPAvantNiveau(totalPoints),
    currentXP: totalPoints,
    badges,
    weeklyGoalProgress: weeklyCount || 0,
    weeklyGoal: 50,
  };

  // Déconnexion survenue pendant le chargement : résultat écarté.
  if (generation !== generationAuth) return null;

  // Sauvegarder longestStreak, seulement si la session est toujours celle de cet utilisateur
  // (sinon l'écriture part sans jeton → 401).
  if (longestStreak > storedLongestStreak && (await sessionToujoursActive(userId, generation))) {
    await (supabase as any).from('user_gamification_stats').upsert({
      user_id: userId,
      longest_streak: longestStreak,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  }

  return baseStats;
}

/** Un chargement par utilisateur : réutilisé 30 s, partagé s'il est en cours ; `force` relit. */
function chargerStatsPartagees(userId: string, force: boolean): Promise<GamificationStats | null> {
  if (!force) {
    const enCache = statsEnCache(userId);
    if (enCache) return Promise.resolve(enCache);
    const enCours = chargementsEnCours.get(userId);
    if (enCours) return enCours;
  }
  const generation = generationAuth;
  const promesse = lireStatsServeur(userId, generation)
    .then((stats) => {
      if (stats && generation === generationAuth) publierStats(userId, stats);
      return generation === generationAuth ? stats : null;
    })
    .finally(() => {
      if (chargementsEnCours.get(userId) === promesse) chargementsEnCours.delete(userId);
    });
  chargementsEnCours.set(userId, promesse);
  return promesse;
}

export function useGamification() {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [_newlyUnlockedBadge, _setNewlyUnlockedBadge] = useState<Badge | null>(null);
  const { toast } = useToast();


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

  // Utilisateur dont cette instance affiche les statistiques (diffusion partagée).
  const utilisateurAffiche = useRef<string | null>(null);

  useEffect(() => {
    const recevoir = (userId: string, nouvelles: GamificationStats) => {
      if (userId === utilisateurAffiche.current) setStats(nouvelles);
    };
    abonnesStats.add(recevoir);
    return () => {
      abonnesStats.delete(recevoir);
    };
  }, []);

  const chargerStats = useCallback(async (userId: string, force: boolean) => {
    if (!userId || userId === '00000000-0000-0000-0000-000000000000') {
      utilisateurAffiche.current = null;
      setStats(getDefaultStats());
      setLoading(false);
      return;
    }

    utilisateurAffiche.current = userId;
    const enCache = force ? null : statsEnCache(userId);
    if (enCache) {
      setStats(enCache);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const chargees = await chargerStatsPartagees(userId, force);
      if (chargees && utilisateurAffiche.current === userId) setStats(chargees);
    } catch (error) {
      console.error('Error loading gamification stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback((userId: string) => chargerStats(userId, false), [chargerStats]);

  // Add points function
  const addPoints = useCallback(async (userId: string, points: number, reason: string = 'activity'): Promise<boolean> => {
    if (!userId || userId === '00000000-0000-0000-0000-000000000000') return false;
    
    try {
      // `activity_name` est NOT NULL en base : sans lui, chaque insertion était
      // refusée (23502) et l'XP restait à 0 malgré quiz et ECOS terminés.
      const { error } = await supabase.from('gamification_activities').insert({
        user_id: userId,
        activity_type: reason,
        activity_name: LIBELLES_ACTIVITE[reason] ?? reason,
        points_earned: points,
        created_at: new Date().toISOString()
      } as any);
      if (error) throw error;

      // Relecture forcée (le cache partagé contient les points d'avant)
      await chargerStats(userId, true);
      return true;
    } catch (error) {
      console.error('Error adding points:', error);
      return false;
    }
  }, [chargerStats]);

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
    publierStats(userId, updatedStats);

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
    
    // Compteurs d'activités réellement enregistrées. « review » n'était écrit
    // nulle part (la répétition espacée enregistre « srs_review ») : les badges
    // items_* étaient inatteignables. Les compteurs IA et cas cliniques notés
    // sont retirés avec leurs badges (MM-A10).
    const [reviewsResult, examResult, musicResult] = await Promise.all([
      supabase.from('user_activity_log').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('activity_type', 'srs_review'),
      supabase.from('user_activity_log').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('activity_type', 'exam'),
      supabase.from('user_activity_log').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('activity_type', 'music_generation'),
    ]);

    // flashcards n'a pas de colonne user_id : les cartes de l'utilisateur sont
    // celles de ses paquets.
    const { data: paquets } = await (supabase as any).from('flashcard_decks').select('id').eq('user_id', userId);
    const idsPaquets = ((paquets ?? []) as { id: string }[]).map((d) => d.id);
    const flashcardResult = idsPaquets.length > 0
      ? await (supabase as any).from('flashcards').select('id', { count: 'exact', head: true }).in('deck_id', idsPaquets)
      : { count: 0 };

    const totalReviews = reviewsResult.count || 0;
    const examCount = examResult.count || 0;
    const musicCount = musicResult.count || 0;
    const flashcardCount = flashcardResult?.count || 0;

    // Répétition espacée
    if (totalReviews >= 1) await unlockBadge(userId, 'first_item');
    if (totalReviews >= 10) await unlockBadge(userId, 'items_10');
    if (totalReviews >= 50) await unlockBadge(userId, 'items_50');
    if (totalReviews >= 100) await unlockBadge(userId, 'items_100');
    if (totalReviews >= 200) await unlockBadge(userId, 'items_200');

    // Quiz d'item
    if (examCount >= 10) await unlockBadge(userId, 'exam_10');
    if (examCount >= 50) await unlockBadge(userId, 'exam_50');

    // Musique
    if (musicCount >= 1) await unlockBadge(userId, 'music_first');
    if (musicCount >= 10) await unlockBadge(userId, 'music_10');

    // Flashcards
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
          level: calculerNiveau(points),
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
        const date = jourLocal(d.created_at);
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
      await chargerStats(userId, true);
      return true;
    } catch (error) {
      console.error('Error resetting streak:', error);
      return false;
    }
  }, [chargerStats]);

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
