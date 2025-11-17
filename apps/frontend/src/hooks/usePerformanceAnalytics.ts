import { useState, useEffect, useCallback } from 'react';
import { performanceAnalyticsService, PerformanceAnalytics, PerformanceBudget } from '@shared/services/performanceAnalyticsService';
import { useToast } from '@/hooks/use-toast';

export const usePerformanceAnalytics = (
  period: '1h' | '24h' | '7d' | '30d' = '24h',
  autoRefresh: boolean = true,
  refreshInterval: number = 30000
) => {
  const [analytics, setAnalytics] = useState<PerformanceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAnalytics = useCallback(async () => {
    try {
      setError(null);
      const data = await performanceAnalyticsService.getPerformanceAnalytics(period);
      setAnalytics(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des analytics';
      setError(errorMessage);
      console.error('Failed to fetch performance analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  const recordWebVital = useCallback(async (name: string, value: number, url?: string) => {
    try {
      await performanceAnalyticsService.recordWebVital(name, value, url);
    } catch (err) {
      console.error('Failed to record web vital:', err);
    }
  }, []);

  const recordAPICall = useCallback(async (
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    errorDetails?: any
  ) => {
    try {
      await performanceAnalyticsService.recordAPICall(endpoint, method, responseTime, statusCode, errorDetails);
    } catch (err) {
      console.error('Failed to record API call:', err);
    }
  }, []);

  const createBudget = useCallback(async (budget: Omit<PerformanceBudget, 'id'>) => {
    try {
      await performanceAnalyticsService.createPerformanceBudget(budget);
      toast({
        title: 'Budget créé',
        description: `Le budget "${budget.name}" a été créé avec succès.`,
      });
      await fetchAnalytics(); // Refresh data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du budget';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [fetchAnalytics, toast]);

  const updateBudget = useCallback(async (id: string, updates: Partial<PerformanceBudget>) => {
    try {
      await performanceAnalyticsService.updatePerformanceBudget(id, updates);
      toast({
        title: 'Budget mis à jour',
        description: 'Le budget a été mis à jour avec succès.',
      });
      await fetchAnalytics(); // Refresh data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du budget';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [fetchAnalytics, toast]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await performanceAnalyticsService.acknowledgeAlert(alertId);
      toast({
        title: 'Alerte acquittée',
        description: 'L\'alerte a été marquée comme acquittée.',
      });
      await fetchAnalytics(); // Refresh data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'acquittement de l\'alerte';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [fetchAnalytics, toast]);

  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      await performanceAnalyticsService.resolveAlert(alertId);
      toast({
        title: 'Alerte résolue',
        description: 'L\'alerte a été marquée comme résolue.',
      });
      await fetchAnalytics(); // Refresh data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la résolution de l\'alerte';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [fetchAnalytics, toast]);

  const calculateSLAMetrics = useCallback(async () => {
    try {
      await performanceAnalyticsService.calculateSLAMetrics();
      toast({
        title: 'SLA calculés',
        description: 'Les métriques SLA ont été recalculées.',
      });
      await fetchAnalytics(); // Refresh data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du calcul des SLA';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [fetchAnalytics, toast]);

  const getPerformanceScore = useCallback(() => {
    if (!analytics) return 0;

    const { webVitals } = analytics.metrics;
    const scores = {
      good: 100,
      'needs-improvement': 70,
      poor: 30,
    };

    const totalScore = Object.values(webVitals).reduce((sum, vital) => {
      return sum + scores[vital.rating];
    }, 0);

    return Math.round(totalScore / Object.keys(webVitals).length);
  }, [analytics]);

  const getPerformanceGrade = useCallback(() => {
    const score = getPerformanceScore();
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'F';
  }, [getPerformanceScore]);

  // Effet pour le chargement initial
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Effet pour l'auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchAnalytics, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAnalytics]);

  // Calculer les statistiques dérivées
  const statistics = analytics ? {
    totalMetrics: Object.keys(analytics.metrics.webVitals).length,
    activeBudgets: analytics.budgets.filter(b => b.active).length,
    unresolvedAlerts: analytics.alerts.filter(a => !a.resolved).length,
    criticalAlerts: analytics.alerts.filter(a => a.severity === 'critical' && !a.resolved).length,
    slaBreaches: analytics.slas.filter(s => s.status === 'breach').length,
    performanceScore: getPerformanceScore(),
    performanceGrade: getPerformanceGrade(),
  } : null;

  return {
    analytics,
    statistics,
    loading,
    error,
    refresh: fetchAnalytics,
    recordWebVital,
    recordAPICall,
    createBudget,
    updateBudget,
    acknowledgeAlert,
    resolveAlert,
    calculateSLAMetrics,
    getPerformanceScore,
    getPerformanceGrade,
  };
};