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
    <MedMngLayout>
      <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        {/* Header - Motivating */}
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Ta progression</h1>
          <p className="text-sm text-muted-foreground">
            La régularité fait la différence. Continue comme ça.
          </p>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="p-8 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Chargement...
            </CardContent>
          </Card>
        )}

        {isError && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Impossible de charger la progression.</p>
            </CardContent>
          </Card>
        )}

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-card border-border/40">
                <CardContent className="p-4 text-center">
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Weekly Goal - Simple */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Objectif hebdo</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {data.weeklyRevisedCount} / {data.weeklyGoal}
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.min(100, (data.weeklyRevisedCount / data.weeklyGoal) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-muted-foreground">Modifier :</span>
                  <Select
                    value={String(data.weeklyGoal)}
                    onValueChange={async (value) => {
                      if (!user?.id) return;
                      await (supabase as any).from('profiles').update({ weekly_goal: Number(value) }).eq('id', user.id);
                      await refetch();
                    }}
                  >
                    <SelectTrigger className="w-20 h-8 text-xs">
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
              </CardContent>
            </Card>

            {/* Streak - Motivating */}
            <Card className="bg-warning/5 border-warning/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-warning/10">
                    <Flame className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{data.streakCurrent} jours</p>
                    <p className="text-xs text-muted-foreground">Record : {data.streakBest} jours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specialty Progress */}
            {data.specialtyStats.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <h2 className="text-sm font-medium mb-4">Par spécialité</h2>
                  <div className="space-y-3">
                    {data.specialtyStats.slice(0, 5).map(stat => {
                      const percent = stat.total ? Math.round((stat.revised / stat.total) * 100) : 0;
                      return (
                        <div key={stat.specialty} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-foreground truncate max-w-[60%]">{stat.specialty}</span>
                            <span className="text-muted-foreground">{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-success rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Items to Review - Clean List */}
            <Card>
              <CardContent className="p-5">
                <h2 className="text-sm font-medium mb-4">À réviser</h2>
                {data.itemsToReview.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Tu es à jour ! Continue comme ça.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.itemsToReview.slice(0, 5).map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground font-mono">{item.code}</p>
                          <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                          {item.status === 'not_started' ? 'À faire' : 'En cours'}
                        </Badge>
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
