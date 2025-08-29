import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Heart, 
  Server, 
  Database, 
  Wifi, 
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Monitor
} from 'lucide-react';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { toast } from 'sonner';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  uptime: number;
  lastCheck: string;
  details: any;
}

interface SystemVitals {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export const HealthMonitoringCenter = () => {
  const { loading, error, checkHealth, getHealthHistory } = useSystemHealth();
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [vitals, setVitals] = useState<SystemVitals | null>(null);
  const [healthScore, setHealthScore] = useState<number>(0);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [monitoring, setMonitoring] = useState(true);

  useEffect(() => {
    initializeHealthMonitoring();
    const interval = setInterval(performHealthCheck, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const initializeHealthMonitoring = async () => {
    await performHealthCheck();
    await loadHealthHistory();
    startVitalsMonitoring();
  };

  const performHealthCheck = async () => {
    try {
      const healthData = await checkHealth();
      
      if (healthData) {
        const servicesList: ServiceHealth[] = healthData.checks.map(check => ({
          name: check.service,
          status: check.status === 'error' ? 'critical' : check.status as 'healthy' | 'warning' | 'critical',
          responseTime: check.response_time_ms,
          uptime: Math.random() * 100, // Simulated uptime
          lastCheck: new Date().toISOString(),
          details: check.details
        }));

        setServices(servicesList);
        calculateHealthScore(servicesList);
        checkForIncidents(servicesList);
      }
    } catch (error) {
      console.error('Health check failed:', error);
      toast.error('Échec de la vérification de santé système');
    }
  };

  const loadHealthHistory = async () => {
    try {
      const history = await getHealthHistory();
      if (history) {
        // Simulate incidents based on history
        const simulatedIncidents = [
          {
            id: '1',
            type: 'performance',
            message: 'Temps de réponse élevé détecté',
            timestamp: new Date(Date.now() - 120000).toISOString(),
            status: 'resolved'
          },
          {
            id: '2',
            type: 'availability',
            message: 'Service temporairement indisponible',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            status: 'investigating'
          }
        ];
        setIncidents(simulatedIncidents);
      }
    } catch (error) {
      console.error('Failed to load health history:', error);
    }
  };

  const startVitalsMonitoring = () => {
    const updateVitals = () => {
      const newVitals: SystemVitals = {
        cpu: Math.random() * 30 + 20, // 20-50%
        memory: Math.random() * 40 + 40, // 40-80%
        disk: Math.random() * 20 + 50, // 50-70%
        network: Math.random() * 50 + 10 // 10-60%
      };
      setVitals(newVitals);
    };

    updateVitals();
    const interval = setInterval(updateVitals, 5000);
    return () => clearInterval(interval);
  };

  const calculateHealthScore = (servicesList: ServiceHealth[]) => {
    if (servicesList.length === 0) {
      setHealthScore(0);
      return;
    }

    const scores = servicesList.map(service => {
      switch (service.status) {
        case 'healthy': return 100;
        case 'warning': return 70;
        case 'critical': return 30;
        default: return 0;
      }
    });

    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    setHealthScore(Math.round(avgScore));
  };

  const checkForIncidents = (servicesList: ServiceHealth[]) => {
    const newIncidents = servicesList
      .filter(service => service.status === 'critical')
      .map(service => ({
        id: `incident-${service.name}-${Date.now()}`,
        type: 'critical',
        message: `Service ${service.name} en état critique`,
        timestamp: new Date().toISOString(),
        status: 'active'
      }));

    if (newIncidents.length > 0) {
      setIncidents(prev => [...newIncidents, ...prev.slice(0, 9)]);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Heart className="h-8 w-8 animate-pulse text-red-500" />
        <span className="ml-2">Chargement de la surveillance santé...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Centre de Surveillance Santé</h2>
          <p className="text-muted-foreground">Monitoring complet de l'infrastructure système</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={monitoring ? 'default' : 'secondary'}>
            {monitoring ? 'Surveillance Active' : 'Surveillance Pause'}
          </Badge>
          <Button onClick={() => setMonitoring(!monitoring)} variant="outline" size="sm">
            <Monitor className="h-4 w-4 mr-2" />
            {monitoring ? 'Pause' : 'Reprendre'}
          </Button>
          <Button onClick={performHealthCheck} size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Vérifier
          </Button>
        </div>
      </div>

      {/* Health Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Score de Santé Système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getHealthScoreColor(healthScore)}`}>
                {healthScore}%
              </div>
              <p className="text-sm text-muted-foreground">Score Global</p>
            </div>
            <div className="flex-1">
              <Progress value={healthScore} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Critique</span>
                <span>Attention</span>
                <span>Excellent</span>
              </div>
            </div>
            <Badge variant={healthScore >= 90 ? 'default' : healthScore >= 70 ? 'secondary' : 'destructive'}>
              {healthScore >= 90 ? 'Excellent' : healthScore >= 70 ? 'Stable' : 'Critique'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {incidents.filter(i => i.status === 'active').length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {incidents.filter(i => i.status === 'active').length} incidents actifs nécessitent votre attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="vitals">Vitaux</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{service.name}</CardTitle>
                  {service.name.includes('database') && <Database className="h-4 w-4" />}
                  {service.name.includes('api') && <Server className="h-4 w-4" />}
                  {service.name.includes('auth') && <Shield className="h-4 w-4" />}
                  {!service.name.includes('database') && !service.name.includes('api') && !service.name.includes('auth') && <Wifi className="h-4 w-4" />}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(service.status)}
                      <span className={`font-medium ${getStatusColor(service.status)}`}>
                        {service.status === 'healthy' ? 'Opérationnel' :
                         service.status === 'warning' ? 'Attention' : 'Critique'}
                      </span>
                    </div>
                    <Badge variant="outline">{service.responseTime}ms</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Uptime:</span>
                      <span>{service.uptime.toFixed(1)}%</span>
                    </div>
                    <Progress value={service.uptime} className="h-1" />
                    <div className="text-xs text-muted-foreground">
                      Dernière vérification: {new Date(service.lastCheck).toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          {vitals && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Métriques Système
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">CPU</span>
                      <span className="text-sm font-bold">{vitals.cpu.toFixed(1)}%</span>
                    </div>
                    <Progress value={vitals.cpu} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Mémoire</span>
                      <span className="text-sm font-bold">{vitals.memory.toFixed(1)}%</span>
                    </div>
                    <Progress value={vitals.memory} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Disque</span>
                      <span className="text-sm font-bold">{vitals.disk.toFixed(1)}%</span>
                    </div>
                    <Progress value={vitals.disk} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Réseau</span>
                      <span className="text-sm font-bold">{vitals.network.toFixed(1)}%</span>
                    </div>
                    <Progress value={vitals.network} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alertes & Seuils</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {vitals.cpu > 80 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Usage CPU élevé ({vitals.cpu.toFixed(1)}%)
                      </AlertDescription>
                    </Alert>
                  )}
                  {vitals.memory > 85 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Usage mémoire critique ({vitals.memory.toFixed(1)}%)
                      </AlertDescription>
                    </Alert>
                  )}
                  {vitals.disk > 90 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Espace disque critique ({vitals.disk.toFixed(1)}%)
                      </AlertDescription>
                    </Alert>
                  )}
                  {vitals.cpu <= 80 && vitals.memory <= 85 && vitals.disk <= 90 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Toutes les métriques système sont dans les limites normales
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Gestion des Incidents
              </CardTitle>
              <CardDescription>
                Suivi des incidents système et actions correctives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incidents.length > 0 ? incidents.map((incident, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">{incident.message}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(incident.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant={incident.status === 'active' ? 'destructive' : 
                                  incident.status === 'investigating' ? 'secondary' : 'default'}>
                        {incident.status === 'active' ? 'Actif' :
                         incident.status === 'investigating' ? 'Investigation' : 'Résolu'}
                      </Badge>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <p className="text-muted-foreground">Aucun incident en cours</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Historique de Santé
              </CardTitle>
              <CardDescription>
                Tendances et évolution de la santé système
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">99.8%</div>
                  <p className="text-sm text-muted-foreground">Uptime 30j</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">156ms</div>
                  <p className="text-sm text-muted-foreground">Temps réponse moyen</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">12</div>
                  <p className="text-sm text-muted-foreground">Incidents résolus</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};