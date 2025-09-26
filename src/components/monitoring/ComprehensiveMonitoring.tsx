import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, AlertTriangle, CheckCircle, Clock, 
  Database, Globe, Server, Zap, TrendingUp, TrendingDown
} from 'lucide-react';
import { logger } from '@/utils/logger';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: number;
  latency: number;
  errorRate: number;
  throughput: number;
}

interface HealthCheck {
  service: string;
  status: 'healthy' | 'warning' | 'critical';
  lastCheck: string;
  responseTime: number;
  message?: string;
}

export const ComprehensiveMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    uptime: 0,
    latency: 0,
    errorRate: 0,
    throughput: 0
  });

  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    {
      service: 'Base de données',
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      responseTime: 45,
      message: 'Connexions actives: 23/100'
    },
    {
      service: 'API Backend',
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      responseTime: 120,
      message: 'Toutes les routes opérationnelles'
    },
    {
      service: 'Stockage fichiers',
      status: 'warning',
      lastCheck: new Date().toISOString(),
      responseTime: 280,
      message: 'Espace disque: 85% utilisé'
    },
    {
      service: 'Service IA',
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      responseTime: 340,
      message: 'Modèles chargés et opérationnels'
    }
  ]);

  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isMonitoring) {
      // Simuler des métriques système réelles
      interval = setInterval(() => {
        setMetrics(prev => ({
          cpu: Math.max(10, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
          memory: Math.max(20, Math.min(85, prev.memory + (Math.random() - 0.5) * 5)),
          disk: Math.max(30, Math.min(95, prev.disk + (Math.random() - 0.5) * 2)),
          network: Math.max(5, Math.min(100, prev.network + (Math.random() - 0.5) * 15)),
          uptime: prev.uptime + 1,
          latency: Math.max(50, Math.min(500, prev.latency + (Math.random() - 0.5) * 20)),
          errorRate: Math.max(0, Math.min(5, prev.errorRate + (Math.random() - 0.5) * 0.5)),
          throughput: Math.max(100, Math.min(1000, prev.throughput + (Math.random() - 0.5) * 50))
        }));

        // Mettre à jour les health checks périodiquement
        if (Math.random() < 0.1) { // 10% de chance de mise à jour
          setHealthChecks(prev => prev.map(check => ({
            ...check,
            lastCheck: new Date().toISOString(),
            responseTime: Math.max(20, Math.min(1000, check.responseTime + (Math.random() - 0.5) * 50)),
            status: Math.random() > 0.9 ? 'warning' : 'healthy' // 10% de chance d'avoir un warning
          })));
        }
      }, 2000);

      // Log initial
      logger.info('Monitoring système démarré');
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isMonitoring]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Clock;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}j ${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Monitoring Complet
        </h2>
        <Badge variant={isMonitoring ? 'default' : 'secondary'}>
          {isMonitoring ? 'Actif' : 'Arrêté'}
        </Badge>
      </div>

      {/* Métriques système temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">CPU</span>
                </div>
                <span className="text-lg font-bold">{metrics.cpu.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.cpu} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">Mémoire</span>
                </div>
                <span className="text-lg font-bold">{metrics.memory.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.memory} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium">Disque</span>
                </div>
                <span className="text-lg font-bold">{metrics.disk.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.disk} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium">Réseau</span>
                </div>
                <span className="text-lg font-bold">{metrics.network.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.network} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Métriques avancées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-xl font-bold text-foreground">
              {formatUptime(metrics.uptime)}
            </div>
            <p className="text-sm text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 text-accent" />
            <div className="text-xl font-bold text-foreground">
              {metrics.latency.toFixed(0)}ms
            </div>
            <p className="text-sm text-muted-foreground">Latence</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingDown className="w-8 h-8 mx-auto mb-2 text-success" />
            <div className="text-xl font-bold text-foreground">
              {metrics.errorRate.toFixed(2)}%
            </div>
            <p className="text-sm text-muted-foreground">Taux d'erreur</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-warning" />
            <div className="text-xl font-bold text-foreground">
              {metrics.throughput.toFixed(0)}/s
            </div>
            <p className="text-sm text-muted-foreground">Débit</p>
          </CardContent>
        </Card>
      </div>

      {/* Health Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            Health Checks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthChecks.map((check, index) => {
              const StatusIcon = getStatusIcon(check.status);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`w-5 h-5 ${getStatusColor(check.status)}`} />
                    <div>
                      <h3 className="font-semibold">{check.service}</h3>
                      <p className="text-sm text-muted-foreground">{check.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={check.status === 'healthy' ? 'default' : 'destructive'}>
                      {check.responseTime}ms
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(check.lastCheck).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};