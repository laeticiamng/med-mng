import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, Wifi, WifiOff, TrendingUp, Users, Clock, 
  Download, Bell, BellOff, RefreshCw, BarChart3, 
  Monitor, Tablet, Activity
} from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { usePWAMetrics } from '@/hooks/usePWAMetrics';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';
import { useActivityTracking } from '@/hooks/useActivityTracking';

interface AnalyticsStats {
  total_users: number;
  installed_users: number;
  offline_sessions: number;
  avg_session_duration: number;
  total_page_views: number;
  avg_fcp: number;
  avg_lcp: number;
  avg_cls: number;
  device_breakdown: { mobile: number; tablet: number; desktop: number };
  browser_breakdown: Record<string, number>;
}

const PWAAnalytics: React.FC = () => {
  const { logActivity } = useActivityTracking();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { metrics } = usePWAMetrics();
  const { 
    isSupported, 
    isSubscribed, 
    permission, 
    isLoading: notifLoading,
    subscribe, 
    unsubscribe,
    sendTestNotification 
  } = usePushNotifications();

  useEffect(() => {
    loadAnalytics();
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { page: 'pwa_analytics', action: 'view' }
    });
  }, []);

  const loadAnalytics = async () => {
    try {
      // Charger les stats depuis Supabase
      const { data: metricsData, error } = await supabase
        .from('pwa_metrics' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      if (metricsData) {
        // Calculer les statistiques
        const totalUsers = new Set(metricsData.map((m: any) => m.user_id)).size;
        const installedUsers = metricsData.filter((m: any) => m.is_installed).length;
        const offlineSessions = metricsData.filter((m: any) => m.is_offline).length;
        
        const avgSessionDuration = metricsData
          .filter((m: any) => m.session_duration)
          .reduce((sum: number, m: any) => sum + m.session_duration, 0) / 
          (metricsData.filter((m: any) => m.session_duration).length || 1);

        const totalPageViews = metricsData.reduce((sum: number, m: any) => sum + (m.page_views || 0), 0);

        // Core Web Vitals moyennes
        const avgFCP = calculateAvg(metricsData, 'fcp');
        const avgLCP = calculateAvg(metricsData, 'lcp');
        const avgCLS = calculateAvg(metricsData, 'cls');

        // Device breakdown
        const deviceBreakdown = {
          mobile: metricsData.filter((m: any) => m.device_type === 'mobile').length,
          tablet: metricsData.filter((m: any) => m.device_type === 'tablet').length,
          desktop: metricsData.filter((m: any) => m.device_type === 'desktop').length,
        };

        // Browser breakdown
        const browserBreakdown: Record<string, number> = {};
        metricsData.forEach((m: any) => {
          if (m.browser) {
            browserBreakdown[m.browser] = (browserBreakdown[m.browser] || 0) + 1;
          }
        });

        setStats({
          total_users: totalUsers,
          installed_users: installedUsers,
          offline_sessions: offlineSessions,
          avg_session_duration: Math.floor(avgSessionDuration),
          total_page_views: totalPageViews,
          avg_fcp: avgFCP,
          avg_lcp: avgLCP,
          avg_cls: avgCLS,
          device_breakdown: deviceBreakdown,
          browser_breakdown: browserBreakdown,
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Erreur lors du chargement des analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAvg = (data: any[], field: string): number => {
    const filtered = data.filter((m: any) => m[field]);
    if (filtered.length === 0) return 0;
    return Math.round(filtered.reduce((sum: number, m: any) => sum + m[field], 0) / filtered.length);
  };

  const installRate = stats ? ((stats.installed_users / stats.total_users) * 100).toFixed(1) : '0';

  return (
    <>
      <SEOHead
        title="Analytics PWA - Métriques et Performance"
        description="Dashboard analytics pour suivre l'adoption PWA, performance, utilisation offline et engagement utilisateurs"
        noindex={true}
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-muted/50 p-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  📊 Analytics PWA
                </h1>
                <p className="text-muted-foreground">
                  Suivez les performances et l'adoption de votre Progressive Web App
                </p>
              </div>
              <Button onClick={loadAnalytics} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>

            {/* Session actuelle */}
            <Card className="mb-6 bg-gradient-to-r from-primary to-accent text-primary-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary-foreground">
                  <Activity className="w-5 h-5" />
                  Session Actuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm opacity-90">Installation</div>
                    <div className="text-2xl font-bold flex items-center gap-2">
                      {metrics.isInstalled ? (
                        <>
                          <Download className="w-5 h-5" />
                          Installée
                        </>
                      ) : (
                        'Non installée'
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Connexion</div>
                    <div className="text-2xl font-bold flex items-center gap-2">
                      {metrics.isOffline ? (
                        <>
                          <WifiOff className="w-5 h-5" />
                          Offline
                        </>
                      ) : (
                        <>
                          <Wifi className="w-5 h-5" />
                          Online
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Pages vues</div>
                    <div className="text-2xl font-bold">{metrics.pageViews}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Session ID</div>
                    <div className="text-xs font-mono truncate">{metrics.sessionId.slice(0, 16)}...</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Utilisateurs Totaux
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">
                      {stats?.total_users || 0}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                      <Users className="w-4 h-4" />
                      Utilisateurs uniques
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Taux d'Installation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-success">
                      {installRate}%
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                      <Download className="w-4 h-4" />
                      {stats?.installed_users || 0} installations
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Sessions Offline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-warning">
                      {stats?.offline_sessions || 0}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                      <WifiOff className="w-4 h-4" />
                      Utilisations hors ligne
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Durée Moyenne
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {Math.floor((stats?.avg_session_duration || 0) / 60)}m
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                      <Clock className="w-4 h-4" />
                      Par session
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>First Contentful Paint</CardTitle>
                    <CardDescription>Temps avant le premier rendu</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">
                      {stats?.avg_fcp || 0}
                      <span className="text-xl text-muted-foreground">ms</span>
                    </div>
                    <Badge variant={stats?.avg_fcp && stats.avg_fcp < 1800 ? 'default' : 'destructive'} className="mt-2">
                      {stats?.avg_fcp && stats.avg_fcp < 1800 ? 'Bon' : 'À améliorer'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Largest Contentful Paint</CardTitle>
                    <CardDescription>Plus grand élément rendu</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">
                      {stats?.avg_lcp || 0}
                      <span className="text-xl text-muted-foreground">ms</span>
                    </div>
                    <Badge variant={stats?.avg_lcp && stats.avg_lcp < 2500 ? 'default' : 'destructive'} className="mt-2">
                      {stats?.avg_lcp && stats.avg_lcp < 2500 ? 'Bon' : 'À améliorer'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cumulative Layout Shift</CardTitle>
                    <CardDescription>Stabilité visuelle</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">
                      {(stats?.avg_cls || 0).toFixed(3)}
                    </div>
                    <Badge variant={stats?.avg_cls && stats.avg_cls < 0.1 ? 'default' : 'destructive'} className="mt-2">
                      {stats?.avg_cls && stats.avg_cls < 0.1 ? 'Bon' : 'À améliorer'}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Devices Tab */}
            <TabsContent value="devices" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par Device</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-primary" />
                        <span>Mobile</span>
                      </div>
                      <span className="font-bold">{stats?.device_breakdown.mobile || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Tablet className="w-5 h-5 text-accent" />
                        <span>Tablet</span>
                      </div>
                      <span className="font-bold">{stats?.device_breakdown.tablet || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-success" />
                        <span>Desktop</span>
                      </div>
                      <span className="font-bold">{stats?.device_breakdown.desktop || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par Navigateur</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(stats?.browser_breakdown || {}).map(([browser, count]) => (
                      <div key={browser} className="flex items-center justify-between">
                        <span>{browser}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications Push
                  </CardTitle>
                  <CardDescription>
                    Gérez vos abonnements aux notifications push
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!isSupported ? (
                    <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                      <p className="text-warning">
                        ⚠️ Les notifications push ne sont pas supportées sur ce navigateur
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          {isSubscribed ? (
                            <Bell className="w-6 h-6 text-success" />
                          ) : (
                            <BellOff className="w-6 h-6 text-muted-foreground" />
                          )}
                          <div>
                            <div className="font-semibold">
                              {isSubscribed ? 'Abonné aux notifications' : 'Non abonné'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Permission: {permission}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={isSubscribed ? unsubscribe : subscribe}
                          disabled={notifLoading}
                          variant={isSubscribed ? 'outline' : 'default'}
                        >
                          {notifLoading ? 'Chargement...' : isSubscribed ? 'Se désabonner' : 'S\'abonner'}
                        </Button>
                      </div>

                      {isSubscribed && (
                        <div className="space-y-3">
                          <Button
                            onClick={sendTestNotification}
                            variant="outline"
                            className="w-full"
                          >
                            🧪 Envoyer une notification de test
                          </Button>
                          <p className="text-sm text-muted-foreground text-center">
                            Vous recevrez des notifications pour les nouvelles fonctionnalités,
                            mises à jour importantes et alertes système
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default PWAAnalytics;
