import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Database, 
  Zap, 
  Globe, 
  Users, 
  Activity,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  HardDrive,
  Network,
  BarChart3
} from 'lucide-react';

// Import des composants avancés
import { IntelligentNavigation } from '@/components/navigation/IntelligentNavigation';
import { AdvancedAuthentication } from '@/components/auth/AdvancedAuthentication';
import { DatabaseOptimizer } from '@/components/database/DatabaseOptimizer';
import { EdgeFunctionMonitor } from '@/components/functions/EdgeFunctionMonitor';
import { APISecurityScanner } from '@/components/security/APISecurityScanner';

interface SystemStatus {
  service: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: string;
  response_time: number;
  last_check: string;
}

interface SystemMetrics {
  total_users: number;
  active_sessions: number;
  api_calls_today: number;
  database_size: string;
  edge_functions: number;
  security_score: number;
}

const SystemAdmin: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([
    { service: 'Navigation IA', status: 'healthy', uptime: '99.9%', response_time: 12, last_check: '2 min' },
    { service: 'Auth Avancée', status: 'healthy', uptime: '100%', response_time: 8, last_check: '1 min' },
    { service: 'Base de Données', status: 'warning', uptime: '99.5%', response_time: 45, last_check: '3 min' },
    { service: 'Edge Functions', status: 'healthy', uptime: '99.8%', response_time: 23, last_check: '1 min' },
    { service: 'Sécurité API', status: 'healthy', uptime: '100%', response_time: 15, last_check: '2 min' }
  ]);

  const [metrics, setMetrics] = useState<SystemMetrics>({
    total_users: 12458,
    active_sessions: 1847,
    api_calls_today: 348920,
    database_size: '2.4 GB',
    edge_functions: 87,
    security_score: 98
  });

  const [activeTab, setActiveTab] = useState('overview');

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

  useEffect(() => {
    // Simulation des mises à jour en temps réel
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        active_sessions: prev.active_sessions + Math.floor(Math.random() * 10) - 5,
        api_calls_today: prev.api_calls_today + Math.floor(Math.random() * 100)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Administration Système
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestion avancée et monitoring en temps réel - Architecture 100% complète
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-success to-success-glow text-white px-4 py-2">
            <Activity className="w-4 h-4 mr-2" />
            Tous systèmes opérationnels
          </Badge>
        </div>

        {/* Métriques globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Utilisateurs', value: metrics.total_users.toLocaleString(), color: 'from-blue-500 to-cyan-600' },
            { icon: Activity, label: 'Sessions Actives', value: metrics.active_sessions.toLocaleString(), color: 'from-green-500 to-emerald-600' },
            { icon: BarChart3, label: 'Appels API', value: metrics.api_calls_today.toLocaleString(), color: 'from-purple-500 to-pink-600' },
            { icon: Shield, label: 'Score Sécurité', value: `${metrics.security_score}%`, color: 'from-red-500 to-orange-600' }
          ].map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                        <p className="text-2xl font-bold">{metric.value}</p>
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

        {/* Status des services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Status des Services Avancés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemStatus.map((service, index) => (
                <motion.div
                  key={service.service}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg border border-border bg-card hover:shadow-soft transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{service.service}</h3>
                    <div className={`flex items-center gap-1 ${getStatusColor(service.status)}`}>
                      {getStatusIcon(service.status)}
                      <span className="text-sm font-medium capitalize">{service.status}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <div>
                      <span className="block">Uptime</span>
                      <span className="font-medium text-foreground">{service.uptime}</span>
                    </div>
                    <div>
                      <span className="block">Réponse</span>
                      <span className="font-medium text-foreground">{service.response_time}ms</span>
                    </div>
                    <div>
                      <span className="block">Vérifié</span>
                      <span className="font-medium text-foreground">{service.last_check}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs pour les composants avancés */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Aperçu
            </TabsTrigger>
            <TabsTrigger value="navigation" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Navigation IA
            </TabsTrigger>
            <TabsTrigger value="auth" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Auth Avancée
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Base de Données
            </TabsTrigger>
            <TabsTrigger value="functions" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Edge Functions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Système</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'CPU Usage', value: 23, icon: Cpu },
                    { label: 'Memory', value: 67, icon: HardDrive },
                    { label: 'Network', value: 45, icon: Network }
                  ].map((metric) => {
                    const IconComponent = metric.icon;
                    return (
                      <div key={metric.label} className="flex items-center space-x-3">
                        <IconComponent className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{metric.label}</span>
                            <span>{metric.value}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                              style={{ width: `${metric.value}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions Rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Optimiser la base de données
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Scanner la sécurité
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Activity className="w-4 h-4 mr-2" />
                    Redémarrer les services
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="navigation">
            <IntelligentNavigation />
          </TabsContent>

          <TabsContent value="auth">
            <AdvancedAuthentication />
          </TabsContent>

          <TabsContent value="database">
            <DatabaseOptimizer />
          </TabsContent>

          <TabsContent value="functions">
            <EdgeFunctionMonitor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemAdmin;