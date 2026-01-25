import { supabase } from '@/integrations/supabase/client';
import { useCallback, useEffect, useState } from 'react';
import { useQuizErrorTracker } from './useQuizErrorTracker';

export interface RevisionItem {
  id: string;
  item_code: string;
  concept: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  error_frequency: number;
  last_seen: Date;
  next_review: Date;
  mastery_level: number; // 0-100
  priority_score: number;
  tags: string[];
}

export interface RevisionPlan {
  id: string;
  user_id: string;
  plan_name: string;
  target_items: string[];
  daily_target: number;
  created_at: Date;
  last_updated: Date;
  completion_rate: number;
  estimated_duration_days: number;
}

export interface StudySession {
  id: string;
  plan_id: string;
  items_reviewed: RevisionItem[];
  duration_minutes: number;
  success_rate: number;
  date: Date;
}

export const usePersonalizedRevision = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revisionItems, setRevisionItems] = useState<RevisionItem[]>([]);
  const [currentPlan, setCurrentPlan] = useState<RevisionPlan | null>(null);
  const [studySessions, _setStudySessions] = useState<StudySession[]>([]);
  
  const { getRecentErrors, getErrorsByTheme } = useQuizErrorTracker();

  // Analyser les erreurs pour générer des items de révision
  const analyzeUserWeaknesses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const errorsByTheme = getErrorsByTheme();

      const weaknessAnalysis = Object.entries(errorsByTheme).map(([theme, errors]) => {
        const frequency = errors.length;
        const avgDifficulty = errors.reduce((sum, err) => {
          // Estimer la difficulté selon le type de question/erreur
          return sum + (err.explanation ? 2 : 1);
        }, 0) / errors.length;

        return {
          theme,
          frequency,
          difficulty: avgDifficulty > 1.5 ? 'hard' : avgDifficulty > 1 ? 'medium' : 'easy' as const,
          lastError: new Date(Math.max(...errors.map(e => e.timestamp.getTime()))),
          concepts: errors.map(e => e.correctAnswer)
        };
      });

      // Créer des items de révision basés sur l'analyse
      const newRevisionItems: RevisionItem[] = weaknessAnalysis.map((analysis, index) => ({
        id: `revision-${index}`,
        item_code: analysis.theme,
        concept: `Révision ${analysis.theme}`,
        difficulty_level: analysis.difficulty as 'easy' | 'medium' | 'hard',
        error_frequency: analysis.frequency,
        last_seen: analysis.lastError,
        next_review: calculateNextReview(analysis.lastError, analysis.frequency),
        mastery_level: Math.max(0, 100 - (analysis.frequency * 10)),
        priority_score: calculatePriorityScore(analysis.frequency, analysis.difficulty, analysis.lastError),
        tags: analysis.concepts.slice(0, 3)
      }));

      setRevisionItems(newRevisionItems.sort((a, b) => b.priority_score - a.priority_score));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur analyse');
      console.error('❌ Erreur analyzeUserWeaknesses:', err);
    } finally {
      setLoading(false);
    }
  }, [getRecentErrors, getErrorsByTheme]);

  // Calculer la prochaine date de révision (spaced repetition)
  const calculateNextReview = (_lastSeen: Date, errorFrequency: number): Date => {
    const now = new Date();
    // Algorithme de spaced repetition simplifié
    let nextInterval = 1; // Commencer par 1 jour
    
    if (errorFrequency >= 5) {
      nextInterval = 1; // Révision quotidienne pour les gros problèmes
    } else if (errorFrequency >= 3) {
      nextInterval = 2; // Tous les 2 jours
    } else if (errorFrequency >= 2) {
      nextInterval = 4; // Tous les 4 jours
    } else {
      nextInterval = 7; // Hebdomadaire pour les petites erreurs
    }

    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + nextInterval);
    return nextReview;
  };

  // Calculer le score de priorité
  const calculatePriorityScore = (frequency: number, difficulty: string, lastSeen: Date): number => {
    const now = new Date();
    const daysSinceLastSeen = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24));
    
    let score = frequency * 10; // Base sur la fréquence d'erreur
    
    // Ajuster selon la difficulté
    if (difficulty === 'hard') score *= 1.5;
    else if (difficulty === 'medium') score *= 1.2;
    
    // Réduire le score si trop récent (éviter le spam)
    if (daysSinceLastSeen < 1) score *= 0.5;
    
    // Augmenter si pas vu depuis longtemps
    if (daysSinceLastSeen > 7) score *= 1.3;
    
    return Math.round(score);
  };

  // Créer un plan de révision personnalisé
  const createRevisionPlan = useCallback(async (planName: string, targetItems: string[], dailyTarget: number = 5) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Estimer la durée du plan
      const totalItems = targetItems.length;
      const estimatedDays = Math.ceil(totalItems / dailyTarget);

      const newPlan: RevisionPlan = {
        id: `plan-${Date.now()}`,
        user_id: user.id,
        plan_name: planName,
        target_items: targetItems,
        daily_target: dailyTarget,
        created_at: new Date(),
        last_updated: new Date(),
        completion_rate: 0,
        estimated_duration_days: estimatedDays
      };

      // Save to Supabase
      const { data: savedPlan, error: saveError } = await (supabase as any)
        .from('revision_plans')
        .insert({
          user_id: user.id,
          plan_name: planName,
          target_items: targetItems,
          daily_target: dailyTarget,
          completion_rate: 0,
          estimated_duration_days: estimatedDays
        })
        .select()
        .maybeSingle();

      if (saveError) throw saveError;

      const finalPlan = savedPlan ? { ...newPlan, id: savedPlan.id } : newPlan;
      setCurrentPlan(finalPlan);
      return finalPlan;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur création plan');
      console.error('❌ Erreur createRevisionPlan:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtenir les items à réviser aujourd'hui
  const getTodayRevisionItems = useCallback((): RevisionItem[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return revisionItems.filter(item => {
      const nextReview = new Date(item.next_review);
      nextReview.setHours(0, 0, 0, 0);
      return nextReview <= today;
    }).slice(0, currentPlan?.daily_target || 5);
  }, [revisionItems, currentPlan]);

  // Marquer un item comme révisé
  const markItemAsReviewed = useCallback((itemId: string, success: boolean) => {
    setRevisionItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const masteryChange = success ? 10 : -5;
        const newMasteryLevel = Math.max(0, Math.min(100, item.mastery_level + masteryChange));
        
        return {
          ...item,
          last_seen: new Date(),
          next_review: calculateNextReview(new Date(), success ? Math.max(1, item.error_frequency - 1) : item.error_frequency + 1),
          mastery_level: newMasteryLevel
        };
      }
      return item;
    }));
  }, []);

  // Obtenir les statistiques de progression
  const getProgressStats = useCallback(() => {
    const totalItems = revisionItems.length;
    const masteredItems = revisionItems.filter(item => item.mastery_level >= 80).length;
    const inProgressItems = revisionItems.filter(item => item.mastery_level >= 40 && item.mastery_level < 80).length;
    const strugglingItems = revisionItems.filter(item => item.mastery_level < 40).length;

    const todayItems = getTodayRevisionItems();
    const completedToday = studySessions.filter(session => {
      const today = new Date();
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === today.toDateString();
    }).length;

    return {
      totalItems,
      masteredItems,
      inProgressItems,
      strugglingItems,
      masteryRate: totalItems > 0 ? Math.round((masteredItems / totalItems) * 100) : 0,
      todayTarget: currentPlan?.daily_target || 0,
      todayCompleted: completedToday,
      todayRemaining: todayItems.length
    };
  }, [revisionItems, getTodayRevisionItems, studySessions, currentPlan]);

  // Charger les données au montage
  useEffect(() => {
    analyzeUserWeaknesses();
    
    // Charger le plan actuel depuis Supabase
    const loadCurrentPlan = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await (supabase as any)
        .from('revision_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (data) {
        setCurrentPlan({
          id: data.id,
          user_id: data.user_id,
          plan_name: data.plan_name,
          target_items: data.target_items || [],
          daily_target: data.daily_target,
          created_at: new Date(data.created_at),
          last_updated: new Date(data.updated_at),
          completion_rate: data.completion_rate || 0,
          estimated_duration_days: data.estimated_duration_days
        });
      }
    };
    
    loadCurrentPlan();
  }, [analyzeUserWeaknesses]);

  return {
    loading,
    error,
    revisionItems,
    currentPlan,
    studySessions,
    analyzeUserWeaknesses,
    createRevisionPlan,
    getTodayRevisionItems,
    markItemAsReviewed,
    getProgressStats
  };
};