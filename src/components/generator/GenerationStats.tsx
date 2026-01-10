import React, { useMemo } from 'react';
import { BarChart3, Music, Clock, TrendingUp, Star, Zap } from 'lucide-react';
import { PremiumCard } from '@/components/ui/premium-card';
import { Badge } from '@/components/ui/badge';
import { TranslatedText } from '@/components/TranslatedText';
import { Progress } from '@/components/ui/progress';

interface GeneratedTrack {
  id: string;
  item_code: string;
  rang: string;
  music_style: string;
  audio_url: string;
  created_at: string;
  title?: string;
  is_favorite?: boolean;
  duration?: number;
}

interface GenerationStatsProps {
  tracks: GeneratedTrack[];
  className?: string;
}

export const GenerationStats: React.FC<GenerationStatsProps> = ({ tracks, className }) => {
  const stats = useMemo(() => {
    if (tracks.length === 0) return null;

    // Calculs des statistiques
    const totalTracks = tracks.length;
    const favorites = tracks.filter(t => t.is_favorite).length;
    
    // Styles les plus utilisés
    const styleCounts: Record<string, number> = {};
    tracks.forEach(t => {
      styleCounts[t.music_style] = (styleCounts[t.music_style] || 0) + 1;
    });
    const topStyles = Object.entries(styleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Rangs
    const rangCounts = { A: 0, B: 0, AB: 0 };
    tracks.forEach(t => {
      if (t.rang === 'A') rangCounts.A++;
      else if (t.rang === 'B') rangCounts.B++;
      else if (t.rang === 'AB') rangCounts.AB++;
    });

    // Items les plus générés
    const itemCounts: Record<string, number> = {};
    tracks.forEach(t => {
      itemCounts[t.item_code] = (itemCounts[t.item_code] || 0) + 1;
    });
    const topItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Génération par jour (7 derniers jours)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentTracks = tracks.filter(t => new Date(t.created_at) > sevenDaysAgo);
    const avgPerDay = (recentTracks.length / 7).toFixed(1);

    // Durée totale (si disponible)
    const totalDuration = tracks.reduce((sum, t) => sum + (t.duration || 240), 0);
    const totalMinutes = Math.floor(totalDuration / 60);

    return {
      totalTracks,
      favorites,
      favoriteRate: totalTracks > 0 ? Math.round((favorites / totalTracks) * 100) : 0,
      topStyles,
      rangCounts,
      topItems,
      avgPerDay,
      totalMinutes,
      recentTracks: recentTracks.length
    };
  }, [tracks]);

  if (!stats || tracks.length === 0) {
    return null;
  }

  return (
    <PremiumCard variant="glass" className={`p-4 ${className}`}>
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4 text-primary" />
        <TranslatedText text="Statistiques de génération" />
      </h4>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* Total */}
        <div className="bg-background/50 rounded-lg p-3 text-center">
          <Music className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold text-foreground">{stats.totalTracks}</p>
          <p className="text-xs text-muted-foreground">Générations</p>
        </div>

        {/* Favoris */}
        <div className="bg-background/50 rounded-lg p-3 text-center">
          <Star className="h-4 w-4 mx-auto mb-1 text-warning" />
          <p className="text-2xl font-bold text-foreground">{stats.favorites}</p>
          <p className="text-xs text-muted-foreground">Favoris ({stats.favoriteRate}%)</p>
        </div>

        {/* Durée totale */}
        <div className="bg-background/50 rounded-lg p-3 text-center">
          <Clock className="h-4 w-4 mx-auto mb-1 text-accent" />
          <p className="text-2xl font-bold text-foreground">{stats.totalMinutes}</p>
          <p className="text-xs text-muted-foreground">Minutes</p>
        </div>

        {/* Moyenne par jour */}
        <div className="bg-background/50 rounded-lg p-3 text-center">
          <Zap className="h-4 w-4 mx-auto mb-1 text-success" />
          <p className="text-2xl font-bold text-foreground">{stats.avgPerDay}</p>
          <p className="text-xs text-muted-foreground">Par jour</p>
        </div>
      </div>

      {/* Répartition par rang */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">Répartition par rang</p>
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Rang A</span>
              <span className="font-medium">{stats.rangCounts.A}</span>
            </div>
            <Progress value={(stats.rangCounts.A / stats.totalTracks) * 100} className="h-1.5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Rang B</span>
              <span className="font-medium">{stats.rangCounts.B}</span>
            </div>
            <Progress value={(stats.rangCounts.B / stats.totalTracks) * 100} className="h-1.5 [&>div]:bg-accent" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>A+B</span>
              <span className="font-medium">{stats.rangCounts.AB}</span>
            </div>
            <Progress value={(stats.rangCounts.AB / stats.totalTracks) * 100} className="h-1.5 [&>div]:bg-warning" />
          </div>
        </div>
      </div>

      {/* Styles favoris */}
      <div className="mb-3">
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Styles préférés
        </p>
        <div className="flex flex-wrap gap-1.5">
          {stats.topStyles.map(([style, count], idx) => (
            <Badge 
              key={style} 
              variant={idx === 0 ? 'default' : 'secondary'}
              className="text-xs"
            >
              {style} ({count})
            </Badge>
          ))}
        </div>
      </div>

      {/* Items les plus générés */}
      {stats.topItems.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Items populaires</p>
          <div className="flex flex-wrap gap-1.5">
            {stats.topItems.map(([item, count]) => (
              <Badge key={item} variant="outline" className="text-xs">
                {item} ({count})
              </Badge>
            ))}
          </div>
        </div>
      )}
    </PremiumCard>
  );
};
