import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Zap, Trophy, Star, Calendar, Target } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';

interface QuizStreakTrackerProps {
  className?: string;
  compact?: boolean;
}

export const QuizStreakTracker: React.FC<QuizStreakTrackerProps> = ({ 
  className = '',
  compact = false
}) => {
  const { _stats } = useGamification();

  const currentStreak = _stats?.currentStreak || 0;
  const bestStreak = (_stats as any)?.bestStreak || currentStreak;
  const totalQuizzes = (_stats as any)?.totalQuizzes || 0;
  
  // Calcul des milestones
  const nextMilestone = currentStreak < 7 ? 7 : currentStreak < 30 ? 30 : currentStreak < 100 ? 100 : 365;
  const progressToMilestone = (currentStreak / nextMilestone) * 100;

  const getMilestoneLabel = (days: number) => {
    if (days < 7) return '1 semaine';
    if (days < 30) return '1 mois';
    if (days < 100) return '100 jours';
    return '1 an';
  };

  const getStreakColor = () => {
    if (currentStreak >= 30) return 'text-warning';
    if (currentStreak >= 7) return 'text-primary';
    return 'text-muted-foreground';
  };

  const getStreakEmoji = () => {
    if (currentStreak >= 100) return '🔥🔥🔥';
    if (currentStreak >= 30) return '🔥🔥';
    if (currentStreak >= 7) return '🔥';
    if (currentStreak > 0) return '✨';
    return '🌱';
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-4 p-3 rounded-lg bg-muted/30 ${className}`}>
        <div className="flex items-center gap-2">
          <Flame className={`h-5 w-5 ${getStreakColor()}`} />
          <span className={`text-xl font-bold ${getStreakColor()}`}>
            {currentStreak}
          </span>
          <span className="text-sm text-muted-foreground">jours</span>
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-accent" />
          <span className="text-sm">Record: {bestStreak}</span>
        </div>
      </div>
    );
  }

  return (
    <Card className={`border-border/30 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Flame className={`h-5 w-5 ${getStreakColor()}`} />
          Streak de Quiz
        </CardTitle>
        <CardDescription>
          Maintiens ta série pour débloquer des récompenses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current streak display */}
        <div className="text-center">
          <div className={`text-6xl font-bold ${getStreakColor()} mb-2`}>
            {currentStreak}
          </div>
          <p className="text-muted-foreground">
            jours consécutifs {getStreakEmoji()}
          </p>
        </div>

        {/* Progress to milestone */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Prochain objectif</span>
            <span className="font-medium">{getMilestoneLabel(nextMilestone)}</span>
          </div>
          <Progress value={progressToMilestone} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {nextMilestone - currentStreak} jours restants
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-warning/10 border border-warning/20">
            <Trophy className="h-4 w-4 text-warning mx-auto mb-1" />
            <div className="text-lg font-bold text-warning">{bestStreak}</div>
            <div className="text-xs text-warning/80">Record</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Zap className="h-4 w-4 text-primary mx-auto mb-1" />
            <div className="text-lg font-bold text-primary">{totalQuizzes}</div>
            <div className="text-xs text-primary/80">Quiz total</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-success/10 border border-success/20">
            <Star className="h-4 w-4 text-success mx-auto mb-1" />
            <div className="text-lg font-bold text-success">
              {Math.round((currentStreak / Math.max(bestStreak, 1)) * 100)}%
            </div>
            <div className="text-xs text-success/80">vs Record</div>
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Prochains milestones</p>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={currentStreak >= 7 ? "default" : "outline"}
              className={currentStreak >= 7 ? "bg-success" : ""}
            >
              <Calendar className="h-3 w-3 mr-1" />
              7 jours
            </Badge>
            <Badge 
              variant={currentStreak >= 30 ? "default" : "outline"}
              className={currentStreak >= 30 ? "bg-success" : ""}
            >
              <Target className="h-3 w-3 mr-1" />
              30 jours
            </Badge>
            <Badge 
              variant={currentStreak >= 100 ? "default" : "outline"}
              className={currentStreak >= 100 ? "bg-success" : ""}
            >
              <Trophy className="h-3 w-3 mr-1" />
              100 jours
            </Badge>
          </div>
        </div>

        {/* Motivation message */}
        <div className="p-3 rounded-lg bg-muted/30 text-center">
          {currentStreak === 0 ? (
            <p className="text-sm text-muted-foreground">
              🌱 Commence une série en faisant un quiz aujourd'hui !
            </p>
          ) : currentStreak < 7 ? (
            <p className="text-sm text-muted-foreground">
              💪 Continue encore {7 - currentStreak} jours pour ta première semaine !
            </p>
          ) : currentStreak < 30 ? (
            <p className="text-sm text-muted-foreground">
              🔥 Incroyable ! Tu es à {30 - currentStreak} jours du mois complet !
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              🏆 Champion ! Tu maintiens une série exceptionnelle !
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizStreakTracker;
