import React from 'react';
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
