import React, { useState } from 'react';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Zap,
  HardDrive,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const NewSystemHealth = () => {
  const [systemStats] = useState({
    uptime: '99.9%',
    responseTime: '125ms',
    activeUsers: 1247,
    totalRequests: 45632,
    errorRate: '0.1%',
    cpuUsage: 35,
    memoryUsage: 68,
    diskUsage: 42
  });

  const [services] = useState([
    { name: 'API Principal', status: 'operational', uptime: '99.9%', responseTime: '120ms' },
    { name: 'Base de données', status: 'operational', uptime: '100%', responseTime: '45ms' },
    { name: 'Service d\'authentification', status: 'operational', uptime: '99.8%', responseTime: '85ms' },
    { name: 'CDN', status: 'degraded', uptime: '98.5%', responseTime: '250ms' },
    { name: 'Service de notifications', status: 'operational', uptime: '99.9%', responseTime: '95ms' }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'maintenance': return 'text-blue-600';
      default: return 'text-red-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance': return <Clock className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  const handleRefresh = () => {
    toast.info('Actualisation des données système...');
    setTimeout(() => toast.success('Données mises à jour'), 1000);
  };

  return (
    <ConsistentBackground variant="primary">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="État du Système"
          subtitle="Surveillance en temps réel de la santé et des performances du système"
          icon={Activity}
        />
        <div className="mb-6">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Disponibilité</p>
                  <p className="text-2xl font-bold text-green-600">{systemStats.uptime}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Temps de réponse</p>
                  <p className="text-2xl font-bold">{systemStats.responseTime}</p>
                </div>
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Utilisateurs actifs</p>
                  <p className="text-2xl font-bold">{systemStats.activeUsers.toLocaleString()}</p>
                </div>
                <Wifi className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taux d'erreur</p>
                  <p className="text-2xl font-bold text-green-600">{systemStats.errorRate}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Services Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                État des Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={getStatusColor(service.status)}>
                        {getStatusIcon(service.status)}
                      </div>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Disponibilité: {service.uptime}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={service.status === 'operational' ? 'secondary' : 'destructive'}>
                        {service.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.responseTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Performance du Système
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">CPU</span>
                    <span className="text-sm text-muted-foreground">{systemStats.cpuUsage}%</span>
                  </div>
                  <Progress value={systemStats.cpuUsage} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Mémoire</span>
                    <span className="text-sm text-muted-foreground">{systemStats.memoryUsage}%</span>
                  </div>
                  <Progress value={systemStats.memoryUsage} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Disque</span>
                    <span className="text-sm text-muted-foreground">{systemStats.diskUsage}%</span>
                  </div>
                  <Progress value={systemStats.diskUsage} className="h-2" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">Base de données</p>
                  <p className="text-xs text-muted-foreground">Excellent</p>
                </div>
                <div className="text-center">
                  <HardDrive className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium">Stockage</p>
                  <p className="text-xs text-muted-foreground">Optimal</p>
                </div>
                <div className="text-center">
                  <Wifi className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm font-medium">Réseau</p>
                  <p className="text-xs text-muted-foreground">Stable</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default NewSystemHealth;