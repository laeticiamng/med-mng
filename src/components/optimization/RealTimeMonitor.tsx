import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Activity, Cpu, HardDrive, Wifi, AlertTriangle } from 'lucide-react';

interface SystemMetrics {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  fps: number;
  timestamp: number;
}

export const RealTimeMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    storage: 0,
    network: 0,
    fps: 60,
    timestamp: Date.now()
  });
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Simulation de métriques réelles
      const newMetrics: SystemMetrics = {
        cpu: Math.random() * 100,
        memory: 45 + Math.random() * 30,
        storage: 65 + Math.random() * 10,
        network: Math.random() * 100,
        fps: 55 + Math.random() * 10,
        timestamp: Date.now()
      };

      setMetrics(newMetrics);

      // Détection d'alertes
      const newAlerts: string[] = [];
      if (newMetrics.cpu > 80) newAlerts.push('CPU élevé');
      if (newMetrics.memory > 85) newAlerts.push('Mémoire saturée');
      if (newMetrics.fps < 30) newAlerts.push('FPS faible');
      
      setAlerts(newAlerts);
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getStatusColor = (value: number, thresholds: [number, number]) => {
    if (value < thresholds[0]) return 'hsl(var(--success))';
    if (value < thresholds[1]) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const MetricCard = ({ 
    icon: Icon, 
    label, 
    value, 
    unit, 
    color, 
    thresholds 
  }: {
    icon: React.ElementType;
    label: string;
    value: number;
    unit: string;
    color: string;
    thresholds: [number, number];
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color }} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-mono">
          {value.toFixed(1)}{unit}
        </span>
      </div>
      <Progress 
        value={unit === 'fps' ? (value / 60) * 100 : value} 
        className="h-2"
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Monitoring Temps Réel
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch 
              checked={isMonitoring} 
              onCheckedChange={setIsMonitoring} 
            />
            <label className="text-sm">Monitoring actif</label>
          </div>
          {alerts.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {alerts.length} alerte{alerts.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <MetricCard
            icon={Cpu}
            label="CPU"
            value={metrics.cpu}
            unit="%"
            color="#3b82f6"
            thresholds={[60, 80]}
          />
          
          <MetricCard
            icon={HardDrive}
            label="Mémoire"
            value={metrics.memory}
            unit="%"
            color="#10b981"
            thresholds={[70, 85]}
          />
          
          <MetricCard
            icon={Wifi}
            label="Réseau"
            value={metrics.network}
            unit="MB/s"
            color="#f59e0b"
            thresholds={[50, 80]}
          />

          <MetricCard
            icon={Activity}
            label="FPS"
            value={metrics.fps}
            unit="fps"
            color="#8b5cf6"
            thresholds={[30, 45]}
          />
        </div>

        {alerts.length > 0 && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <h4 className="font-medium text-destructive mb-2">Alertes Actives</h4>
            <ul className="text-sm space-y-1">
              {alerts.map((alert, index) => (
                <li key={index} className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-destructive" />
                  {alert}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground text-center">
          Dernière mise à jour: {new Date(metrics.timestamp).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};