import React from 'react';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Music, 
  Clock, 
  Flame, 
  Trophy, 
  Target, 
  TrendingUp,
  Star,
  Headphones,
  Heart,
  Award,
  Loader2
} from 'lucide-react';

interface UserStatsCardProps {
  className?: string;
  compact?: boolean;
}

export const UserStatsCard: React.FC<UserStatsCardProps> = ({ className = '', compact = false }) => {
  const { data: analytics, isLoading, error } = useUserAnalytics();

  if (isLoading) {
    return (
      <Card className={`border-border/30 ${className}`}>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return null;
  }

  if (compact) {
    return (
      <div className={`flex flex-wrap gap-3 ${className}`}>
        <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
          <BookOpen className="h-3.5 w-3.5" />
          {analytics.revisedItems}/{analytics.totalItems} items
        </Badge>
        <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
          <Flame className="h-3.5 w-3.5 text-warning" />
          {analytics.currentStreak}j
        </Badge>
        <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
          <Trophy className="h-3.5 w-3.5 text-primary" />
          Niv.{analytics.level}
        </Badge>
        <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
          <Music className="h-3.5 w-3.5" />
          {analytics.songsInLibrary} chansons
        </Badge>
      </div>
    );
  }

  return (
    <Card className={`border-border/30 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Mes statistiques
        </CardTitle>
        <CardDescription>
          Vue d'ensemble de votre progression
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progression globale */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progression items</span>
            <span className="font-medium">{analytics.progressPercentage}%</span>
          </div>
          <Progress value={analytics.progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {analytics.revisedItems} révisés sur {analytics.totalItems} items
          </p>
        </div>

        {/* Stats en grille */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Streak */}
          <div className="text-center p-3 rounded-lg bg-warning/10 border border-warning/20">
            <Flame className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{analytics.currentStreak}</p>
            <p className="text-xs text-muted-foreground">jours de suite</p>
          </div>

          {/* Level */}
          <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Trophy className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{analytics.level}</p>
            <p className="text-xs text-muted-foreground">niveau</p>
          </div>

          {/* XP */}
          <div className="text-center p-3 rounded-lg bg-accent/10 border border-accent/20">
            <Star className="h-5 w-5 text-accent mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{analytics.totalXP}</p>
            <p className="text-xs text-muted-foreground">XP total</p>
          </div>

          {/* Badges */}
          <div className="text-center p-3 rounded-lg bg-success/10 border border-success/20">
            <Award className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{analytics.badgesUnlocked}</p>
            <p className="text-xs text-muted-foreground">badges</p>
          </div>
        </div>

        {/* Section Musique */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Music className="h-4 w-4" />
            Musique médicale
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <Headphones className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-semibold">{analytics.songsInLibrary}</p>
              <p className="text-xs text-muted-foreground">chansons</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <Heart className="h-4 w-4 mx-auto mb-1 text-destructive" />
              <p className="text-lg font-semibold">{analytics.favoriteSongsCount}</p>
              <p className="text-xs text-muted-foreground">favoris</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-semibold">{analytics.totalListeningMinutes}</p>
              <p className="text-xs text-muted-foreground">min écoute</p>
            </div>
          </div>
        </div>

        {/* Section Étude */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Temps d'étude
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-semibold">{analytics.totalStudyMinutes}</p>
              <p className="text-xs text-muted-foreground">min total</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <Target className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-semibold">{analytics.studySessionsCount}</p>
              <p className="text-xs text-muted-foreground">sessions</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <TrendingUp className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-semibold">{analytics.averageSessionMinutes}</p>
              <p className="text-xs text-muted-foreground">min/session</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
