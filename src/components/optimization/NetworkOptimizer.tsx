import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Wifi, Zap, Clock, TrendingDown } from 'lucide-react';

interface NetworkMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

export const NetworkOptimizer: React.FC = () => {
  const [metrics, setMetrics] = useState<NetworkMetric[]>([]);
  const [compressionEnabled, setCompressionEnabled] = useState(true);
  const [cachingEnabled, setCachingEnabled] = useState(true);

  useEffect(() => {
    const mockMetrics: NetworkMetric[] = [
      { name: 'Latence', value: 45, unit: 'ms', status: 'good' },
      { name: 'Débit', value: 8.5, unit: 'MB/s', status: 'good' },
      { name: 'Perte de paquets', value: 0.1, unit: '%', status: 'good' },
      { name: 'Compression', value: 67, unit: '%', status: 'good' }
    ];
    setMetrics(mockMetrics);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'hsl(var(--success))';
      case 'warning': return 'hsl(var(--warning))';
      case 'critical': return 'hsl(var(--destructive))';
      default: return 'hsl(var(--muted))';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Optimisation Réseau
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <Switch checked={compressionEnabled} onCheckedChange={setCompressionEnabled} />
              <label className="text-sm">Compression</label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={cachingEnabled} onCheckedChange={setCachingEnabled} />
              <label className="text-sm">Cache HTTP</label>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <div key={metric.name} className="text-center">
                <div className="text-lg font-bold" style={{ color: getStatusColor(metric.status) }}>
                  {metric.value}{metric.unit}
                </div>
                <div className="text-xs text-muted-foreground">{metric.name}</div>
                <Progress value={metric.name === 'Compression' ? metric.value : 85} className="mt-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};