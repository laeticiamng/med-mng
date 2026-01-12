import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, BookOpen, CheckCircle, Clock } from 'lucide-react';

interface SpecialtyData {
  specialty: string;
  total: number;
  revised: number;
  percentage: number;
}

interface SpecialtyProgressChartProps {
  data: SpecialtyData[];
  className?: string;
  variant?: 'bars' | 'pie' | 'compact';
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  'hsl(var(--secondary))',
  'hsl(221, 83%, 53%)',  // Blue
  'hsl(262, 83%, 58%)',  // Purple
  'hsl(330, 81%, 60%)',  // Pink
  'hsl(173, 58%, 39%)',  // Teal
];

export const SpecialtyProgressChart: React.FC<SpecialtyProgressChartProps> = ({ 
  data, 
  className = '',
  variant = 'bars'
}) => {
  if (!data || data.length === 0) {
    return (
      <Card className={`border-border/30 ${className}`}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Aucune donnée de progression disponible</p>
        </CardContent>
      </Card>
    );
  }

  // Sort by percentage (highest first)
  const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);
  
  // For pie chart
  const pieData = sortedData.slice(0, 8).map((item, index) => ({
    name: item.specialty,
    value: item.revised,
    color: COLORS[index % COLORS.length]
  }));

  const totalRevised = data.reduce((sum, d) => sum + d.revised, 0);
  const totalItems = data.reduce((sum, d) => sum + d.total, 0);
  const globalPercentage = totalItems > 0 ? Math.round((totalRevised / totalItems) * 100) : 0;

  if (variant === 'compact') {
    return (
      <Card className={`border-border/30 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Top spécialités
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {sortedData.slice(0, 5).map((item, index) => (
              <div key={item.specialty} className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-muted-foreground truncate flex-1">
                  {item.specialty}
                </span>
                <Badge variant="outline" className="text-xs">
                  {item.percentage}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'pie') {
    return (
      <Card className={`border-border/30 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Répartition par spécialité
          </CardTitle>
          <CardDescription>
            {totalRevised} items révisés sur {totalItems} ({globalPercentage}%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value} items`, name]}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value) => <span className="text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default: bars variant
  return (
    <Card className={`border-border/30 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Progression par spécialité
        </CardTitle>
        <CardDescription className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-success" />
            {totalRevised} révisés
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {totalItems - totalRevised} restants
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {sortedData.map((item, index) => (
            <div key={item.specialty} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-foreground font-medium truncate max-w-[200px]">
                    {item.specialty}
                  </span>
                </div>
                <span className="text-muted-foreground text-xs">
                  {item.revised}/{item.total} ({item.percentage}%)
                </span>
              </div>
              <Progress 
                value={item.percentage} 
                className="h-2"
                style={{ 
                  ['--progress-background' as any]: COLORS[index % COLORS.length] 
                }}
              />
            </div>
          ))}
        </div>

        {/* Résumé global */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progression globale</span>
            <span className="text-lg font-bold text-primary">{globalPercentage}%</span>
          </div>
          <Progress value={globalPercentage} className="h-3 mt-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default SpecialtyProgressChart;
