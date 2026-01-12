import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Trophy, 
  Flame,
  Calendar,
  TrendingUp,
  Settings,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface WeeklyGoalCardProps {
  className?: string;
}

interface WeeklyProgress {
  itemsReviewed: number;
  quizzesCompleted: number;
  studyMinutes: number;
  songsListened: number;
}

const DEFAULT_GOALS = {
  itemsReviewed: 20,
  quizzesCompleted: 10,
  studyMinutes: 120,
};

export const WeeklyGoalCard: React.FC<WeeklyGoalCardProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [progress, setProgress] = useState<WeeklyProgress>({
    itemsReviewed: 0,
    quizzesCompleted: 0,
    studyMinutes: 0,
    songsListened: 0,
  });
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadWeeklyProgress();
    }
  }, [user?.id]);

  const loadWeeklyProgress = async () => {
    if (!user?.id) return;
    
    try {
      // Calculer le début de la semaine (lundi)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      startOfWeek.setHours(0, 0, 0, 0);

      // Récupérer l'activité de la semaine
      const { data: activityData } = await supabase
        .from('user_activities')
        .select('activity_type, count, duration_seconds')
        .eq('user_id', user.id)
        .gte('created_at', startOfWeek.toISOString());

      if (activityData) {
        const weekProgress: WeeklyProgress = {
          itemsReviewed: 0,
          quizzesCompleted: 0,
          studyMinutes: 0,
          songsListened: 0,
        };

        activityData.forEach((activity: any) => {
          switch (activity.activity_type) {
            case 'study':
            case 'srs_review':
              weekProgress.itemsReviewed += activity.count || 1;
              weekProgress.studyMinutes += Math.round((activity.duration_seconds || 0) / 60);
              break;
            case 'quiz':
            case 'exam':
              weekProgress.quizzesCompleted += activity.count || 1;
              break;
            case 'music':
              weekProgress.songsListened += activity.count || 1;
              break;
          }
        });

        setProgress(weekProgress);
      }

      // Charger les objectifs personnalisés depuis metadata si disponible
      const { data: profileData } = await supabase
        .from('profiles')
        .select('metadata')
        .eq('id', user.id)
        .maybeSingle();

      const weeklyGoal = (profileData as any)?.metadata?.weekly_goal;
      if (weeklyGoal) {
        setGoals({
          ...DEFAULT_GOALS,
          itemsReviewed: weeklyGoal,
        });
      }
    } catch (error) {
      console.error('Erreur chargement objectifs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOverallProgress = () => {
    const itemsProgress = Math.min((progress.itemsReviewed / goals.itemsReviewed) * 100, 100);
    const quizProgress = Math.min((progress.quizzesCompleted / goals.quizzesCompleted) * 100, 100);
    const studyProgress = Math.min((progress.studyMinutes / goals.studyMinutes) * 100, 100);
    
    return Math.round((itemsProgress + quizProgress + studyProgress) / 3);
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    return dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  };

  const overallProgress = getOverallProgress();
  const daysRemaining = getDaysRemaining();

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 animate-pulse">
          <div className="h-4 bg-muted rounded w-1/2 mb-4" />
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-border/30 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Objectifs de la semaine
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            {daysRemaining} jours restants
          </Badge>
        </div>
        <CardDescription>
          Atteins tes objectifs hebdomadaires pour des bonus XP
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress global */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progression globale</span>
            <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
          {overallProgress >= 100 && (
            <div className="flex items-center gap-2 text-success text-sm">
              <Trophy className="h-4 w-4" />
              Objectifs de la semaine atteints ! 🎉
            </div>
          )}
        </div>

        {/* Individual goals */}
        <div className="space-y-4">
          {/* Items reviewed */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${progress.itemsReviewed >= goals.itemsReviewed ? 'text-success' : 'text-muted-foreground'}`} />
                <span>Items révisés</span>
              </div>
              <span className="font-medium">{progress.itemsReviewed} / {goals.itemsReviewed}</span>
            </div>
            <Progress 
              value={Math.min((progress.itemsReviewed / goals.itemsReviewed) * 100, 100)} 
              className="h-2"
            />
          </div>

          {/* Quizzes */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${progress.quizzesCompleted >= goals.quizzesCompleted ? 'text-success' : 'text-muted-foreground'}`} />
                <span>Quiz complétés</span>
              </div>
              <span className="font-medium">{progress.quizzesCompleted} / {goals.quizzesCompleted}</span>
            </div>
            <Progress 
              value={Math.min((progress.quizzesCompleted / goals.quizzesCompleted) * 100, 100)} 
              className="h-2"
            />
          </div>

          {/* Study time */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${progress.studyMinutes >= goals.studyMinutes ? 'text-success' : 'text-muted-foreground'}`} />
                <span>Temps d'étude</span>
              </div>
              <span className="font-medium">{progress.studyMinutes} / {goals.studyMinutes} min</span>
            </div>
            <Progress 
              value={Math.min((progress.studyMinutes / goals.studyMinutes) * 100, 100)} 
              className="h-2"
            />
          </div>
        </div>

        {/* Rewards */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-warning" />
              <span className="font-medium">Récompense</span>
            </div>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              +{overallProgress >= 100 ? '500' : '0'} XP
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {overallProgress >= 100 
              ? 'Bravo ! Tu as gagné 500 XP bonus cette semaine !'
              : `Atteins 100% pour gagner 500 XP bonus`
            }
          </p>
        </div>

        {/* Motivation */}
        {overallProgress < 100 && (
          <div className="text-center text-sm text-muted-foreground">
            {daysRemaining === 0 
              ? "⏰ Dernier jour pour atteindre tes objectifs !"
              : `💪 Continue comme ça, tu peux le faire !`
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyGoalCard;
