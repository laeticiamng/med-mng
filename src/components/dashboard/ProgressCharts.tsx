import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { TrendingUp, Clock, Award, Activity, BarChart3 } from 'lucide-react';

export const ProgressCharts: React.FC = () => {
  const { user } = useAuth();

  // Fetch progress history
  const { data: progressHistory = [] } = useQuery({
    queryKey: ['progress-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await (supabase as any)
        .from('user_edn_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: true });

      if (error) {
        console.error('Error fetching progress history:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Graphiques de Progression</CardTitle>
          <CardDescription>
            Connectez-vous pour voir vos statistiques de révision
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalTime = progressHistory.reduce((acc: number, item: any) => 
    acc + (item.time_spent_minutes || 0), 0
  );
  const statusDistribution = {
    completed: progressHistory.filter((p: any) => p.status === 'completed' || p.status === 'mastered').length,
    in_progress: progressHistory.filter((p: any) => p.status === 'in_progress').length,
    mastered: progressHistory.filter((p: any) => p.status === 'mastered').length,
  };
  const avgScore = progressHistory.length > 0
    ? progressHistory.reduce((acc: number, item: any) => acc + (item.score || 0), 0) / progressHistory.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Items actifs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressHistory.length}</div>
            <p className="text-xs text-muted-foreground">Total démarrés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Complétés</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statusDistribution.completed}
            </div>
            <p className="text-xs text-muted-foreground">Items terminés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Temps total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalTime / 60)}h</div>
            <p className="text-xs text-muted-foreground">{totalTime} minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {avgScore.toFixed(0)}/100
            </div>
            <p className="text-xs text-muted-foreground">Performance globale</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Graphiques de progression
          </CardTitle>
          <CardDescription>
            Visualisez votre évolution sur les 14 derniers jours
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12 text-muted-foreground">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Les graphiques détaillés seront bientôt disponibles</p>
          <p className="text-sm mt-2">Continuez à réviser pour générer plus de données</p>
        </CardContent>
      </Card>
    </div>
  );
};

export const ProgressCharts: React.FC = () => {
  const { user } = useAuth();

  // Fetch progress history
  const { data: progressHistory = [] } = useQuery({
    queryKey: ['progress-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_edn_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: true });

      if (error) {
        console.error('Error fetching progress history:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user,
  });

  // Calculate temporal stats
  const temporalStats = useMemo(() => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const dailyCompletions: Record<string, number> = {};
    const dailyTimeSpent: Record<string, number> = {};

    progressHistory.forEach((item: any) => {
      const date = new Date(item.updated_at).toLocaleDateString('fr-FR');
      
      if (item.status === 'completed' || item.status === 'mastered') {
        dailyCompletions[date] = (dailyCompletions[date] || 0) + 1;
      }
      
      dailyTimeSpent[date] = (dailyTimeSpent[date] || 0) + (item.time_spent_minutes || 0);
    });

    return { dailyCompletions, dailyTimeSpent };
  }, [progressHistory]);

  // Status distribution
  const statusDistribution = useMemo(() => {
    const dist = {
      not_started: 0,
      in_progress: 0,
      completed: 0,
      mastered: 0,
    };

    progressHistory.forEach((item: any) => {
      dist[item.status as keyof typeof dist]++;
    });

    return dist;
  }, [progressHistory]);

  // Prepare chart data
  const completionChartData = {
    labels: Object.keys(temporalStats.dailyCompletions).slice(-14), // Last 14 days
    datasets: [
      {
        label: 'Items complétés',
        data: Object.values(temporalStats.dailyCompletions).slice(-14),
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsl(var(--primary) / 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const timeSpentChartData = {
    labels: Object.keys(temporalStats.dailyTimeSpent).slice(-14),
    datasets: [
      {
        label: 'Temps de révision (min)',
        data: Object.values(temporalStats.dailyTimeSpent).slice(-14),
        backgroundColor: 'hsl(var(--accent))',
        borderColor: 'hsl(var(--accent))',
        borderWidth: 1,
      },
    ],
  };

  const statusChartData = {
    labels: ['En cours', 'Complétés', 'Maîtrisés'],
    datasets: [
      {
        data: [
          statusDistribution.in_progress,
          statusDistribution.completed,
          statusDistribution.mastered,
        ],
        backgroundColor: [
          'hsl(var(--chart-3))',
          'hsl(var(--chart-2))',
          'hsl(var(--chart-4))',
        ],
        borderWidth: 2,
        borderColor: 'hsl(var(--background))',
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Graphiques de Progression</CardTitle>
          <CardDescription>
            Connectez-vous pour voir vos statistiques de révision
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalTime = progressHistory.reduce((acc: number, item: any) => 
    acc + (item.time_spent_minutes || 0), 0
  );
  const avgScore = progressHistory.length > 0
    ? progressHistory.reduce((acc: number, item: any) => acc + (item.score || 0), 0) / progressHistory.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Items actifs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressHistory.length}</div>
            <p className="text-xs text-muted-foreground">Total démarrés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Complétés</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statusDistribution.completed + statusDistribution.mastered}
            </div>
            <p className="text-xs text-muted-foreground">Items terminés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Temps total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalTime / 60)}h</div>
            <p className="text-xs text-muted-foreground">{totalTime} minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {avgScore.toFixed(0)}/100
            </div>
            <p className="text-xs text-muted-foreground">Performance globale</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des complétions</CardTitle>
            <CardDescription>Items complétés sur les 14 derniers jours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line data={completionChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Time Spent */}
        <Card>
          <CardHeader>
            <CardTitle>Temps de révision</CardTitle>
            <CardDescription>Minutes passées par jour (14 derniers jours)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar data={timeSpentChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Répartition par statut</CardTitle>
            <CardDescription>Distribution de vos items EDN</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="w-full max-w-md">
                <Doughnut
                  data={statusChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
