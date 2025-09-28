import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  HardDrive, 
  Cpu, 
  MemoryStick,
  Globe,
  Shield,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

/**
 * Système de Monitoring Avancé
 */
export const SystemMonitor = () => {
  const [metrics, setMetrics] = useState({
    cpu: { usage: 45, status: 'healthy' },
    memory: { usage: 67, total: 16, used: 10.7, status: 'healthy' },
    storage: { usage: 78, total: 500, used: 390, status: 'warning' },
    network: { inbound: 125, outbound: 89, status: 'healthy' },
    database: { connections: 23, maxConnections: 100, responseTime: 12, status: 'healthy' },
    api: { requests: 1247, errors: 3, latency: 120, status: 'healthy' }
  });

  const [services, setServices] = useState([
    { name: 'API Principal', status: 'online', uptime: '99.9%', lastCheck: '30s' },
    { name: 'Base de Données', status: 'online', uptime: '100%', lastCheck: '15s' },
    { name: 'Service Audio', status: 'online', uptime: '98.7%', lastCheck: '45s' },
    { name: 'Authentification', status: 'online', uptime: '99.8%', lastCheck: '20s' },
    { name: 'Stockage Fichiers', status: 'maintenance', uptime: '95.2%', lastCheck: '2m' },
    { name: 'Email Service', status: 'online', uptime: '99.5%', lastCheck: '1m' }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshMetrics = () => {
    setIsRefreshing(true);
    // Simuler un refresh des métriques
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        cpu: { ...prev.cpu, usage: Math.random() * 80 + 10 },
        memory: { ...prev.memory, usage: Math.random() * 40 + 30 },
        api: { ...prev.api, latency: Math.random() * 100 + 50 }
      }));
      setIsRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'offline': case 'error': return 'text-destructive';
      case 'maintenance': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'online': case 'healthy': 
        return <Badge className="bg-success/10 text-success">En ligne</Badge>;
      case 'warning': 
        return <Badge className="bg-warning/10 text-warning">Attention</Badge>;
      case 'offline': case 'error': 
        return <Badge className="bg-destructive/10 text-destructive">Hors ligne</Badge>;
      case 'maintenance': 
        return <Badge className="bg-primary/10 text-primary">Maintenance</Badge>;
      default: 
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Monitoring Système</h1>
          <p className="text-muted-foreground">Surveillance en temps réel de la plateforme</p>
        </div>
        <Button 
          onClick={refreshMetrics} 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Métriques Système */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="medical-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU</CardTitle>
                <Cpu className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.cpu.usage.toFixed(1)}%</div>
                <Progress value={metrics.cpu.usage} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">Utilisation processeur</p>
              </CardContent>
            </Card>

            <Card className="medical-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mémoire</CardTitle>
                <MemoryStick className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.memory.usage.toFixed(1)}%</div>
                <Progress value={metrics.memory.usage} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.memory.used}GB / {metrics.memory.total}GB
                </p>
              </CardContent>
            </Card>

            <Card className="medical-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stockage</CardTitle>
                <HardDrive className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.storage.usage}%</div>
                <Progress value={metrics.storage.usage} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.storage.used}GB / {metrics.storage.total}GB
                </p>
              </CardContent>
            </Card>

            <Card className="medical-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API</CardTitle>
                <Zap className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.api.latency}ms</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.api.requests} requêtes · {metrics.api.errors} erreurs
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques de Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Activité Réseau
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Entrant</span>
                  <span className="font-mono text-sm">{metrics.network.inbound} MB/s</span>
                </div>
                <Progress value={(metrics.network.inbound / 200) * 100} />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sortant</span>
                  <span className="font-mono text-sm">{metrics.network.outbound} MB/s</span>
                </div>
                <Progress value={(metrics.network.outbound / 200) * 100} />
              </CardContent>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Base de Données
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Connexions Actives</span>
                  <span className="font-mono text-sm">
                    {metrics.database.connections}/{metrics.database.maxConnections}
                  </span>
                </div>
                <Progress value={(metrics.database.connections / metrics.database.maxConnections) * 100} />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Temps de Réponse</span>
                  <span className="font-mono text-sm">{metrics.database.responseTime}ms</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                État des Services
              </CardTitle>
              <CardDescription>
                Monitoring des services critiques de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        service.status === 'online' ? 'bg-success animate-pulse' :
                        service.status === 'maintenance' ? 'bg-warning' :
                        'bg-destructive'
                      }`} />
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Dernier check: {service.lastCheck} · Uptime: {service.uptime}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(service.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">SSL/TLS</span>
                  <Badge className="bg-success/10 text-success">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Actif
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pare-feu</span>
                  <Badge className="bg-success/10 text-success">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Actif
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Anti-DDoS</span>
                  <Badge className="bg-success/10 text-success">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Actif
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Audit Logs</span>
                  <Badge className="bg-success/10 text-success">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Actif
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Trafic Global
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">12,347</div>
                <p className="text-sm text-muted-foreground mb-4">Requêtes aujourd'hui</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Succès (2xx)</span>
                    <span>98.7%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Erreurs client (4xx)</span>
                    <span>1.1%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Erreurs serveur (5xx)</span>
                    <span>0.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemMonitor;