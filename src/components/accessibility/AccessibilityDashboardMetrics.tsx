import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, GitPullRequest, XCircle } from 'lucide-react';

interface MetricsOverviewProps {
  totalPRs: number;
  passedPRs: number;
  failedPRs: number;
  conformityRate: number;
  avgFixTime: number;
  blockedPRsCount: number;
}

export const AccessibilityDashboardMetrics: React.FC<MetricsOverviewProps> = ({
  totalPRs,
  passedPRs,
  failedPRs,
  conformityRate,
  avgFixTime,
  blockedPRsCount
}) => {
  const metrics = [
    {
      title: 'PRs Totales',
      value: totalPRs,
      icon: GitPullRequest,
      description: 'Total des PRs analysées',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'PRs Conformes',
      value: passedPRs,
      icon: CheckCircle2,
      description: 'Tests d\'accessibilité réussis',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'PRs Bloquées',
      value: blockedPRsCount,
      icon: XCircle,
      description: 'PRs avec violations actives',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    },
    {
      title: 'Taux de Conformité',
      value: `${conformityRate.toFixed(1)}%`,
      icon: TrendingUp,
      description: 'Pourcentage de conformité global',
      color: conformityRate >= 80 ? 'text-success' : conformityRate >= 60 ? 'text-warning' : 'text-destructive',
      bgColor: conformityRate >= 80 ? 'bg-success/10' : conformityRate >= 60 ? 'bg-warning/10' : 'bg-destructive/10'
    },
    {
      title: 'Temps de Correction',
      value: avgFixTime > 0 ? `${avgFixTime.toFixed(1)}h` : 'N/A',
      icon: Clock,
      description: 'Temps moyen de résolution',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      title: 'PRs Échouées',
      value: failedPRs,
      icon: AlertTriangle,
      description: 'PRs avec violations détectées',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <Icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${metric.color}`}>
                {metric.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
