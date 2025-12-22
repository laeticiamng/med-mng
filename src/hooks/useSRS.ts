import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// SM-2 Algorithm Constants
const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;
const LEARNING_STEPS = [1, 10]; // Minutes for learning steps
const GRADUATING_INTERVAL = 1; // Days
const EASY_INTERVAL = 4; // Days

export interface UserItemProgress {
  id: string;
  user_id: string;
  item_code: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
  last_review_date: string | null;
  total_reviews: number;
  correct_reviews: number;
  learning_state: 'new' | 'learning' | 'review' | 'relearning';
}

export interface ReviewStats {
  dueToday: number;
  newItems: number;
  learningItems: number;
  reviewItems: number;
  totalItems: number;
  masteredItems: number;
}

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;
// 0 = Again (complete blackout)
// 1 = Hard (incorrect, serious difficulty)
// 2 = Hard (incorrect, remembered with difficulty)
// 3 = Good (correct with serious difficulty)
// 4 = Good (correct after hesitation)
// 5 = Easy (perfect response)

export const useSRS = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const { toast } = useToast();

  // Calculate next review based on SM-2 algorithm
  const calculateNextReview = (
    quality: ReviewQuality,
    currentProgress: Partial<UserItemProgress>
  ): { 
    newEaseFactor: number; 
    newInterval: number; 
    newRepetitions: number;
    newState: UserItemProgress['learning_state'];
    nextReviewDate: Date;
  } => {
    let easeFactor = currentProgress.ease_factor || DEFAULT_EASE_FACTOR;
    let interval = currentProgress.interval_days || 0;
    let repetitions = currentProgress.repetitions || 0;
    let state = currentProgress.learning_state || 'new';

    // SM-2 Ease Factor update
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const newEaseFactor = Math.max(
      MIN_EASE_FACTOR,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    let newInterval: number;
    let newRepetitions: number;
    let newState: UserItemProgress['learning_state'];

    if (quality < 3) {
      // Failed review - reset
      newRepetitions = 0;
      newInterval = 0;
      newState = state === 'new' ? 'learning' : 'relearning';
    } else {
      // Successful review
      newRepetitions = repetitions + 1;

      if (state === 'new' || state === 'learning') {
        // Graduating from learning
        if (quality === 5) {
          newInterval = EASY_INTERVAL;
        } else {
          newInterval = GRADUATING_INTERVAL;
        }
        newState = 'review';
      } else {
        // Regular review
        if (newRepetitions === 1) {
          newInterval = 1;
        } else if (newRepetitions === 2) {
          newInterval = 6;
        } else {
          newInterval = Math.round(interval * newEaseFactor);
        }
        newState = 'review';
      }
    }

    // Calculate next review date
    const nextReviewDate = new Date();
    if (newState === 'learning' || newState === 'relearning') {
      // Add minutes for learning steps
      nextReviewDate.setMinutes(nextReviewDate.getMinutes() + LEARNING_STEPS[0]);
    } else {
      // Add days for review
      nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
    }

    return {
      newEaseFactor,
      newInterval,
      newRepetitions,
      newState,
      nextReviewDate
    };
  };

  // Get items due for review
  const getDueItems = useCallback(async (userId: string, limit: number = 20) => {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('user_item_progress')
        .select('*')
        .eq('user_id', userId)
        .lte('next_review_date', now)
        .order('next_review_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data as UserItemProgress[];
    } catch (error) {
      console.error('Error fetching due items:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get new items (never studied)
  const getNewItems = useCallback(async (userId: string, existingItemCodes: string[], limit: number = 10) => {
    try {
      // Get all item codes from edn_items_immersive that user hasn't studied
      const { data: allItems } = await supabase
        .from('edn_items_immersive')
        .select('item_code, title')
        .order('item_code')
        .limit(limit + existingItemCodes.length);

      if (!allItems) return [];

      // Filter out already studied items
      const newItems = allItems
        .filter(item => !existingItemCodes.includes(item.item_code))
        .slice(0, limit);

      return newItems;
    } catch (error) {
      console.error('Error fetching new items:', error);
      return [];
    }
  }, []);

  // Record a review
  const recordReview = useCallback(async (
    userId: string,
    itemCode: string,
    quality: ReviewQuality,
    responseTimeMs?: number,
    sessionId?: string
  ) => {
    try {
      // Get current progress
      const { data: currentProgress } = await supabase
        .from('user_item_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('item_code', itemCode)
        .maybeSingle();

      const progress: Partial<UserItemProgress> = currentProgress 
        ? {
            ...currentProgress,
            learning_state: currentProgress.learning_state as UserItemProgress['learning_state']
          }
        : {
            ease_factor: DEFAULT_EASE_FACTOR,
            interval_days: 0,
            repetitions: 0,
            learning_state: 'new',
            total_reviews: 0,
            correct_reviews: 0
          };

      // Calculate new values
      const { newEaseFactor, newInterval, newRepetitions, newState, nextReviewDate } = 
        calculateNextReview(quality, progress);

      // Upsert progress
      const { error: progressError } = await supabase
        .from('user_item_progress')
        .upsert({
          user_id: userId,
          item_code: itemCode,
          ease_factor: newEaseFactor,
          interval_days: newInterval,
          repetitions: newRepetitions,
          learning_state: newState,
          next_review_date: nextReviewDate.toISOString(),
          last_review_date: new Date().toISOString(),
          total_reviews: (progress.total_reviews ?? 0) + 1,
          correct_reviews: (progress.correct_reviews ?? 0) + (quality >= 3 ? 1 : 0)
        }, { onConflict: 'user_id,item_code' });

      if (progressError) throw progressError;

      // Record individual review
      await supabase.from('item_reviews').insert({
        user_id: userId,
        item_code: itemCode,
        session_id: sessionId,
        quality,
        response_time_ms: responseTimeMs,
        ease_factor_before: progress.ease_factor,
        interval_before: progress.interval_days,
        ease_factor_after: newEaseFactor,
        interval_after: newInterval,
        next_review_date: nextReviewDate.toISOString()
      });

      return { success: true, nextReviewDate, newInterval, newState };
    } catch (error) {
      console.error('Error recording review:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la révision",
        variant: "destructive"
      });
      return { success: false };
    }
  }, [toast]);

  // Get review statistics
  const getStats = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      
      // Get user's progress
      const { data: progress } = await supabase
        .from('user_item_progress')
        .select('*')
        .eq('user_id', userId);

      // Get total items count
      const { count: totalItems } = await supabase
        .from('edn_items_immersive')
        .select('*', { count: 'exact', head: true });

      const userProgress = progress || [];
      const studiedItemCodes = userProgress.map(p => p.item_code);

      const dueToday = userProgress.filter(p => new Date(p.next_review_date) <= new Date()).length;
      const learningItems = userProgress.filter(p => p.learning_state === 'learning' || p.learning_state === 'relearning').length;
      const reviewItems = userProgress.filter(p => p.learning_state === 'review').length;
      const masteredItems = userProgress.filter(p => p.interval_days >= 21).length; // 21+ days interval = mastered

      const stats: ReviewStats = {
        dueToday,
        newItems: (totalItems || 367) - studiedItemCodes.length,
        learningItems,
        reviewItems,
        totalItems: totalItems || 367,
        masteredItems
      };

      setStats(stats);
      return stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Start a review session
  const startSession = useCallback(async (userId: string, sessionType: 'new' | 'review' | 'mixed' = 'mixed') => {
    try {
      const { data, error } = await supabase
        .from('review_sessions')
        .insert({
          user_id: userId,
          session_type: sessionType
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting session:', error);
      return null;
    }
  }, []);

  // Complete a review session
  const completeSession = useCallback(async (
    sessionId: string,
    itemsReviewed: number,
    itemsCorrect: number,
    itemsAgain: number,
    totalTimeSeconds: number
  ) => {
    try {
      const { error } = await supabase
        .from('review_sessions')
        .update({
          completed_at: new Date().toISOString(),
          items_reviewed: itemsReviewed,
          items_correct: itemsCorrect,
          items_again: itemsAgain,
          total_time_seconds: totalTimeSeconds
        })
        .eq('id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error completing session:', error);
      return false;
    }
  }, []);

  // Get item progress by item code
  const getItemProgress = useCallback(async (userId: string, itemCode: string): Promise<UserItemProgress | null> => {
    try {
      const { data, error } = await supabase
        .from('user_item_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('item_code', itemCode)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data as UserItemProgress | null;
    } catch (error) {
      console.error('Error fetching item progress:', error);
      return null;
    }
  }, []);

  // Get all user progress
  const getAllProgress = useCallback(async (userId: string): Promise<UserItemProgress[]> => {
    try {
      const { data, error } = await supabase
        .from('user_item_progress')
        .select('*')
        .eq('user_id', userId)
        .order('next_review_date', { ascending: true });

      if (error) throw error;
      return data as UserItemProgress[];
    } catch (error) {
      console.error('Error fetching all progress:', error);
      return [];
    }
  }, []);

  // Reset item progress
  const resetItemProgress = useCallback(async (userId: string, itemCode: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_item_progress')
        .delete()
        .eq('user_id', userId)
        .eq('item_code', itemCode);

      if (error) throw error;

      toast({
        title: "Progression réinitialisée",
        description: `L'item ${itemCode} a été réinitialisé`
      });

      return true;
    } catch (error) {
      console.error('Error resetting progress:', error);
      return false;
    }
  }, [toast]);

  // Get mastery level for an item
  const getMasteryLevel = useCallback((progress: UserItemProgress | null): 'new' | 'learning' | 'familiar' | 'mastered' => {
    if (!progress) return 'new';
    if (progress.interval_days >= 21) return 'mastered';
    if (progress.interval_days >= 7) return 'familiar';
    if (progress.repetitions > 0) return 'learning';
    return 'new';
  }, []);

  // Get accuracy for an item
  const getItemAccuracy = useCallback((progress: UserItemProgress | null): number => {
    if (!progress || progress.total_reviews === 0) return 0;
    return Math.round((progress.correct_reviews / progress.total_reviews) * 100);
  }, []);

  // Predict next interval
  const predictNextInterval = useCallback((quality: ReviewQuality, progress: Partial<UserItemProgress>): number => {
    const result = calculateNextReview(quality, progress);
    return result.newInterval;
  }, []);

  // Get review forecast
  const getReviewForecast = useCallback(async (userId: string, days: number = 7): Promise<{ date: string; count: number }[]> => {
    try {
      const { data } = await supabase
        .from('user_item_progress')
        .select('next_review_date')
        .eq('user_id', userId);

      if (!data) return [];

      const forecast: Record<string, number> = {};
      const today = new Date();

      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        forecast[dateStr] = 0;
      }

      data.forEach(item => {
        const reviewDate = new Date(item.next_review_date).toISOString().split('T')[0];
        if (forecast.hasOwnProperty(reviewDate)) {
          forecast[reviewDate]++;
        }
      });

      return Object.entries(forecast).map(([date, count]) => ({ date, count }));
    } catch (error) {
      console.error('Error getting forecast:', error);
      return [];
    }
  }, []);

  // Get review sessions history
  const getSessionHistory = useCallback(async (userId: string, limit: number = 10): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('review_sessions')
        .select('*')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching session history:', error);
      return [];
    }
  }, []);

  // Get optimal study time recommendation
  const getOptimalStudyTime = useCallback(async (userId: string): Promise<string> => {
    const sessions = await getSessionHistory(userId, 30);

    if (sessions.length < 5) return 'Pas assez de données';

    const byHour: Record<number, { count: number; avgScore: number }> = {};

    sessions.forEach(s => {
      if (s.completed_at && s.items_correct !== undefined) {
        const hour = new Date(s.completed_at).getHours();
        if (!byHour[hour]) {
          byHour[hour] = { count: 0, avgScore: 0 };
        }
        byHour[hour].count++;
        byHour[hour].avgScore += s.items_reviewed > 0 ? (s.items_correct / s.items_reviewed) * 100 : 0;
      }
    });

    let bestHour = -1;
    let bestScore = 0;

    Object.entries(byHour).forEach(([hour, data]) => {
      const avg = data.avgScore / data.count;
      if (avg > bestScore) {
        bestScore = avg;
        bestHour = parseInt(hour);
      }
    });

    if (bestHour === -1) return 'Non déterminé';
    return `${bestHour}h00 - ${bestHour + 1}h00`;
  }, [getSessionHistory]);

  // Calculate retention rate
  const getRetentionRate = useCallback(async (userId: string): Promise<number> => {
    try {
      const { data } = await supabase
        .from('user_item_progress')
        .select('total_reviews, correct_reviews')
        .eq('user_id', userId);

      if (!data || data.length === 0) return 0;

      const totalReviews = data.reduce((sum, p) => sum + (p.total_reviews || 0), 0);
      const correctReviews = data.reduce((sum, p) => sum + (p.correct_reviews || 0), 0);

      if (totalReviews === 0) return 0;
      return Math.round((correctReviews / totalReviews) * 100);
    } catch (error) {
      console.error('Error calculating retention:', error);
      return 0;
    }
  }, []);

  // Get items by mastery level
  const getItemsByMastery = useCallback(async (userId: string): Promise<{
    new: string[];
    learning: string[];
    familiar: string[];
    mastered: string[];
  }> => {
    const progress = await getAllProgress(userId);

    const result = {
      new: [] as string[],
      learning: [] as string[],
      familiar: [] as string[],
      mastered: [] as string[]
    };

    progress.forEach(p => {
      const level = getMasteryLevel(p);
      result[level].push(p.item_code);
    });

    return result;
  }, [getAllProgress, getMasteryLevel]);

  // Export progress data
  const exportProgress = useCallback(async (userId: string): Promise<string> => {
    const progress = await getAllProgress(userId);
    const sessions = await getSessionHistory(userId, 100);
    const stats = await getStats(userId);

    return JSON.stringify({
      exportDate: new Date().toISOString(),
      userId,
      stats,
      progress,
      sessions: sessions.slice(0, 50)
    }, null, 2);
  }, [getAllProgress, getSessionHistory, getStats]);

  return {
    loading,
    stats,
    getDueItems,
    getNewItems,
    recordReview,
    getStats,
    startSession,
    completeSession,
    calculateNextReview,
    getItemProgress,
    getAllProgress,
    resetItemProgress,
    getMasteryLevel,
    getItemAccuracy,
    predictNextInterval,
    getReviewForecast,
    getSessionHistory,
    getOptimalStudyTime,
    getRetentionRate,
    getItemsByMastery,
    exportProgress
  };
};
