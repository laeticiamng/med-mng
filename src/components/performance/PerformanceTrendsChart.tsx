import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendData {
  timestamp: string;
  metric_name: string;
  value: number;
}

interface PerformanceTrendsChartProps {
  data: TrendData[];
  period: string;
}

export const PerformanceTrendsChart: React.FC<PerformanceTrendsChartProps> = ({
  data,
  period,
}) => {
  // Grouper les données par métrique
  const groupedData = data.reduce((acc, item) => {
    const timestamp = new Date(item.timestamp).toLocaleString();
    if (!acc[timestamp]) {
      acc[timestamp] = { timestamp };
    }
    acc[timestamp][item.metric_name] = item.value;
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(groupedData);
  
  // Obtenir les métriques uniques
  const metrics = [...new Set(data.map(item => item.metric_name))];
  
  const colors = [
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
    '#00ff00',
    '#ff00ff',
  ];

  const formatTooltipValue = (value: any, name: string) => {
    if (typeof value !== 'number') return [value, name];
    
    if (name === 'CLS') {
      return [value.toFixed(3), name];
    }
    
    return [Math.round(value), name];
  };

  return (
    <div className="space-y-4">
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="timestamp" 
              fontSize={12}
              tick={{ fontSize: 10 }}
            />
            <YAxis fontSize={12} />
            <Tooltip 
              formatter={formatTooltipValue}
              labelStyle={{ color: '#000' }}
            />
            <Legend />
            {metrics.map((metric, index) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>Période: {period} • {data.length} points de données</p>
        <p>Métriques suivies: {metrics.join(', ')}</p>
      </div>
    </div>
  );
};