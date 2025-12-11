import React, { useEffect, useState } from 'react';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Flame, TrendingUp } from 'lucide-react';

interface HeatmapData {
  date: string;
  count: number;
  activities: Record<string, number>;
}

export const ActivityHeatmap: React.FC<{ days?: number }> = ({ days = 90 }) => {
  const { getHeatmapData, getStreak } = useActivityTracking();
  const [data, setData] = useState<HeatmapData[]>([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [loading, setLoading] = useState(true);

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
    if (count < 5) return 'bg-primary/20';
    if (count < 15) return 'bg-primary/40';
    if (count < 30) return 'bg-primary/60';
    if (count < 50) return 'bg-primary/80';
    return 'bg-primary';
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const totalActivities = data.reduce((sum, d) => sum + d.count, 0);
  const activeDays = data.filter(d => d.count > 0).length;

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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Activité ({days} jours)
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
                  {week.map((day, dayIndex) => (
                    <Tooltip key={`${weekIndex}-${dayIndex}`}>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-3 h-3 rounded-sm transition-colors ${
                            day.count < 0 ? 'bg-transparent' : getIntensityClass(day.count)
                          } ${day.count > 0 ? 'cursor-pointer hover:ring-2 hover:ring-primary/50' : ''}`}
                        />
                      </TooltipTrigger>
                      {day.count >= 0 && (
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-medium">{formatDate(day.date)}</p>
                          <p>{day.count} activités</p>
                          {day.count > 0 && (
                            <div className="text-muted-foreground mt-1">
                              {Object.entries(day.activities)
                                .filter(([_, v]) => v > 0)
                                .map(([type, count]) => (
                                  <div key={type}>{type}: {count}</div>
                                ))
                              }
                            </div>
                          )}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  ))}
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
              <div className="w-3 h-3 rounded-sm bg-primary/20" />
              <div className="w-3 h-3 rounded-sm bg-primary/40" />
              <div className="w-3 h-3 rounded-sm bg-primary/60" />
              <div className="w-3 h-3 rounded-sm bg-primary/80" />
              <div className="w-3 h-3 rounded-sm bg-primary" />
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
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;
