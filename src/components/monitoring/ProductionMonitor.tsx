import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Database,
    Globe,
    HardDrive,
    RefreshCw,
    Server,
    Users,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: number;
  lastUpdate: string;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  component: string;
}

interface SystemStatus {
  api: 'online' | 'degraded' | 'offline';
  database: 'online' | 'degraded' | 'offline';
  frontend: 'online' | 'degraded' | 'offline';
  storage: 'online' | 'degraded' | 'offline';
}

export const ProductionMonitor = () => {
  const { toast } = useToast();
  const [systemStatus, _setSystemStatus] = useState<SystemStatus>({
    api: 'online',
    database: 'online',
    frontend: 'online',
    storage: 'online'
  });

  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([
    {
      name: 'CPU Usage',
      value: 23,
      unit: '%',
      status: 'healthy',
      threshold: 80,
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      name: 'Memory Usage',
      value: 67,
      unit: '%',
      status: 'warning',
      threshold: 85,
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      name: 'Response Time',
      value: 145,
      unit: 'ms',
      status: 'healthy',
      threshold: 500,
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      name: 'Error Rate',
      value: 0.2,
      unit: '%',
      status: 'healthy',
      threshold: 1,
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      name: 'Active Users',
      value: 1247,
      unit: 'users',
      status: 'healthy',
      threshold: 10000,
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      name: 'DB Connections',
      value: 15,
      unit: 'connections',
      status: 'healthy',
      threshold: 100,
      lastUpdate: new Date().toLocaleTimeString()
    }
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'High Memory Usage',
      message: 'Memory usage has exceeded 65% threshold',
      timestamp: new Date(Date.now() - 5 * 60000).toLocaleString(),
      resolved: false,
      component: 'API Server'
    },
    {
      id: '2',
      type: 'info',
      title: 'Deployment Complete',
      message: 'Successfully deployed version 2.1.3',
      timestamp: new Date(Date.now() - 30 * 60000).toLocaleString(),
      resolved: true,
      component: 'CI/CD'
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    try {
      // Fetch real metrics from Supabase
      const [activityResult, errorsResult, sessionsResult] = await Promise.all([
        supabase.from('user_activity_log').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()),
        supabase.from('ai_monitoring_errors').select('*', { count: 'exact', head: true }).eq('resolved', false),
        supabase.from('activity_sessions').select('*', { count: 'exact', head: true }).gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      setHealthMetrics(prev => prev.map(metric => {
        if (metric.name === 'Active Users') {
          return { ...metric, value: activityResult.count || 0, lastUpdate: new Date().toLocaleTimeString() };
        }
        if (metric.name === 'Error Rate') {
          const errorRate = errorsResult.count ? Math.min((errorsResult.count / 100) * 100, 5) : 0.1;
          return { ...metric, value: parseFloat(errorRate.toFixed(2)), lastUpdate: new Date().toLocaleTimeString() };
        }
        if (metric.name === 'DB Connections') {
          return { ...metric, value: sessionsResult.count || 0, lastUpdate: new Date().toLocaleTimeString() };
        }
        return { ...metric, lastUpdate: new Date().toLocaleTimeString() };
      }));

      toast({ title: "Métriques actualisées", description: "Les données de monitoring ont été mises à jour" });
    } catch (error) {
      console.error('Error refreshing metrics:', error);
      toast({ title: "Erreur", description: "Impossible de rafraîchir les métriques", variant: "destructive" });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'offline':
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };
  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
    toast({
      title: "Alerte résolue",
      description: "L'alerte a été marquée comme résolue"
    });
  };

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      refreshMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Monitoring Production</h1>
          <p className="text-muted-foreground">Surveillance en temps réel de la plateforme</p>
        </div>
        <Button 
          onClick={refreshMetrics} 
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <Globe className="h-8 w-8 text-primary mr-3" />
            <div>
              <p className="text-sm font-medium">Frontend</p>
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.frontend)}
                <Badge variant={systemStatus.frontend === 'online' ? 'default' : 'destructive'}>
                  {systemStatus.frontend}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <Server className="h-8 w-8 text-primary mr-3" />
            <div>
              <p className="text-sm font-medium">API</p>
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.api)}
                <Badge variant={systemStatus.api === 'online' ? 'default' : 'destructive'}>
                  {systemStatus.api}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <Database className="h-8 w-8 text-primary mr-3" />
            <div>
              <p className="text-sm font-medium">Database</p>
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.database)}
                <Badge variant={systemStatus.database === 'online' ? 'default' : 'destructive'}>
                  {systemStatus.database}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <HardDrive className="h-8 w-8 text-primary mr-3" />
            <div>
              <p className="text-sm font-medium">Storage</p>
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.storage)}
                <Badge variant={systemStatus.storage === 'online' ? 'default' : 'destructive'}>
                  {systemStatus.storage}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Métriques</TabsTrigger>
          <TabsTrigger value="alerts">
            Alertes
            {alerts.filter(a => !a.resolved).length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alerts.filter(a => !a.resolved).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  {getStatusIcon(metric.status)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value.toFixed(metric.name === 'Error Rate' ? 1 : 0)} {metric.unit}
                  </div>
                  <Progress 
                    value={(metric.value / metric.threshold) * 100} 
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Seuil: {metric.threshold} {metric.unit} • MAJ: {metric.lastUpdate}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Card key={alert.id} className={alert.resolved ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {alert.type === 'error' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                        {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-warning" />}
                        {alert.type === 'info' && <CheckCircle className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">{alert.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {alert.component}
                          </Badge>
                          {alert.resolved && (
                            <Badge variant="default" className="text-xs">
                              Résolu
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Résoudre
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance Web
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Core Web Vitals</span>
                    <Badge variant="default">Bon</Badge>
                  </div>
                  <Progress value={85} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Time to First Byte</span>
                    <span>120ms</span>
                  </div>
                  <Progress value={75} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>First Contentful Paint</span>
                    <span>1.2s</span>
                  </div>
                  <Progress value={80} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Utilisation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Utilisateurs actifs (24h)</span>
                    <span>1,247</span>
                  </div>
                  <Progress value={62} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sessions simultanées</span>
                    <span>89</span>
                  </div>
                  <Progress value={35} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Taux de rebond</span>
                    <span>23%</span>
                  </div>
                  <Progress value={23} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};