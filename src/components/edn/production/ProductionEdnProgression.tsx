import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ThemeProgressGrid } from '@/components/edn/progression/ThemeProgressGrid';
import { SpacedRepetitionPlanner } from '@/components/edn/progression/SpacedRepetitionPlanner';
import { ProgressHistoryTimeline } from '@/components/edn/progression/ProgressHistoryTimeline';
import { EightMinuteSessionBuilder } from '@/components/edn/progression/EightMinuteSessionBuilder';
import { useEdnProgressionData } from '@/hooks/edn/useEdnProgressionData';

export const ProductionEdnProgression: React.FC = () => {
  const { loading, error, items, themeProgress, history, repetitionPlan, suggestions, refresh } = useEdnProgressionData();
  const [rankFilter, setRankFilter] = useState<'all' | 'A' | 'B'>('all');

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">Préparation des statistiques EDN...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Impossible de charger la progression</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>{error}</span>
            <Button variant="secondary" size="sm" onClick={refresh}>
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <ThemeProgressGrid themes={themeProgress} rankFilter={rankFilter} onRankFilterChange={setRankFilter} />

      <div className="grid gap-6 xl:grid-cols-2">
        <SpacedRepetitionPlanner items={repetitionPlan} rankFilter={rankFilter} />
        <ProgressHistoryTimeline entries={history} />
      </div>

      <EightMinuteSessionBuilder items={items} suggestions={suggestions} onSessionSaved={refresh} />
    </div>
  );
};
