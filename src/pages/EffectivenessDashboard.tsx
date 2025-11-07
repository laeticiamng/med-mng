import React from 'react';
import { useEffectivenessScores } from '@/hooks/useEffectivenessScores';
import { useAppliedRecommendations } from '@/hooks/useAppliedRecommendations';
import { EffectivenessStats } from '@/components/effectiveness/EffectivenessStats';
import { EffectivenessByCategory } from '@/components/effectiveness/EffectivenessByCategory';
import { EffectivenessOverTimeChart } from '@/components/effectiveness/EffectivenessOverTimeChart';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EffectivenessDashboard() {
  const navigate = useNavigate();
  const { scores, loading: loadingScores, refresh: refreshScores } = useEffectivenessScores();
  const { appliedRecommendations, loading: loadingRecs, refresh: refreshRecs } = useAppliedRecommendations();

  const handleRefresh = () => {
    refreshScores();
    refreshRecs();
  };

  const loading = loadingScores || loadingRecs;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
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

        {/* Stats Overview */}
        <EffectivenessStats
          recommendations={appliedRecommendations}
          categoryScores={scores}
        />

        {/* Charts */}
        <div className="grid gap-6 mt-6">
          <EffectivenessByCategory scores={scores} />
          <EffectivenessOverTimeChart recommendations={appliedRecommendations} />
        </div>

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
