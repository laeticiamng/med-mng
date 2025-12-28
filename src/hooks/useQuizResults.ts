import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QuizResult {
  id: string;
  item_code: string;
  item_title: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  time_spent: number;
  performance?: {
    rangA: { correct: number; total: number };
    rangB: { correct: number; total: number };
    easy: { correct: number; total: number };
    medium: { correct: number; total: number };
    hard: { correct: number; total: number };
  };
  created_at: string;
}

export const useQuizResults = () => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const saveQuizResult = useCallback(async (result: {
    itemCode: string;
    itemTitle: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    timeSpent: number;
    performance?: any;
    answers?: any;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('quiz_results')
        .insert({
          user_id: user?.id || null,
          item_code: result.itemCode,
          item_title: result.itemTitle,
          score: result.score,
          total_questions: result.totalQuestions,
          correct_answers: result.correctAnswers,
          wrong_answers: result.wrongAnswers,
          time_spent: result.timeSpent,
          performance: result.performance,
          answers: result.answers
        });

      if (error) throw error;
      
      console.log('✅ Résultat quiz sauvegardé');
      return true;
    } catch (error) {
      console.error('❌ Erreur sauvegarde quiz:', error);
      return false;
    }
  }, []);

  const fetchUserResults = useCallback(async (itemCode?: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setResults([]);
        return [];
      }

      let query = supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (itemCode) {
        query = query.eq('item_code', itemCode);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      const formattedResults: QuizResult[] = (data || []).map(r => ({
        id: r.id,
        item_code: r.item_code,
        item_title: r.item_title,
        score: r.score,
        total_questions: r.total_questions,
        correct_answers: r.correct_answers,
        wrong_answers: r.wrong_answers,
        time_spent: r.time_spent,
        performance: r.performance as QuizResult['performance'],
        created_at: r.created_at
      }));

      setResults(formattedResults);
      return formattedResults;
    } catch (error) {
      console.error('❌ Erreur chargement résultats quiz:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getItemStats = useCallback(async (itemCode: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('quiz_results')
        .select('score, correct_answers, total_questions')
        .eq('user_id', user.id)
        .eq('item_code', itemCode);

      if (error) throw error;
      if (!data || data.length === 0) return null;

      const avgScore = data.reduce((sum, r) => sum + r.score, 0) / data.length;
      const totalCorrect = data.reduce((sum, r) => sum + r.correct_answers, 0);
      const totalQuestions = data.reduce((sum, r) => sum + r.total_questions, 0);
      const bestScore = Math.max(...data.map(r => r.score));

      return {
        attempts: data.length,
        avgScore: Math.round(avgScore),
        bestScore,
        totalCorrect,
        totalQuestions,
        successRate: Math.round((totalCorrect / totalQuestions) * 100)
      };
    } catch (error) {
      console.error('❌ Erreur stats quiz:', error);
      return null;
    }
  }, []);

  return {
    results,
    loading,
    saveQuizResult,
    fetchUserResults,
    getItemStats
  };
};
