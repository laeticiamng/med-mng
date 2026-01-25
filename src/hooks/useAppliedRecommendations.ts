import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppliedRecommendation = Database['public']['Tables']['applied_recommendations']['Row'];

interface MetricsSnapshot {
  total: number;
  successRate: number;
  delivered: number;
  failed: number;
  pending: number;
  period_start: string;
  period_end: string;
}

export function useAppliedRecommendations() {
  const [appliedRecommendations, setAppliedRecommendations] = useState<AppliedRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAppliedRecommendations();
  }, []);

  const loadAppliedRecommendations = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { _data, _error } = await supabase
        .from('applied_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false });

      if (_error) throw _error;
      setAppliedRecommendations(_data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading applied recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMetrics = async (): Promise<MetricsSnapshot> => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Récupérer les données réelles depuis Supabase
    const { _data: recommendationsData } = await supabase
      .from('applied_recommendations')
      .select('status')
      .gte('created_at', startDate.toISOString());

    const total = recommendationsData?.length || 0;
    const delivered = recommendationsData?.filter(r => r.status === 'applied').length || 0;
    const failed = recommendationsData?.filter(r => r.status === 'failed').length || 0;
    const pending = recommendationsData?.filter(r => r.status === 'pending').length || 0;
    const successRate = total > 0 ? Math.round((delivered / total) * 100) : 100;

    return {
      total,
      successRate,
      delivered,
      failed,
      pending,
      period_start: startDate.toISOString(),
      period_end: endDate.toISOString(),
    };
  };

  const applyRecommendation = async (
    recommendation: {
      id: string;
      title: string;
      description: string;
      category: string;
      impact: string;
    },
    notes?: string
  ) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Capturer les métriques AVANT
      const metricsBefore = await getCurrentMetrics();

      const { _data, _error } = await supabase
        .from('applied_recommendations')
        .insert({
          user_id: user.id,
          recommendation_id: recommendation.id,
          title: recommendation.title,
          description: recommendation.description,
          category: recommendation.category,
          impact_level: recommendation.impact,
          metrics_before: metricsBefore as any,
          metrics_before_period_start: metricsBefore.period_start,
          metrics_before_period_end: metricsBefore.period_end,
          status: 'applied',
          notes,
        })
        .select()
        .maybeSingle();

      if (_error) throw _error;

      toast.success('Recommandation marquée comme appliquée', {
        description: 'Les métriques sont en cours de suivi',
      });

      await loadAppliedRecommendations();
      return _data;
    } catch (err: any) {
      console.error('Error applying recommendation:', err);
      toast.error('Erreur lors de l\'application', {
        description: err.message,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const measureImpact = async (recommendationId: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Capturer les métriques APRÈS
      const metricsAfter = await getCurrentMetrics();

      // Mettre à jour avec les nouvelles métriques
      const { _error: updateError } = await supabase
        .from('applied_recommendations')
        .update({
          metrics_after: metricsAfter as any,
          metrics_after_period_start: metricsAfter.period_start,
          metrics_after_period_end: metricsAfter.period_end,
          status: 'measuring',
        })
        .eq('id', recommendationId);

      if (updateError) throw updateError;

      // Calculer l'impact via la fonction SQL
      const { _data, _error: rpcError } = await supabase.rpc('calculate_recommendation_impact', {
        rec_id: recommendationId,
      });

      if (rpcError) throw rpcError;

      toast.success('Impact calculé avec succès', {
        description: `Score d'impact: ${(_data as any)?.impactScore || 0}/100`,
      });

      await loadAppliedRecommendations();
      return _data;
    } catch (err: any) {
      console.error('Error measuring impact:', err);
      toast.error('Erreur lors du calcul d\'impact', {
        description: err.message,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRecommendation = async (id: string, updates: Partial<AppliedRecommendation>) => {
    try {
      setLoading(true);
      const { _error } = await supabase
        .from('applied_recommendations')
        .update(updates)
        .eq('id', id);

      if (_error) throw _error;

      toast.success('Recommandation mise à jour');
      await loadAppliedRecommendations();
    } catch (err: any) {
      console.error('Error updating recommendation:', err);
      toast.error('Erreur lors de la mise à jour');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecommendation = async (id: string) => {
    try {
      setLoading(true);
      const { _error } = await supabase
        .from('applied_recommendations')
        .delete()
        .eq('id', id);

      if (_error) throw _error;

      toast.success('Recommandation supprimée');
      await loadAppliedRecommendations();
    } catch (err: any) {
      console.error('Error deleting recommendation:', err);
      toast.error('Erreur lors de la suppression');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    appliedRecommendations,
    loading,
    error,
    applyRecommendation,
    measureImpact,
    updateRecommendation,
    deleteRecommendation,
    refresh: loadAppliedRecommendations,
  };
}
