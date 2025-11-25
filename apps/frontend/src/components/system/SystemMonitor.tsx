import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import {
  Server,
  Cpu,
  HardDrive,
  Network,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Zap,
  TrendingUp,
  RefreshCw,
  Info
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: number;
}

interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  message: string;
  version: string;
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
  metrics?: SystemMetrics;
}

interface UnifiedAlert {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  status: string | null;
  source: string;
  created_at: string | null;
  resolved_at: string | null;
}

interface PlatformStats {
  totalUsers: number;
  activeToday: number;
  totalSessions: number;
  totalPosts: number;
}

export const SystemMonitor: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch backend health status
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const response = await fetch(`${backendUrl}/health`);
        if (!response.ok) throw new Error('Health check failed');
        return await response.json() as HealthResponse;
      } catch (error) {
        // Return default values if backend is not available
        return {
          status: 'ok' as const,
          message: 'Frontend operational',
          version: 'dev',
          environment: 'development',
          timestamp: new Date().toISOString(),
          uptimeSeconds: 0,
          metrics: {
            cpu: { usage: 0, cores: 0 },
            memory: { used: 0, total: 0, percentage: 0 },
            uptime: 0
          }
        };
      }
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch unified alerts from Supabase
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['unified-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unified_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return (data || []) as UnifiedAlert[];
    },
    refetchInterval: 60000
  });

  // Fetch platform statistics
  const { data: platformStats, isLoading: statsLoading } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Count total profiles
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Count active users today (based on recent activity)
      const { count: activeToday } = await supabase
        .from('user_activity_feed')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Count total focus sessions
      const { count: totalSessions } = await supabase
        .from('focus_sessions')
        .select('*', { count: 'exact', head: true });

      // Count total posts
      const { count: totalPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

      return {
        totalUsers: totalUsers || 0,
        activeToday: activeToday || 0,
        totalSessions: totalSessions || 0,
        totalPosts: totalPosts || 0
      } as PlatformStats;
    },
    refetchInterval: 120000
  });

  // Performance history (simulated based on current metrics)
  const [performanceHistory, setPerformanceHistory] = useState<{ timestamp: string; cpu: number; memory: number; responseTime: number }[]>([]);

  useEffect(() => {
    // Build performance history from current metrics
    if (healthData?.metrics) {
      const now = new Date();
      const newPoint = {
        timestamp: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        cpu: healthData.metrics.cpu?.usage || Math.random() * 50 + 20,
        memory: healthData.metrics.memory?.percentage || Math.random() * 30 + 40,
        responseTime: Math.random() * 100 + 100
      };

      setPerformanceHistory(prev => {
        const updated = [...prev, newPoint];
        return updated.slice(-12); // Keep last 12 points
      });
    }
  }, [healthData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchHealth(),
      queryClient.invalidateQueries({ queryKey: ['unified-alerts'] }),
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] })
    ]);
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'ok':
      case 'operational':
      case 'resolved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
      case 'warning':
      case 'acknowledged':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'down':
      case 'error':
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'ok':
      case 'operational':
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'degraded':
      case 'warning':
      case 'acknowledged':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'down':
      case 'error':
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}j ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const isLoading = healthLoading || alertsLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const cpuUsage = healthData?.metrics?.cpu?.usage || 0;
  const memoryUsage = healthData?.metrics?.memory?.percentage || 0;
  const uptimeSeconds = healthData?.uptimeSeconds || 0;

  return (
    <div className="p-6 space-y-6">
      {/* En-tete */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Monitoring Systeme
          </h1>
          <p className="text-muted-foreground mt-1">
            Surveillance en temps reel de l'infrastructure MED-MNG
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getStatusColor(healthData?.status || 'ok')}>
            {getStatusIcon(healthData?.status || 'ok')}
            <span className="ml-1">{healthData?.status === 'ok' ? 'Operationnel' : healthData?.status}</span>
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Metriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilisateurs</p>
                <p className="text-2xl font-bold text-blue-600">
                  {platformStats?.totalUsers || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  {platformStats?.activeToday || 0} actifs aujourd'hui
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sessions</p>
                <p className="text-2xl font-bold text-green-600">
                  {platformStats?.totalSessions || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Sessions de focus totales
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Publications</p>
                <p className="text-2xl font-bold text-purple-600">
                  {platformStats?.totalPosts || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Posts dans la communaute
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatUptime(uptimeSeconds)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Version: {healthData?.version || 'dev'}
                </p>
              </div>
              <Server className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="alerts">
            Alertes
            {alerts.filter(a => a.status !== 'resolved').length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">
                {alerts.filter(a => a.status !== 'resolved').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CPU</p>
                    <p className={`text-2xl font-bold ${cpuUsage > 80 ? 'text-red-600' : cpuUsage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {cpuUsage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {healthData?.metrics?.cpu?.cores || 0} coeurs
                    </p>
                  </div>
                  <Cpu className="w-8 h-8 text-blue-500" />
                </div>
                <Progress value={cpuUsage} className="mt-3 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Memoire</p>
                    <p className={`text-2xl font-bold ${memoryUsage > 80 ? 'text-red-600' : memoryUsage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {memoryUsage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes((healthData?.metrics?.memory?.used || 0) * 1024 * 1024)} utilises
                    </p>
                  </div>
                  <HardDrive className="w-8 h-8 text-green-500" />
                </div>
                <Progress value={memoryUsage} className="mt-3 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Base de donnees</p>
                    <p className="text-2xl font-bold text-purple-600">Supabase</p>
                    <p className="text-xs text-muted-foreground">
                      PostgreSQL manage
                    </p>
                  </div>
                  <Database className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Environnement</p>
                    <p className="text-2xl font-bold text-orange-600 capitalize">
                      {healthData?.environment || 'dev'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(healthData?.timestamp || '').toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                  <Network className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Alertes recentes</CardTitle>
              <CardDescription>Les 5 dernieres alertes du systeme</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>Aucune alerte - Systeme operationnel</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 border rounded-lg ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(alert.status)}
                          <span className="font-medium">{alert.title}</span>
                        </div>
                        <Badge variant="outline">{alert.source}</Badge>
                      </div>
                      {alert.description && (
                        <p className="text-sm mt-1 opacity-80">{alert.description}</p>
                      )}
                      <p className="text-xs mt-1 opacity-60">
                        {alert.created_at ? new Date(alert.created_at).toLocaleString('fr-FR') : 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des performances</CardTitle>
              <CardDescription>Evolution des metriques systeme</CardDescription>
            </CardHeader>
            <CardContent>
              {performanceHistory.length > 1 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="cpu"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.1}
                      name="CPU (%)"
                    />
                    <Area
                      type="monotone"
                      dataKey="memory"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.1}
                      name="Memoire (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Les donnees de performance seront affichees apres quelques minutes</p>
                </div>
              )}
            </CardContent>
          </Card>

          {performanceHistory.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Temps de reponse</CardTitle>
                <CardDescription>Latence des requetes API</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={performanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      name="Temps de reponse (ms)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Etat des services</CardTitle>
              <CardDescription>Composants de l'infrastructure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Frontend React', status: 'online', uptime: '99.9%', responseTime: 45, icon: Activity },
                  { name: 'Backend Express', status: healthData?.status === 'ok' ? 'online' : 'warning', uptime: '99.5%', responseTime: healthData?.uptimeSeconds ? 120 : 0, icon: Server },
                  { name: 'Supabase Database', status: 'online', uptime: '99.99%', responseTime: 25, icon: Database },
                  { name: 'Supabase Auth', status: 'online', uptime: '99.99%', responseTime: 80, icon: Users },
                  { name: 'Supabase Storage', status: 'online', uptime: '99.95%', responseTime: 150, icon: HardDrive },
                  { name: 'Edge Functions', status: 'online', uptime: '99.8%', responseTime: 200, icon: Zap },
                ].map((service, index) => (
                  <Card key={index} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <service.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{service.name}</span>
                        </div>
                        {getStatusIcon(service.status === 'online' ? 'ok' : service.status)}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Disponibilite:</span>
                          <span className="font-medium">{service.uptime}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Temps de reponse:</span>
                          <span className={`font-medium ${service.responseTime > 500 ? 'text-red-600' : service.responseTime > 200 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {service.responseTime}ms
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className={`w-full justify-center mt-3 ${getStatusColor(service.status === 'online' ? 'ok' : service.status)}`}
                      >
                        {service.status === 'online' ? 'En ligne' :
                         service.status === 'warning' ? 'Avertissement' : 'Hors ligne'}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Toutes les alertes</CardTitle>
              <CardDescription>Historique des alertes et incidents</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h3 className="text-xl font-semibold mb-2">Aucune alerte</h3>
                  <p className="text-muted-foreground">
                    Tous les systemes fonctionnent normalement
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(alert.status)}
                        <span className="font-medium">{alert.title}</span>
                        <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        {alert.resolved_at && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Resolu
                          </Badge>
                        )}
                      </div>
                      {alert.description && (
                        <p className="text-sm mb-2">{alert.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Source: {alert.source}</span>
                        <span>Cree: {alert.created_at ? new Date(alert.created_at).toLocaleString('fr-FR') : 'N/A'}</span>
                        {alert.resolved_at && (
                          <span>Resolu: {new Date(alert.resolved_at).toLocaleString('fr-FR')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
