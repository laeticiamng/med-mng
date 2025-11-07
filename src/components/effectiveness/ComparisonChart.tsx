import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface ComparisonData {
  category: string;
  period1: number;
  period2: number;
  difference: number;
  percentageChange: number;
}

interface ComparisonChartProps {
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

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  period1Label,
  period2Label,
}) => {
  const chartData = data.map((item) => ({
    category: CATEGORY_LABELS[item.category] || item.category,
    'Période 1': item.period1,
    'Période 2': item.period2,
    rawCategory: item.category,
    difference: item.difference,
    percentageChange: item.percentageChange,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    const diff = data.difference;
    const percentChange = data.percentageChange;

    return (
      <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
        <p className="font-semibold text-popover-foreground mb-2">{data.category}</p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{period1Label}:</span>
            <span className="font-medium" style={{ color: 'hsl(var(--chart-1))' }}>
              {data['Période 1']}/100
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{period2Label}:</span>
            <span className="font-medium" style={{ color: 'hsl(var(--chart-2))' }}>
              {data['Période 2']}/100
            </span>
          </div>
          <div className="pt-2 mt-2 border-t border-border">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Différence:</span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  diff > 0 ? 'text-success' : diff < 0 ? 'text-destructive' : 'text-muted-foreground'
                }`}
              >
                {diff > 0 ? (
                  <ArrowUp className="h-3 w-3" />
                ) : diff < 0 ? (
                  <ArrowDown className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                {Math.abs(diff)} pts ({percentChange > 0 ? '+' : ''}
                {percentChange.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparaison des scores</CardTitle>
          <CardDescription>Évolution des scores d'efficacité par catégorie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Aucune donnée disponible pour les périodes sélectionnées
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparaison des scores</CardTitle>
        <CardDescription>
          Évolution des scores d'efficacité entre {period1Label} et {period2Label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              domain={[0, 100]}
              fontSize={12}
              label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px',
              }}
            />
            <Bar
              dataKey="Période 1"
              fill="hsl(var(--chart-1))"
              radius={[8, 8, 0, 0]}
              name={period1Label}
            />
            <Bar
              dataKey="Période 2"
              fill="hsl(var(--chart-2))"
              radius={[8, 8, 0, 0]}
              name={period2Label}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
