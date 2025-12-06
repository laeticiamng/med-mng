import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap, 
  Clock,
  Heart,
  Brain,
  Music,
  FileText,
  Settings,
  BarChart3
} from 'lucide-react';
import { ROUTE_PATHS } from '@/config/routes';

/**
 * Dashboard Overview - Vue d'ensemble optimisée de la plateforme
 */
export const DashboardOverview = () => {
  const [stats, setStats] = useState({
    activeUsers: 1247,
    sessionsToday: 89,
    systemHealth: 98,
    apiLatency: 120,
    storageUsed: 67,
    tasksCompleted: 342
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'generation', title: 'Nouvelle analyse EDN générée', time: '2 min', status: 'success' },
    { id: 2, type: 'user', title: 'Nouvel utilisateur inscrit', time: '5 min', status: 'info' },
    { id: 3, type: 'audit', title: 'Audit système complété', time: '15 min', status: 'success' },
    { id: 4, type: 'music', title: 'Playlist créée en Med-MNG', time: '22 min', status: 'music' },
  ]);

  const quickActions = [
    { icon: Music, title: 'Créer Musique', desc: 'Générer du contenu musical', path: ROUTE_PATHS.medMngCreate, color: 'bg-accent' },
    { icon: FileText, title: 'Audit System', desc: 'Lancer un audit complet', path: ROUTE_PATHS.audit, color: 'bg-primary' },
    { icon: Brain, title: 'EDN Analysis', desc: 'Analyser les données EDN', path: ROUTE_PATHS.ednComplete, color: 'bg-success' },
    { icon: BarChart3, title: 'Analytics', desc: 'Voir les métriques', path: ROUTE_PATHS.medMngAnalytics, color: 'bg-warning' },
  ];

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de Bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre plateforme médicale</p>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="bg-success/10 text-success">
            <Activity className="w-4 h-4 mr-1" />
            Système Opérationnel
          </Badge>
        </div>
      </div>

      {/* Métriques Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% depuis hier</p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Aujourd'hui</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sessionsToday}</div>
            <p className="text-xs text-muted-foreground">+5% comparé à hier</p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Santé Système</CardTitle>
            <Shield className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.systemHealth}%</div>
            <Progress value={stats.systemHealth} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latence API</CardTitle>
            <Zap className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.apiLatency}ms</div>
            <p className="text-xs text-muted-foreground">Excellent</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Rapides */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="medical-card hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité Récente */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Activité Récente
            </CardTitle>
            <CardDescription>Dernières actions sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-success' :
                  activity.status === 'info' ? 'bg-primary' :
                  activity.status === 'music' ? 'bg-accent' : 'bg-muted'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">Il y a {activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Statuts des Services */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              État des Services
            </CardTitle>
            <CardDescription>Monitoring en temps réel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API Principal</span>
              <Badge className="bg-success/10 text-success">Opérationnel</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Base de Données</span>
              <Badge className="bg-success/10 text-success">Opérationnel</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Service Audio</span>
              <Badge className="bg-success/10 text-success">Opérationnel</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Authentification</span>
              <Badge className="bg-success/10 text-success">Opérationnel</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Stockage</span>
              <div className="flex items-center gap-2">
                <Progress value={stats.storageUsed} className="w-20" />
                <span className="text-xs text-muted-foreground">{stats.storageUsed}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;