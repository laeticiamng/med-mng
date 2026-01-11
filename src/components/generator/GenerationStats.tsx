/**
 * Statistiques de génération enrichies
 * ✅ AMÉLIORÉ: Graphiques, tendances, export
 */

import React, { useMemo, useState } from 'react';
import { BarChart3, Music, Clock, TrendingUp, Star, Zap, Calendar, Target, Award, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { PremiumCard } from '@/components/ui/premium-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TranslatedText } from '@/components/TranslatedText';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { isToday, isThisWeek, isThisMonth, format, differenceInDays, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  showExpanded?: boolean;
}

export const GenerationStats: React.FC<GenerationStatsProps> = ({ tracks, className, showExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(showExpanded);

  const stats = useMemo(() => {
    if (tracks.length === 0) return null;

    // Calculs des statistiques de base
    const totalTracks = tracks.length;
    const favorites = tracks.filter(t => t.is_favorite).length;
    
    // Styles les plus utilisés
    const styleCounts: Record<string, number> = {};
    tracks.forEach(t => {
      styleCounts[t.music_style] = (styleCounts[t.music_style] || 0) + 1;
    });
    const topStyles = Object.entries(styleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

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
      .slice(0, 5);

    // Statistiques temporelles
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const todayTracks = tracks.filter(t => isToday(new Date(t.created_at)));
    const weekTracks = tracks.filter(t => new Date(t.created_at) > sevenDaysAgo);
    const monthTracks = tracks.filter(t => new Date(t.created_at) > thirtyDaysAgo);
    
    const avgPerDay = weekTracks.length > 0 ? (weekTracks.length / 7).toFixed(1) : '0';
    const avgPerWeek = monthTracks.length > 0 ? (monthTracks.length / 4).toFixed(1) : '0';

    // Durée totale
    const totalDuration = tracks.reduce((sum, t) => sum + (t.duration || 240), 0);
    const totalMinutes = Math.floor(totalDuration / 60);
    const totalHours = Math.floor(totalMinutes / 60);

    // Tendance (comparaison semaine actuelle vs semaine précédente)
    const thisWeekStart = startOfWeek(now, { locale: fr });
    const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekEnd = new Date(thisWeekStart.getTime() - 1);
    
    const thisWeekCount = tracks.filter(t => {
      const d = new Date(t.created_at);
      return d >= thisWeekStart && d <= now;
    }).length;
    
    const lastWeekCount = tracks.filter(t => {
      const d = new Date(t.created_at);
      return d >= lastWeekStart && d <= lastWeekEnd;
    }).length;
    
    const trend = lastWeekCount > 0 
      ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
      : thisWeekCount > 0 ? 100 : 0;

    // Jour le plus productif
    const dayOfWeekCounts: Record<number, number> = {};
    tracks.forEach(t => {
      const day = new Date(t.created_at).getDay();
      dayOfWeekCounts[day] = (dayOfWeekCounts[day] || 0) + 1;
    });
    const mostProductiveDay = Object.entries(dayOfWeekCounts)
      .sort((a, b) => b[1] - a[1])[0];
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    // Première et dernière génération
    const sortedByDate = [...tracks].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const firstTrack = sortedByDate[0];
    const lastTrack = sortedByDate[sortedByDate.length - 1];
    const daysSinceFirst = differenceInDays(now, new Date(firstTrack.created_at));

    return {
      totalTracks,
      favorites,
      favoriteRate: totalTracks > 0 ? Math.round((favorites / totalTracks) * 100) : 0,
      topStyles,
      rangCounts,
      topItems,
      todayCount: todayTracks.length,
      weekCount: weekTracks.length,
      monthCount: monthTracks.length,
      avgPerDay,
      avgPerWeek,
      totalMinutes,
      totalHours,
      trend,
      mostProductiveDay: mostProductiveDay ? dayNames[parseInt(mostProductiveDay[0])] : null,
      daysSinceFirst,
      uniqueItems: Object.keys(itemCounts).length,
      uniqueStyles: Object.keys(styleCounts).length
    };
  }, [tracks]);

  if (!stats || tracks.length === 0) {
    return null;
  }

  const getTrendIcon = () => {
    if (stats.trend > 0) return <TrendingUp className="h-3 w-3 text-success" />;
    if (stats.trend < 0) return <TrendingUp className="h-3 w-3 text-destructive rotate-180" />;
    return null;
  };

  const getTrendColor = () => {
    if (stats.trend > 0) return 'text-success';
    if (stats.trend < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <PremiumCard variant="glass" className={cn("p-4", className)}>
        {/* Header avec toggle */}
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between text-left">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <TranslatedText text="Statistiques de génération" />
              <Badge variant="secondary" className="text-xs">{stats.totalTracks}</Badge>
            </h4>
            <div className="flex items-center gap-2">
              {stats.trend !== 0 && (
                <Badge 
                  variant="outline" 
                  className={cn("text-xs gap-1", getTrendColor())}
                >
                  {getTrendIcon()}
                  {stats.trend > 0 ? '+' : ''}{stats.trend}%
                </Badge>
              )}
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Stats principales (toujours visibles) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <Music className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-foreground">{stats.totalTracks}</p>
            <p className="text-xs text-muted-foreground">Générations</p>
          </div>

          <div className="bg-background/50 rounded-lg p-3 text-center">
            <Star className="h-4 w-4 mx-auto mb-1 text-warning" />
            <p className="text-2xl font-bold text-foreground">{stats.favorites}</p>
            <p className="text-xs text-muted-foreground">Favoris ({stats.favoriteRate}%)</p>
          </div>

          <div className="bg-background/50 rounded-lg p-3 text-center">
            <Clock className="h-4 w-4 mx-auto mb-1 text-accent" />
            <p className="text-2xl font-bold text-foreground">
              {stats.totalHours > 0 ? `${stats.totalHours}h` : stats.totalMinutes}
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.totalHours > 0 ? 'Heures' : 'Minutes'}
            </p>
          </div>

          <div className="bg-background/50 rounded-lg p-3 text-center">
            <Zap className="h-4 w-4 mx-auto mb-1 text-success" />
            <p className="text-2xl font-bold text-foreground">{stats.avgPerDay}</p>
            <p className="text-xs text-muted-foreground">Par jour</p>
          </div>
        </div>

        {/* Contenu expansible */}
        <CollapsibleContent className="mt-4 space-y-4">
          {/* Activité temporelle */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-primary/5 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-foreground">{stats.todayCount}</p>
              <p className="text-xs text-muted-foreground">Aujourd'hui</p>
            </div>
            <div className="bg-primary/5 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-foreground">{stats.weekCount}</p>
              <p className="text-xs text-muted-foreground">Cette semaine</p>
            </div>
            <div className="bg-primary/5 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-foreground">{stats.monthCount}</p>
              <p className="text-xs text-muted-foreground">Ce mois</p>
            </div>
          </div>

          {/* Répartition par rang */}
          <div>
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

          {/* Insights */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
              <Target className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Items uniques</p>
                <p className="text-sm font-medium truncate">{stats.uniqueItems}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
              <Award className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Styles utilisés</p>
                <p className="text-sm font-medium truncate">{stats.uniqueStyles}</p>
              </div>
            </div>
            {stats.mostProductiveDay && (
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Jour préféré</p>
                  <p className="text-sm font-medium truncate">{stats.mostProductiveDay}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
              <TrendingUp className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Depuis</p>
                <p className="text-sm font-medium truncate">{stats.daysSinceFirst} jours</p>
              </div>
            </div>
          </div>

          {/* Styles favoris */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Top 5 styles
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

          {/* Items populaires */}
          {stats.topItems.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Top 5 items</p>
              <div className="flex flex-wrap gap-1.5">
                {stats.topItems.map(([item, count]) => (
                  <Badge key={item} variant="outline" className="text-xs">
                    {item} ({count})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CollapsibleContent>
      </PremiumCard>
    </Collapsible>
  );
};
