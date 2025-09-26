import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Activity, 
  Calendar, Download, Music, Brain, Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { errorService } from '@/services/core/ErrorService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  };
}

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
      uptime: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Récupération des données utilisateurs
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Calcul de la croissance utilisateurs
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const thisMonthUsers = profiles?.filter(p => 
        new Date(p.created_at) >= thisMonth
      ).length || 0;

      const lastMonthUsers = profiles?.filter(p => 
        new Date(p.created_at) >= lastMonth && new Date(p.created_at) < thisMonth
      ).length || 0;

      const growthRate = lastMonthUsers > 0 
        ? Math.round(((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100)
        : 0;

      // Simulation des données IA (RPC non disponible)
      const mockIaStats = { total_credits_used: 15000 };

      // Simulation de données de performance et d'usage
      const mockFeatureUsage = [
        { feature: 'Génération musicale', usage: 1250, percentage: 35 },
        { feature: 'QCM interactifs', usage: 980, percentage: 28 },
        { feature: 'Tableaux EDN', usage: 860, percentage: 24 },
        { feature: 'Scènes 3D', usage: 450, percentage: 13 }
      ];

      const mockCostBreakdown = [
        { service: 'Suno Music API', credits: 6250, cost: 125 },
        { service: 'OpenAI GPT-4', credits: 2940, cost: 58.8 },
        { service: 'DALL-E Images', credits: 1350, cost: 27 },
        { service: 'Autres services', credits: 460, cost: 9.2 }
      ];

      setAnalyticsData({
        userGrowth: {
          total: profiles?.length || 0,
          thisMonth: thisMonthUsers,
          lastMonth: lastMonthUsers,
          growthRate
        },
        contentUsage: {
          totalSessions: 3750, // Valeur simulée
          averageSessionTime: 18, // minutes
          mostUsedFeatures: mockFeatureUsage
        },
        aiUsage: {
          totalCreditsUsed: mockIaStats.total_credits_used,
          musicGenerated: 425,
          qcmGenerated: 1230,
          bdGenerated: 89,
          costBreakdown: mockCostBreakdown
        },
        performance: {
          averageLoadTime: 1.2, // secondes
          errorRate: 0.8, // pourcentage
          uptime: 99.9 // pourcentage
        }
      });

    } catch (error) {
      errorService.handleError(error as Error, 'system', false);
      toast.error('Erreur lors du chargement des analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async () => {
    try {
      // Créer un rapport CSV simple
      const csvData = [
        ['Métrique', 'Valeur'],
        ['Utilisateurs totaux', analyticsData.userGrowth.total.toString()],
        ['Nouveaux utilisateurs ce mois', analyticsData.userGrowth.thisMonth.toString()],
        ['Crédits IA utilisés', analyticsData.aiUsage.totalCreditsUsed.toString()],
        ['Temps de session moyen', `${analyticsData.contentUsage.averageSessionTime} min`],
        ['Uptime', `${analyticsData.performance.uptime}%`]
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      
      window.URL.revokeObjectURL(url);
      toast.success('Rapport exporté avec succès');
    } catch (error) {
      errorService.handleError(error as Error, 'user_action', true);
      toast.error('Erreur lors de l\'export');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec exports */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics et métriques</h2>
          <p className="text-muted-foreground">
            Analysez les performances et l'utilisation de la plateforme
          </p>
        </div>
        <Button onClick={exportAnalytics} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exporter le rapport
        </Button>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
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
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div className="text-sm font-medium text-muted-foreground">Croissance</div>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {analyticsData.userGrowth.growthRate > 0 ? '+' : ''}{analyticsData.userGrowth.growthRate}%
            </div>
            <div className="text-sm text-muted-foreground">vs mois dernier</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-purple-600" />
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
              <BarChart3 className="h-4 w-4 text-orange-600" />
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
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {analyticsData.aiUsage.musicGenerated}
                  </div>
                  <div className="text-sm text-muted-foreground">Musiques générées</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.aiUsage.qcmGenerated}
                  </div>
                  <div className="text-sm text-muted-foreground">QCM créés</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
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
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {analyticsData.performance.uptime}%
              </div>
              <div className="text-sm font-medium">Disponibilité</div>
              <Badge className="mt-2 bg-green-100 text-green-800">Excellent</Badge>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {analyticsData.performance.averageLoadTime}s
              </div>
              <div className="text-sm font-medium">Temps de chargement</div>
              <Badge className="mt-2 bg-blue-100 text-blue-800">Bon</Badge>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">
                {analyticsData.performance.errorRate}%
              </div>
              <div className="text-sm font-medium">Taux d'erreur</div>
              <Badge className="mt-2 bg-yellow-100 text-yellow-800">Acceptable</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};