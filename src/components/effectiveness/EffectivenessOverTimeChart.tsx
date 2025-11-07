import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AppliedRecommendation {
  id: string;
  category: string;
  applied_at: string;
  impact_measured_at?: string;
  impact_score?: number;
}

interface EffectivenessOverTimeChartProps {
  recommendations: AppliedRecommendation[];
}

const CATEGORY_COLORS: Record<string, string> = {
  timing: 'hsl(var(--chart-1))',
  platform: 'hsl(var(--chart-2))',
  volume: 'hsl(var(--chart-3))',
  quality: 'hsl(var(--chart-4))',
};

export const EffectivenessOverTimeChart: React.FC<EffectivenessOverTimeChartProps> = ({
  recommendations,
}) => {
  // Grouper les recommandations par mois et catégorie
  const dataByMonth = recommendations
    .filter((rec) => rec.impact_measured_at && rec.impact_score !== null)
    .reduce((acc, rec) => {
      const monthKey = format(new Date(rec.impact_measured_at!), 'yyyy-MM', { locale: fr });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          timing: [],
          platform: [],
          volume: [],
          quality: [],
        };
      }
      
      if (rec.category in acc[monthKey]) {
        acc[monthKey][rec.category as keyof typeof acc[typeof monthKey]].push(rec.impact_score!);
      }
      
      return acc;
    }, {} as Record<string, any>);

  // Calculer les moyennes par mois
  const chartData = Object.entries(dataByMonth)
    .map(([month, data]) => {
      const result: any = {
        month: format(new Date(month + '-01'), 'MMM yyyy', { locale: fr }),
      };
      
      ['timing', 'platform', 'volume', 'quality'].forEach((category) => {
        const scores = data[category];
        if (scores.length > 0) {
          result[category] = Math.round(
            scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length
          );
        }
      });
      
      return result;
    })
    .sort((a, b) => a.month.localeCompare(b.month));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution des scores d'efficacité</CardTitle>
          <CardDescription>
            Score d'impact moyen par catégorie au fil du temps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Aucune donnée d'impact mesurée pour le moment
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution des scores d'efficacité</CardTitle>
        <CardDescription>
          Score d'impact moyen par catégorie au fil du temps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              domain={[0, 100]}
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                color: 'hsl(var(--popover-foreground))',
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px',
              }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  timing: 'Timing',
                  platform: 'Plateforme',
                  volume: 'Volume',
                  quality: 'Qualité',
                };
                return labels[value] || value;
              }}
            />
            {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
              <Line
                key={category}
                type="monotone"
                dataKey={category}
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 4 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
