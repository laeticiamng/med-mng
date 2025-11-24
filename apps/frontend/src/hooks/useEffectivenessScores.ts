import logger from '@/lib/logger';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CategoryScore {
  category: 'timing' | 'platform' | 'volume' | 'quality';
  avg_impact_score: number;
  total_applied: number;
  total_measured: number;
  avg_success_improvement: number;
  effectiveness_score: number;
}

export function useEffectivenessScores() {
  const [scores, setScores] = useState<Record<string, CategoryScore>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setScores({});
        return;
      }

      const { data, error: rpcError } = await supabase.rpc('get_category_effectiveness_scores', {
        p_user_id: user.id,
      });

      if (rpcError) throw rpcError;

      // Convertir en objet indexé par catégorie
      const scoresMap: Record<string, CategoryScore> = {};
      (data || []).forEach((score: any) => {
        scoresMap[score.category] = score;
      });

      setScores(scoresMap);
    } catch (err: any) {
      logger.error('Error loading effectiveness scores:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreForCategory = (category: string): number => {
    return scores[category]?.effectiveness_score || 50; // 50 = score neutre par défaut
  };

  return {
    scores,
    loading,
    error,
    refresh: loadScores,
    getScoreForCategory,
  };
}
