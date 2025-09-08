/**
 * 🏆 ULTIMATE PREMIUM DASHBOARD - MED-MNG v3.0
 * Dashboard premium avec toutes les fonctionnalités avancées
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Clock, 
  Heart,
  Brain,
  Shield,
  Zap,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Settings,
  Bell,
  Download,
  RefreshCw,
  Calendar,
  FileText,
  Stethoscope,
  Thermometer,
  Pill,
  Clipboard
} from 'lucide-react';
import { usePremiumStore, useSystemHealth, useNotifications } from '@/stores/premiumStore';
import { logger } from '@/lib/logger';
import { useRenderMonitor } from '@/hooks/usePerformanceOptimizer';

interface DashboardStats {
  totalPatients: number;
  activeAppointments: number;
  criticalAlerts: number;
  systemHealth: number;
  responseTime: number;
  satisfaction: number;
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'emergency' | 'consultation' | 'treatment';
  patient: string;
  time: string;
  status: 'completed' | 'pending' | 'urgent';
  description: string;
}

export const UltimatePremiumDashboard: React.FC = () => {
  const { user, analytics, medicalData } = usePremiumStore();
  const { systemHealth, updateSystemHealth } = useSystemHealth();
  const { notifications, unreadCount } = useNotifications();
  const { logPerformance } = useRenderMonitor('UltimatePremiumDashboard');
  
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 1247,
    activeAppointments: 23,
    criticalAlerts: 3,
    systemHealth: 98,
    responseTime: 120,
    satisfaction: 94
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'emergency',
      patient: 'Marie Dubois',
      time: 'Il y a 5 min',
      status: 'urgent',
      description: 'Douleurs thoraciques - salle 3'
    },
    {
      id: '2',
      type: 'appointment',
      patient: 'Jean Martin',
      time: 'Il y a 15 min',
      status: 'completed',
      description: 'Consultation cardiologique terminée'
    },
    {
      id: '3',
      type: 'treatment',
      patient: 'Sophie Laurent',
      time: 'Il y a 30 min',
      status: 'pending',
      description: 'Traitement hypertension en cours'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  // Mise à jour temps réel des données
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    logger.info('app', 'Refreshing dashboard data');
    
    try {
      // Simulation de mise à jour des données
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats(prev => ({
        ...prev,
        activeAppointments: prev.activeAppointments + Math.floor(Math.random() * 3) - 1,
        responseTime: 120 + Math.floor(Math.random() * 50) - 25,
        systemHealth: Math.max(95, Math.min(100, prev.systemHealth + Math.floor(Math.random() * 3) - 1))
      }));

      updateSystemHealth({
        status: 'healthy',
        responseTime: stats.responseTime,
        activeUsers: stats.totalPatients
      });

      logPerformance('Data refresh completed');
      
    } catch (error) {
      logger.error('app', 'Failed to refresh data', { error });
    } finally {
      setIsLoading(false);
    }
  }, [stats.responseTime, stats.totalPatients, updateSystemHealth, logPerformance]);

  // Auto-refresh des données toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Métriques de performance en temps réel
  useEffect(() => {
    logPerformance('Dashboard initial load');
  }, [logPerformance]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'appointment': return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'consultation': return <Stethoscope className="h-4 w-4 text-green-500" />;
      case 'treatment': return <Pill className="h-4 w-4 text-purple-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard Premium - MED-MNG</title>
        <meta name="description" content="Tableau de bord médical premium avec analyses en temps réel" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5">
        {/* Header Premium */}
        <div className="nav-premium sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-medical rounded-xl flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gradient-primary">
                    Dashboard Premium
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Bienvenue, Dr. {user?.firstName} {user?.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refreshData}
                  disabled={isLoading}
                  className="relative"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
                
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Statistiques Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-premium">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Patients Total</p>
                    <p className="text-3xl font-bold">{stats.totalPatients.toLocaleString()}</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12% ce mois
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">RDV Actifs</p>
                    <p className="text-3xl font-bold">{stats.activeAppointments}</p>
                    <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Alertes Critiques</p>
                    <p className="text-3xl font-bold text-red-600">{stats.criticalAlerts}</p>
                    <p className="text-xs text-red-500">Nécessitent attention</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                    <p className="text-3xl font-bold text-green-600">{stats.satisfaction}%</p>
                    <p className="text-xs text-green-600">+5% vs mois dernier</p>
                  </div>
                  <Heart className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dashboard Principal */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full lg:w-auto">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="patients" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Patients
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Santé Système
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Sécurité
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activité Récente */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Activité Récente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30">
                          {getActivityIcon(activity.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{activity.patient}</p>
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(activity.status)}>
                              {activity.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Métriques Système */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Performance Système
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Santé Système</span>
                        <span className="text-sm font-medium">{stats.systemHealth}%</span>
                      </div>
                      <Progress value={stats.systemHealth} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Temps de Réponse</span>
                        <span className="text-sm font-medium">{stats.responseTime}ms</span>
                      </div>
                      <Progress value={Math.max(0, 100 - (stats.responseTime / 10))} className="h-2" />
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Statut
                        </span>
                        <Badge className="bg-green-100 text-green-800">
                          Opérationnel
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="patients">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des Patients Premium</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Module patients premium en cours de développement</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="health">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Surveillance Système
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">CPU</span>
                        <span className="text-sm font-medium">23%</span>
                      </div>
                      <Progress value={23} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Mémoire</span>
                        <span className="text-sm font-medium">67%</span>
                      </div>
                      <Progress value={67} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Disque</span>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Uptime & Disponibilité
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">99.9%</p>
                        <p className="text-sm text-muted-foreground">Uptime ce mois</p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Dernière panne</span>
                          <span className="text-muted-foreground">Il y a 15 jours</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Maintenance prévue</span>
                          <span className="text-muted-foreground">Dimanche 3h</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Analytics Avancées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Module analytics premium en cours de développement</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Monitoring Sécurité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="font-medium">Authentification</p>
                      <p className="text-sm text-green-600">Sécurisée</p>
                    </div>
                    
                    <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                      <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="font-medium">Chiffrement</p>
                      <p className="text-sm text-green-600">Actif</p>
                    </div>
                    
                    <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                      <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="font-medium">Monitoring</p>
                      <p className="text-sm text-green-600">Opérationnel</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};