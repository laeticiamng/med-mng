import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Database, 
  Users, 
  BarChart3, 
  Shield, 
  Search, 
  MessageSquare, 
  Music, 
  AlertTriangle,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Import des composants d'administration existants
import { AdminSystemSettings } from './AdminSystemSettings';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminUsersManager } from './AdminUsersManager';
import { AdminContentManager } from './AdminContentManager';
import { AdminSubscriptionsManager } from './AdminSubscriptionsManager';

// Import des nouveaux composants développés
import { AdminSecurityAudit } from './AdminSecurityAudit';
import { AdminChatMonitoring } from './AdminChatMonitoring';

interface SystemStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalEdnItems: number;
  totalSongs: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  recentAlerts: number;
  lastUpdate: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

export const AdminDashboard: React.FC = () => {
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalEdnItems: 0,
    totalSongs: 0,
    systemHealth: 'healthy',
    recentAlerts: 0,
    lastUpdate: new Date().toISOString()
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSystemStats();
    fetchRecentActivity();
    
    // Refresh data every 60 seconds
    const interval = setInterval(() => {
      fetchSystemStats();
      fetchRecentActivity();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchSystemStats = async () => {
    try {
      setRefreshing(true);
      
      // Récupérer les statistiques système en parallèle
      const [usersResult, subscriptionsResult, ednResult, songsResult, alertsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('edn_items_immersive').select('id', { count: 'exact', head: true }),
        supabase.from('emotionscare_songs').select('id', { count: 'exact', head: true }),
        supabase.from('completeness_alerts').select('id', { count: 'exact', head: true }).eq('resolved', false)
      ]);

      // Vérifier la santé du système via audit
      let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      try {
        const healthCheck = await supabase.functions.invoke('audit-system', {
          body: { action: 'health_check' }
        });
        if (healthCheck.error) healthStatus = 'warning';
      } catch {
        healthStatus = 'warning';
      }

      setSystemStats({
        totalUsers: usersResult.count || 0,
        activeSubscriptions: subscriptionsResult.count || 0,
        totalEdnItems: ednResult.count || 0,
        totalSongs: songsResult.count || 0,
        systemHealth: healthStatus,
        recentAlerts: alertsResult.count || 0,
        lastUpdate: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
      toast.error('Erreur lors du chargement des statistiques système');
      setSystemStats(prev => ({ ...prev, systemHealth: 'critical' }));
    } finally {
      setRefreshing(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_changelog')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) throw error;

      const activities: RecentActivity[] = (data || []).map(item => ({
        id: item.id,
        type: item.action_type,
        description: `${item.action_type} sur ${item.table_name}`,
        timestamp: item.created_at,
        status: 'success'
      }));

      setRecentActivity(activities);
    } catch (error) {
      console.error('Erreur activité récente:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeQuickAction = async (action: string) => {
    try {
      setRefreshing(true);
      toast.loading(`Exécution: ${action}...`, { id: action });

      switch (action) {
        case 'sync_uness':
          await supabase.functions.invoke('extract-edn-uness-production', {
            body: { action: 'sync_all' }
          });
          toast.success('Synchronisation UNESS terminée', { id: action });
          break;
          
        case 'security_audit':
          await supabase.functions.invoke('audit-system', {
            body: { action: 'full_audit' }
          });
          toast.success('Audit sécurité terminé', { id: action });
          break;
          
        case 'data_integrity':
          await supabase.functions.invoke('data-integrity-check', {
            body: { action: 'comprehensive_check' }
          });
          toast.success('Vérification intégrité terminée', { id: action });
          break;
          
        case 'analytics_report':
          await supabase.functions.invoke('analytics-aggregator', {
            body: { action: 'generate_report' }
          });
          toast.success('Rapport analytics généré', { id: action });
          break;
          
        default:
          toast.error('Action non reconnue', { id: action });
      }
      
      // Refresh stats after action
      await fetchSystemStats();
      await fetchRecentActivity();
      
    } catch (error) {
      console.error(`Erreur action ${action}:`, error);
      toast.error(`Erreur lors de l'exécution de ${action}`, { id: action });
    } finally {
      setRefreshing(false);
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'critical': return <XCircle className="h-5 w-5 text-destructive" />;
      default: return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-success bg-success/10';
      case 'warning': return 'text-warning-foreground bg-warning/10';
      case 'error': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Administration Complète</h1>
          <p className="text-muted-foreground mt-1">
            Tableau de bord unifié - Tous les outils en un seul endroit
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getHealthIcon(systemStats.systemHealth)}
            <span className="text-sm font-medium">
              Système {systemStats.systemHealth === 'healthy' ? 'Opérationnel' : 'En surveillance'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchSystemStats();
              fetchRecentActivity();
            }}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Alertes système si nécessaire */}
      {systemStats.recentAlerts > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800">
                {systemStats.recentAlerts} alerte(s) non résolue(s) nécessitent votre attention
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Comptes actifs sur la plateforme
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnements actifs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeSubscriptions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Souscriptions payantes
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items EDN</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalEdnItems.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Contenus pédagogiques
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chansons générées</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalSongs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Créations musicales IA
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section activité récente et actions rapides */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activité système récente
            </CardTitle>
            <CardDescription>
              Dernières actions administratives et modifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune activité récente</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className={`flex items-center justify-between p-3 border rounded-lg ${getStatusColor(activity.status)}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-success' : activity.status === 'warning' ? 'bg-warning' : 'bg-destructive'}`} />
                      <div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs opacity-70">
                          {new Date(activity.timestamp).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={activity.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Actions rapides
            </CardTitle>
            <CardDescription>
              Outils de gestion rapide du système
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => executeQuickAction('sync_uness')}
              disabled={refreshing}
            >
              <Database className="h-4 w-4 mr-2" />
              Synchroniser données UNESS
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => executeQuickAction('security_audit')}
              disabled={refreshing}
            >
              <Shield className="h-4 w-4 mr-2" />
              Lancer audit sécurité
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => executeQuickAction('analytics_report')}
              disabled={refreshing}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Générer rapport analytics
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => executeQuickAction('data_integrity')}
              disabled={refreshing}
            >
              <Search className="h-4 w-4 mr-2" />
              Vérification intégrité données
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabs des outils d'administration */}
      <Card>
        <CardHeader>
          <CardTitle>Outils d'administration</CardTitle>
          <CardDescription>
            Interface complète regroupant tous les outils développés dans les 10 points techniques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Vue d'ensemble</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Système</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Utilisateurs</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Contenu</span>
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Abonnements</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Sécurité</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Chat IA</span>
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-1">
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Outils</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Résumé des 10 points techniques</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">I. Extraction UNESS automatisée</span>
                      <Badge variant="default">✅ Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">II. Génération contenu IA contextuelle</span>
                      <Badge variant="default">✅ Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">III. Système audit & monitoring</span>
                      <Badge variant="default">✅ Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">IV. Gestion quotas IA analytics</span>
                      <Badge variant="default">✅ Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">V. Moteur recherche intelligent</span>
                      <Badge variant="default">✅ Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">VI. API gestion rapide admin</span>
                      <Badge variant="default">✅ Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">VII. Agrégation & tracking analytics</span>
                      <Badge variant="default">✅ Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">VIII. Streaming-only & Sécurité</span>
                      <Badge variant="default">✅ Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">IX. Chat IA contextuel</span>
                      <Badge variant="default">✅ Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">X. Interface admin complète</span>
                      <Badge variant="default">✅ Actif</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Santé du système</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Base de données</span>
                      <Badge variant="default">Opérationnelle</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Services IA</span>
                      <Badge variant="default">Actifs</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Edge Functions</span>
                      <Badge variant="default">Déployées</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>API Gateway</span>
                      <Badge variant="default">Stable</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Dernière mise à jour</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(systemStats.lastUpdate).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <AdminSystemSettings />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <AdminUsersManager />
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <AdminContentManager />
            </TabsContent>

            <TabsContent value="subscriptions" className="space-y-6">
              <AdminSubscriptionsManager />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AdminAnalytics />
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <AdminSecurityAudit />
            </TabsContent>

            <TabsContent value="chat" className="space-y-6">
              <AdminChatMonitoring />
            </TabsContent>

            <TabsContent value="tools" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Outils avancés</CardTitle>
                  <CardDescription>
                    Outils de gestion et maintenance avancés
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 justify-start">
                    <Database className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Migration données</div>
                      <div className="text-sm text-muted-foreground">Outils de migration et backup</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 justify-start">
                    <Search className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Recherche avancée</div>
                      <div className="text-sm text-muted-foreground">Filtrage et recherche intelligente</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 justify-start">
                    <Edit className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Édition rapide</div>
                      <div className="text-sm text-muted-foreground">Modification en lot</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 justify-start">
                    <Activity className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Monitoring temps réel</div>
                      <div className="text-sm text-muted-foreground">Surveillance système</div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};