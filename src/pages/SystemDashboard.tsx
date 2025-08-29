import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Activity, 
  Users, 
  Database,
  Zap,
  Shield,
  Globe,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Network,
  Server
} from 'lucide-react';

// Import des widgets
import { SystemHealthWidget } from '@/components/dashboard/SystemHealthWidget';
import { RealTimeMonitor } from '@/components/optimization/RealTimeMonitor';

interface DashboardMetric {
  id: string;
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
}

interface ActivityLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

const SystemDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  const [dashboardMetrics] = useState<DashboardMetric[]>([
    {
      id: 'users',
      label: 'Utilisateurs Actifs',
      value: '2,847',
      change: 12.5,
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'requests',
      label: 'Requêtes/h',
      value: '18.2k',
      change: -3.2,
      trend: 'down',
      icon: BarChart3,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'uptime',
      label: 'Disponibilité',
      value: '99.98%',
      change: 0.02,
      trend: 'up',
      icon: Activity,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'response',
      label: 'Temps Réponse',
      value: '142ms',
      change: -8.5,
      trend: 'down',
      icon: Zap,
      color: 'from-orange-500 to-red-600'
    }
  ]);

  const [activityLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      action: 'Optimisation base de données lancée',
      user: 'System',
      timestamp: '14:32',
      status: 'success'
    },
    {
      id: '2',
      action: 'Scan sécurité API terminé',
      user: 'Admin',
      timestamp: '14:28',
      status: 'success'
    },
    {
      id: '3',
      action: 'Alert: Pic de trafic détecté',
      user: 'Monitor',
      timestamp: '14:15',
      status: 'warning'
    },
    {
      id: '4',
      action: 'Edge Functions mises à jour',
      user: 'System',
      timestamp: '14:10',
      status: 'success'
    },
    {
      id: '5',
      action: 'Sauvegarde automatique',
      user: 'System',
      timestamp: '14:00',
      status: 'success'
    }
  ]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-destructive rotate-180" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Tableau de Bord Système
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitoring en temps réel et analytics avancés
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-success to-success-glow text-white">
              <Activity className="w-4 h-4 mr-2" />
              Système Opérationnel
            </Badge>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <Settings className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          {metric.label}
                        </p>
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <div className="flex items-center gap-1 text-sm">
                          {getTrendIcon(metric.trend)}
                          <span className={`${metric.change > 0 ? 'text-success' : 'text-destructive'}`}>
                            {metric.change > 0 ? '+' : ''}{metric.change}%
                          </span>
                          <span className="text-muted-foreground">vs hier</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${metric.color}`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Contenu principal avec tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Santé Système
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Logs & Activité
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Widget de santé système */}
              <SystemHealthWidget />

              {/* Informations système */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Edge Functions', value: '87 actives', icon: Zap, status: 'healthy' },
                    { label: 'Base de Données', value: '2.4 GB utilisés', icon: Database, status: 'healthy' },
                    { label: 'CDN Global', value: '15 régions', icon: Globe, status: 'healthy' },
                    { label: 'Sécurité', value: 'Score: 98%', icon: Shield, status: 'healthy' }
                  ].map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-sm text-muted-foreground">{item.value}</p>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-success" />
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="health">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SystemHealthWidget />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Actions Rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Database className="w-4 h-4 mr-2" />
                    Optimiser BDD
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Scan Sécurité
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Zap className="w-4 h-4 mr-2" />
                    Redémarrer Functions
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Config Système
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <RealTimeMonitor />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Journaux d'Activité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activityLogs.map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(log.status)}
                        <div>
                          <p className="font-medium">{log.action}</p>
                          <p className="text-sm text-muted-foreground">Par {log.user}</p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{log.timestamp}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemDashboard;