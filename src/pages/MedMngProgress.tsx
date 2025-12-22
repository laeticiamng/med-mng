import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Clock, Flame, ListTodo, Loader2, Target } from 'lucide-react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { withAuth } from '@/components/med-mng/withAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { fetchProgressOverview } from '@/services/medMngItemsService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

const MedMngProgressComponent = () => {
  const { user } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['med-mng-progress', user?.id],
    queryFn: () => fetchProgressOverview(user?.id ?? ''),
    enabled: Boolean(user?.id),
  });

  const stats = useMemo(() => {
    if (!data) {
      return null;
    }

    return [
      {
        label: 'Total items',
        value: data.totalItems,
        icon: ListTodo,
      },
      {
        label: 'En cours',
        value: data.inProgressCount,
        icon: Clock,
      },
      {
        label: 'Révisés',
        value: data.revisedCount,
        icon: CheckCircle,
      },
      {
        label: 'Streak',
        value: data.streakCurrent,
        icon: Flame,
      },
    ];
  }, [data]);

  return (
    <MedMngLayout className="bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        {/* Header - Rassurant */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Ma progression</h1>
          <p className="text-sm text-muted-foreground">
            Une vision claire de ce que tu as déjà vu.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <Card className="border-border/30">
            <CardContent className="p-8 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Chargement...
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {isError && (
          <Card className="border-border/30">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Impossible de charger la progression.</p>
            </CardContent>
          </Card>
        )}

        {/* Stats cards - Mise en avant régularité */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-border/30 bg-card/60">
                <CardContent className="p-4 text-center">
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {data && (
          <div className="space-y-5">
            {/* Objectif hebdomadaire - Valorise régularité */}
            <Card className="border-border/30">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">Objectif hebdomadaire</h2>
                  <Select
                    value={String(data.weeklyGoal)}
                    onValueChange={async (value) => {
                      if (!user?.id) return;
                      await (supabase as any).from('profiles').update({ weekly_goal: Number(value) }).eq('id', user.id);
                      await refetch();
                    }}
                  >
                    <SelectTrigger className="w-20 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{data.weeklyRevisedCount} / {data.weeklyGoal} items</span>
                    <span className="font-medium text-foreground">{Math.round((data.weeklyRevisedCount / data.weeklyGoal) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, (data.weeklyRevisedCount / data.weeklyGoal) * 100)}%` }} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/70 italic">
                  Bonne continuité. La régularité fait la différence.
                </p>
              </CardContent>
            </Card>

            {/* Streak - Mise en valeur */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Flame className="h-8 w-8 text-warning" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{data.streakCurrent} jours</p>
                    <p className="text-xs text-muted-foreground">Record : {data.streakBest} jours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progression par spécialité */}
            <Card className="border-border/30">
              <CardContent className="p-5 space-y-4">
                <h2 className="font-semibold text-foreground">Progression par spécialité</h2>
                {data.specialtyStats.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune donnée disponible.</p>
                ) : (
                  <div className="space-y-3">
                    {data.specialtyStats.map(stat => {
                      const percent = stat.total ? Math.round((stat.revised / stat.total) * 100) : 0;
                      return (
                        <div key={stat.specialty} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{stat.specialty}</span>
                            <span className="text-foreground">{percent}%</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-success transition-all" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items à faire */}
            <Card className="border-border/30">
              <CardContent className="p-5 space-y-4">
                <h2 className="font-semibold text-foreground">Items à réviser</h2>
                {data.itemsToReview.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun item à faire pour le moment.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.itemsToReview.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-border/30 p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">{item.code}</p>
                          <p className="font-medium text-foreground text-sm truncate">{item.title}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs ml-2 shrink-0">
                          {item.status === 'not_started' ? 'À faire' : 'En cours'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activité récente */}
            <Card className="border-border/30">
              <CardContent className="p-5 space-y-3">
                <h2 className="font-semibold text-foreground">Activité récente</h2>
                {data.recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Pas d'activité récente.</p>
                ) : (
                  <div className="space-y-2">
                    {data.recentActivity.map(activity => (
                      <div key={activity.date} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{new Date(activity.date).toLocaleDateString('fr-FR')}</span>
                        <Badge variant="outline" className="text-xs">{activity.revisedCount} révisés</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MedMngLayout>
  );
};

export const MedMngProgress = withAuth(MedMngProgressComponent);
