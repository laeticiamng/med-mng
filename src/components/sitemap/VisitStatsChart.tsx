import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface VisitStats {
  [path: string]: {
    count: number;
    timestamps: number[];
  };
}

interface VisitStatsChartProps {
  visitStats: VisitStats;
}

export function VisitStatsChart({ visitStats }: VisitStatsChartProps) {
  const chartData = useMemo(() => {
    // Grouper les visites par jour
    const visitsByDay: Record<string, number> = {};
    
    Object.values(visitStats).forEach(stat => {
      stat.timestamps.forEach(timestamp => {
        const date = new Date(timestamp);
        const dayKey = date.toLocaleDateString('fr-FR');
        visitsByDay[dayKey] = (visitsByDay[dayKey] || 0) + 1;
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
      })
      .slice(-14); // Garder les 14 derniers jours
  }, [visitStats]);

  const totalVisits = useMemo(() => {
    return Object.values(visitStats).reduce((sum, stat) => sum + stat.count, 0);
  }, [visitStats]);

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
                {totalVisits} visites sur les 14 derniers jours
              </p>
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
