import logger from '@/lib/logger';
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { TrendingUp, Clock, Award, Activity, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
        logger.error('Error fetching progress history:', error);
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

  // Prepare chart data
  const dailyData = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return date.toISOString().split('T')[0];
    });

    const dataMap: Record<string, { date: string; completed: number; time: number }> = {};
    last14Days.forEach(date => {
      dataMap[date] = { date: new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }), completed: 0, time: 0 };
    });

    progressHistory.forEach((item: any) => {
      const itemDate = new Date(item.updated_at).toISOString().split('T')[0];
      if (dataMap[itemDate]) {
        if (item.status === 'completed' || item.status === 'mastered') {
          dataMap[itemDate].completed += 1;
        }
        dataMap[itemDate].time += item.time_spent_minutes || 0;
      }
    });

    return Object.values(dataMap);
  }, [progressHistory]);

  const statusData = [
    { name: 'En cours', value: statusDistribution.in_progress, color: '#3b82f6' },
    { name: 'Complétés', value: statusDistribution.completed, color: '#10b981' },
    { name: 'Maîtrisés', value: statusDistribution.mastered, color: '#8b5cf6' },
  ];

  const specialtyData = useMemo(() => {
    const specialties: Record<string, { total: number; time: number }> = {};
    
    progressHistory.forEach((item: any) => {
      // Extract specialty from item_number (first 3 digits usually indicate category)
      const itemNum = parseInt(item.item_number);
      let specialty = 'Autres';
      
      if (itemNum >= 1 && itemNum <= 50) specialty = 'Cardiologie';
      else if (itemNum >= 51 && itemNum <= 100) specialty = 'Pneumologie';
      else if (itemNum >= 101 && itemNum <= 150) specialty = 'Néphrologie';
      else if (itemNum >= 151 && itemNum <= 200) specialty = 'Gastro-entérologie';
      else if (itemNum >= 201 && itemNum <= 250) specialty = 'Endocrinologie';

      if (!specialties[specialty]) {
        specialties[specialty] = { total: 0, time: 0 };
      }
      
      if (item.status === 'completed' || item.status === 'mastered') {
        specialties[specialty].total += 1;
      }
      specialties[specialty].time += item.time_spent_minutes || 0;
    });

    return Object.entries(specialties).map(([name, data]) => ({
      specialty: name,
      items: data.total,
      temps: Math.round(data.time),
    }));
  }, [progressHistory]);

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

      {/* Daily Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Items complétés (14 jours)</CardTitle>
            <CardDescription>Évolution quotidienne de vos révisions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Temps de révision (14 jours)</CardTitle>
            <CardDescription>Minutes passées chaque jour</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="time" 
                  fill="hsl(var(--accent))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution & Specialty Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Répartition par statut</CardTitle>
            <CardDescription>Distribution de vos items EDN</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Temps par spécialité</CardTitle>
            <CardDescription>Minutes investies par domaine</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={specialtyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  type="category" 
                  dataKey="specialty" 
                  width={120}
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="temps" 
                  fill="hsl(var(--primary))"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
