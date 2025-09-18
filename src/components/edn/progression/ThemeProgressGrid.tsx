import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { ThemeProgressMetrics } from '@/hooks/edn/useEdnProgressionData';

interface ThemeProgressGridProps {
  themes: ThemeProgressMetrics[];
  rankFilter: 'all' | 'A' | 'B';
  onRankFilterChange: (filter: 'all' | 'A' | 'B') => void;
}

const formatLabel = (value: number) => `${value.toString().padStart(2, '0')}`;

export const ThemeProgressGrid: React.FC<ThemeProgressGridProps> = ({ themes, rankFilter, onRankFilterChange }) => {
  const sortedThemes = React.useMemo(() => {
    if (rankFilter === 'A') {
      return [...themes].sort((a, b) => b.rankACount - a.rankACount);
    }
    if (rankFilter === 'B') {
      return [...themes].sort((a, b) => b.rankBCount - a.rankBCount);
    }
    return [...themes].sort((a, b) => b.masteryRate - a.masteryRate);
  }, [themes, rankFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Progression par thème</h2>
          <p className="text-sm text-muted-foreground">Visualisez vos priorités par rang et thème EDN.</p>
        </div>
        <ToggleGroup
          type="single"
          value={rankFilter}
          onValueChange={(value) => value && onRankFilterChange(value as 'all' | 'A' | 'B')}
          className="bg-muted/40 rounded-full p-1"
        >
          <ToggleGroupItem value="all" className="px-4 py-1 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            Global
          </ToggleGroupItem>
          <ToggleGroupItem value="A" className="px-4 py-1 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            Rang A
          </ToggleGroupItem>
          <ToggleGroupItem value="B" className="px-4 py-1 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            Rang B
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sortedThemes.map((theme) => (
          <Card key={theme.theme} className="relative overflow-hidden border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex-1 pr-4">{theme.theme}</CardTitle>
                <Badge variant="secondary" className="text-xs font-medium">
                  {formatLabel(theme.mastered)}/{formatLabel(theme.totalItems)} maîtrisés
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                  <span>Taux de maîtrise</span>
                  <span className="font-semibold text-foreground">{theme.masteryRate}%</span>
                </div>
                <Progress value={theme.masteryRate} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div className="space-y-1">
                  <p className="text-foreground font-medium">Rang A</p>
                  <p>{theme.rankACount} compétences suivies</p>
                  <p>{theme.mastered} maîtrisés</p>
                </div>
                <div className="space-y-1">
                  <p className="text-foreground font-medium">Rang B</p>
                  <p>{theme.rankBCount} compétences suivies</p>
                  <p>{theme.completed + theme.inProgress} en progression</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>En cours</span>
                <span className="font-medium text-foreground">{theme.inProgress}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Non commencés</span>
                <span className="font-medium text-foreground">{theme.notStarted}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
