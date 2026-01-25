import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, CheckCircle2, Target, TrendingUp } from 'lucide-react';
import React from 'react';

interface AppliedRecommendation {
  id: string;
  impact_score?: number;
  success_improvement?: number;
  status: string;
}

interface EffectivenessStatsProps {
  recommendations: AppliedRecommendation[];
  categoryScores: Record<string, any>;
}

export const EffectivenessStats: React.FC<EffectivenessStatsProps> = ({
  recommendations,
  categoryScores,
}) => {
  const measuredRecs = recommendations.filter((rec) => rec.impact_score !== null);
  const avgImpactScore = measuredRecs.length > 0
    ? Math.round(
        measuredRecs.reduce((sum, rec) => sum + (rec.impact_score || 0), 0) / measuredRecs.length
      )
    : 0;

  const avgSuccessImprovement = measuredRecs.length > 0
    ? Math.round(
        measuredRecs.reduce((sum, rec) => sum + (rec.success_improvement || 0), 0) / measuredRecs.length
      )
    : 0;

  const totalApplied = recommendations.length;
  const totalMeasured = measuredRecs.length;

  const avgCategoryScore = Object.values(categoryScores).length > 0
    ? Math.round(
        Object.values(categoryScores).reduce(
          (sum: number, cat: any) => sum + cat.effectiveness_score,
          0
        ) / Object.values(categoryScores).length
      )
    : 0;

  const stats = [
    {
      title: 'Score d\'efficacité moyen',
      value: `${avgCategoryScore}/100`,
      description: 'Moyenne globale des catégories',
      icon: Target,
      color: 'text-primary',
    },
    {
      title: 'Impact moyen mesuré',
      value: `${avgImpactScore}/100`,
      description: `Sur ${totalMeasured} recommandations`,
      icon: TrendingUp,
      color: 'text-success',
    },
    {
      title: 'Amélioration moyenne',
      value: `+${avgSuccessImprovement}%`,
      description: 'Taux de succès',
      icon: CheckCircle2,
      color: 'text-success',
    },
    {
      title: 'Recommandations appliquées',
      value: totalApplied.toString(),
      description: `${totalMeasured} mesurées`,
      icon: BarChart3,
      color: 'text-primary',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
