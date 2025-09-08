import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MedicalAnalytics {
  user_id: string;
  timeframe: string;
  summary: {
    total_generations: number;
    completed_generations: number;
    success_rate: number;
    current_streak: number;
    active_days_count: number;
    favorite_specialty: string;
  };
  specialty_breakdown: Record<string, {
    total: number;
    completed: number;
    rang_a: number;
    rang_b: number;
    recent_activity: any[];
  }>;
  recent_activity: any[];
  performance_trends: {
    daily_activity: Array<{
      date: string;
      generations: number;
    }>;
    success_rate_trend: Array<{
      date: string;
      success_rate: number;
      total_generations: number;
    }>;
  };
  recommendations: string[];
  learning_insights: {
    most_challenging_items: string[];
    preferred_styles: string[];
    optimal_study_times: string[];
  };
}

export type AnalyticsTimeframe = 'week' | 'month' | 'year';

export const useMedicalAnalytics = (initialTimeframe: AnalyticsTimeframe = 'month') => {
  const [analytics, setAnalytics] = useState<MedicalAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>(initialTimeframe);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const { toast } = useToast();

  const loadAnalytics = useCallback(async (selectedTimeframe?: AnalyticsTimeframe) => {
    const targetTimeframe = selectedTimeframe || timeframe;
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase.functions.invoke('med-analytics-dashboard', {
        body: { 
          timeframe: targetTimeframe 
        }
      });

      if (fetchError) throw fetchError;

      if (data?.success) {
        setAnalytics(data.analytics);
        setLastUpdated(new Date());
      } else {
        throw new Error(data?.error || 'Erreur de chargement des analytics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      
      toast({
        title: "Erreur de chargement",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [timeframe, toast]);

  const changeTimeframe = useCallback(async (newTimeframe: AnalyticsTimeframe) => {
    setTimeframe(newTimeframe);
    await loadAnalytics(newTimeframe);
  }, [loadAnalytics]);

  const refreshAnalytics = useCallback(() => {
    return loadAnalytics();
  }, [loadAnalytics]);

  // Auto-load on mount and timeframe change
  useEffect(() => {
    loadAnalytics();
  }, []); // Only on mount, timeframe changes are handled by changeTimeframe

  // Computed values
  const hasData = analytics && analytics.summary.total_generations > 0;
  
  const getSpecialtyProgress = useCallback((specialty: string) => {
    if (!analytics?.specialty_breakdown[specialty]) return 0;
    const stats = analytics.specialty_breakdown[specialty];
    return stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  }, [analytics]);

  const getTopSpecialties = useCallback((limit: number = 5) => {
    if (!analytics?.specialty_breakdown) return [];
    
    return Object.entries(analytics.specialty_breakdown)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, limit)
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        completed: stats.completed,
        progress: getSpecialtyProgress(name)
      }));
  }, [analytics, getSpecialtyProgress]);

  const getStreakQuality = useCallback(() => {
    if (!analytics) return 'unknown';
    const streak = analytics.summary.current_streak;
    
    if (streak === 0) return 'none';
    if (streak < 7) return 'good';
    if (streak < 30) return 'excellent';
    return 'legendary';
  }, [analytics]);

  const getPerformanceInsight = useCallback(() => {
    if (!analytics) return null;
    
    const successRate = analytics.summary.success_rate;
    const totalGenerations = analytics.summary.total_generations;
    
    if (totalGenerations === 0) {
      return {
        type: 'empty',
        message: 'Commencez par générer votre première musique médicale !'
      };
    }
    
    if (successRate >= 90) {
      return {
        type: 'excellent',
        message: 'Performance exceptionnelle ! Continuez sur cette lancée 🎯'
      };
    }
    
    if (successRate >= 75) {
      return {
        type: 'good',
        message: 'Bonne performance ! Quelques optimisations possibles 📈'
      };
    }
    
    if (successRate >= 50) {
      return {
        type: 'average',
        message: 'Performance correcte, mais améliorable 🔧'
      };
    }
    
    return {
      type: 'low',
      message: 'Performance à améliorer. Vérifiez vos paramètres ⚡'
    };
  }, [analytics]);

  const exportAnalytics = useCallback(async (format: 'json' | 'csv' = 'json') => {
    if (!analytics) {
      toast({
        title: "Aucune donnée",
        description: "Pas de données à exporter",
        variant: "destructive"
      });
      return;
    }

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'json') {
        content = JSON.stringify(analytics, null, 2);
        filename = `medical-analytics-${timeframe}-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        // Simple CSV export
        const csvRows = [
          ['Métrique', 'Valeur'],
          ['Générations totales', analytics.summary.total_generations.toString()],
          ['Générations complétées', analytics.summary.completed_generations.toString()],
          ['Taux de succès (%)', analytics.summary.success_rate.toString()],
          ['Série actuelle (jours)', analytics.summary.current_streak.toString()],
          ['Jours actifs', analytics.summary.active_days_count.toString()],
          ['Spécialité favorite', analytics.summary.favorite_specialty]
        ];
        
        content = csvRows.map(row => row.join(',')).join('\n');
        filename = `medical-analytics-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: `Analytics exportées en ${format.toUpperCase()}`
      });
    } catch (err) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les analytics",
        variant: "destructive"
      });
    }
  }, [analytics, timeframe, toast]);

  return {
    // State
    analytics,
    isLoading,
    error,
    timeframe,
    lastUpdated,
    hasData,
    
    // Actions
    loadAnalytics,
    refreshAnalytics,
    changeTimeframe,
    exportAnalytics,
    
    // Computed values
    getSpecialtyProgress,
    getTopSpecialties,
    getStreakQuality,
    getPerformanceInsight,
    
    // Utilities
    clearError: () => setError(null)
  };
};