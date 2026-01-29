import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBKTKnowledge } from './useBKTKnowledge';

interface ECNPrediction {
  id: string;
  prediction_date: string;
  predicted_rank_min: number;
  predicted_rank_max: number;
  predicted_percentile: number;
  confidence_interval: number;
  strong_items: string[];
  weak_items: string[];
  recommended_study_plan: {
    priority_items: string[];
    daily_goals: { item_code: string; target_sessions: number }[];
    estimated_improvement: number;
  };
}

export const useECNPrediction = () => {
  const [loading, setLoading] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<ECNPrediction | null>(null);
  const { toast } = useToast();
  const { getMasteryStats, getWeakConcepts, getMasteredConcepts } = useBKTKnowledge();

  // Calculate ECN prediction based on BKT knowledge state
  const generatePrediction = useCallback(async (): Promise<ECNPrediction | null> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get mastery data
      const [stats, weakConcepts, masteredConcepts] = await Promise.all([
        getMasteryStats(),
        getWeakConcepts(20),
        getMasteredConcepts()
      ]);

      if (!stats) {
        toast({
          title: "Données insuffisantes",
          description: "Continuez à réviser pour obtenir une prédiction ECN",
          variant: "destructive"
        });
        return null;
      }

      // Simple prediction model (to be refined with real ECN data)
      // avgPKnow correlates inversely with rank
      const avgMastery = stats.avgPKnow;
      const masteryRate = stats.masteryRate;

      // Estimate rank based on mastery (simplified model)
      // Top 100: >95% mastery, Top 1000: >80% mastery, etc.
      const totalCandidates = 10000; // Approximate ECN candidates
      const estimatedPercentile = Math.min(99, avgMastery * 100);
      const baseRank = Math.round((1 - avgMastery) * totalCandidates);
      
      // Confidence based on number of concepts practiced
      const confidenceBase = Math.min(95, stats.totalConcepts * 0.5);
      const confidence = Math.max(20, confidenceBase);
      
      // Rank range based on confidence
      const rankVariance = Math.round(baseRank * (1 - confidence / 100) * 0.5);
      const rankMin = Math.max(1, baseRank - rankVariance);
      const rankMax = Math.min(totalCandidates, baseRank + rankVariance);

      // Get strong and weak items
      const strongItems = [...new Set(masteredConcepts.slice(0, 10).map(c => c.item_code))];
      const weakItems = [...new Set(weakConcepts.map(c => c.item_code))];

      // Generate study plan
      const studyPlan = {
        priority_items: weakItems.slice(0, 5),
        daily_goals: weakItems.slice(0, 3).map(item => ({
          item_code: item,
          target_sessions: 2
        })),
        estimated_improvement: Math.round(Math.min(15, weakItems.length * 0.5) * 10) / 10
      };

      // Save prediction to database
      const { data, error } = await supabase
        .from('ecn_predictions')
        .insert({
          user_id: user.id,
          predicted_rank_min: rankMin,
          predicted_rank_max: rankMax,
          predicted_percentile: estimatedPercentile,
          confidence_interval: confidence,
          strong_items: strongItems,
          weak_items: weakItems,
          recommended_study_plan: studyPlan
        })
        .select()
        .single();

      if (error) throw error;

      const prediction: ECNPrediction = {
        id: data.id,
        prediction_date: data.prediction_date,
        predicted_rank_min: data.predicted_rank_min,
        predicted_rank_max: data.predicted_rank_max,
        predicted_percentile: data.predicted_percentile,
        confidence_interval: data.confidence_interval,
        strong_items: data.strong_items || [],
        weak_items: data.weak_items || [],
        recommended_study_plan: data.recommended_study_plan as any
      };

      setCurrentPrediction(prediction);

      toast({
        title: "🎯 Prédiction ECN générée",
        description: `Rang estimé: ${rankMin} - ${rankMax}`,
      });

      return prediction;
    } catch (error) {
      console.error('Error generating prediction:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la prédiction",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [getMasteryStats, getWeakConcepts, getMasteredConcepts, toast]);

  // Get latest prediction
  const getLatestPrediction = useCallback(async (): Promise<ECNPrediction | null> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('ecn_predictions')
        .select('*')
        .eq('user_id', user.id)
        .order('prediction_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const prediction: ECNPrediction = {
          id: data.id,
          prediction_date: data.prediction_date,
          predicted_rank_min: data.predicted_rank_min,
          predicted_rank_max: data.predicted_rank_max,
          predicted_percentile: data.predicted_percentile,
          confidence_interval: data.confidence_interval,
          strong_items: data.strong_items || [],
          weak_items: data.weak_items || [],
          recommended_study_plan: data.recommended_study_plan as any
        };
        setCurrentPrediction(prediction);
        return prediction;
      }

      return null;
    } catch (error) {
      console.error('Error fetching prediction:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get prediction history for progress tracking
  const getPredictionHistory = useCallback(async (limit = 30): Promise<ECNPrediction[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('ecn_predictions')
        .select('*')
        .eq('user_id', user.id)
        .order('prediction_date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(d => ({
        id: d.id,
        prediction_date: d.prediction_date,
        predicted_rank_min: d.predicted_rank_min,
        predicted_rank_max: d.predicted_rank_max,
        predicted_percentile: d.predicted_percentile,
        confidence_interval: d.confidence_interval,
        strong_items: d.strong_items || [],
        weak_items: d.weak_items || [],
        recommended_study_plan: d.recommended_study_plan as any
      }));
    } catch (error) {
      console.error('Error fetching prediction history:', error);
      return [];
    }
  }, []);

  return {
    loading,
    currentPrediction,
    generatePrediction,
    getLatestPrediction,
    getPredictionHistory
  };
};
