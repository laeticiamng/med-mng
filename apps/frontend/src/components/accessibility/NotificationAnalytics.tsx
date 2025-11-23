import logger from '@/lib/logger';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Activity, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationHistoryItem {
  id: string;
  platform: 'slack' | 'discord';
  status: 'success' | 'failed' | 'pending';
  sent_at: string;
}

const COLORS = {
  success: 'hsl(var(--success))',
  failed: 'hsl(var(--destructive))',
  pending: 'hsl(var(--warning))',
  slack: 'hsl(var(--accent))',
  discord: 'hsl(var(--primary))',
};

interface PeriodStats {
  total: number;
  success: number;
  failed: number;
  pending: number;
  successRate: number;
}

export function NotificationAnalytics() {
  const [currentPeriodData, setCurrentPeriodData] = useState<NotificationHistoryItem[]>([]);
  const [previousPeriodData, setPreviousPeriodData] = useState<NotificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [compareMode, setCompareMode] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [period, compareMode]);

  const getPeriodDates = (periodType: 'week' | 'month' | 'quarter', offset: number = 0) => {
    const now = new Date();
    
    switch (periodType) {
      case 'week':
        const weekStart = startOfWeek(subWeeks(now, offset), { weekStartsOn: 1 });
        const weekEnd = endOfWeek(subWeeks(now, offset), { weekStartsOn: 1 });
        return { start: startOfDay(weekStart), end: endOfDay(weekEnd) };
      
      case 'month':
        const monthStart = startOfMonth(subMonths(now, offset));
        const monthEnd = endOfMonth(subMonths(now, offset));
        return { start: startOfDay(monthStart), end: endOfDay(monthEnd) };
      
      case 'quarter':
        const quarterStart = startOfMonth(subMonths(now, offset * 3));
        const quarterEnd = endOfMonth(subMonths(now, offset * 3 - 2));
        return { start: startOfDay(quarterStart), end: endOfDay(quarterEnd) };
      
      default:
        return { start: startOfDay(now), end: endOfDay(now) };
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Période actuelle
      const currentDates = getPeriodDates(period, 0);
      
      // Période précédente
      const previousDates = getPeriodDates(period, 1);

      // Charger les données de la période actuelle
      const { data: currentData, error: currentError } = await supabase
        .from('notification_history')
        .select('id, platform, status, sent_at')
        .eq('user_id', user.id)
        .gte('sent_at', currentDates.start.toISOString())
        .lte('sent_at', currentDates.end.toISOString())
        .order('sent_at', { ascending: true });

      if (currentError) throw currentError;

      // Charger les données de la période précédente si mode comparaison
      let previousData = [];
      if (compareMode) {
        const { data: prevData, error: prevError } = await supabase
          .from('notification_history')
          .select('id, platform, status, sent_at')
          .eq('user_id', user.id)
          .gte('sent_at', previousDates.start.toISOString())
          .lte('sent_at', previousDates.end.toISOString())
          .order('sent_at', { ascending: true });

        if (prevError) throw prevError;
        previousData = prevData || [];
      }

      const typedCurrentData = (currentData || []).map(item => ({
        ...item,
        platform: item.platform as 'slack' | 'discord',
        status: item.status as 'success' | 'failed' | 'pending',
      }));

      const typedPreviousData = (previousData || []).map(item => ({
        ...item,
        platform: item.platform as 'slack' | 'discord',
        status: item.status as 'success' | 'failed' | 'pending',
      }));

      setCurrentPeriodData(typedCurrentData);
      setPreviousPeriodData(typedPreviousData);
    } catch (error) {
      logger.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: NotificationHistoryItem[]): PeriodStats => {
    const total = data.length;
    const success = data.filter(d => d.status === 'success').length;
    const failed = data.filter(d => d.status === 'failed').length;
    const pending = data.filter(d => d.status === 'pending').length;
    const successRate = total > 0 ? (success / total) * 100 : 0;

    return { total, success, failed, pending, successRate };
  };

  const getVariation = (current: number, previous: number): { value: number; isPositive: boolean; isNeutral: boolean } => {
    if (previous === 0) return { value: current > 0 ? 100 : 0, isPositive: current > 0, isNeutral: current === 0 };
    const variation = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(variation),
      isPositive: variation > 0,
      isNeutral: Math.abs(variation) < 0.1,
    };
  };

  // Comparaison des périodes
  const comparisonData = () => {
    const currentStats = calculateStats(currentPeriodData);
    const previousStats = calculateStats(previousPeriodData);

    return {
      current: currentStats,
      previous: previousStats,
      totalVariation: getVariation(currentStats.total, previousStats.total),
      successVariation: getVariation(currentStats.success, previousStats.success),
      successRateVariation: getVariation(currentStats.successRate, previousStats.successRate),
    };
  };

  // Calcul des statistiques par plateforme
  const platformStats = (data: NotificationHistoryItem[]) => {
    const stats = {
      slack: { total: 0, success: 0, failed: 0, pending: 0 },
      discord: { total: 0, success: 0, failed: 0, pending: 0 },
    };

    data.forEach(item => {
      stats[item.platform].total++;
      stats[item.platform][item.status]++;
    });

    return [
      {
        platform: 'Slack',
        total: stats.slack.total,
        successRate: stats.slack.total > 0 ? (stats.slack.success / stats.slack.total * 100).toFixed(1) : 0,
        success: stats.slack.success,
        failed: stats.slack.failed,
        pending: stats.slack.pending,
      },
      {
        platform: 'Discord',
        total: stats.discord.total,
        successRate: stats.discord.total > 0 ? (stats.discord.success / stats.discord.total * 100).toFixed(1) : 0,
        success: stats.discord.success,
        failed: stats.discord.failed,
        pending: stats.discord.pending,
      },
    ];
  };

  // Répartition globale des statuts
  const statusDistribution = (data: NotificationHistoryItem[]) => {
    const distribution = {
      success: 0,
      failed: 0,
      pending: 0,
    };

    data.forEach(item => {
      distribution[item.status]++;
    });

    return [
      { name: 'Succès', value: distribution.success, color: COLORS.success },
      { name: 'Échecs', value: distribution.failed, color: COLORS.failed },
      { name: 'En attente', value: distribution.pending, color: COLORS.pending },
    ].filter(item => item.value > 0);
  };

  // Évolution temporelle
  const timelineData = (data: NotificationHistoryItem[]) => {
    const grouped: Record<string, { date: string; success: number; failed: number; total: number }> = {};

    data.forEach(item => {
      const dateKey = format(new Date(item.sent_at), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: format(new Date(item.sent_at), 'dd MMM', { locale: fr }),
          success: 0,
          failed: 0,
          total: 0,
        };
      }
      grouped[dateKey].total++;
      if (item.status === 'success') grouped[dateKey].success++;
      if (item.status === 'failed') grouped[dateKey].failed++;
    });

    return Object.values(grouped).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const getPeriodLabel = (periodType: 'week' | 'month' | 'quarter') => {
    switch (periodType) {
      case 'week': return 'Semaine';
      case 'month': return 'Mois';
      case 'quarter': return 'Trimestre';
    }
  };

  const VariationBadge = ({ variation }: { variation: { value: number; isPositive: boolean; isNeutral: boolean } }) => {
    if (variation.isNeutral) {
      return (
        <Badge variant="outline" className="gap-1">
          <Minus className="h-3 w-3" />
          Stable
        </Badge>
      );
    }
    
    return (
      <Badge 
        variant="outline" 
        className={`gap-1 ${variation.isPositive ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}
      >
        {variation.isPositive ? (
          <ArrowUpRight className="h-3 w-3" />
        ) : (
          <ArrowDownRight className="h-3 w-3" />
        )}
        {variation.value.toFixed(1)}%
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const comparison = compareMode ? comparisonData() : null;
  const platformData = platformStats(currentPeriodData);
  const statusData = statusDistribution(currentPeriodData);
  const timeline = timelineData(currentPeriodData);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Analyse des Notifications
            </CardTitle>
            <CardDescription>
              {compareMode 
                ? `Comparaison: ${getPeriodLabel(period)} actuel vs ${getPeriodLabel(period)} précédent`
                : `Visualisation des performances du ${getPeriodLabel(period).toLowerCase()} actuel`
              }
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(value: 'week' | 'month' | 'quarter') => setPeriod(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semaine</SelectItem>
                <SelectItem value="month">Mois</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={compareMode ? "default" : "outline"}
              size="sm"
              onClick={() => setCompareMode(!compareMode)}
            >
              {compareMode ? 'Mode comparaison' : 'Sans comparaison'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {currentPeriodData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune donnée disponible pour cette période</p>
          </div>
        ) : (
          <>
            {/* Métriques clés avec comparaison */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div>
                      <p className="text-3xl font-bold">{comparison?.current.successRate.toFixed(1)}%</p>
                      {compareMode && comparison && (
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <VariationBadge variation={comparison.successRateVariation} />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Taux de succès</p>
                    {compareMode && comparison && (
                      <p className="text-xs text-muted-foreground">
                        vs {comparison.previous.successRate.toFixed(1)}% période précédente
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div>
                      <p className="text-3xl font-bold">{comparison?.current.total}</p>
                      {compareMode && comparison && (
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <VariationBadge variation={comparison.totalVariation} />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Notifications envoyées</p>
                    {compareMode && comparison && (
                      <p className="text-xs text-muted-foreground">
                        vs {comparison.previous.total} période précédente
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <PieChartIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div>
                      <p className="text-3xl font-bold">{comparison?.current.success}</p>
                      {compareMode && comparison && (
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <VariationBadge variation={comparison.successVariation} />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Notifications réussies</p>
                    {compareMode && comparison && (
                      <p className="text-xs text-muted-foreground">
                        vs {comparison.previous.success} période précédente
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Graphique: Taux de succès par plateforme */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performances par Plateforme</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                              <p className="font-semibold mb-2">{data.platform}</p>
                              <p className="text-sm text-success">Succès: {data.success}</p>
                              <p className="text-sm text-destructive">Échecs: {data.failed}</p>
                              {data.pending > 0 && (
                                <p className="text-sm text-warning">En attente: {data.pending}</p>
                              )}
                              <p className="text-sm font-semibold mt-2">
                                Taux: {data.successRate}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="success" name="Succès" fill={COLORS.success} />
                    <Bar dataKey="failed" name="Échecs" fill={COLORS.failed} />
                    <Bar dataKey="pending" name="En attente" fill={COLORS.pending} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
              {/* Graphique: Répartition des statuts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Répartition des Statuts</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => 
                          `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Tableau récapitulatif */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Détails par Plateforme</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {platformData.map((platform) => (
                      <div key={platform.platform} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{platform.platform}</span>
                          <span className="text-sm text-muted-foreground">
                            {platform.total} notifications
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${platform.successRate}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-600">{platform.success} succès</span>
                          <span className="font-semibold">{platform.successRate}%</span>
                          <span className="text-red-600">{platform.failed} échecs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Graphique: Évolution temporelle */}
            {timeline.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Évolution dans le Temps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border rounded-lg p-3 shadow-lg">
                                <p className="font-semibold mb-2">{data.date}</p>
                                <p className="text-sm text-green-600">Succès: {data.success}</p>
                                <p className="text-sm text-red-600">Échecs: {data.failed}</p>
                                <p className="text-sm font-semibold mt-2">Total: {data.total}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="success"
                        name="Succès"
                        stroke={COLORS.success}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="failed"
                        name="Échecs"
                        stroke={COLORS.failed}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        name="Total"
                        stroke="#8884d8"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
