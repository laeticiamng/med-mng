import React, { useEffect, useState } from 'react';
import { useActivityTracking, ActivityType } from '@/hooks/useActivityTracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Flame, TrendingUp, Filter, X } from 'lucide-react';

interface HeatmapData {
  date: string;
  count: number;
  activities: Record<string, number>;
}

const ACTIVITY_COLORS: Record<string, string> = {
  srs_review: 'bg-blue-500',
  exam: 'bg-purple-500',
  flashcard: 'bg-amber-500',
  clinical_case: 'bg-green-500',
  study: 'bg-primary',
};

const ACTIVITY_LABELS: Record<string, string> = {
  srs_review: '🔄 Révision SRS',
  exam: '📝 Examen',
  flashcard: '🃏 Flashcard',
  clinical_case: '🏥 Cas clinique',
  study: '📚 Étude',
};

export const ActivityHeatmap: React.FC<{ days?: number }> = ({ days = 90 }) => {
  const { getHeatmapData, getStreak } = useActivityTracking();
  const [data, setData] = useState<HeatmapData[]>([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [heatmapData, streakData] = await Promise.all([
        getHeatmapData(days),
        getStreak()
      ]);
      setData(heatmapData);
      setStreak(streakData);
      setLoading(false);
    };
    loadData();
  }, [days, getHeatmapData, getStreak]);

  const getIntensityClass = (count: number): string => {
    if (count === 0) return 'bg-muted';
    if (filterType) {
      const color = ACTIVITY_COLORS[filterType] || 'bg-primary';
      if (count < 5) return `${color}/20`;
      if (count < 15) return `${color}/40`;
      if (count < 30) return `${color}/60`;
      if (count < 50) return `${color}/80`;
      return color;
    }
    if (count < 5) return 'bg-primary/20';
    if (count < 15) return 'bg-primary/40';
    if (count < 30) return 'bg-primary/60';
    if (count < 50) return 'bg-primary/80';
    return 'bg-primary';
  };

  const getFilteredCount = (day: HeatmapData): number => {
    if (!filterType) return day.count;
    return day.activities[filterType] || 0;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const totalActivities = data.reduce((sum, d) => sum + (filterType ? (d.activities[filterType] || 0) : d.count), 0);
  const activeDays = data.filter(d => filterType ? (d.activities[filterType] || 0) > 0 : d.count > 0).length;
  
  // Calcul des statistiques par type d'activité
  const activityStats = data.reduce((acc, d) => {
    Object.entries(d.activities).forEach(([type, count]) => {
      acc[type] = (acc[type] || 0) + count;
    });
    return acc;
  }, {} as Record<string, number>);
  
  const activityLabels: Record<string, string> = {
    study: '📚 Étude',
    review: '🔄 Révision',
    exam: '📝 Examen',
    clinical: '🏥 Cas clinique',
    flashcard: '🃏 Flashcard',
    ai_question: '🤖 Question IA',
  };

  // Group by weeks for display
  const weeks: HeatmapData[][] = [];
  let currentWeek: HeatmapData[] = [];
  
  data.forEach((day, index) => {
    const date = new Date(day.date);
    const dayOfWeek = date.getDay();
    
    if (index === 0) {
      // Pad the first week with empty days
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push({ date: '', count: -1, activities: {} });
      }
    }
    
    currentWeek.push(day);
    
    if (dayOfWeek === 6 || index === data.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Activité ({days} jours)
            {filterType && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Filter className="h-3 w-3" />
                {ACTIVITY_LABELS[filterType]}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0 ml-1" 
                  onClick={() => setFilterType(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">{streak.current} jours</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Record: {streak.longest}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-1 min-w-max">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => {
                    const count = day.count >= 0 ? getFilteredCount(day) : -1;
                    return (
                      <Tooltip key={`${weekIndex}-${dayIndex}`}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-3 h-3 rounded-sm transition-all ${
                              count < 0 ? 'bg-transparent' : getIntensityClass(count)
                            } ${count > 0 ? 'cursor-pointer hover:ring-2 hover:ring-primary/50 hover:scale-125' : ''}`}
                          />
                        </TooltipTrigger>
                        {day.count >= 0 && (
                          <TooltipContent side="top" className="text-xs">
                            <p className="font-medium">{formatDate(day.date)}</p>
                            <p>{count} activités{filterType ? ` (${ACTIVITY_LABELS[filterType]})` : ''}</p>
                            {day.count > 0 && !filterType && (
                              <div className="text-muted-foreground mt-1">
                                {Object.entries(day.activities)
                                  .filter(([_, v]) => v > 0)
                                  .map(([type, cnt]) => (
                                    <div key={type}>{ACTIVITY_LABELS[type] || type}: {cnt}</div>
                                  ))
                                }
                              </div>
                            )}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Moins</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted" />
              <div className={`w-3 h-3 rounded-sm ${filterType ? `${ACTIVITY_COLORS[filterType] || 'bg-primary'}/20` : 'bg-primary/20'}`} />
              <div className={`w-3 h-3 rounded-sm ${filterType ? `${ACTIVITY_COLORS[filterType] || 'bg-primary'}/40` : 'bg-primary/40'}`} />
              <div className={`w-3 h-3 rounded-sm ${filterType ? `${ACTIVITY_COLORS[filterType] || 'bg-primary'}/60` : 'bg-primary/60'}`} />
              <div className={`w-3 h-3 rounded-sm ${filterType ? `${ACTIVITY_COLORS[filterType] || 'bg-primary'}/80` : 'bg-primary/80'}`} />
              <div className={`w-3 h-3 rounded-sm ${filterType ? ACTIVITY_COLORS[filterType] || 'bg-primary' : 'bg-primary'}`} />
            </div>
            <span>Plus</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {totalActivities} total
            </span>
            <span>{activeDays} jours actifs</span>
          </div>
        </div>

        {/* Statistiques par type d'activité - Clickable filters */}
        {Object.keys(activityStats).length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Filtrer par activité <span className="text-muted-foreground/60">(cliquez)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(activityStats)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                  <Badge 
                    key={type} 
                    variant={filterType === type ? "default" : "secondary"} 
                    className={`text-xs gap-1 cursor-pointer transition-all hover:scale-105 ${
                      filterType === type ? 'ring-2 ring-primary/50' : ''
                    }`}
                    onClick={() => setFilterType(filterType === type ? null : type)}
                  >
                    {ACTIVITY_LABELS[type] || type}
                    <span className="font-bold">{count}</span>
                  </Badge>
                ))
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;
