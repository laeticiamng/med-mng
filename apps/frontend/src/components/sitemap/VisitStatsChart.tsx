import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

interface VisitStats {
  [path: string]: {
    count: number;
    timestamps: number[];
  };
}

interface VisitStatsChartProps {
  visitStats: VisitStats;
}

type PeriodFilter = 7 | 30 | 'all';

export function VisitStatsChart({ visitStats }: VisitStatsChartProps) {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>(7);

  const chartData = useMemo(() => {
    const now = Date.now();
    const filterTimestamp = periodFilter === 'all' ? 0 : now - (periodFilter * 24 * 60 * 60 * 1000);
    // Grouper les visites par jour
    const visitsByDay: Record<string, number> = {};
    
    Object.values(visitStats).forEach(stat => {
      stat.timestamps.forEach(timestamp => {
        if (timestamp >= filterTimestamp) {
          const date = new Date(timestamp);
          const dayKey = date.toLocaleDateString('fr-FR');
          visitsByDay[dayKey] = (visitsByDay[dayKey] || 0) + 1;
        }
      });
    });

    // Convertir en format pour Recharts
    return Object.entries(visitsByDay)
      .map(([date, visits]) => ({
        date,
        visits,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      });
  }, [visitStats, periodFilter]);

  const totalVisits = useMemo(() => {
    const now = Date.now();
    const filterTimestamp = periodFilter === 'all' ? 0 : now - (periodFilter * 24 * 60 * 60 * 1000);
    
    return Object.values(visitStats).reduce((sum, stat) => {
      const filteredCount = stat.timestamps.filter(ts => ts >= filterTimestamp).length;
      return sum + filteredCount;
    }, 0);
  }, [visitStats, periodFilter]);

  const getPeriodLabel = () => {
    if (periodFilter === 'all') return 'toutes les périodes';
    return `les ${periodFilter} derniers jours`;
  };

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div>
              <CardTitle className="text-xl">Évolution des visites</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {totalVisits} visites sur {getPeriodLabel()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={periodFilter === 7 ? 'default' : 'outline'}
                onClick={() => setPeriodFilter(7)}
                className="h-8"
              >
                7j
              </Button>
              <Button
                size="sm"
                variant={periodFilter === 30 ? 'default' : 'outline'}
                onClick={() => setPeriodFilter(30)}
                className="h-8"
              >
                30j
              </Button>
              <Button
                size="sm"
                variant={periodFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setPeriodFilter('all')}
                className="h-8"
              >
                Tout
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="visits"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
              activeDot={{ r: 6 }}
              name="Visites"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
