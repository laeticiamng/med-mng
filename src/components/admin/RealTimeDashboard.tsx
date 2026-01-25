import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealTimeMonitoring } from '@/hooks/useRealTimeMonitoring';
import { supabase } from '@/integrations/supabase/client';
import {
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    Download,
    Users,
    XCircle,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface MetricCard {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  api: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
}

export const RealTimeDashboard = () => {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [systemHealth] = useState<SystemHealth>({
    database: 'healthy',
    api: 'healthy',
    storage: 'healthy'
  });
  const [liveStats, setLiveStats] = useState({
    activeUsers: 0,
    totalExtractions: 0,
    errorRate: 0,
    responseTime: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const { isConnected } = useRealTimeMonitoring();

  // Simuler des données temps réel
  useEffect(() => {
    const updateMetrics = () => {
      const baseUsers = 15;
      const baseExtractions = 1247;
      
      setLiveStats({
        activeUsers: baseUsers + Math.floor(Math.random() * 10),
        totalExtractions: baseExtractions + Math.floor(Math.random() * 5),
        errorRate: Math.random() * 2,
        responseTime: 120 + Math.random() * 80
      });

      setMetrics([
        {
          title: 'Utilisateurs Actifs',
          value: liveStats.activeUsers,
          change: '+2.3%',
          icon: <Users className="h-4 w-4" />,
          status: 'success'
        },
        {
          title: 'Extractions Totales',
          value: liveStats.totalExtractions.toLocaleString(),
          change: '+12.1%',
          icon: <Download className="h-4 w-4" />,
          status: 'info'
        },
        {
          title: 'Taux d\'Erreur',
          value: `${liveStats.errorRate.toFixed(1)}%`,
          change: '-0.5%',
          icon: <AlertTriangle className="h-4 w-4" />,
          status: liveStats.errorRate < 1 ? 'success' : 'warning'
        },
        {
          title: 'Temps de Réponse',
          value: `${Math.round(liveStats.responseTime)}ms`,
          change: '-15ms',
          icon: <Zap className="h-4 w-4" />,
          status: liveStats.responseTime < 200 ? 'success' : 'warning'
        }
      ]);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, [liveStats]);

  // Récupérer l'activité récente
  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const { _data, _error } = await supabase
          .from('operation_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (!_error && _data) {
          setRecentActivity(_data);
        }
      } catch (err) {
        console.error('Erreur récupération activité:', err);
      }
    };

    fetchRecentActivity();
    const interval = setInterval(fetchRecentActivity, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-destructive';
      default: return 'text-primary';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec status de connexion */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Temps Réel</h1>
          <p className="text-muted-foreground">
            Surveillance en direct des performances système
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-success' : 'bg-destructive'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connecté' : 'Déconnecté'}
          </span>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={getStatusColor(metric.status)}>
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.change && (
                <p className="text-xs text-muted-foreground">
                  <span className={metric.change.startsWith('+') ? 'text-success' : 'text-destructive'}>
                    {metric.change}
                  </span>
                  {' '}depuis la dernière heure
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Santé du système */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Santé du Système
            </CardTitle>
            <CardDescription>
              État en temps réel des composants critiques
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getHealthIcon(systemHealth.database)}
                <span>Base de données</span>
              </div>
              <Badge variant={systemHealth.database === 'healthy' ? 'default' : 'destructive'}>
                {systemHealth.database === 'healthy' ? 'Opérationnel' : 'Problème'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getHealthIcon(systemHealth.api)}
                <span>API Services</span>
              </div>
              <Badge variant={systemHealth.api === 'healthy' ? 'default' : 'destructive'}>
                {systemHealth.api === 'healthy' ? 'Opérationnel' : 'Problème'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getHealthIcon(systemHealth.storage)}
                <span>Stockage</span>
              </div>
              <Badge variant={systemHealth.storage === 'healthy' ? 'default' : 'destructive'}>
                {systemHealth.storage === 'healthy' ? 'Opérationnel' : 'Problème'}
              </Badge>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Charge CPU</span>
                <span>23%</span>
              </div>
              <Progress value={23} className="h-2" />
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Utilisation Mémoire</span>
                <span>67%</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activité Récente
            </CardTitle>
            <CardDescription>
              Dernières opérations système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes système */}
      {liveStats.errorRate > 1.5 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Taux d'erreur élevé détecté ({liveStats.errorRate.toFixed(1)}%). 
            Surveillance renforcée recommandée.
          </AlertDescription>
        </Alert>
      )}

      {/* Onglets détaillés */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="extractions">Extractions</TabsTrigger>
          <TabsTrigger value="errors">Erreurs</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métriques de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {Math.round(liveStats.responseTime)}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Temps de réponse moyen</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">99.8%</div>
                  <div className="text-sm text-muted-foreground">Disponibilité</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">2.3s</div>
                  <div className="text-sm text-muted-foreground">Temps de chargement</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">156</div>
                  <div className="text-sm text-muted-foreground">Requêtes/min</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activité Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Utilisateurs connectés</span>
                  <Badge>{liveStats.activeUsers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sessions actives</span>
                  <Badge variant="outline">{Math.floor(liveStats.activeUsers * 0.8)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Nouveaux utilisateurs (24h)</span>
                  <Badge variant="secondary">12</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extractions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques d'Extraction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Extractions réussies (24h)</span>
                  <Badge variant="default">{Math.floor(liveStats.totalExtractions * 0.95)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Extractions échouées (24h)</span>
                  <Badge variant="destructive">{Math.floor(liveStats.totalExtractions * 0.05)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Taille moyenne des données</span>
                  <Badge variant="outline">2.3 MB</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse des Erreurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Erreurs 4xx (24h)</span>
                  <Badge variant="secondary">23</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Erreurs 5xx (24h)</span>
                  <Badge variant="destructive">3</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Timeouts (24h)</span>
                  <Badge variant="outline">7</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
