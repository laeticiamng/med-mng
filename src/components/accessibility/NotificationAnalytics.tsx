import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, Activity, PieChart as PieChartIcon } from 'lucide-react';
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
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationHistoryItem {
  id: string;
  platform: 'slack' | 'discord';
  status: 'success' | 'failed' | 'pending';
  sent_at: string;
}

const COLORS = {
  success: '#10b981',
  failed: '#ef4444',
  pending: '#f59e0b',
  slack: '#4A154B',
  discord: '#5865F2',
};

export function NotificationAnalytics() {
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    loadHistory();
  }, [period]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startDate = startOfDay(subDays(new Date(), parseInt(period)));
      const endDate = endOfDay(new Date());

      const { data, error } = await supabase
        .from('notification_history')
        .select('id, platform, status, sent_at')
        .eq('user_id', user.id)
        .gte('sent_at', startDate.toISOString())
        .lte('sent_at', endDate.toISOString())
        .order('sent_at', { ascending: true });

      if (error) throw error;

      const typedData = (data || []).map(item => ({
        ...item,
        platform: item.platform as 'slack' | 'discord',
        status: item.status as 'success' | 'failed' | 'pending',
      }));

      setHistory(typedData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcul des statistiques par plateforme
  const platformStats = () => {
    const stats = {
      slack: { total: 0, success: 0, failed: 0, pending: 0 },
      discord: { total: 0, success: 0, failed: 0, pending: 0 },
    };

    history.forEach(item => {
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
  const statusDistribution = () => {
    const distribution = {
      success: 0,
      failed: 0,
      pending: 0,
    };

    history.forEach(item => {
      distribution[item.status]++;
    });

    return [
      { name: 'Succès', value: distribution.success, color: COLORS.success },
      { name: 'Échecs', value: distribution.failed, color: COLORS.failed },
      { name: 'En attente', value: distribution.pending, color: COLORS.pending },
    ].filter(item => item.value > 0);
  };

  // Évolution temporelle
  const timelineData = () => {
    const grouped: Record<string, { date: string; success: number; failed: number; total: number }> = {};

    history.forEach(item => {
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

  // Taux de succès global
  const globalSuccessRate = () => {
    if (history.length === 0) return 0;
    const successCount = history.filter(h => h.status === 'success').length;
    return ((successCount / history.length) * 100).toFixed(1);
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

  const platformData = platformStats();
  const statusData = statusDistribution();
  const timeline = timelineData();

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
              Visualisation des performances et taux de succès
            </CardDescription>
          </div>
          <Select value={period} onValueChange={(value: '7' | '30' | '90') => setPeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">90 derniers jours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {history.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune donnée disponible pour cette période</p>
          </div>
        ) : (
          <>
            {/* Métriques clés */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-3xl font-bold">{globalSuccessRate()}%</p>
                    <p className="text-sm text-muted-foreground">Taux de succès global</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-3xl font-bold">{history.length}</p>
                    <p className="text-sm text-muted-foreground">Notifications envoyées</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <PieChartIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-3xl font-bold">
                      {history.filter(h => h.status === 'success').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Notifications réussies</p>
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
                              <p className="text-sm text-green-600">Succès: {data.success}</p>
                              <p className="text-sm text-red-600">Échecs: {data.failed}</p>
                              {data.pending > 0 && (
                                <p className="text-sm text-yellow-600">En attente: {data.pending}</p>
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
