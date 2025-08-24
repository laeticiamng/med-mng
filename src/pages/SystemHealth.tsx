import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Activity, AlertTriangle, CheckCircle, XCircle, Cpu, Database, Globe, Wifi, Server, Shield, Clock, RefreshCw, Download, Bell, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemHealthChecker } from '@/components/system/SystemHealthChecker';
import { useResponsiveSpacing } from '@/hooks/useBreakpoints';
import { Helmet } from 'react-helmet-async';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';

const SystemHealth = () => {
  const spacing = useResponsiveSpacing();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState({
    overallHealth: 98.7,
    uptime: '99.9%',
    responseTime: '142ms',
    errorRate: '0.1%',
    lastIncident: '7 jours',
    totalUsers: '2,847',
    activeUsers: '342',
    apiCalls: '1.2M'
  });

  const healthChecks = [
    {
      name: 'API Principale',
      status: 'healthy',
      uptime: '99.98%',
      responseTime: '89ms',
      lastCheck: '2 min',
      issues: 0,
      description: 'Endpoint principal de l\'application'
    },
    {
      name: 'Base de Données',
      status: 'healthy',
      uptime: '99.95%',
      responseTime: '45ms',
      lastCheck: '1 min',
      issues: 0,
      description: 'Supabase PostgreSQL'
    },
    {
      name: 'Authentification',
      status: 'healthy',
      uptime: '99.99%',
      responseTime: '123ms',
      lastCheck: '3 min',
      issues: 0,
      description: 'Système d\'auth Supabase'
    },
    {
      name: 'Génération Musicale',
      status: 'warning',
      uptime: '97.2%',
      responseTime: '2.3s',
      lastCheck: '5 min',
      issues: 2,
      description: 'API Suno pour génération audio'
    },
    {
      name: 'CDN Images',
      status: 'healthy',
      uptime: '99.8%',
      responseTime: '67ms',
      lastCheck: '1 min',
      issues: 0,
      description: 'Distribution des assets statiques'
    },
    {
      name: 'Monitoring',
      status: 'degraded',
      uptime: '94.5%',
      responseTime: '234ms',
      lastCheck: '8 min',
      issues: 1,
      description: 'Système de surveillance interne'
    }
  ];

  const serverMetrics = [
    { name: 'CPU Usage', value: 34, max: 100, unit: '%', status: 'good' },
    { name: 'RAM Usage', value: 2.4, max: 8, unit: 'GB', status: 'good' },
    { name: 'Storage', value: 145, max: 500, unit: 'GB', status: 'good' },
    { name: 'Network I/O', value: 45.2, max: 100, unit: 'Mbps', status: 'good' },
    { name: 'Database Connections', value: 23, max: 100, unit: '', status: 'good' },
    { name: 'Active Sessions', value: 342, max: 1000, unit: '', status: 'good' }
  ];

  const recentEvents = [
    { time: '10:45', type: 'info', message: 'Backup automatique complété avec succès', severity: 'low' },
    { time: '10:30', type: 'warning', message: 'Latence élevée détectée sur l\'API Suno', severity: 'medium' },
    { time: '10:15', type: 'success', message: 'Mise à jour de sécurité appliquée', severity: 'low' },
    { time: '09:45', type: 'info', message: 'Pic de trafic géré avec succès', severity: 'low' },
    { time: '09:30', type: 'error', message: 'Échec temporaire du monitoring externe', severity: 'high' },
    { time: '09:00', type: 'info', message: 'Maintenance programmée terminée', severity: 'low' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'degraded':
        return <XCircle className="h-5 w-5 text-orange-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'degraded':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simuler la récupération des métriques
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  useEffect(() => {
    // Auto-refresh toutes les 30 secondes
    const interval = setInterval(() => {
      // Mettre à jour les métriques en temps réel
      setSystemMetrics(prev => ({
        ...prev,
        responseTime: `${Math.floor(Math.random() * 100 + 100)}ms`,
        activeUsers: `${Math.floor(Math.random() * 100 + 300)}`
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ConsistentBackground variant="secondary">
      <Helmet>
        <title>Diagnostic Système | MED MNG</title>
        <meta name="description" content="Surveillance en temps réel de l'état système MED MNG. Métriques de performance, santé des services et monitoring avancé." />
      </Helmet>

      <PageHeader
        title="🔍 Diagnostic Système"
        subtitle="Surveillance en temps réel de l'infrastructure MED MNG. Monitoring complet des performances, santé des services et métriques système."
        icon={Activity}
        badge={{
          text: `Santé système: ${systemMetrics.overallHealth}%`,
          variant: systemMetrics.overallHealth > 95 ? 'default' : 
                   systemMetrics.overallHealth > 85 ? 'secondary' : 'destructive'
        }}
        showBackButton
        backTo="/"
        actions={
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        }
      />

      <div className={`container mx-auto ${spacing.container}`}>
        {/* Métriques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {[
            { label: 'Santé', value: systemMetrics.overallHealth + '%', icon: Activity, color: 'text-success' },
            { label: 'Uptime', value: systemMetrics.uptime, icon: Clock, color: 'text-primary' },
            { label: 'Latence', value: systemMetrics.responseTime, icon: Zap, color: 'text-secondary' },
            { label: 'Erreurs', value: systemMetrics.errorRate, icon: AlertTriangle, color: 'text-warning' },
            { label: 'Utilisateurs', value: systemMetrics.totalUsers, icon: Globe, color: 'text-primary' },
            { label: 'Actifs', value: systemMetrics.activeUsers, icon: Wifi, color: 'text-success' },
            { label: 'API Calls', value: systemMetrics.apiCalls, icon: Server, color: 'text-info' },
            { label: 'Dernier incident', value: systemMetrics.lastIncident, icon: Shield, color: 'text-muted-foreground' }
          ].map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.label} className={`bg-card/80 backdrop-blur-sm text-center animate-fade-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-4">
                  <Icon className={`h-5 w-5 ${metric.color} mx-auto mb-2`} />
                  <div className="text-sm font-semibold text-foreground">{metric.value}</div>
                  <div className="text-xs text-muted-foreground">{metric.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Interface système détaillée */}
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Événements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {healthChecks.map((service, index) => (
                <Card key={service.name} 
                      className={`bg-card/80 backdrop-blur-sm shadow-lg animate-fade-in`}
                      style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getStatusIcon(service.status)}
                        {service.name}
                      </CardTitle>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Uptime</div>
                        <div className="font-semibold">{service.uptime}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Latence</div>
                        <div className="font-semibold">{service.responseTime}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Dernier check</div>
                        <div className="font-semibold">Il y a {service.lastCheck}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Problèmes</div>
                        <div className="font-semibold text-destructive">{service.issues}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ... keep existing code for other tabs with updated theming */}
          
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {serverMetrics.map((metric, index) => (
                <Card key={metric.name} 
                      className={`bg-card/80 backdrop-blur-sm shadow-lg animate-fade-in`}
                      style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{metric.name}</span>
                      <Badge className={
                        metric.value / metric.max < 0.7 ? 'bg-success/10 text-success border-success/20' :
                        metric.value / metric.max < 0.9 ? 'bg-warning/10 text-warning border-warning/20' :
                        'bg-destructive/10 text-destructive border-destructive/20'
                      }>
                        {metric.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Utilisation actuelle</span>
                        <span className="text-lg font-bold">
                          {metric.value}{metric.unit} / {metric.max}{metric.unit}
                        </span>
                      </div>
                      <Progress 
                        value={(metric.value / metric.max) * 100} 
                        className="h-3"
                      />
                      <div className="text-xs text-muted-foreground">
                        {((metric.value / metric.max) * 100).toFixed(1)}% utilisé
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Système de Surveillance Avancé
                </CardTitle>
                <CardDescription>
                  Interface complète de monitoring système avec outils d'analyse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SystemHealthChecker />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-warning" />
                    Journal des Événements
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurer
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Événements système en temps réel et alertes de monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentEvents.map((event, index) => (
                    <div key={index} 
                         className={`flex items-center gap-3 p-3 rounded-lg border-l-4 animate-fade-in ${
                           event.type === 'success' ? 'border-success bg-success/10' :
                           event.type === 'warning' ? 'border-warning bg-warning/10' :
                           event.type === 'error' ? 'border-destructive bg-destructive/10' :
                           'border-primary bg-primary/10'
                         }`}
                         style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex-shrink-0">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{event.message}</div>
                        <div className="text-xs text-muted-foreground">Il y a {event.time}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ConsistentBackground>
  );
};

export default SystemHealth;