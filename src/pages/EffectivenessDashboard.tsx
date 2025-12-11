import React, { useState, useRef, useEffect } from 'react';
import { useEffectivenessScores } from '@/hooks/useEffectivenessScores';
import { useAppliedRecommendations } from '@/hooks/useAppliedRecommendations';
import { EffectivenessStats } from '@/components/effectiveness/EffectivenessStats';
import { EffectivenessByCategory } from '@/components/effectiveness/EffectivenessByCategory';
import { EffectivenessOverTimeChart } from '@/components/effectiveness/EffectivenessOverTimeChart';
import { PerformanceDegradationAlerts } from '@/components/effectiveness/PerformanceDegradationAlerts';
import { PeriodSelector, DateRange } from '@/components/effectiveness/PeriodSelector';
import { ComparisonChart } from '@/components/effectiveness/ComparisonChart';
import { ComparisonStats } from '@/components/effectiveness/ComparisonStats';
import { ComparisonExport } from '@/components/effectiveness/ComparisonExport';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, RefreshCw, BarChart3, GitCompare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';

interface RecommendationWithMeasurement {
  id: string;
  category: string;
  applied_at: string;
  measured_at?: string;
  impact_score?: number | null;
  impact_calculated?: boolean;
}

export default function EffectivenessDashboard() {
  const navigate = useNavigate();
  const chartRef = useRef<HTMLDivElement>(null);
  const { logActivity } = useActivityTracking();
  const { scores, loading: loadingScores, refresh: refreshScores } = useEffectivenessScores();
  const { appliedRecommendations, loading: loadingRecs, refresh: refreshRecs } = useAppliedRecommendations();

  useEffect(() => {
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { page: 'effectiveness_dashboard', action: 'view' }
    });
  }, []);

  // État pour la comparaison de périodes
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const [period1, setPeriod1] = useState<DateRange>({
    start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
    end: new Date(today.getFullYear(), today.getMonth(), 0),
    label: 'Mois dernier',
  });

  const [period2, setPeriod2] = useState<DateRange>({
    start: new Date(today.getFullYear(), today.getMonth(), 1),
    end: today,
    label: 'Ce mois-ci',
  });

  const handleRefresh = () => {
    refreshScores();
    refreshRecs();
  };

  const loading = loadingScores || loadingRecs;

  // Calculer les données de comparaison
  const getComparisonData = () => {
    const data: Array<{
      category: string;
      period1: number;
      period2: number;
      difference: number;
      percentageChange: number;
    }> = [];

    // Filtrer les recommandations par période
    // On utilise applied_at comme date de référence si measured_at n'est pas disponible
    const recsInPeriod1 = appliedRecommendations.filter((rec: any) => {
      const dateToCheck = rec.measured_at || rec.applied_at;
      if (!dateToCheck) return false;
      const checkDate = new Date(dateToCheck);
      return checkDate >= period1.start && checkDate <= period1.end && rec.impact_calculated;
    });

    const recsInPeriod2 = appliedRecommendations.filter((rec: any) => {
      const dateToCheck = rec.measured_at || rec.applied_at;
      if (!dateToCheck) return false;
      const checkDate = new Date(dateToCheck);
      return checkDate >= period2.start && checkDate <= period2.end && rec.impact_calculated;
    });

    // Calculer les scores moyens par catégorie pour chaque période
    const categories = ['timing', 'platform', 'volume', 'quality'];
    
    categories.forEach((category) => {
      const p1Recs = recsInPeriod1.filter((rec: any) => rec.category === category);
      const p2Recs = recsInPeriod2.filter((rec: any) => rec.category === category);

      if (p1Recs.length > 0 || p2Recs.length > 0) {
        const p1Score =
          p1Recs.length > 0
            ? Math.round(
                p1Recs.reduce((sum: number, rec: any) => sum + (rec.impact_score || 0), 0) / p1Recs.length
              )
            : 0;

        const p2Score =
          p2Recs.length > 0
            ? Math.round(
                p2Recs.reduce((sum: number, rec: any) => sum + (rec.impact_score || 0), 0) / p2Recs.length
              )
            : 0;

        const difference = p2Score - p1Score;
        const percentageChange = p1Score > 0 ? (difference / p1Score) * 100 : 0;

        data.push({
          category,
          period1: p1Score,
          period2: p2Score,
          difference,
          percentageChange,
        });
      }
    });

    return data;
  };

  const comparisonData = getComparisonData();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(ROUTE_PATHS.home)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Statistiques d'efficacité
              </h1>
              <p className="text-muted-foreground mt-1">
                Analyse des performances de vos recommandations appliquées
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <GitCompare className="h-4 w-4" />
              Comparaison
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            {/* Alertes de dégradation */}
            <PerformanceDegradationAlerts />

            {/* Stats Overview */}
            <EffectivenessStats
              recommendations={appliedRecommendations}
              categoryScores={scores}
            />

            {/* Charts */}
            <div className="grid gap-6">
              <EffectivenessByCategory scores={scores} />
              <EffectivenessOverTimeChart recommendations={appliedRecommendations} />
            </div>
          </TabsContent>

          {/* Vue comparaison */}
          <TabsContent value="comparison" className="space-y-6">
            {/* En-tête avec export */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Comparaison de périodes</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Analysez l'évolution des performances entre deux périodes
                </p>
              </div>
              <ComparisonExport
                data={comparisonData}
                period1Label={period1.label}
                period2Label={period2.label}
                chartRef={chartRef}
                disabled={loading}
              />
            </div>

            {/* Sélecteur de périodes */}
            <PeriodSelector
              period1={period1}
              period2={period2}
              onPeriod1Change={setPeriod1}
              onPeriod2Change={setPeriod2}
            />

            {/* Statistiques de comparaison */}
            <ComparisonStats
              data={comparisonData}
              period1Label={period1.label}
              period2Label={period2.label}
            />

            {/* Graphique de comparaison */}
            <div ref={chartRef}>
              <ComparisonChart
                data={comparisonData}
                period1Label={period1.label}
                period2Label={period2.label}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Info */}
        {Object.keys(scores).length === 0 && !loading && (
          <div className="mt-8 p-6 rounded-lg border border-border bg-muted/30 text-center">
            <p className="text-muted-foreground">
              Commencez à appliquer et mesurer des recommandations pour voir les statistiques d'efficacité.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
