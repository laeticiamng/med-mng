import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Music, TrendingUp, Activity, Heart, Flame, Star, Trophy, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProfileStatsProps {
  stats: {
    totalSongs: number;
    creditsRemaining: number;
    creditsUsed: number;
    favorites?: number;
  };
  gamificationStats?: {
    currentStreak: number;
    level: number;
    totalPoints: number;
    badges: any[];
  };
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ stats, gamificationStats }) => {
  const XP_PER_LEVEL = 1000;
  const levelProgress = gamificationStats 
    ? ((gamificationStats.totalPoints % XP_PER_LEVEL) / XP_PER_LEVEL) * 100 
    : 0;

  return (
    <div className="space-y-6 mb-8">
      {/* Gamification Stats Row */}
      {gamificationStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-warning/10 to-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/20 rounded-full">
                  <Flame className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">{gamificationStats.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">Jours de suite</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-primary">Niv. {gamificationStats.level}</p>
                  <Progress value={levelProgress} className="h-1.5 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-accent/10 to-accent/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-full">
                  <Zap className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent-foreground">{gamificationStats.totalPoints}</p>
                  <p className="text-xs text-muted-foreground">XP total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-success/10 to-success/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/20 rounded-full">
                  <Trophy className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">{gamificationStats.badges.length}</p>
                  <p className="text-xs text-muted-foreground">Badges</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Original Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalSongs}</p>
                <p className="text-sm text-muted-foreground">Chansons créées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.creditsRemaining}</p>
                <p className="text-sm text-muted-foreground">Crédits restants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-full">
                <Activity className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.creditsUsed}</p>
                <p className="text-sm text-muted-foreground">Crédits utilisés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <Heart className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.favorites || '-'}</p>
                <p className="text-sm text-muted-foreground">Favoris</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
