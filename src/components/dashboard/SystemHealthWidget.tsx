import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Database,
  Globe,
  Shield,
  Clock
} from 'lucide-react';

interface HealthMetric {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  value: number;
  unit: string;
  threshold: number;
  trend: 'up' | 'down' | 'stable';
  last_updated: string;
  icon: React.ComponentType<any>;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export const SystemHealthWidget: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date().toLocaleTimeString());
  
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([
    {
      id: 'api_response',
      name: 'Temps de réponse API',
      status: 'healthy',
      value: 145,
      unit: 'ms',
      threshold: 500,
      trend: 'down',
      last_updated: '1 min',
      icon: Globe
    },
    {
      id: 'database_perf',
      name: 'Performance BDD',
      status: 'warning',
      value: 78,
      unit: '%',
      threshold: 85,
      trend: 'up',
      last_updated: '2 min',
      icon: Database
    },
    {
      id: 'edge_functions',
      name: 'Edge Functions',
      status: 'healthy',
      value: 99.8,
      unit: '%',
      threshold: 99,
      trend: 'stable',
      last_updated: '30 sec',
      icon: Zap
    },
    {
      id: 'security_score',
      name: 'Score sécurité',
      status: 'healthy',
      value: 98,
      unit: '%',
      threshold: 95,
      trend: 'up',
      last_updated: '5 min',
      icon: Shield
    }
  ]);

  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: '1',
      type: 'warning',
      message: 'Performance base de données en dessous du seuil optimal',
      timestamp: '14:32',
      resolved: false
    },
    {
      id: '2',
      type: 'info',
      message: 'Mise à jour automatique des Edge Functions terminée',
      timestamp: '14:15',
      resolved: true
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-success" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-destructive" />;
      default: return <Minus className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
      default: return 'outline';
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simulation de la mise à jour des métriques
    setTimeout(() => {
      setHealthMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * (metric.value * 0.1),
        last_updated: 'maintenant'
      })));
      setLastRefresh(new Date().toLocaleTimeString());
      setIsRefreshing(false);
    }, 1500);
  };

  const overallStatus = healthMetrics.every(m => m.status === 'healthy') ? 'healthy' :
                       healthMetrics.some(m => m.status === 'error') ? 'error' : 'warning';

  const activeAlerts = alerts.filter(alert => !alert.resolved);

  useEffect(() => {
    // Auto-refresh toutes les 30 secondes
    const interval = setInterval(() => {
      setHealthMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, metric.value + (Math.random() - 0.5) * (metric.value * 0.05)),
        status: metric.value < metric.threshold * 0.8 ? 'warning' : 
                metric.value < metric.threshold * 0.6 ? 'error' : 'healthy'
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Santé du Système
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge 
            className={`${getStatusColor(overallStatus)} ${
              overallStatus === 'healthy' ? 'bg-success/10' :
              overallStatus === 'warning' ? 'bg-warning/10' : 'bg-destructive/10'
            } border-current`}
            variant="outline"
          >
            {getStatusIcon(overallStatus)}
            <span className="ml-1 capitalize">{overallStatus}</span>
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Métriques de santé */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {healthMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{metric.name}</span>
                  </div>
                  <div className={`flex items-center gap-1 ${getStatusColor(metric.status)}`}>
                    {getStatusIcon(metric.status)}
                  </div>
                </div>
                
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-lg font-bold">
                      {typeof metric.value === 'number' ? metric.value.toFixed(metric.unit === '%' ? 1 : 0) : metric.value}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">{metric.unit}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {getTrendIcon(metric.trend)}
                    <span>{metric.last_updated}</span>
                  </div>
                </div>

                {/* Barre de progression */}
                {metric.unit === '%' && (
                  <div className="mt-2">
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          metric.status === 'healthy' ? 'bg-success' :
                          metric.status === 'warning' ? 'bg-warning' : 'bg-destructive'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, metric.value))}%` }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Alertes actives */}
        {activeAlerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Alertes Actives</h4>
            <AnimatePresence>
              {activeAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <Badge variant={getAlertColor(alert.type)} className="mt-0.5">
                    {alert.type}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Dernière mise à jour */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <span>Dernière mise à jour: {lastRefresh}</span>
          <span>Auto-refresh: 30s</span>
        </div>
      </CardContent>
    </Card>
  );
};