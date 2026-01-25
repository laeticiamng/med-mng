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

  // Enhanced SM-2+ algorithm with adaptive difficulty
  const calculateNextReview = useCallback((
    quality: number,
    currentEF: number,
    currentInterval: number,
    repetitions: number,
    consecutiveCorrect: number = 0,
    consecutiveErrors: number = 0
  ): { easeFactor: number; interval: number; repetitions: number; difficulty: 'easy' | 'medium' | 'hard' } => {
    // Base SM-2 ease factor calculation
    let newEF = Math.max(1.3, currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    
    // Adaptive adjustments based on performance patterns
    if (consecutiveCorrect >= 3) {
      newEF = Math.min(3.0, newEF * 1.05); // Boost for consistent performance
    } else if (consecutiveErrors >= 2) {
      newEF = Math.max(1.3, newEF * 0.9); // Reduce for struggling items
    }

    let newInterval: number;
    let newReps: number;
    let difficulty: 'easy' | 'medium' | 'hard';

    if (quality < 3) {
      // Failed - reset with graduated relearning
      newReps = Math.max(0, repetitions - 1);
      newInterval = consecutiveErrors >= 2 ? 0.5 : 1; // More frequent if struggling
      difficulty = 'hard';
    } else {
      newReps = repetitions + 1;
      
      if (newReps === 1) {
        newInterval = quality === 5 ? 4 : 1;
      } else if (newReps === 2) {
        newInterval = quality === 5 ? 10 : 6;
      } else {
        newInterval = Math.round(currentInterval * newEF);
        
        // Apply deterministic fuzz factor for better distribution (±5%)
        // Based on card characteristics instead of Math.random() for reproducibility
        const cardHash = (repetitions * 17 + quality * 31 + currentInterval * 7) % 100;
        const fuzz = 0.95 + (cardHash / 1000); // ±5% deterministic jitter
        newInterval = Math.round(newInterval * fuzz);
      }

      // Determine difficulty based on performance
      if (quality >= 4 && consecutiveCorrect >= 2) {
        difficulty = 'easy';
        newInterval = Math.round(newInterval * 1.1); // Bonus interval for easy items
      } else if (quality <= 3 || consecutiveErrors >= 1) {
        difficulty = 'hard';
      } else {
        difficulty = 'medium';
      }
    }

    // Apply forgetting curve optimization
    const forgettingFactor = Math.exp(-0.1 * currentInterval);
    if (quality >= 3 && forgettingFactor < 0.5) {
      newInterval = Math.round(newInterval * 1.2);
    }

    // Cap interval at 1 year
    newInterval = Math.min(newInterval, 365);
    
    // Minimum interval of 0.5 days (12 hours)
    newInterval = Math.max(newInterval, 0.5);

    return {
      easeFactor: newEF,
      interval: newInterval,
      repetitions: newReps,
      difficulty
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
        .maybeSingle();

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

      const { _data: cards, _error } = await query;
      if (_error || !cards) return [];

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

  // Get memory stability indicators for all cards
  const getMemoryStabilityIndicators = useCallback(async (userId: string): Promise<{
    cardId: string;
    stability: 'low' | 'medium' | 'high';
    retentionProbability: number;
    daysUntilCritical: number;
    easeFactor: number;
    reviewCount: number;
    trend: 'improving' | 'stable' | 'declining';
    consecutiveCorrect: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }[]> => {
    try {
      const { data: cards } = await (supabase as any)
        .from('srs_card_data')
        .select('*')
        .eq('user_id', userId);

      if (!cards) return [];

      const now = new Date();
      return cards.map((card: any) => {
        const lastReview = card.last_reviewed ? new Date(card.last_reviewed) : null;
        const daysSinceReview = lastReview 
          ? Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24))
          : 999;
        
        const ef = card.ease_factor || 2.5;
        const retention = predictRetention(ef, daysSinceReview);
        const intervalDays = card.interval_days || 1;
        const reviewCount = card.review_count || 0;
        const correctCount = card.correct_count || 0;
        
        // Calculate stability level
        let stability: 'low' | 'medium' | 'high';
        if (ef >= 2.5 && reviewCount >= 5) {
          stability = 'high';
        } else if (ef >= 2.0 && reviewCount >= 2) {
          stability = 'medium';
        } else {
          stability = 'low';
        }

        // Days until retention drops below 70%
        const criticalRetention = 0.7;
        const stabilityFactor = ef * 10;
        const daysUntilCritical = Math.max(0, Math.round(-stabilityFactor * Math.log(criticalRetention) - daysSinceReview));

        // Determine trend based on ease factor changes
        let trend: 'improving' | 'stable' | 'declining';
        if (ef > 2.7) trend = 'improving';
        else if (ef < 2.0) trend = 'declining';
        else trend = 'stable';

        // Calculate consecutive correct
        const consecutiveCorrect = reviewCount > 0 ? Math.min(reviewCount, Math.round(correctCount / reviewCount * reviewCount)) : 0;

        // Risk level
        let riskLevel: 'low' | 'medium' | 'high' | 'critical';
        if (retention < 30 || (daysSinceReview > intervalDays * 2)) riskLevel = 'critical';
        else if (retention < 50 || (daysSinceReview > intervalDays * 1.5)) riskLevel = 'high';
        else if (retention < 70 || (daysSinceReview > intervalDays)) riskLevel = 'medium';
        else riskLevel = 'low';

        return {
          cardId: card.card_id,
          stability,
          retentionProbability: retention,
          daysUntilCritical,
          easeFactor: ef,
          reviewCount,
          trend,
          consecutiveCorrect,
          riskLevel
        };
      });
    } catch (error) {
      console.error('Error getting memory stability:', error);
      return [];
    }
  }, [predictRetention]);

  // Get retention prediction graph data (next 30 days)
  const getRetentionPredictionData = useCallback(async (userId: string): Promise<{
    day: number;
    averageRetention: number;
    cardsAtRisk: number;
  }[]> => {
    const indicators = await getMemoryStabilityIndicators(userId);
    const predictions: { day: number; averageRetention: number; cardsAtRisk: number }[] = [];

    for (let day = 0; day <= 30; day++) {
      const retentions = indicators.map(ind => {
        const futureRetention = predictRetention(ind.easeFactor, day);
        return futureRetention;
      });
      
      const avgRetention = retentions.length > 0 
        ? Math.round(retentions.reduce((a, b) => a + b, 0) / retentions.length)
        : 100;
      
      const atRisk = retentions.filter(r => r < 70).length;

      predictions.push({
        day,
        averageRetention: avgRetention,
        cardsAtRisk: atRisk
      });
    }

    return predictions;
  }, [getMemoryStabilityIndicators, predictRetention]);

  // Get items at risk of being forgotten
  const getAtRiskItems = useCallback(async (userId: string) => {
    const indicators = await getMemoryStabilityIndicators(userId);
    return indicators
      .filter(i => i.riskLevel === 'high' || i.riskLevel === 'critical')
      .sort((a, b) => a.retentionProbability - b.retentionProbability);
  }, [getMemoryStabilityIndicators]);

  return {
    loading,
    processReview,
    getDueCards,
    getSRSStats,
    predictRetention,
    calculateNextReview,
    getMemoryStabilityIndicators,
    getRetentionPredictionData,
    getAtRiskItems
  };
};
