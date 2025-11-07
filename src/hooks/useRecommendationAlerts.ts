import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RecommendationAlert {
  id: string;
  user_id: string;
  recommendation_id: string;
  title: string;
  description: string;
  category: string;
  impact: string;
  historical_score: number;
  created_at: string;
  first_seen_at: string;
  last_checked_at: string;
  alert_triggered: boolean;
  alert_triggered_at: string | null;
  dismissed: boolean;
  dismissed_at: string | null;
  applied: boolean;
  applied_at: string | null;
}

export function useRecommendationAlerts() {
  const [alerts, setAlerts] = useState<RecommendationAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAlerts();
    
    // S'abonner aux changements en temps réel
    const channel = supabase
      .channel('recommendation_alerts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recommendation_alerts',
        },
        () => {
          loadAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAlerts([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('recommendation_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('dismissed', false)
        .eq('applied', false)
        .order('alert_triggered', { ascending: false })
        .order('historical_score', { ascending: false });

      if (fetchError) throw fetchError;
      setAlerts(data || []);
    } catch (err: any) {
      console.error('Error loading alerts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const trackRecommendation = async (recommendation: {
    id: string;
    title: string;
    description: string;
    category: string;
    impact: string;
    historicalScore: number;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Vérifier si cette recommandation est déjà trackée
      const { data: existing } = await supabase
        .from('recommendation_alerts')
        .select('id')
        .eq('user_id', user.id)
        .eq('recommendation_id', recommendation.id)
        .eq('dismissed', false)
        .single();

      if (existing) {
        // Déjà trackée, ne rien faire
        return;
      }

      // Créer une nouvelle alerte
      const { error: insertError } = await supabase
        .from('recommendation_alerts')
        .insert({
          user_id: user.id,
          recommendation_id: recommendation.id,
          title: recommendation.title,
          description: recommendation.description,
          category: recommendation.category,
          impact: recommendation.impact,
          historical_score: recommendation.historicalScore,
        });

      if (insertError) throw insertError;
    } catch (err: any) {
      console.error('Error tracking recommendation:', err);
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('recommendation_alerts')
        .update({
          dismissed: true,
          dismissed_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (updateError) throw updateError;
      
      toast.success('Alerte ignorée');
      await loadAlerts();
    } catch (err: any) {
      console.error('Error dismissing alert:', err);
      toast.error('Erreur lors de l\'ignorage de l\'alerte');
    }
  };

  const triggeredAlerts = alerts.filter(a => a.alert_triggered);
  const pendingAlerts = alerts.filter(a => !a.alert_triggered);

  return {
    alerts,
    triggeredAlerts,
    pendingAlerts,
    loading,
    error,
    trackRecommendation,
    dismissAlert,
    refresh: loadAlerts,
  };
}
