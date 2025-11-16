import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpDown, Calendar } from 'lucide-react';
import { subDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TimeComparisonProps {
  visitStats: Record<string, { count: number; timestamps: number[]; sessions: any[] }>;
  routeLabels: Record<string, { label: string; category: string }>;
}

type PeriodOption = 7 | 14 | 30 | 90;

export function TimeComparison({ visitStats, routeLabels }: TimeComparisonProps) {
  const [period1, setPeriod1] = useState<PeriodOption>(7);
  const [period2, setPeriod2] = useState<PeriodOption>(14);

  // Calculer les statistiques pour chaque période
  const comparisonData = useMemo(() => {
    const now = Date.now();
    const period1Start = now - period1 * 24 * 60 * 60 * 1000;
    const period2Start = now - period2 * 24 * 60 * 60 * 1000;
    const period2End = now - period1 * 24 * 60 * 60 * 1000;

    const stats: Record<string, {
      path: string;
      label: string;
      period1: { visits: number; avgDuration: number; bounceRate: number };
      period2: { visits: number; avgDuration: number; bounceRate: number };
    }> = {};

    Object.entries(visitStats).forEach(([path, data]) => {
      const label = routeLabels[path]?.label || path;

      // Période 1 (récente)
      const period1Timestamps = data.timestamps.filter(ts => ts >= period1Start);
      const period1Sessions = data.sessions.filter(s => s.startTime >= period1Start);
      const period1Bounces = period1Sessions.filter(s => !s.duration || s.duration < 5000).length;
      const period1AvgDuration = period1Sessions.length > 0
        ? period1Sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / period1Sessions.length / 1000
        : 0;

      // Période 2 (plus ancienne)
      const period2Timestamps = data.timestamps.filter(ts => ts >= period2Start && ts < period2End);
      const period2Sessions = data.sessions.filter(s => s.startTime >= period2Start && s.startTime < period2End);
      const period2Bounces = period2Sessions.filter(s => !s.duration || s.duration < 5000).length;
      const period2AvgDuration = period2Sessions.length > 0
        ? period2Sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / period2Sessions.length / 1000
        : 0;

      if (period1Timestamps.length > 0 || period2Timestamps.length > 0) {
        stats[path] = {
          path,
          label,
          period1: {
            visits: period1Timestamps.length,
            avgDuration: period1AvgDuration,
            bounceRate: period1Timestamps.length > 0 ? (period1Bounces / period1Timestamps.length) * 100 : 0,
          },
          period2: {
            visits: period2Timestamps.length,
            avgDuration: period2AvgDuration,
            bounceRate: period2Timestamps.length > 0 ? (period2Bounces / period2Timestamps.length) * 100 : 0,
          },
        };
      }
    });

    return Object.values(stats);
  }, [visitStats, routeLabels, period1, period2]);

  // Trier par différence de visites
  const topChanges = useMemo(() => {
    return comparisonData
      .map(stat => ({
        ...stat,
        visitChange: stat.period1.visits - stat.period2.visits,
        visitChangePercent: stat.period2.visits > 0
          ? ((stat.period1.visits - stat.period2.visits) / stat.period2.visits) * 100
          : stat.period1.visits > 0 ? 100 : 0,
        durationChange: stat.period1.avgDuration - stat.period2.avgDuration,
        bounceRateChange: stat.period1.bounceRate - stat.period2.bounceRate,
      }))
      .sort((a, b) => Math.abs(b.visitChange) - Math.abs(a.visitChange))
      .slice(0, 10);
  }, [comparisonData]);

  // Données pour le graphique
  const chartData = useMemo(() => {
    return topChanges.slice(0, 8).map(stat => ({
      name: stat.label.length > 20 ? stat.label.substring(0, 20) + '...' : stat.label,
      [`${period1}j`]: stat.period1.visits,
      [`${period2}j`]: stat.period2.visits,
    }));
  }, [topChanges, period1, period2]);

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendBadge = (change: number, isPositive: boolean = true) => {
    if (change === 0) return <Badge variant="outline">Stable</Badge>;
    
    const isGood = isPositive ? change > 0 : change < 0;
    const color = isGood ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    
    return (
      <Badge className={color}>
        {change > 0 ? '+' : ''}{change.toFixed(1)}%
      </Badge>
    );
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}min`;
    return `${Math.round(seconds / 3600)}h`;
  };

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Calendar className="h-6 w-6 text-accent" />
            </div>
            <div>
              <CardTitle className="text-xl">Comparaison Temporelle</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Analysez l'évolution de vos métriques entre deux périodes
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sélection des périodes */}
        <div className="grid gap-4 sm:grid-cols-2 p-4 rounded-lg border border-border bg-background">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Période récente</Label>
            <Select value={period1.toString()} onValueChange={(v) => setPeriod1(Number(v) as PeriodOption)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Derniers 7 jours</SelectItem>
                <SelectItem value="14">Derniers 14 jours</SelectItem>
                <SelectItem value="30">Derniers 30 jours</SelectItem>
                <SelectItem value="90">Derniers 90 jours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Du {format(subDays(new Date(), period1), 'PP', { locale: fr })} à aujourd'hui
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Période de comparaison</Label>
            <Select value={period2.toString()} onValueChange={(v) => setPeriod2(Number(v) as PeriodOption)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 jours précédents</SelectItem>
                <SelectItem value="14">14 jours précédents</SelectItem>
                <SelectItem value="30">30 jours précédents</SelectItem>
                <SelectItem value="90">90 jours précédents</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Du {format(subDays(new Date(), period2), 'PP', { locale: fr })} au {format(subDays(new Date(), period1), 'PP', { locale: fr })}
            </p>
          </div>
        </div>

        {/* Graphique de comparaison */}
        {chartData.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Évolution des visites par page</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />
                <Bar dataKey={`${period1}j`} fill="hsl(var(--primary))" name={`${period1} derniers jours`} radius={[4, 4, 0, 0]} />
                <Bar dataKey={`${period2}j`} fill="hsl(var(--accent))" name={`${period2} jours précédents`} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Détails des changements */}
        <div className="space-y-3">
          <h3 className="font-semibold">Top changements</h3>
          {topChanges.map((stat) => (
            <div
              key={stat.path}
              className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{stat.label}</h4>
                </div>
                {getTrendIcon(stat.visitChange)}
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Visites</p>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{stat.period1.visits}</span>
                    {getTrendBadge(stat.visitChangePercent)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    vs {stat.period2.visits}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Durée moy.</p>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatDuration(stat.period1.avgDuration)}</span>
                    {stat.durationChange !== 0 && (
                      <span className={`text-xs ${stat.durationChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.durationChange > 0 ? '+' : ''}{formatDuration(Math.abs(stat.durationChange))}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    vs {formatDuration(stat.period2.avgDuration)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Rebond</p>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{stat.period1.bounceRate.toFixed(0)}%</span>
                    {getTrendBadge(stat.bounceRateChange, false)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    vs {stat.period2.bounceRate.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          ))}

          {topChanges.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Pas assez de données pour comparer les périodes
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
