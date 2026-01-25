import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Award, Minus, Target, TrendingUp } from 'lucide-react';
import React from 'react';

interface ComparisonData {
  category: string;
  period1: number;
  period2: number;
  difference: number;
  percentageChange: number;
}

interface ComparisonStatsProps {
  data: ComparisonData[];
  period1Label: string;
  period2Label: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  timing: 'Timing',
  platform: 'Plateforme',
  volume: 'Volume',
  quality: 'Qualité',
};

export const ComparisonStats: React.FC<ComparisonStatsProps> = ({
  data,
  period1Label,
  period2Label,
}) => {
  if (data.length === 0) {
    return null;
  }

  // Calculer les statistiques globales
  const avgPeriod1 = Math.round(
    data.reduce((sum, item) => sum + item.period1, 0) / data.length
  );
  const avgPeriod2 = Math.round(
    data.reduce((sum, item) => sum + item.period2, 0) / data.length
  );
  const avgDifference = avgPeriod2 - avgPeriod1;
  const avgPercentageChange = avgPeriod1 > 0 ? (avgDifference / avgPeriod1) * 100 : 0;

  // Trouver la meilleure et la pire évolution
  const sortedByChange = [...data].sort((a, b) => b.difference - a.difference);
  const bestImprovement = sortedByChange[0];
  // Compter les améliorations et détériorations
  const improvements = data.filter((d) => d.difference > 0).length;
  const deteriorations = data.filter((d) => d.difference < 0).length;
  const unchanged = data.filter((d) => d.difference === 0).length;

  const renderTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-4 w-4 text-success" />;
    if (value < 0) return <ArrowDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const renderTrendColor = (value: number) => {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Évolution moyenne */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Évolution moyenne</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{avgPeriod1}</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-2xl font-bold text-foreground">{avgPeriod2}</span>
          </div>
          <div className={`flex items-center gap-1 mt-2 ${renderTrendColor(avgDifference)}`}>
            {renderTrendIcon(avgDifference)}
            <span className="text-sm font-semibold">
              {avgDifference > 0 ? '+' : ''}
              {avgDifference} pts ({avgPercentageChange > 0 ? '+' : ''}
              {avgPercentageChange.toFixed(1)}%)
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Score moyen toutes catégories</p>
        </CardContent>
      </Card>

      {/* Meilleure amélioration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Meilleure amélioration</CardTitle>
          <Award className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-1">
            {CATEGORY_LABELS[bestImprovement.category] || bestImprovement.category}
          </div>
          <div className="flex items-center gap-1 text-success">
            <ArrowUp className="h-4 w-4" />
            <span className="text-sm font-semibold">
              +{bestImprovement.difference} pts (+
              {bestImprovement.percentageChange.toFixed(1)}%)
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {bestImprovement.period1} → {bestImprovement.period2}
          </p>
        </CardContent>
      </Card>

      {/* Résumé des évolutions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Résumé des évolutions</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Améliorations</span>
              <span className="text-sm font-semibold text-success">{improvements}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Détériorations</span>
              <span className="text-sm font-semibold text-destructive">{deteriorations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Inchangé</span>
              <span className="text-sm font-semibold text-muted-foreground">{unchanged}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Sur {data.length} catégories</p>
        </CardContent>
      </Card>

      {/* Détail par catégorie */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Détail par catégorie</CardTitle>
          <CardDescription>
            Évolution détaillée des scores entre {period1Label} et {period2Label}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.map((item) => (
              <div
                key={item.category}
                className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="font-medium text-foreground mb-2">
                  {CATEGORY_LABELS[item.category] || item.category}
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-lg font-semibold">{item.period1}</span>
                  <span className="text-muted-foreground text-sm">→</span>
                  <span className="text-lg font-semibold">{item.period2}</span>
                </div>
                <div className={`flex items-center gap-1 ${renderTrendColor(item.difference)}`}>
                  {renderTrendIcon(item.difference)}
                  <span className="text-sm font-medium">
                    {item.difference > 0 ? '+' : ''}
                    {item.difference} pts ({item.percentageChange > 0 ? '+' : ''}
                    {item.percentageChange.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
