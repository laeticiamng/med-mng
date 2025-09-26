import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, Users, BarChart3, Shield, Database, 
  Activity, AlertTriangle, CheckCircle, Clock,
  Server, Zap, Globe, Lock
} from 'lucide-react';

export const UnifiedAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const systemMetrics = {
    totalUsers: 2847,
    activeUsers: 1923,
    systemHealth: 99.2,
    uptime: '99.9%',
    apiCalls: '1.2M',
    storage: '847GB'
  };

  const alerts = [
    { type: 'info', message: 'Maintenance programmée dimanche 3h-5h', time: '2h' },
    { type: 'warning', message: 'Utilisation CPU élevée sur serveur-2', time: '15min' },
    { type: 'success', message: 'Backup automatique terminé avec succès', time: '1h' }
  ];

  return (
    <>
      <Helmet>
        <title>Administration Unifiée - MED-MNG</title>
        <meta name="description" content="Interface d'administration complète pour la gestion de la plateforme MED-MNG" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              🛠️ Administration Unifiée
            </h1>
            <p className="text-muted-foreground">
              Centre de contrôle avancé pour la gestion complète de la plateforme
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold text-foreground">
                  {systemMetrics.totalUsers.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Utilisateurs totaux</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="w-8 h-8 mx-auto mb-3 text-success" />
                <div className="text-2xl font-bold text-success">
                  {systemMetrics.activeUsers.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Server className="w-8 h-8 mx-auto mb-3 text-accent" />
                <div className="text-2xl font-bold text-foreground">
                  {systemMetrics.uptime}
                </div>
                <p className="text-sm text-muted-foreground">Disponibilité</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 mx-auto mb-3 text-warning" />
                <div className="text-2xl font-bold text-foreground">
                  {systemMetrics.systemHealth}%
                </div>
                <p className="text-sm text-muted-foreground">Santé système</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
              <TabsTrigger value="system">Système</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Alertes Récentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {alerts.map((alert, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            {alert.type === 'success' && <CheckCircle className="w-4 h-4 text-success" />}
                            {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-warning" />}
                            {alert.type === 'info' && <Clock className="w-4 h-4 text-primary" />}
                            <span className="text-sm">{alert.message}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {alert.time}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Statistiques Rapides
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Appels API aujourd'hui</span>
                        <span className="font-semibold">{systemMetrics.apiCalls}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Stockage utilisé</span>
                        <span className="font-semibold">{systemMetrics.storage}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Nouvelles inscriptions</span>
                        <span className="font-semibold">+47</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des Utilisateurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Interface de gestion des utilisateurs en cours de développement.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Avancées</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Tableaux de bord analytics en cours de développement.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Sécurité et Accès
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border">
                      <Lock className="w-8 h-8 mb-3 text-primary" />
                      <h3 className="font-semibold mb-2">Authentification</h3>
                      <p className="text-sm text-muted-foreground">Gestion des méthodes d'authentification</p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <Globe className="w-8 h-8 mb-3 text-accent" />
                      <h3 className="font-semibold mb-2">Accès Réseau</h3>
                      <p className="text-sm text-muted-foreground">Configuration des règles de sécurité réseau</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Système et Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Monitoring et gestion de l'infrastructure système.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Paramètres Globaux
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Configuration des paramètres généraux de la plateforme.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default UnifiedAdmin;