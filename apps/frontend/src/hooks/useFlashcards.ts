import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import logger from '@/lib/logger';

export interface Flashcard {
  id: string;
  user_id: string;
  item_number?: string;
  deck_id?: string;
  front: string;
  back: string;
  tags?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  updated_at: string;
}

export interface FlashcardReview {
  id: string;
  flashcard_id: string;
  user_id: string;
  quality: number; // 0-5 SM-2 quality rating
  ease_factor: number;
  interval: number; // days
  repetitions: number;
  next_review_date: string;
  reviewed_at: string;
}

export interface FlashcardDeck {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  card_count?: number;
  created_at: string;
  updated_at: string;
}

export interface FlashcardStats {
  total: number;
  mastered: number;
  learning: number;
  dueToday: number;
  averageEaseFactor: number;
}

// SM-2 Spaced Repetition Algorithm
const calculateSM2 = (
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number
): { newInterval: number; newEaseFactor: number; newRepetitions: number } => {
  // quality: 0-5 rating
  // 5: perfect response
  // 4: correct with hesitation
  // 3: correct with difficulty
  // 2: incorrect but easy to recall
  // 1: incorrect with difficulty
  // 0: complete blackout

  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor); // Minimum ease factor

  let newRepetitions: number;
  let newInterval: number;

  if (quality < 3) {
    // Reset to beginning
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions = repetitions + 1;

    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
  }

  return { newInterval, newEaseFactor, newRepetitions };
};

// Fetch user's flashcard decks
export const useFlashcardDecks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['flashcard-decks', user?.id],
    queryFn: async (): Promise<FlashcardDeck[]> => {
      if (!user) return [];

      const { data, error } = await (supabase as any)
        .from('flashcard_decks')
        .select('*, flashcards(count)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        // Table might not exist yet
        if (error.code === '42P01') {
          logger.warn('Flashcard decks table does not exist');
          return [];
        }
        throw error;
      }

      return (data || []).map((deck: any) => ({
        ...deck,
        card_count: deck.flashcards?.[0]?.count || 0,
      }));
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });
};

// Fetch flashcards for a deck or all user flashcards
export const useFlashcards = (deckId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['flashcards', user?.id, deckId],
    queryFn: async (): Promise<Flashcard[]> => {
      if (!user) return [];

      let query = (supabase as any)
        .from('flashcards')
        .select('*')
        .eq('user_id', user.id);

      if (deckId) {
        query = query.eq('deck_id', deckId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          logger.warn('Flashcards table does not exist');
          return [];
        }
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });
};

// Fetch flashcards due for review
export const useDueFlashcards = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['due-flashcards', user?.id, today],
    queryFn: async (): Promise<(Flashcard & { review?: FlashcardReview })[]> => {
      if (!user) return [];

      try {
        // Get flashcards with their latest review
        const { data: flashcards, error: flashcardsError } = await (supabase as any)
          .from('flashcards')
          .select('*')
          .eq('user_id', user.id);

        if (flashcardsError) {
          if (flashcardsError.code === '42P01') return [];
          throw flashcardsError;
        }

        const { data: reviews, error: reviewsError } = await (supabase as any)
          .from('flashcard_reviews')
          .select('*')
          .eq('user_id', user.id)
          .lte('next_review_date', today)
          .order('next_review_date', { ascending: true });

        if (reviewsError && reviewsError.code !== '42P01') {
          throw reviewsError;
        }

        // Map reviews to flashcards
        const reviewMap = new Map(
          (reviews || []).map((r: FlashcardReview) => [r.flashcard_id, r])
        );

        // Filter to due cards or new cards
        const dueCards = (flashcards || []).filter((card: Flashcard) => {
          const review = reviewMap.get(card.id);
          if (!review) return true; // New card
          return new Date(review.next_review_date) <= new Date(today);
        });

        return dueCards.map((card: Flashcard) => ({
          ...card,
          review: reviewMap.get(card.id),
        }));
      } catch (error) {
        logger.error('Error fetching due flashcards:', error);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};

// Flashcard stats
export const useFlashcardStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['flashcard-stats', user?.id],
    queryFn: async (): Promise<FlashcardStats> => {
      if (!user) {
        return { total: 0, mastered: 0, learning: 0, dueToday: 0, averageEaseFactor: 2.5 };
      }

      try {
        const today = new Date().toISOString().split('T')[0];

        const [flashcardsResult, reviewsResult] = await Promise.all([
          (supabase as any)
            .from('flashcards')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id),
          (supabase as any)
            .from('flashcard_reviews')
            .select('*')
            .eq('user_id', user.id),
        ]);

        const total = flashcardsResult.count || 0;
        const reviews = reviewsResult.data || [];

        const mastered = reviews.filter((r: FlashcardReview) => r.interval >= 21).length;
        const learning = reviews.filter(
          (r: FlashcardReview) => r.interval > 0 && r.interval < 21
        ).length;
        const dueToday = reviews.filter(
          (r: FlashcardReview) => new Date(r.next_review_date) <= new Date(today)
        ).length;
        const averageEaseFactor =
          reviews.length > 0
            ? reviews.reduce((sum: number, r: FlashcardReview) => sum + r.ease_factor, 0) /
              reviews.length
            : 2.5;

        return { total, mastered, learning, dueToday, averageEaseFactor };
      } catch (error) {
        logger.error('Error fetching flashcard stats:', error);
        return { total: 0, mastered: 0, learning: 0, dueToday: 0, averageEaseFactor: 2.5 };
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};

// Create deck mutation
export const useCreateDeck = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (deck: Omit<FlashcardDeck, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await (supabase as any)
        .from('flashcard_decks')
        .insert({
          ...deck,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] });
    },
  });
};

// Create flashcard mutation
export const useCreateFlashcard = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      flashcard: Omit<Flashcard, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    ) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await (supabase as any)
        .from('flashcards')
        .insert({
          ...flashcard,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      queryClient.invalidateQueries({ queryKey: ['flashcard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] });
    },
  });
};

// Update flashcard mutation
export const useUpdateFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Flashcard, 'id' | 'user_id' | 'created_at'>>;
    }) => {
      const { data, error } = await (supabase as any)
        .from('flashcards')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });
};

// Delete flashcard mutation
export const useDeleteFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('flashcards').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      queryClient.invalidateQueries({ queryKey: ['flashcard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] });
    },
  });
};

// Review flashcard mutation (SM-2 algorithm)
export const useReviewFlashcard = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      flashcardId,
      quality,
      previousReview,
    }: {
      flashcardId: string;
      quality: number; // 0-5
      previousReview?: FlashcardReview;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const repetitions = previousReview?.repetitions || 0;
      const easeFactor = previousReview?.ease_factor || 2.5;
      const interval = previousReview?.interval || 0;

      const { newInterval, newEaseFactor, newRepetitions } = calculateSM2(
        quality,
        repetitions,
        easeFactor,
        interval
      );

      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

      const reviewData = {
        flashcard_id: flashcardId,
        user_id: user.id,
        quality,
        ease_factor: newEaseFactor,
        interval: newInterval,
        repetitions: newRepetitions,
        next_review_date: nextReviewDate.toISOString().split('T')[0],
        reviewed_at: new Date().toISOString(),
      };

      if (previousReview) {
        // Update existing review
        const { data, error } = await (supabase as any)
          .from('flashcard_reviews')
          .update(reviewData)
          .eq('id', previousReview.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new review
        const { data, error } = await (supabase as any)
          .from('flashcard_reviews')
          .insert(reviewData)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['due-flashcards'] });
      queryClient.invalidateQueries({ queryKey: ['flashcard-stats'] });
    },
  });
};

export default {
  useFlashcardDecks,
  useFlashcards,
  useDueFlashcards,
  useFlashcardStats,
  useCreateDeck,
  useCreateFlashcard,
  useUpdateFlashcard,
  useDeleteFlashcard,
  useReviewFlashcard,
};
