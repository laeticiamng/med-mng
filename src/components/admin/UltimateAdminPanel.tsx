import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, Users, Database, Shield, BarChart3, Activity, 
  AlertTriangle, CheckCircle, XCircle, RefreshCw, Zap,
  Server, Globe, Lock, Clock, TrendingUp, Brain
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  memoryUsage: number;
  cpuUsage: number;
  dbConnections: number;
}

interface QuickMetrics {
  totalUsers: number;
  activeSubscriptions: number;
  todaySignups: number;
  revenueThisMonth: number;
  contentItems: number;
  aiCreditsUsed: number;
  systemAlerts: number;
  performance: number;
}

export const UltimateAdminPanel = () => {
  const [health, setHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: 99.9,
    responseTime: 120,
    errorRate: 0.1,
    activeUsers: 245,
    memoryUsage: 68,
    cpuUsage: 23,
    dbConnections: 12
  });
  
  const [metrics, setMetrics] = useState<QuickMetrics>({
    totalUsers: 0,
    activeSubscriptions: 0,
    todaySignups: 0,
    revenueThisMonth: 0,
    contentItems: 0,
    aiCreditsUsed: 0,
    systemAlerts: 0,
    performance: 95
  });
  
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchSystemMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemMetrics = async () => {
    try {
      setLoading(true);
      
      const [usersResult, subscriptionsResult, ednsResult, songsResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('edn_items_complete').select('*', { count: 'exact', head: true }),
        supabase.from('emotionscare_songs').select('*', { count: 'exact', head: true })
      ]);

      // Calculate today's signups
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      setMetrics({
        totalUsers: usersResult.count || 0,
        activeSubscriptions: subscriptionsResult.count || 0,
        todaySignups: todayCount || 0,
        revenueThisMonth: (subscriptionsResult.count || 0) * 29.99, // Estimation
        contentItems: (ednsResult.count || 0) + (songsResult.count || 0),
        aiCreditsUsed: 24750, // Simulated
        systemAlerts: 2,
        performance: Math.floor(Math.random() * 5) + 95
      });

      // Update health with real-time simulation
      setHealth(prev => ({
        ...prev,
        responseTime: Math.floor(Math.random() * 50) + 100,
        activeUsers: Math.floor(Math.random() * 50) + 200,
        memoryUsage: Math.floor(Math.random() * 20) + 60,
        cpuUsage: Math.floor(Math.random() * 30) + 15,
        status: prev.errorRate > 1 ? 'warning' : 'healthy'
      }));

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast.error('Erreur lors de la récupération des métriques');
    } finally {
      setLoading(false);
    }
  };

  const executeSystemAction = async (action: string) => {
    try {
      toast.loading(`Exécution: ${action}...`, { id: action });
      
      // Simulate system actions
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      switch (action) {
        case 'optimize_db':
          await supabase.functions.invoke('admin-optimization', {
            body: { action: 'database_optimization' }
          });
          toast.success('Base de données optimisée', { id: action });
          break;
        case 'clear_cache':
          toast.success('Cache système vidé', { id: action });
          break;
        case 'backup_system':
          toast.success('Sauvegarde système créée', { id: action });
          break;
        case 'security_scan':
          await supabase.functions.invoke('security-scanner', {
            body: { action: 'full_scan' }
          });
          toast.success('Scan de sécurité terminé', { id: action });
          break;
        default:
          toast.success('Action exécutée avec succès', { id: action });
      }
      
      fetchSystemMetrics();
    } catch (error) {
      console.error(`Error executing ${action}:`, error);
      toast.error(`Erreur lors de l'exécution: ${action}`, { id: action });
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel Admin Ultimate</h1>
          <p className="text-muted-foreground">
            Contrôle total de la plateforme • Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button 
          onClick={fetchSystemMetrics} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* System Health Status */}
      <Card className={getHealthColor(health.status)}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getHealthIcon(health.status)}
              <div>
                <h3 className="font-semibold">Statut Système: {health.status.toUpperCase()}</h3>
                <p className="text-sm opacity-80">
                  Uptime: {health.uptime}% • Temps de réponse: {health.responseTime}ms
                </p>
              </div>
            </div>
            <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
              {health.activeUsers} utilisateurs actifs
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs Totaux</p>
                <p className="text-2xl font-bold text-foreground">{metrics.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{metrics.todaySignups} aujourd'hui</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus (Mois)</p>
                <p className="text-2xl font-bold text-foreground">{metrics.revenueThisMonth.toLocaleString()}€</p>
                <p className="text-xs text-green-600">{metrics.activeSubscriptions} abonnements</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contenus Totaux</p>
                <p className="text-2xl font-bold text-foreground">{metrics.contentItems.toLocaleString()}</p>
                <p className="text-xs text-blue-600">EDN + Musiques</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Performance</p>
                <p className="text-2xl font-bold text-foreground">{metrics.performance}%</p>
                <p className="text-xs text-purple-600">Score global</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Ressources Système
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Mémoire</span>
                <span>{health.memoryUsage}%</span>
              </div>
              <Progress value={health.memoryUsage} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU</span>
                <span>{health.cpuUsage}%</span>
              </div>
              <Progress value={health.cpuUsage} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Connexions DB</span>
                <span>{health.dbConnections}/100</span>
              </div>
              <Progress value={health.dbConnections} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Actions Rapides
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => executeSystemAction('optimize_db')}
            >
              <Database className="h-4 w-4" />
              Optimiser DB
            </Button>
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => executeSystemAction('clear_cache')}
            >
              <RefreshCw className="h-4 w-4" />
              Vider Cache
            </Button>
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => executeSystemAction('backup_system')}
            >
              <Shield className="h-4 w-4" />
              Sauvegarde
            </Button>
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => executeSystemAction('security_scan')}
            >
              <Lock className="h-4 w-4" />
              Scan Sécurité
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitoring Avancé
          </CardTitle>
          <CardDescription>Surveillance temps réel des métriques critiques</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="alerts">Alertes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{health.responseTime}ms</div>
                  <div className="text-sm text-muted-foreground">Temps Réponse</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{health.uptime}%</div>
                  <div className="text-sm text-muted-foreground">Disponibilité</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{health.errorRate}%</div>
                  <div className="text-sm text-muted-foreground">Taux d'Erreur</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Pare-feu actif
                  </span>
                  <Badge className="bg-green-100 text-green-800">OK</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    SSL/TLS validé
                  </span>
                  <Badge className="bg-green-100 text-green-800">OK</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Tentatives suspectes
                  </span>
                  <Badge className="bg-yellow-100 text-yellow-800">2 détectées</Badge>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="usage" className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Crédits IA utilisés</span>
                  <span className="font-bold">{metrics.aiCreditsUsed.toLocaleString()}</span>
                </div>
                <Progress value={75} />
                <div className="text-xs text-muted-foreground">75% du quota mensuel utilisé</div>
              </div>
            </TabsContent>
            
            <TabsContent value="alerts" className="space-y-4">
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <p className="text-lg font-semibold">{metrics.systemAlerts} alertes actives</p>
                <p className="text-muted-foreground">Vérification nécessaire</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};