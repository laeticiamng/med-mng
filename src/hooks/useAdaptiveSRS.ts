import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// SM-2 Algorithm with Ebbinghaus forgetting curve
interface CardReviewData {
  id: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  lastReviewed: string | null;
  nextReview: string | null;
}

interface ReviewResult {
  card: CardReviewData;
  quality: number; // 0-5 (0=complete blackout, 5=perfect)
}

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
    // Quality: 0-5 (3+ is correct, below is failed)
    const newEF = Math.max(1.3, currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    
    let newInterval: number;
    let newReps: number;

    if (quality < 3) {
      // Failed - reset to beginning
      newReps = 0;
      newInterval = 1;
    } else {
      newReps = repetitions + 1;
      
      if (newReps === 1) {
        newInterval = 1;
      } else if (newReps === 2) {
        newInterval = 6;
      } else {
        newInterval = Math.round(currentInterval * newEF);
      }
    }

    // Apply Ebbinghaus forgetting curve factor
    const forgettingFactor = Math.exp(-0.1 * currentInterval);
    if (quality >= 3 && forgettingFactor < 0.5) {
      // Boost interval for well-remembered cards
      newInterval = Math.round(newInterval * 1.2);
    }

    return {
      easeFactor: newEF,
      interval: Math.min(newInterval, 365), // Cap at 1 year
      repetitions: newReps
    };
  }, []);

  // Process a review for a flashcard
  const processReview = useCallback(async (
    cardId: string,
    quality: number // 0-5
  ): Promise<boolean> => {
    setLoading(true);
    try {
      // Get current card data from local storage (fallback until DB types are updated)
      const srsData = JSON.parse(localStorage.getItem('srs_card_data') || '{}');
      const cardData = srsData[cardId] || { easeFactor: 2.5, intervalDays: 0, reviewCount: 0, correctCount: 0 };

      const currentEF = cardData.easeFactor || 2.5;
      const currentInterval = cardData.intervalDays || 0;
      const repetitions = cardData.reviewCount || 0;

      // Calculate new values
      const { easeFactor, interval, repetitions: newReps } = calculateNextReview(
        quality,
        currentEF,
        currentInterval,
        repetitions
      );

      // Calculate next review date
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + interval);

      // Save to local storage
      srsData[cardId] = {
        easeFactor,
        intervalDays: interval,
        reviewCount: newReps,
        correctCount: quality >= 3 ? (cardData.correctCount || 0) + 1 : cardData.correctCount,
        lastReviewed: new Date().toISOString(),
        nextReview: nextReview.toISOString()
      };
      localStorage.setItem('srs_card_data', JSON.stringify(srsData));

      return true;
    } catch (error) {
      console.error('Error processing review:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [calculateNextReview]);

  // Get cards due for review (using local storage SRS data)
  const getDueCards = useCallback(async (deckId?: string, limit: number = 20) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get cards from database
      let query = supabase
        .from('flashcards')
        .select('id, front_content, back_content, tags, item_code, difficulty, deck_id')
        .limit(limit * 2);

      if (deckId) {
        query = query.eq('deck_id', deckId);
      }

      const { data, error } = await query;

      if (error || !data) {
        console.error('Error fetching cards:', error);
        return [];
      }

      // Get SRS data from local storage
      const srsData = JSON.parse(localStorage.getItem('srs_card_data') || '{}');
      const now = new Date();

      // Filter and sort by due date
      const cardsWithSRS = data.map((card: any) => {
        const srs = srsData[card.id] || { nextReview: null };
        return { ...card, srsData: srs };
      });

      const dueCards = cardsWithSRS
        .filter((c: any) => !c.srsData.nextReview || new Date(c.srsData.nextReview) <= now)
        .slice(0, limit);

      return dueCards;
    } catch (error) {
      console.error('Error in getDueCards:', error);
      return [];
    }
  }, []);

  // Get SRS statistics (using local storage)
  const getSRSStats = useCallback(async (userId: string): Promise<SRSStats> => {
    try {
      // Get SRS data from local storage
      const srsData = JSON.parse(localStorage.getItem('srs_card_data') || '{}');
      const cards = Object.values(srsData) as any[];

      if (cards.length === 0) {
        return {
          dueToday: 0,
          overdue: 0,
          learning: 0,
          mastered: 0,
          averageRetention: 0,
          predictedWorkload: [0, 0, 0, 0, 0, 0, 0]
        };
      }

      const today = new Date();
      today.setHours(23, 59, 59, 999);

      let dueToday = 0;
      let overdue = 0;
      let learning = 0;
      let mastered = 0;
      let totalRetention = 0;
      let cardsWithReviews = 0;
      const predictedWorkload = [0, 0, 0, 0, 0, 0, 0];

      cards.forEach((card: any) => {
        const nextReview = card.nextReview ? new Date(card.nextReview) : null;
        
        if (!nextReview || nextReview <= today) {
          if (nextReview && nextReview < new Date(today.getTime() - 24 * 60 * 60 * 1000)) {
            overdue++;
          } else {
            dueToday++;
          }
        }

        if (card.reviewCount > 0) {
          cardsWithReviews++;
          totalRetention += (card.correctCount || 0) / card.reviewCount;
        }

        if ((card.intervalDays || 0) < 7) {
          learning++;
        } else if ((card.intervalDays || 0) >= 21) {
          mastered++;
        }

        // Predict workload for next 7 days
        if (nextReview) {
          for (let i = 0; i < 7; i++) {
            const checkDate = new Date();
            checkDate.setDate(checkDate.getDate() + i);
            checkDate.setHours(23, 59, 59, 999);
            
            if (nextReview <= checkDate) {
              predictedWorkload[i]++;
              break;
            }
          }
        }
      });

      return {
        dueToday: dueToday + overdue,
        overdue,
        learning,
        mastered,
        averageRetention: cardsWithReviews > 0 
          ? Math.round((totalRetention / cardsWithReviews) * 100) 
          : 0,
        predictedWorkload
      };
    } catch (error) {
      console.error('Error getting SRS stats:', error);
      return {
        dueToday: 0,
        overdue: 0,
        learning: 0,
        mastered: 0,
        averageRetention: 0,
        predictedWorkload: [0, 0, 0, 0, 0, 0, 0]
      };
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
