import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QuizResult {
  id: string;
  score: number;
  total_questions: number;
  created_at: string;
  time_spent?: number;
}

interface QuizHistorySummary {
  totalAttempts: number;
  bestScore: number;
  averageScore: number;
  lastAttempt: string | null;
  recentScores: number[];
}

export const useQuizHistory = (itemCode?: string) => {
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [summary, setSummary] = useState<QuizHistorySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    // Return early with empty state if no itemCode
    if (!itemCode || itemCode.trim() === '') {
      setHistory([]);
      setSummary(null);
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { _data, _error } = await supabase
        .from('quiz_results')
        .select('id, score, total_questions, created_at, time_spent')
        .eq('user_id', user.id)
        .eq('item_code', itemCode)
        .order('created_at', { ascending: false })
        .limit(10);

      if (_error) throw _error;

      const results = (_data || []) as QuizResult[];
      setHistory(results);

      // Calculate summary
      if (results.length > 0) {
        const scores = results.map(r => (r.score / r.total_questions) * 100);
        setSummary({
          totalAttempts: results.length,
          bestScore: Math.max(...scores),
          averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
          lastAttempt: results[0].created_at,
          recentScores: scores.slice(0, 5)
        });
      } else {
        setSummary(null);
      }
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [itemCode]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    summary,
    loading,
    refetch: fetchHistory
  };
};
