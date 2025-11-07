import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CategoryScore } from '@/hooks/useEffectivenessScores';

interface EffectivenessByCategoryProps {
  scores: Record<string, CategoryScore>;
}

const CATEGORY_LABELS: Record<string, string> = {
  timing: 'Timing',
  platform: 'Plateforme',
  volume: 'Volume',
  quality: 'Qualité',
};

const getScoreColor = (score: number) => {
  if (score >= 75) return 'hsl(var(--success))';
  if (score >= 60) return 'hsl(var(--warning))';
  return 'hsl(var(--destructive))';
};

export const EffectivenessByCategory: React.FC<EffectivenessByCategoryProps> = ({ scores }) => {
  const data = Object.entries(scores).map(([category, score]) => ({
    category: CATEGORY_LABELS[category] || category,
    score: Math.round(score.effectiveness_score),
    applied: score.total_applied,
    measured: score.total_measured,
    rawCategory: category,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Efficacité par catégorie</CardTitle>
        <CardDescription>
          Score d'efficacité moyen pour chaque type de recommandation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="category" 
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
              formatter={(value: any, name: string, props: any) => {
                if (name === 'score') {
                  return [
                    `${value}/100`,
                    <div key="details" className="text-xs mt-1">
                      <div>{props.payload.applied} appliquées</div>
                      <div>{props.payload.measured} mesurées</div>
                    </div>
                  ];
                }
                return value;
              }}
            />
            <Bar dataKey="score" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {data.map((item) => (
            <div
              key={item.rawCategory}
              className="p-4 rounded-lg border border-border bg-card"
            >
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {item.category}
              </div>
              <div className="text-2xl font-bold" style={{ color: getScoreColor(item.score) }}>
                {item.score}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {item.measured}/{item.applied} mesurées
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
