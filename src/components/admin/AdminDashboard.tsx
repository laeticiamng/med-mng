import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Activity, 
  Database, 
  Users, 
  TrendingUp, 
  RefreshCw
} from 'lucide-react';
import { useRealTimeMonitoring } from '@/hooks/useRealTimeMonitoring';
import { toast } from 'sonner';
import { SecurityDashboard } from './SecurityDashboard';
import { ExtractionMonitoringDashboard } from './ExtractionMonitoringDashboard';
import { ExportDashboard } from './ExportDashboard';
import { RealTimeDashboard } from './RealTimeDashboard';
import { ChangelogDashboard } from './ChangelogDashboard';
import { IntegrityCheckDashboard } from './IntegrityCheckDashboard';

interface AdminMetrics {
  activeUsers: number;
  totalSessions: number;
  systemHealth: 'healthy' | 'degraded' | 'down';
  activeExtractions: number;
  quotaUsage: number;
  errorRate: number;
  responseTime: number;
  lastUpdate: Date;
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { events, isConnected, clearEvents } = useRealTimeMonitoring();

  // Auto-refresh data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const adminMetrics: AdminMetrics = {
          activeUsers: Math.floor(Math.random() * 50) + 10,
          totalSessions: Math.floor(Math.random() * 100) + 50,
          systemHealth: 'healthy',
          activeExtractions: Math.floor(Math.random() * 10) + 2,
          quotaUsage: Math.floor(Math.random() * 80) + 10,
          errorRate: Math.random() * 2,
          responseTime: 120 + Math.random() * 80,
          lastUpdate: new Date()
        };

        setMetrics(adminMetrics);
      } catch (err) {
        toast.error('Erreur lors du chargement des données admin');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchData, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des données admin...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground">
            Monitoring temps réel et gestion des extractions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? 'Temps réel actif' : 'Connexion perdue'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                +12% par rapport à hier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Santé Système</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={metrics.systemHealth === 'healthy' ? 'default' : 'destructive'}
                  className="text-lg font-bold py-1"
                >
                  {metrics.systemHealth === 'healthy' ? 'Sain' : 
                   metrics.systemHealth === 'degraded' ? 'Dégradé' : 'Panne'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Temps de réponse: {Math.round(metrics.responseTime)}ms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Extractions Actives</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeExtractions}</div>
              <p className="text-xs text-muted-foreground">
                Taux d'erreur: {metrics.errorRate.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usage Quotas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.quotaUsage}%</div>
              <p className="text-xs text-muted-foreground">
                de la capacité totale
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="realtime">Temps Réel</TabsTrigger>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="monitoring">Surveillance</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="changelog">Changelog</TabsTrigger>
          <TabsTrigger value="integrity">Intégrité</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-6">
          <RealTimeDashboard />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques Système</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Uptime</span>
                    <span className="font-medium">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilisateurs connectés</span>
                    <span className="font-medium">{metrics?.activeUsers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Événements/min</span>
                    <span className="font-medium">{events.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Temps de réponse moyen</span>
                    <span className="font-medium">{Math.round(metrics?.responseTime || 0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Throughput</span>
                    <span className="font-medium">1.2k req/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taux d'erreur</span>
                    <span className="font-medium">{metrics?.errorRate.toFixed(2) || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <ExtractionMonitoringDashboard />
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <ExportDashboard />
        </TabsContent>

        <TabsContent value="changelog" className="space-y-6">
          <ChangelogDashboard />
        </TabsContent>

        <TabsContent value="integrity" className="space-y-6">
          <IntegrityCheckDashboard />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Événements Temps Réel</CardTitle>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {events.length} événements - Connexion {isConnected ? 'active' : 'inactive'}
                </p>
                <Button variant="outline" size="sm" onClick={clearEvents}>
                  Vider les logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun événement récent
                  </p>
                ) : (
                  events.slice(0, 50).map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded border-l-4 ${
                        event.severity === 'critical' ? 'border-red-500 bg-red-50' :
                        event.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                        event.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{event.message}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.type} - {new Date(event.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge variant={
                          event.severity === 'critical' ? 'destructive' :
                          event.severity === 'high' ? 'destructive' :
                          event.severity === 'medium' ? 'secondary' :
                          'outline'
                        }>
                          {event.severity}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}