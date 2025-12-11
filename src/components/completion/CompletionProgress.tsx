import React, { useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Flame, Star, Trophy } from 'lucide-react';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';

interface CompletionProgressProps {
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  pendingItems: number;
}

export const CompletionProgress: React.FC<CompletionProgressProps> = ({
  totalItems,
  completedItems,
  inProgressItems,
  pendingItems
}) => {
  const { logActivity } = useActivityTracking();
  const { stats: gamificationStats, loadStats } = useGamification();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadStats(user.id);
    };
    load();
  }, [loadStats]);

  useEffect(() => {
    if (totalItems > 0) {
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { component: 'completion_progress', totalItems, completedItems }
      });
    }
  }, [logActivity, totalItems, completedItems]);
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const progressPercentage = totalItems > 0 ? ((completedItems + inProgressItems) / totalItems) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Progression Globale
          </CardTitle>
          {gamificationStats && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Flame className="h-3 w-3 text-warning" />
                {gamificationStats.currentStreak}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Star className="h-3 w-3 text-primary" />
                Nv.{gamificationStats.level}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Trophy className="h-3 w-3 text-accent" />
                {gamificationStats.totalPoints} pts
              </Badge>
            </div>
          )}
        </div>
        <CardDescription>
          État d'avancement de votre apprentissage sur la plateforme EDN
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progression principale */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression totale</span>
            <span className="font-medium">{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">Terminés</span>
            </div>
            <div className="text-2xl font-bold text-success">{completedItems}</div>
            <div className="text-xs text-success/80">
              {totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0}% du total
            </div>
          </div>

          <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">En cours</span>
            </div>
            <div className="text-2xl font-bold text-primary">{inProgressItems}</div>
            <div className="text-xs text-primary/80">
              {totalItems > 0 ? Math.round((inProgressItems / totalItems) * 100) : 0}% du total
            </div>
          </div>

          <div className="text-center p-3 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertCircle className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-warning">À démarrer</span>
            </div>
            <div className="text-2xl font-bold text-warning">{pendingItems}</div>
            <div className="text-xs text-warning/80">
              {totalItems > 0 ? Math.round((pendingItems / totalItems) * 100) : 0}% du total
            </div>
          </div>
        </div>

        {/* Badges de statut */}
        <div className="flex flex-wrap gap-2">
          {completionPercentage >= 90 && (
            <Badge variant="secondary" className="bg-success/10 text-success">
              🏆 Presque terminé !
            </Badge>
          )}
          {completionPercentage >= 50 && completionPercentage < 90 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              🚀 Bon rythme
            </Badge>
          )}
          {completionPercentage < 25 && (
            <Badge variant="secondary" className="bg-warning/10 text-warning">
              🌱 Début du parcours
            </Badge>
          )}
          {inProgressItems > 0 && (
            <Badge variant="outline">
              {inProgressItems} item{inProgressItems > 1 ? 's' : ''} actif{inProgressItems > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Message d'encouragement */}
        <div className="text-sm text-muted-foreground">
          {completionPercentage >= 90 ? (
            "🎉 Félicitations ! Vous maîtrisez presque tout le contenu EDN !"
          ) : completionPercentage >= 50 ? (
            "💪 Excellent travail ! Vous êtes sur la bonne voie."
          ) : completionPercentage >= 25 ? (
            "🌟 Continuez vos efforts, vous progressez bien !"
          ) : (
            "🚀 C'est parti ! Votre parcours d'apprentissage EDN commence."
          )}
        </div>
      </CardContent>
    </Card>
  );
};