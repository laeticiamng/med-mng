import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();

  const deepLinkedItem = useMemo(() => {
    const focus = searchParams.get('item');
    if (!focus) return null;
    const normalized = focus.toLowerCase();
    return (
      items.find((item) => item.item_code.toLowerCase() === normalized) ??
      items.find((item) => item.slug.toLowerCase() === normalized)
    ) ?? null;
  }, [items, searchParams]);

  const focusTheme = deepLinkedItem?.specialite ?? deepLinkedItem?.domaine_medical ?? null;
  const shouldAutoStart = (searchParams.get('session') ?? '').toLowerCase() === '8min';
  const focusItemCode = deepLinkedItem?.item_code;

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

      <ThemeProgressGrid
        themes={themeProgress}
        rankFilter={rankFilter}
        onRankFilterChange={setRankFilter}
        highlightedTheme={focusTheme ?? undefined}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <SpacedRepetitionPlanner items={repetitionPlan} rankFilter={rankFilter} focusItemCode={focusItemCode} />
        <ProgressHistoryTimeline entries={history} focusItemCode={focusItemCode} />
      </div>

      <EightMinuteSessionBuilder
        items={items}
        suggestions={suggestions}
        onSessionSaved={refresh}
        initialItemCode={focusItemCode}
        focusTheme={focusTheme}
        autoStart={shouldAutoStart}
      />
    </div>
  );
};
