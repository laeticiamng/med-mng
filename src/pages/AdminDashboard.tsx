import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, CreditCard, BarChart3, Settings, Shield,
  AlertTriangle, TrendingUp, DollarSign, Music, Brain, Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { toast } from 'sonner';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { ROUTE_PATHS } from '@/config/routes';

// Components
import { AdminUsersManager } from '@/components/admin/AdminUsersManager';
import { AdminContentManager } from '@/components/admin/AdminContentManager';
import { AdminSubscriptionsManager } from '@/components/admin/AdminSubscriptionsManager';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { AdminSystemSettings } from '@/components/admin/AdminSystemSettings';

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalContent: number;
  monthlyRevenue: number;
  totalCreditsUsed: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalContent: 0,
    monthlyRevenue: 0,
    totalCreditsUsed: 0,
    systemHealth: 'good'
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats();
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate(ROUTE_PATHS.medMngLogin);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !profile || profile.role !== 'admin') {
        toast.error('Accès refusé: Privilèges administrateur requis');
        navigate(ROUTE_PATHS.home);
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Erreur vérification admin:', error);
      navigate(ROUTE_PATHS.home);
    }
  };

  const fetchAdminStats = async () => {
    try {
      setLoading(true);

      // Récupérer les statistiques en parallèle
      const [
        usersResult,
        subscriptionsResult,
        contentResult
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('user_quotas').select('subscription_type', { count: 'exact' }),
        supabase.from('edn_items_immersive').select('id', { count: 'exact' })
      ]);

      const totalUsers = usersResult.count || 0;
      const activeSubscriptions = subscriptionsResult.data?.filter(
        sub => sub.subscription_type !== 'free'
      ).length || 0;
      const totalContent = contentResult.count || 0;
      const totalCreditsUsed = 45670; // Valeur simulée

      // Calcul approximatif du revenu mensuel
      const monthlyRevenue = activeSubscriptions * 25; // Prix moyen

      // Déterminer la santé du système
      const systemHealth = totalCreditsUsed > 50000 ? 'warning' : 'good';

      setStats({
        totalUsers,
        activeSubscriptions,
        totalContent,
        monthlyRevenue,
        totalCreditsUsed,
        systemHealth
      });

    } catch (error) {
      console.error('Erreur chargement stats admin:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Vérification des accès...</h2>
          <p className="text-muted-foreground">Contrôle des privilèges administrateur</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <MedMngLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
        {/* Header */}
        <div className="bg-card/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-destructive rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-destructive-foreground" />
                </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Administration</h1>
                <p className="text-sm text-muted-foreground">
                  Gestion complète de la plateforme E-LiSA
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge 
                variant={stats.systemHealth === 'good' ? 'default' : 'destructive'}
                className="flex items-center gap-1"
              >
                <div className={`w-2 h-2 rounded-full ${
                  stats.systemHealth === 'good' ? 'bg-green-500' : 'bg-red-500'
                } animate-pulse`} />
                Système {stats.systemHealth === 'good' ? 'Opérationnel' : 'Alerte'}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/')}
              >
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Système</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Alertes système */}
            {stats.systemHealth !== 'good' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Attention: Utilisation élevée des crédits IA ({stats.totalCreditsUsed.toLocaleString()}).
                  Surveillez les coûts et les performances.
                </AlertDescription>
              </Alert>
            )}

            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Total des comptes créés
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Abonnements</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
                  <p className="text-xs text-muted-foreground">
                    Abonnements actifs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.monthlyRevenue}€</div>
                  <p className="text-xs text-muted-foreground">
                    Estimation mensuelle
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contenu</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalContent}</div>
                  <p className="text-xs text-muted-foreground">
                    Items EDN disponibles
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Graphiques et activité récente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Utilisation des crédits IA
                  </CardTitle>
                  <CardDescription>
                    Consommation des ressources IA sur la période
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Génération musicale</span>
                      </div>
                      <span className="font-medium">
                        {Math.round(stats.totalCreditsUsed * 0.6).toLocaleString()} crédits
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-green-500" />
                        <span className="text-sm">QCM intelligents</span>
                      </div>
                      <span className="font-medium">
                        {Math.round(stats.totalCreditsUsed * 0.3).toLocaleString()} crédits
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">Bandes dessinées</span>
                      </div>
                      <span className="font-medium">
                        {Math.round(stats.totalCreditsUsed * 0.1).toLocaleString()} crédits
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                  <CardDescription>
                    Tâches administratives courantes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('users')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Gérer les utilisateurs
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('content')}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Modérer le contenu
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('analytics')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Voir les analytics
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={fetchAdminStats}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Actualiser les données
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <AdminUsersManager />
          </TabsContent>

          <TabsContent value="content">
            <AdminContentManager />
          </TabsContent>

          <TabsContent value="subscriptions">
            <AdminSubscriptionsManager />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSystemSettings />
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </MedMngLayout>
  );
}