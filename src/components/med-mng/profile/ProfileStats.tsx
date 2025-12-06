import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Music, TrendingUp, Activity, Heart } from 'lucide-react';

interface ProfileStatsProps {
  stats: {
    totalSongs: number;
    creditsRemaining: number;
    creditsUsed: number;
    favorites?: number;
  };
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
  );
};
