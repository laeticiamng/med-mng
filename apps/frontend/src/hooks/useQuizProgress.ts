import logger from '@/lib/logger';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface QuizProgressStats {
  totalQuizzes: number;
  averageScore: number;
  totalQuestions: number;
  totalCorrect: number;
  successRate: number;
  bestScore: number;
  worstScore: number;
  itemsPracticed: number;
  totalTimeHours: number;
}

export interface QuizSessionSummary {
  id: string;
  item_code: string;
  rang: 'A' | 'B' | 'AB';
  score: number;
  questions_count: number;
  correct_answers: number;
  time_spent_seconds: number | null;
  completed_at: string;
  created_at: string;
}

/**
 * Hook to fetch user quiz progress statistics
 * Uses the get_user_quiz_stats database function
 */
export const useQuizProgress = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['quiz-progress', user?.id],
    queryFn: async (): Promise<QuizProgressStats> => {
      if (!user) {
        return {
          totalQuizzes: 0,
          averageScore: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          successRate: 0,
          bestScore: 0,
          worstScore: 0,
          itemsPracticed: 0,
          totalTimeHours: 0,
        };
      }

      // Call database function to get quiz stats
      const { data, error } = await supabase.rpc('get_user_quiz_stats', {
        p_user_id: user.id,
      });

      if (error) {
        logger.error('Error fetching quiz progress:', error);
        throw error;
      }

      const stats = data?.[0];
      if (!stats) {
        return {
          totalQuizzes: 0,
          averageScore: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          successRate: 0,
          bestScore: 0,
          worstScore: 0,
          itemsPracticed: 0,
          totalTimeHours: 0,
        };
      }

      return {
        totalQuizzes: Number(stats.total_quizzes) || 0,
        averageScore: Number(stats.average_score) || 0,
        totalQuestions: Number(stats.total_questions) || 0,
        totalCorrect: Number(stats.total_correct) || 0,
        successRate: Number(stats.success_rate) || 0,
        bestScore: Number(stats.best_score) || 0,
        worstScore: Number(stats.worst_score) || 0,
        itemsPracticed: Number(stats.items_practiced) || 0,
        totalTimeHours: Number(stats.total_time_hours) || 0,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!user,
  });
};

/**
 * Hook to fetch user quiz history
 */
export const useQuizHistory = (limit: number = 20) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['quiz-history', user?.id, limit],
    queryFn: async (): Promise<QuizSessionSummary[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('quiz_sessions')
        .select('id, item_code, rang, score, questions_count, correct_answers, time_spent_seconds, completed_at, created_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error fetching quiz history:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!user,
  });
};

/**
 * Hook to fetch quiz sessions for a specific item
 */
export const useItemQuizHistory = (itemCode: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['item-quiz-history', user?.id, itemCode],
    queryFn: async (): Promise<QuizSessionSummary[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('quiz_sessions')
        .select('id, item_code, rang, score, questions_count, correct_answers, time_spent_seconds, completed_at, created_at')
        .eq('user_id', user.id)
        .eq('item_code', itemCode)
        .order('completed_at', { ascending: false });

      if (error) {
        logger.error('Error fetching item quiz history:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!user && !!itemCode,
  });
};

/**
 * Hook to get item difficulty based on all user attempts
 * Uses the get_item_difficulty database function
 */
export const useItemDifficulty = (itemCode: string) => {
  return useQuery({
    queryKey: ['item-difficulty', itemCode],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_item_difficulty', {
        p_item_code: itemCode,
      });

      if (error) {
        logger.error('Error fetching item difficulty:', error);
        throw error;
      }

      const difficulty = data?.[0];
      if (!difficulty) {
        return {
          itemCode,
          attemptsCount: 0,
          averageScore: 0,
          successRate: 0,
          difficultyLevel: 'Inconnu',
        };
      }

      return {
        itemCode: difficulty.item_code,
        attemptsCount: Number(difficulty.attempts_count) || 0,
        averageScore: Number(difficulty.average_score) || 0,
        successRate: Number(difficulty.success_rate) || 0,
        difficultyLevel: difficulty.difficulty_level || 'Inconnu',
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (difficulty changes slowly)
    enabled: !!itemCode,
  });
};

/**
 * Hook to update EDN progress after completing a quiz
 * This links quiz_sessions with user_edn_progress
 */
export const useUpdateProgressAfterQuiz = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      itemCode: string;
      score: number;
      timeSpentMinutes: number;
    }) => {
      if (!user) throw new Error('User must be authenticated');

      // Extract item number from item code (e.g., "EDN-123" -> "123")
      const itemNumber = params.itemCode.replace(/[^\d]/g, '');

      // Determine status based on score
      let status: 'not_started' | 'in_progress' | 'completed' | 'mastered' = 'in_progress';
      if (params.score >= 90) {
        status = 'mastered';
      } else if (params.score >= 70) {
        status = 'completed';
      }

      // Update user_edn_progress
      const updateData: any = {
        user_id: user.id,
        item_number: itemNumber,
        status,
        score: params.score,
        last_reviewed_at: new Date().toISOString(),
      };

      // Get existing time spent
      const { data: existing } = await supabase
        .from('user_edn_progress')
        .select('time_spent_minutes')
        .eq('user_id', user.id)
        .eq('item_number', itemNumber)
        .single();

      updateData.time_spent_minutes =
        (existing?.time_spent_minutes || 0) + params.timeSpentMinutes;

      if (status === 'completed' || status === 'mastered') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('user_edn_progress')
        .upsert(updateData, { onConflict: 'user_id,item_number' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate both quiz and EDN progress queries
      queryClient.invalidateQueries({ queryKey: ['quiz-progress', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['edn-progress', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['quiz-history', user?.id] });
    },
    onError: (error) => {
      logger.error('Error updating progress after quiz:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la progression',
        variant: 'destructive',
      });
    },
  });
};
