import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
    Activity,
    AlertTriangle,
    Calendar,
    Clock,
    Download, RefreshCw,
    Target,
    TrendingUp, Users
} from "lucide-react";
import { useEffect, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Funnel,
    FunnelChart,
    LabelList,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';
import { toast } from "sonner";

interface AnalyticsData {
  user_engagement: {
    daily_active_users: number;
    weekly_active_users: number;
    session_duration_avg: number;
    bounce_rate: number;
  };
  content_performance: {
    top_edn_items: Array<{item_code: string, views: number, completion_rate: number}>;
    quiz_success_rates: Array<{item_code: string, success_rate: number}>;
    popular_features: Array<{feature: string, usage_count: number}>;
  };
  system_health: {
    api_response_time: number;
    error_rate: number;
    uptime_percentage: number;
    database_performance: number;
  };
  business_insights: {
    conversion_funnel: Array<{stage: string, count: number, drop_rate: number}>;
    feature_adoption: Array<{feature: string, adoption_rate: number}>;
    user_retention: Array<{period: string, retention_rate: number}>;
  };
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function AdvancedAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('7d');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { _data, error } = await supabase.functions.invoke('analytics-engine', {
        body: { timeframe, detailed: true }
      });

      if (error) throw error;

      setAnalytics(_data.metrics);
      setLastUpdate(new Date());
      toast.success(`Analytics générées pour ${timeframe}`);
    } catch (error) {
      console.error('Erreur analytics:', error);
      toast.error('Erreur lors de la génération des analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const exportAnalytics = async () => {
    try {
      const { error } = await supabase.functions.invoke('admin-export', {
        body: { 
          table: 'analytics',
          format: 'json',
          filters: { timeframe }
        }
      });

      if (error) throw error;

      const blob = new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${timeframe}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      toast.success('Analytics exportées');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className={`h-8 w-8 mx-auto mb-4 ${loading ? 'animate-spin' : ''}`} />
          <p>Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics Avancé</h2>
          <p className="text-muted-foreground">
            Insights détaillés et métriques business
          </p>
        </div>
        <div className="flex gap-2">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="24h">24h</option>
            <option value="7d">7 jours</option>
            <option value="30d">30 jours</option>
            <option value="90d">90 jours</option>
          </select>
          <Button onClick={fetchAnalytics} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button onClick={exportAnalytics} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Utilisateurs Actifs</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{analytics.user_engagement.daily_active_users}</span>
              <span className="text-sm text-muted-foreground ml-2">DAU</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-secondary" />
              <span className="text-sm font-medium">Durée Session</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{analytics.user_engagement.session_duration_avg}</span>
              <span className="text-sm text-muted-foreground ml-2">min</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Taux Rebond</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{analytics.user_engagement.bounce_rate}%</span>
              <Badge variant={analytics.user_engagement.bounce_rate < 30 ? "default" : "destructive"} className="ml-2">
                {analytics.user_engagement.bounce_rate < 30 ? 'Bon' : 'À améliorer'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-success" />
              <span className="text-sm font-medium">Uptime</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{analytics.system_health.uptime_percentage.toFixed(1)}%</span>
              <Badge variant="default" className="ml-2">Excellent</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top EDN Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Items EDN
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.content_performance.top_edn_items}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="item_code" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rétention Utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle>Rétention Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.business_insights.user_retention}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="retention_rate" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel de Conversion */}
        <Card>
          <CardHeader>
            <CardTitle>Funnel de Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <FunnelChart data={analytics.business_insights.conversion_funnel}>
                <Tooltip />
                <Funnel
                  dataKey="count"
                  nameKey="stage"
                  fill="hsl(var(--primary))"
                >
                  <LabelList position="center" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Adoption des Fonctionnalités */}
        <Card>
          <CardHeader>
            <CardTitle>Adoption des Fonctionnalités</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.business_insights.feature_adoption}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ feature, adoption_rate }) => `${feature}: ${adoption_rate}%`}
                  outerRadius={80}
                  fill="hsl(var(--chart-1))"
                  dataKey="adoption_rate"
                  nameKey="feature"
                >
                  {analytics.business_insights.feature_adoption.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Métriques Système */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Santé du Système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {analytics.system_health.api_response_time}ms
              </div>
              <div className="text-sm text-muted-foreground">Temps Réponse API</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {analytics.system_health.error_rate}%
              </div>
              <div className="text-sm text-muted-foreground">Taux d'Erreur</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {analytics.system_health.database_performance.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Perf. Base</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {analytics.system_health.uptime_percentage.toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">Disponibilité</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      {lastUpdate && (
        <div className="text-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 inline mr-2" />
          Dernière mise à jour: {lastUpdate.toLocaleString()}
        </div>
      )}
    </div>
  );
}