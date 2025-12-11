import React, { useEffect } from 'react';
import { Flame, Trophy, Star, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import type { GamificationStats } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';

interface StreakDisplayProps {
  stats: GamificationStats;
  compact?: boolean;
}

const MOTIVATIONS = [
  { min: 0, max: 2, message: "Commencez votre série !", icon: "🌱" },
  { min: 3, max: 6, message: "Belle régularité !", icon: "🔥" },
  { min: 7, max: 13, message: "Une semaine complète !", icon: "⭐" },
  { min: 14, max: 29, message: "Impressionnant !", icon: "🚀" },
  { min: 30, max: 59, message: "Un mois de suite !", icon: "🏆" },
  { min: 60, max: Infinity, message: "Légendaire !", icon: "👑" },
];

export function StreakDisplay({ stats, compact = false }: StreakDisplayProps) {
  const { logActivity } = useActivityTracking();
  const levelProgress = ((stats.currentXP % 1000) / 1000) * 100;
  
  // Track streak display view
  useEffect(() => {
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { type: 'streak_display_view', streak: stats.currentStreak, level: stats.level }
    });
  }, [logActivity, stats.currentStreak, stats.level]);
  
  const getMotivation = () => {
    const motivation = MOTIVATIONS.find(m => stats.currentStreak >= m.min && stats.currentStreak <= m.max);
    return motivation || MOTIVATIONS[0];
  };
  
  const motivation = getMotivation();

  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-warning/10 text-warning">
                <Flame className="h-4 w-4" />
                <span className="font-bold text-sm">{stats.currentStreak}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{stats.currentStreak} jours consécutifs</p>
              <p className="text-xs text-muted-foreground">Record: {stats.longestStreak}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary">
                <Star className="h-4 w-4" />
                <span className="font-bold text-sm">Nv.{stats.level}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Niveau {stats.level}</p>
              <p className="text-xs text-muted-foreground">{stats.xpToNextLevel} XP restant</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent-foreground">
                <Zap className="h-4 w-4" />
                <span className="font-bold text-sm">{stats.totalPoints.toLocaleString()}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{stats.totalPoints.toLocaleString()} points totaux</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Streak */}
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/20">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Flame className={`h-6 w-6 text-warning ${stats.currentStreak > 0 ? 'animate-pulse' : ''}`} />
              <span className="text-3xl font-bold text-warning">{stats.currentStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">jours consécutifs</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="text-sm">{motivation.icon}</span>
              <p className="text-[10px] text-warning font-medium">{motivation.message}</p>
            </div>
            <p className="text-[10px] text-muted-foreground/60">Record: {stats.longestStreak}</p>
          </div>

          {/* Level */}
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="h-6 w-6 text-primary" />
              <span className="text-3xl font-bold text-primary">{stats.level}</span>
            </div>
            <Progress value={levelProgress} className="h-1.5 mb-1" />
            <p className="text-[10px] text-muted-foreground">{stats.xpToNextLevel} XP restant</p>
          </div>

          {/* Points */}
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="h-6 w-6 text-accent-foreground" />
              <span className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">points totaux</p>
          </div>

          {/* Weekly Goal */}
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-success/20 to-success/5 border border-success/20">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy className="h-6 w-6 text-success" />
              <span className="text-2xl font-bold text-success">
                {stats.weeklyGoalProgress}/{stats.weeklyGoal}
              </span>
            </div>
            <Progress 
              value={Math.min((stats.weeklyGoalProgress / stats.weeklyGoal) * 100, 100)} 
              className="h-1.5 mb-1" 
            />
            <p className="text-[10px] text-muted-foreground">objectif hebdo</p>
          </div>
        </div>

        {/* Badges preview */}
        {stats.badges.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">Badges récents</p>
            <div className="flex gap-2 flex-wrap">
              {stats.badges.slice(-5).map((badge) => (
                <Badge 
                  key={badge.id} 
                  variant="outline"
                  className={`text-lg ${
                    badge.rarity === 'legendary' ? 'border-yellow-500 bg-yellow-500/10' :
                    badge.rarity === 'epic' ? 'border-purple-500 bg-purple-500/10' :
                    badge.rarity === 'rare' ? 'border-blue-500 bg-blue-500/10' :
                    'border-border'
                  }`}
                >
                  {badge.icon}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
