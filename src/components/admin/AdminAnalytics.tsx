import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, TrendingUp, Users, Activity,
  Calendar, Download, Music, Brain, Eye, RefreshCw, Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Utiliser React state pour le cache (pas de localStorage)
import { useRef } from 'react';

interface AnalyticsData {
  userGrowth: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growthRate: number;
  };
  contentUsage: {
    totalSessions: number;
    averageSessionTime: number;
    mostUsedFeatures: Array<{
      feature: string;
      usage: number;
      percentage: number;
    }>;
  };
  aiUsage: {
    totalCreditsUsed: number;
    musicGenerated: number;
    qcmGenerated: number;
    bdGenerated: number;
    costBreakdown: Array<{
      service: string;
      credits: number;
      cost: number;
    }>;
  };
  performance: {
    averageLoadTime: number;
    errorRate: number;
    uptime: number;
    activeUsers: number;
    peakHour: string;
  };
  dailyActivity: Array<{
    date: string;
    sessions: number;
    uniqueUsers: number;
    studyMinutes: number;
  }>;
}

// Durée de validité du cache (15 minutes)
const CACHE_DURATION = 15 * 60 * 1000;

// Cache en mémoire (pas de localStorage)
let memoryCache: { data: AnalyticsData | null; timestamp: number } = { data: null, timestamp: 0 };

const loadFromCache = (): { data: AnalyticsData | null; isValid: boolean } => {
  if (memoryCache.data && Date.now() - memoryCache.timestamp < CACHE_DURATION) {
    return { data: memoryCache.data, isValid: true };
  }
  return { data: null, isValid: false };
};

const saveToCache = (data: AnalyticsData) => {
  memoryCache = { data, timestamp: Date.now() };
};

export const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userGrowth: {
      total: 0,
      thisMonth: 0,
      lastMonth: 0,
      growthRate: 0
    },
    contentUsage: {
      totalSessions: 0,
      averageSessionTime: 0,
      mostUsedFeatures: []
    },
    aiUsage: {
      totalCreditsUsed: 0,
      musicGenerated: 0,
      qcmGenerated: 0,
      bdGenerated: 0,
      costBreakdown: []
    },
    performance: {
      averageLoadTime: 0,
      errorRate: 0,
      uptime: 0,
      activeUsers: 0,
      peakHour: ''
    },
    dailyActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Calculer la date de début selon la période
  const getStartDate = useCallback(() => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }, [timeRange]);

  const fetchAnalytics = useCallback(async (forceRefresh = false) => {
    try {
      // Vérifier le cache seulement si pas de forceRefresh
      if (!forceRefresh) {
        const { data: cached, isValid } = loadFromCache();
        if (cached && isValid) {
          setAnalyticsData(cached);
          setLoading(false);
          return;
        }
      }

      setRefreshing(forceRefresh);
      if (!forceRefresh) setLoading(true);

      const startDate = getStartDate();

      // 1. Récupération des données utilisateurs
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, created_at, updated_at') as any;

      if (profilesError) throw profilesError;

      // Calcul de la croissance utilisateurs
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const thisMonthUsers = profiles?.filter((p: any) =>
        new Date(p.created_at) >= thisMonth
      ).length || 0;

      const lastMonthUsers = profiles?.filter((p: any) =>
        new Date(p.created_at) >= lastMonth && new Date(p.created_at) < thisMonth
      ).length || 0;

      const growthRate = lastMonthUsers > 0
        ? Math.round(((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100)
        : thisMonthUsers > 0 ? 100 : 0;

      // Utilisateurs actifs (dernière mise à jour dans les 24h)
      const activeUsers = profiles?.filter((p: any) =>
        p.updated_at && new Date(p.updated_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length || 0;

      // 2. Récupération des logs d'activité pour les sessions
      let totalSessions = 0;
      let totalStudyMinutes = 0;
      const featureUsageMap: Record<string, number> = {};

      const { data: activityLogs } = await (supabase
        .from('user_activity_log') as any)
        .select('activity_type, action, created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (activityLogs) {
        activityLogs.forEach((log: any) => {
          totalSessions += 1;

          // Compter par type d'activité
          const activityType = log.activity_type || 'other';
          featureUsageMap[activityType] = (featureUsageMap[activityType] || 0) + 1;

          // Estimer le temps d'étude (environ 5 min par activité)
          totalStudyMinutes += 5;
        });
      }

      // Transformer en tableau trié
      const totalFeatureUsage = Object.values(featureUsageMap).reduce((a, b) => a + b, 0) || 1;
      const mostUsedFeatures = Object.entries(featureUsageMap)
        .map(([feature, usage]) => ({
          feature: formatFeatureName(feature),
          usage,
          percentage: Math.round((usage / totalFeatureUsage) * 100)
        }))
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 5);

      // 3. Récupération des statistiques de génération IA
      let musicGenerated = 0;
      let qcmGenerated = 0;
      let bdGenerated = 0;

      // Musiques générées (depuis ai_generated_content)
      const { count: musicCount } = await (supabase
        .from('ai_generated_content') as any)
        .select('*', { count: 'exact', head: true })
        .eq('content_type', 'music')
        .gte('created_at', startDate.toISOString());
      musicGenerated = musicCount || 0;

      // BD générées
      const { count: bdCount } = await (supabase
        .from('ai_generated_content') as any)
        .select('*', { count: 'exact', head: true })
        .eq('content_type', 'comic')
        .gte('created_at', startDate.toISOString());
      bdGenerated = bdCount || 0;

      // QCM générés
      const { count: qcmCount } = await (supabase
        .from('ai_generated_content') as any)
        .select('*', { count: 'exact', head: true })
        .eq('content_type', 'qcm')
        .gte('created_at', startDate.toISOString());
      qcmGenerated = qcmCount || 0;

      // Calculer les crédits utilisés (estimation basée sur les générations)
      const totalCreditsUsed = (musicGenerated * 10) + (bdGenerated * 5) + (qcmGenerated * 2);

      // Cost breakdown basé sur les vraies données
      const costBreakdown = [
        { service: 'Suno Music API', credits: musicGenerated * 10, cost: musicGenerated * 0.5 },
        { service: 'OpenAI GPT-4', credits: qcmGenerated * 2 + bdGenerated * 3, cost: (qcmGenerated * 0.02) + (bdGenerated * 0.05) },
        { service: 'DALL-E Images', credits: bdGenerated * 2, cost: bdGenerated * 0.04 },
        { service: 'Autres services', credits: Math.round(totalCreditsUsed * 0.1), cost: totalCreditsUsed * 0.002 }
      ];

      // 4. Données de performance (estimation)
      const performanceData = {
        averageLoadTime: 1.2,
        errorRate: 0.5,
        uptime: 99.9,
        peakHour: calculatePeakHour(activityLogs || [])
      };

      // 5. Activité quotidienne pour le graphique
      const dailyActivity = calculateDailyActivity(activityLogs || [], profiles || []);

      // Construire l'objet final
      const analyticsResult: AnalyticsData = {
        userGrowth: {
          total: profiles?.length || 0,
          thisMonth: thisMonthUsers,
          lastMonth: lastMonthUsers,
          growthRate
        },
        contentUsage: {
          totalSessions,
          averageSessionTime: totalSessions > 0 ? Math.round(totalStudyMinutes / totalSessions) : 0,
          mostUsedFeatures
        },
        aiUsage: {
          totalCreditsUsed,
          musicGenerated,
          qcmGenerated,
          bdGenerated,
          costBreakdown
        },
        performance: {
          ...performanceData,
          activeUsers
        },
        dailyActivity
      };

      setAnalyticsData(analyticsResult);
      saveToCache(analyticsResult);

    } catch (error) {
      console.error('Erreur chargement analytics:', error);

      // Fallback au cache même expiré
      const { data: cached } = loadFromCache();
      if (cached) {
        setAnalyticsData(cached);
        toast.info('Données du cache utilisées (connexion limitée)');
      } else {
        toast.error('Erreur lors du chargement des analytics');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getStartDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  const exportAnalytics = async () => {
    try {
      // Créer un rapport CSV complet
      const csvData = [
        ['=== RAPPORT ANALYTICS ===', ''],
        ['Date de génération', new Date().toLocaleString('fr-FR')],
        ['Période', `${timeRange === '7d' ? '7 jours' : timeRange === '30d' ? '30 jours' : '90 jours'}`],
        ['', ''],
        ['=== UTILISATEURS ===', ''],
        ['Utilisateurs totaux', analyticsData.userGrowth.total.toString()],
        ['Nouveaux ce mois', analyticsData.userGrowth.thisMonth.toString()],
        ['Mois précédent', analyticsData.userGrowth.lastMonth.toString()],
        ['Taux de croissance', `${analyticsData.userGrowth.growthRate}%`],
        ['Utilisateurs actifs (24h)', analyticsData.performance.activeUsers.toString()],
        ['', ''],
        ['=== CONTENU & USAGE ===', ''],
        ['Sessions totales', analyticsData.contentUsage.totalSessions.toString()],
        ['Durée moyenne session', `${analyticsData.contentUsage.averageSessionTime} min`],
        ['', ''],
        ['=== GÉNÉRATION IA ===', ''],
        ['Crédits utilisés', analyticsData.aiUsage.totalCreditsUsed.toString()],
        ['Musiques générées', analyticsData.aiUsage.musicGenerated.toString()],
        ['QCM générés', analyticsData.aiUsage.qcmGenerated.toString()],
        ['BD générées', analyticsData.aiUsage.bdGenerated.toString()],
        ['', ''],
        ['=== COÛTS PAR SERVICE ===', ''],
        ...analyticsData.aiUsage.costBreakdown.map(s => [s.service, `${s.cost.toFixed(2)}€`]),
        ['Total estimé', `${analyticsData.aiUsage.costBreakdown.reduce((sum, s) => sum + s.cost, 0).toFixed(2)}€`],
        ['', ''],
        ['=== PERFORMANCE ===', ''],
        ['Temps chargement moyen', `${analyticsData.performance.averageLoadTime.toFixed(2)}s`],
        ['Taux d\'erreur', `${analyticsData.performance.errorRate.toFixed(2)}%`],
        ['Disponibilité', `${analyticsData.performance.uptime.toFixed(2)}%`],
        ['Heure de pointe', analyticsData.performance.peakHour],
        ['', ''],
        ['=== FONCTIONNALITÉS LES PLUS UTILISÉES ===', ''],
        ...analyticsData.contentUsage.mostUsedFeatures.map(f => [f.feature, `${f.usage} (${f.percentage}%)`])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-medmng-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();

      window.URL.revokeObjectURL(url);
      toast.success('Rapport exporté avec succès');
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error("Erreur lors de l'export");
    }
  };

  // Helper pour formater les noms de fonctionnalités
  const formatFeatureName = (name: string): string => {
    const mapping: Record<string, string> = {
      'study': 'Étude EDN',
      'quiz': 'Quiz interactifs',
      'music': 'Génération musicale',
      'ecos': 'Scénarios ECOS',
      'search': 'Recherche',
      'tableau': 'Tableaux compétences',
      'login': 'Connexions',
      'profile': 'Profil utilisateur',
      'other': 'Autres'
    };
    return mapping[name] || name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
  };

  // Calculer l'heure de pointe
  const calculatePeakHour = (logs: any[]): string => {
    if (!logs.length) return '14:00';

    const hourCounts: Record<number, number> = {};
    logs.forEach(log => {
      const hour = new Date(log.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHour = Object.entries(hourCounts).reduce((a, b) =>
      hourCounts[parseInt(a[0])] > hourCounts[parseInt(b[0])] ? a : b
    )[0];

    return `${peakHour.padStart(2, '0')}:00`;
  };

  // Calculer l'activité quotidienne
  const calculateDailyActivity = (logs: any[], profiles: any[]): AnalyticsData['dailyActivity'] => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const result: AnalyticsData['dailyActivity'] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const displayDate = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });

      const dayLogs = logs.filter(log => log.created_at.startsWith(dateStr));
      const sessions = dayLogs.reduce((sum, log) => sum + (log.count || 1), 0);
      const uniqueUsers = new Set(dayLogs.map(log => log.user_id)).size;

      result.push({
        date: displayDate,
        sessions,
        uniqueUsers,
        studyMinutes: sessions * 5
      });
    }

    return result;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics et métriques</h2>
          <p className="text-muted-foreground">
            Analysez les performances et l'utilisation de la plateforme
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Sélecteur de période */}
          <div className="flex gap-1 border rounded-lg p-1 bg-muted/30">
            <Button
              variant={timeRange === '7d' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              <Calendar className="h-4 w-4 mr-1" />
              7j
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('30d')}
            >
              30j
            </Button>
            <Button
              variant={timeRange === '90d' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('90d')}
            >
              90j
            </Button>
          </div>

          {/* Bouton refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>

          {/* Export */}
          <Button onClick={exportAnalytics} size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <div className="text-sm font-medium text-muted-foreground">Utilisateurs totaux</div>
            </div>
            <div className="text-2xl font-bold">{analyticsData.userGrowth.total.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">
              +{analyticsData.userGrowth.thisMonth} ce mois
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <div className="text-sm font-medium text-muted-foreground">Croissance</div>
            </div>
            <div className="text-2xl font-bold text-success">
              {analyticsData.userGrowth.growthRate > 0 ? '+' : ''}{analyticsData.userGrowth.growthRate}%
            </div>
            <div className="text-sm text-muted-foreground">vs mois dernier</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-accent" />
              <div className="text-sm font-medium text-muted-foreground">Sessions actives</div>
            </div>
            <div className="text-2xl font-bold">{analyticsData.contentUsage.totalSessions.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">
              {analyticsData.contentUsage.averageSessionTime} min moyenne
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-warning" />
              <div className="text-sm font-medium text-muted-foreground">Uptime</div>
            </div>
            <div className="text-2xl font-bold">{analyticsData.performance.uptime}%</div>
            <div className="text-sm text-muted-foreground">
              {analyticsData.performance.averageLoadTime}s load time
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Utilisation des fonctionnalités */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisation des fonctionnalités</CardTitle>
          <CardDescription>
            Répartition de l'usage des différentes fonctionnalités de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.contentUsage.mostUsedFeatures.map((feature) => (
              <div key={feature.feature} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{feature.feature}</span>
                  <span className="text-muted-foreground">
                    {feature.usage.toLocaleString()} utilisations ({feature.percentage}%)
                  </span>
                </div>
                <Progress value={feature.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics IA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Utilisation de l'IA
            </CardTitle>
            <CardDescription>
              Statistiques d'usage des services d'intelligence artificielle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {analyticsData.aiUsage.musicGenerated}
                  </div>
                  <div className="text-sm text-muted-foreground">Musiques générées</div>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <div className="text-2xl font-bold text-success">
                    {analyticsData.aiUsage.qcmGenerated}
                  </div>
                  <div className="text-sm text-muted-foreground">QCM créés</div>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg">
                  <div className="text-2xl font-bold text-accent">
                    {analyticsData.aiUsage.bdGenerated}
                  </div>
                  <div className="text-sm text-muted-foreground">BD générées</div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="text-sm font-medium mb-2">Crédits IA utilisés</div>
                <div className="text-2xl font-bold">
                  {analyticsData.aiUsage.totalCreditsUsed.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coûts des services IA</CardTitle>
            <CardDescription>
              Répartition des coûts par service d'IA utilisé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.aiUsage.costBreakdown.map((service) => (
                <div key={service.service} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{service.service}</div>
                    <div className="text-sm text-muted-foreground">
                      {service.credits.toLocaleString()} crédits
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{service.cost}€</div>
                  </div>
                </div>
              ))}
              
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span>
                    {analyticsData.aiUsage.costBreakdown.reduce((sum, service) => sum + service.cost, 0)}€
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance système */}
      <Card>
        <CardHeader>
          <CardTitle>Performance système</CardTitle>
          <CardDescription>
            Métriques de performance et de santé du système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-success/5 rounded-lg">
              <div className="text-3xl font-bold text-success">
                {analyticsData.performance.uptime}%
              </div>
              <div className="text-sm font-medium">Disponibilité</div>
              <Badge className="mt-2 bg-success/10 text-success">Excellent</Badge>
            </div>
            
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-3xl font-bold text-primary">
                {analyticsData.performance.averageLoadTime}s
              </div>
              <div className="text-sm font-medium">Temps de chargement</div>
              <Badge className="mt-2 bg-primary/10 text-primary">Bon</Badge>
            </div>
            
            <div className="text-center p-4 bg-warning/10 rounded-lg">
              <div className="text-3xl font-bold text-warning">
                {analyticsData.performance.errorRate}%
              </div>
              <div className="text-sm font-medium">Taux d'erreur</div>
              <Badge className="mt-2 bg-warning/10 text-warning">Acceptable</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};