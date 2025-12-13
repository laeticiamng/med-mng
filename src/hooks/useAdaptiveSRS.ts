import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SRSStats {
  dueToday: number;
  overdue: number;
  learning: number;
  mastered: number;
  averageRetention: number;
  predictedWorkload: number[];
}

export const useAdaptiveSRS = () => {
  const [loading, setLoading] = useState(false);

  // Calculate next review using SM-2 algorithm
  const calculateNextReview = useCallback((
    quality: number,
    currentEF: number,
    currentInterval: number,
    repetitions: number
  ): { easeFactor: number; interval: number; repetitions: number } => {
    const newEF = Math.max(1.3, currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    
    let newInterval: number;
    let newReps: number;

    if (quality < 3) {
      newReps = 0;
      newInterval = 1;
    } else {
      newReps = repetitions + 1;
      if (newReps === 1) newInterval = 1;
      else if (newReps === 2) newInterval = 6;
      else newInterval = Math.round(currentInterval * newEF);
    }

    const forgettingFactor = Math.exp(-0.1 * currentInterval);
    if (quality >= 3 && forgettingFactor < 0.5) {
      newInterval = Math.round(newInterval * 1.2);
    }

    return {
      easeFactor: newEF,
      interval: Math.min(newInterval, 365),
      repetitions: newReps
    };
  }, []);

  // Process a review - now uses Supabase
  const processReview = useCallback(async (
    cardId: string,
    quality: number
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get current SRS data from Supabase
      const { data: existingData } = await (supabase as any)
        .from('srs_card_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('card_id', cardId)
        .single();

      const currentEF = existingData?.ease_factor || 2.5;
      const currentInterval = existingData?.interval_days || 0;
      const repetitions = existingData?.review_count || 0;
      const correctCount = existingData?.correct_count || 0;

      const { easeFactor, interval, repetitions: newReps } = calculateNextReview(
        quality, currentEF, currentInterval, repetitions
      );

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + interval);

      // Upsert to Supabase
      await (supabase as any)
        .from('srs_card_data')
        .upsert({
          user_id: user.id,
          card_id: cardId,
          ease_factor: easeFactor,
          interval_days: interval,
          review_count: newReps,
          correct_count: quality >= 3 ? correctCount + 1 : correctCount,
          last_reviewed: new Date().toISOString(),
          next_review: nextReview.toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,card_id' });

      return true;
    } catch (error) {
      console.error('Error processing review:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [calculateNextReview]);

  // Get cards due for review - now uses Supabase SRS data
  const getDueCards = useCallback(async (deckId?: string, limit: number = 20) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('flashcards')
        .select('id, front_content, back_content, tags, item_code, difficulty, deck_id')
        .limit(limit * 2);

      if (deckId) {
        query = query.eq('deck_id', deckId);
      }

      const { data: cards, error } = await query;
      if (error || !cards) return [];

      // Get SRS data from Supabase
      const cardIds = cards.map(c => c.id);
      const { data: srsData } = await (supabase as any)
        .from('srs_card_data')
        .select('card_id, next_review, interval_days, ease_factor')
        .eq('user_id', user.id)
        .in('card_id', cardIds);

      const srsMap = new Map((srsData || []).map((s: any) => [s.card_id, s]));
      const now = new Date();

      const cardsWithSRS = cards.map((card: any) => ({
        ...card,
        srsData: srsMap.get(card.id) || { next_review: null }
      }));

      return cardsWithSRS
        .filter((c: any) => !c.srsData.next_review || new Date(c.srsData.next_review) <= now)
        .slice(0, limit);
    } catch (error) {
      console.error('Error in getDueCards:', error);
      return [];
    }
  }, []);

  // Get SRS statistics - now uses Supabase
  const getSRSStats = useCallback(async (userId: string): Promise<SRSStats> => {
    try {
      const { data: cards } = await (supabase as any)
        .from('srs_card_data')
        .select('*')
        .eq('user_id', userId);

      if (!cards || cards.length === 0) {
        return { dueToday: 0, overdue: 0, learning: 0, mastered: 0, averageRetention: 0, predictedWorkload: [0,0,0,0,0,0,0] };
      }

      const today = new Date();
      today.setHours(23, 59, 59, 999);

      let dueToday = 0, overdue = 0, learning = 0, mastered = 0, totalRetention = 0, cardsWithReviews = 0;
      const predictedWorkload = [0, 0, 0, 0, 0, 0, 0];

      cards.forEach((card: any) => {
        const nextReview = card.next_review ? new Date(card.next_review) : null;
        
        if (!nextReview || nextReview <= today) {
          if (nextReview && nextReview < new Date(today.getTime() - 24 * 60 * 60 * 1000)) overdue++;
          else dueToday++;
        }

        if (card.review_count > 0) {
          cardsWithReviews++;
          totalRetention += (card.correct_count || 0) / card.review_count;
        }

        if ((card.interval_days || 0) < 7) learning++;
        else if ((card.interval_days || 0) >= 21) mastered++;

        if (nextReview) {
          for (let i = 0; i < 7; i++) {
            const checkDate = new Date();
            checkDate.setDate(checkDate.getDate() + i);
            checkDate.setHours(23, 59, 59, 999);
            if (nextReview <= checkDate) { predictedWorkload[i]++; break; }
          }
        }
      });

      return {
        dueToday: dueToday + overdue,
        overdue,
        learning,
        mastered,
        averageRetention: cardsWithReviews > 0 ? Math.round((totalRetention / cardsWithReviews) * 100) : 0,
        predictedWorkload
      };
    } catch (error) {
      console.error('Error getting SRS stats:', error);
      return { dueToday: 0, overdue: 0, learning: 0, mastered: 0, averageRetention: 0, predictedWorkload: [0,0,0,0,0,0,0] };
    }
  }, []);

  // Predict retention based on current ease factor and interval
  const predictRetention = useCallback((
    easeFactor: number,
    daysSinceReview: number
  ): number => {
    // Ebbinghaus forgetting curve: R = e^(-t/S)
    // S is stability (proportional to ease factor and number of reviews)
    const stability = easeFactor * 10;
    const retention = Math.exp(-daysSinceReview / stability);
    return Math.round(retention * 100);
  }, []);

  return {
    loading,
    processReview,
    getDueCards,
    getSRSStats,
    predictRetention,
    calculateNextReview
  };
};
