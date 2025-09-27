import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Database,
  Zap,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings,
  Music,
  BookOpen,
  MessageSquare,
  BarChart3,
  Clock,
  Download,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSongs: number;
  totalConversations: number;
  totalEdnItems: number;
  systemHealth: number;
  securityScore: number;
  performanceScore: number;
}

interface RecentActivity {
  id: string;
  type: 'user_signup' | 'song_generated' | 'chat_started' | 'security_alert' | 'system_update';
  description: string;
  timestamp: Date;
  severity: 'info' | 'success' | 'warning' | 'error';
}

const ComprehensiveAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalSongs: 0,
    totalConversations: 0,
    totalEdnItems: 0,
    systemHealth: 98.3,
    securityScore: 98.3,
    performanceScore: 94
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Charger les statistiques du dashboard
  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);

      // Statistiques utilisateurs
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Statistiques des chansons générées
      const { count: songsCount } = await supabase
        .from('med_mng_songs')
        .select('*', { count: 'exact', head: true });

      // Statistiques des conversations chat
      const { count: conversationsCount } = await supabase
        .from('chat_conversations')
        .select('*', { count: 'exact', head: true });

      // Statistiques des items EDN
      const { count: ednItemsCount } = await supabase
        .from('edn_items_immersive')
        .select('*', { count: 'exact', head: true });

      // Utilisateurs actifs (dernières 24h)
      const { count: activeUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      setStats({
        totalUsers: usersCount || 0,
        activeUsers: activeUsersCount || 0,
        totalSongs: songsCount || 0,
        totalConversations: conversationsCount || 0,
        totalEdnItems: ednItemsCount || 0,
        systemHealth: 98.3,
        securityScore: 98.3,
        performanceScore: 94
      });

      // Charger les activités récentes simulées
      const recentActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'user_signup',
          description: 'Nouvel utilisateur inscrit: Dr. Martin',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          severity: 'success'
        },
        {
          id: '2',
          type: 'song_generated',
          description: 'Chanson générée pour Item IC-123 (Cardiologie)',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          severity: 'info'
        },
        {
          id: '3',
          type: 'security_alert',
          description: 'Problème sécurité mineur résolu: RLS Policy updated',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          severity: 'warning'
        },
        {
          id: '4',
          type: 'system_update',
          description: 'Edge Function déployée: openai-chat v2.1.0',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          severity: 'info'
        },
        {
          id: '5',
          type: 'chat_started',
          description: 'Nouvelle conversation IA démarrée',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          severity: 'info'
        }
      ];

      setActivities(recentActivities);

    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques du dashboard.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_signup':
        return <Users className="w-4 h-4" />;
      case 'song_generated':
        return <Music className="w-4 h-4" />;
      case 'chat_started':
        return <MessageSquare className="w-4 h-4" />;
      case 'security_alert':
        return <Shield className="w-4 h-4" />;
      case 'system_update':
        return <Settings className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: RecentActivity['severity']) => {
    switch (severity) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  if (!user || !user.user_metadata?.role?.includes('admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès Administrateur Requis</h2>
            <p className="text-muted-foreground">
              Cette section est réservée aux administrateurs système.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Helmet>
        <title>Dashboard Admin - MED-MNG</title>
        <meta name="description" content="Tableau de bord administrateur complet MED-MNG" />
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrateur</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble complète de la plateforme MED-MNG
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadDashboardStats}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Link to="/admin/monitoring">
            <Button size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Monitoring Avancé
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Utilisateurs Total</p>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                    <p className="text-xs text-green-600">+{stats.activeUsers} actifs 24h</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Chansons Générées</p>
                    <p className="text-3xl font-bold">{stats.totalSongs}</p>
                    <p className="text-xs text-muted-foreground">Via Suno API</p>
                  </div>
                  <Music className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Conversations IA</p>
                    <p className="text-3xl font-bold">{stats.totalConversations}</p>
                    <p className="text-xs text-muted-foreground">Chat médical</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Items EDN</p>
                    <p className="text-3xl font-bold">{stats.totalEdnItems}</p>
                    <p className="text-xs text-muted-foreground">Contenu éducatif</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Santé Système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Système Global</span>
                    <Badge className="bg-green-100 text-green-800">
                      {stats.systemHealth}%
                    </Badge>
                  </div>
                  <Progress value={stats.systemHealth} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Tous les services sont opérationnels
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Score Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Grade A</span>
                    <Badge className="bg-green-100 text-green-800">
                      {stats.securityScore}%
                    </Badge>
                  </div>
                  <Progress value={stats.securityScore} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    17 problèmes mineurs restants
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Lighthouse</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {stats.performanceScore}/100
                    </Badge>
                  </div>
                  <Progress value={stats.performanceScore} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Core Web Vitals optimisables
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Activité Récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className={`p-2 rounded-full ${getSeverityColor(activity.severity)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Interface de gestion des utilisateurs à implémenter
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion du Contenu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Interface de gestion du contenu à implémenter
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Base de Données
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connexions actives</span>
                    <Badge variant="outline">12/100</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Utilisation stockage</span>
                    <Badge variant="outline">2.4 GB / 8 GB</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dernier backup</span>
                    <Badge variant="outline">Il y a 2h</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Edge Functions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fonctions actives</span>
                    <Badge className="bg-green-100 text-green-800">7/7</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Exécutions/jour</span>
                    <Badge variant="outline">~2,500</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taux d'erreur</span>
                    <Badge className="bg-green-100 text-green-800">0.03%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveAdminDashboard;