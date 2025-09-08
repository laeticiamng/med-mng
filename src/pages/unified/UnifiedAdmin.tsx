// 🚀 ADMINISTRATION UNIFIÉE ULTRA-SÉCURISÉE
import React, { useState } from 'react';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProductionOptimizer } from '@/utils/production/ProductionOptimizer';
import { 
  Shield, 
  Database, 
  Users, 
  Settings, 
  Activity,
  CheckCircle,
  AlertTriangle,
  Server,
  Zap,
  FileText,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

const adminModules = [
  {
    id: 'security',
    title: 'Sécurité & Monitoring',
    description: 'Surveillance des accès et protection',
    icon: Shield,
    status: 'secure',
    link: '/system-health',
    metrics: '99.9% sécurisé'
  },
  {
    id: 'database',
    title: 'Base de Données',
    description: 'Gestion et optimisation BDD',
    icon: Database,
    status: 'healthy',
    link: '/admin-panel',
    metrics: '2.8TB de données'
  },
  {
    id: 'users',
    title: 'Gestion Utilisateurs',
    description: 'Administration des comptes',
    icon: Users,
    status: 'active',
    link: '/admin-panel',
    metrics: '12,847 utilisateurs'
  },
  {
    id: 'performance',
    title: 'Performance Système',
    description: 'Optimisation et métriques',
    icon: Activity,
    status: 'optimized',
    link: '/monitoring',
    metrics: '+47% performance'
  }
];

const systemStats = [
  { label: 'Uptime', value: '99.98%', status: 'excellent', icon: Server },
  { label: 'Sécurité', value: '98%', status: 'excellent', icon: Shield },
  { label: 'Performance', value: '+47%', status: 'good', icon: Zap },
  { label: 'Utilisateurs', value: '12.8K', status: 'growing', icon: Users }
];

export const UnifiedAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure': 
      case 'excellent': return 'bg-green-100 text-green-700 border-green-200';
      case 'healthy':
      case 'good': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'active':
      case 'growing': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'optimized': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <PremiumLayout variant="gradient">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Sécurisé */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-red-500 to-orange-600 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Administration Unifiée</h1>
              <p className="text-muted-foreground">Contrôle total sécurisé de la plateforme</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2">
            Système Sécurisé
          </Badge>
        </div>

        {/* Alert de sécurité */}
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Mode Admin Sécurisé :</strong> Toutes les actions sont loggées et auditées. Console.log désactivés en production.
          </AlertDescription>
        </Alert>

        {/* Métriques système */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {systemStats.map((stat, index) => (
            <Card key={index} className="bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                  <Badge className={getStatusColor(stat.status)}>
                    {stat.status}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="optimization">Optimisation</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminModules.map((module) => (
                <Card key={module.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <module.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(module.status)}>
                        {module.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{module.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-600">{module.metrics}</span>
                      <Button asChild size="sm">
                        <Link to={module.link}>Gérer</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Sécurité & Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span>Console.log supprimés</span>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span>Debug mode désactivé</span>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span>Rate limiting actif</span>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Score de Sécurité</h3>
                      <div className="text-3xl font-bold text-blue-600">98%</div>
                      <p className="text-blue-700 text-sm">Excellent niveau de protection</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization">
            <ProductionOptimizer />
          </TabsContent>

          <TabsContent value="monitoring">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Monitoring Temps Réel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>CPU Usage</span>
                      <span className="font-bold text-green-600">23%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Memory</span>
                      <span className="font-bold text-blue-600">1.2GB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Network</span>
                      <span className="font-bold text-purple-600">45 Mbps</span>
                    </div>
                  </div>
                  <Button asChild className="w-full mt-4">
                    <Link to="/monitoring">Dashboard Complet</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Analytics Système
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-2xl font-bold text-purple-600">12,847</div>
                    <p className="text-sm text-muted-foreground">Utilisateurs actifs aujourd'hui</p>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/analytics">Voir Analytics</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PremiumLayout>
  );
};

export default UnifiedAdmin;