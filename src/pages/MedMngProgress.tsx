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
    <MedMngLayout className="bg-gradient-to-br from-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Progression</h1>
          <p className="text-muted-foreground">
            Suivez vos items à faire et votre rythme de révision.
          </p>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="p-8 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Chargement de la progression...
            </CardContent>
          </Card>
        )}

        {isError && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-destructive font-medium">Impossible de charger la progression.</p>
            </CardContent>
          </Card>
        )}

        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <stat.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {data && (
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-semibold">Objectif hebdomadaire</h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="h-4 w-4" />
                      Objectif {data.weeklyGoal} items
                    </div>
                    <p className="font-semibold">{data.weeklyRevisedCount} révisés</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Changer l'objectif</span>
                    <Select
                      value={String(data.weeklyGoal)}
                      onValueChange={async (value) => {
                        if (!user?.id) {
                          return;
                        }
                        await (supabase as any)
                          .from('profiles')
                          .update({ weekly_goal: Number(value) })
                          .eq('id', user.id);
                        await refetch();
                      }}
                    >
                      <SelectTrigger className="w-24">
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
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${Math.min(100, (data.weeklyRevisedCount / data.weeklyGoal) * 100)}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-semibold">Progression par spécialité</h2>
                  {data.specialtyStats.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune donnée disponible.</p>
                  ) : (
                    <div className="space-y-3">
                      {data.specialtyStats.map(stat => {
                        const percent = stat.total ? Math.round((stat.revised / stat.total) * 100) : 0;
                        return (
                          <div key={stat.specialty} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{stat.specialty}</span>
                              <span>{percent}%</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-success" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-semibold">Items à faire</h2>
                  {data.itemsToReview.length === 0 ? (
                    <div className="text-center text-muted-foreground py-6">
                      Aucun item à faire pour le moment.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.itemsToReview.map(item => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm text-muted-foreground">{item.code}</p>
                            <p className="font-medium text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.specialty ?? 'Spécialité non précisée'} • {item.itemType}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {item.status === 'not_started' ? 'À faire' : 'En cours'}
                            </Badge>
                            <Badge variant="outline">
                              {item.revisionCount}x
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-2">
                  <h2 className="text-lg font-semibold">Streak</h2>
                  <p className="text-3xl font-bold text-primary">{data.streakCurrent} jours</p>
                  <p className="text-sm text-muted-foreground">
                    Record: {data.streakBest} jours
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-semibold">Activité récente</h2>
                  {data.recentActivity.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Pas d'activité récente.</p>
                  ) : (
                    <div className="space-y-2">
                      {data.recentActivity.map(activity => (
                        <div key={activity.date} className="flex items-center justify-between text-sm">
                          <span>{new Date(activity.date).toLocaleDateString('fr-FR')}</span>
                          <Badge variant="secondary">{activity.revisedCount} révisés</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MedMngLayout>
  );
};

export const MedMngProgress = withAuth(MedMngProgressComponent);
