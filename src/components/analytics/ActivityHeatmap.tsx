import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { Loader2, Flame, Calendar } from 'lucide-react';

interface HeatmapData {
  date: string;
  count: number;
  activities: Record<string, number>;
}

interface ActivityHeatmapProps {
  days?: number;
  className?: string;
}

const getIntensityClass = (count: number): string => {
  if (count === 0) return 'bg-muted/30';
  if (count <= 2) return 'bg-success/20';
  if (count <= 5) return 'bg-success/40';
  if (count <= 10) return 'bg-success/60';
  if (count <= 20) return 'bg-success/80';
  return 'bg-success';
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });
};

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ 
  days = 90,
  className = '' 
}) => {
  const { getHeatmapData, getStreak } = useActivityTracking();
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [data, streakData] = await Promise.all([
          getHeatmapData(days),
          getStreak()
        ]);
        setHeatmapData(data);
        setStreak(streakData);
      } catch (error) {
        console.error('Error loading heatmap data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [days, getHeatmapData, getStreak]);

  if (loading) {
    return (
      <Card className={`border-border/30 ${className}`}>
        <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Group by weeks for display
  const weeks: HeatmapData[][] = [];
  let currentWeek: HeatmapData[] = [];
  
  heatmapData.forEach((day, index) => {
    const dayOfWeek = new Date(day.date).getDay();
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
    if (index === heatmapData.length - 1 && currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
  });

  const totalActivities = heatmapData.reduce((sum, d) => sum + d.count, 0);
  const activeDays = heatmapData.filter(d => d.count > 0).length;

  return (
    <Card className={`border-border/30 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Activité des {days} derniers jours
        </CardTitle>
        <CardDescription className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-warning" />
            Streak: {streak.current}j (record: {streak.longest}j)
          </span>
          <span>•</span>
          <span>{activeDays} jours actifs</span>
          <span>•</span>
          <span>{totalActivities} activités</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Légende jours */}
        <div className="flex gap-1 mb-2 text-xs text-muted-foreground pl-8">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
            <div key={i} className="w-3 h-3 flex items-center justify-center">
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          <TooltipProvider delayDuration={100}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {/* Week label */}
                {weekIndex % 4 === 0 && week[0] && (
                  <div className="text-[10px] text-muted-foreground mb-0.5 h-4">
                    {new Date(week[0].date).toLocaleDateString('fr-FR', { month: 'short' })}
                  </div>
                )}
                {weekIndex % 4 !== 0 && <div className="h-4" />}
                
                {/* Days */}
                <div className="flex flex-col gap-1">
                  {week.map((day) => (
                    <Tooltip key={day.date}>
                      <TooltipTrigger asChild>
                        <div 
                          className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-primary/30 ${getIntensityClass(day.count)}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">{formatDate(day.date)}</p>
                        <p>{day.count} activité{day.count > 1 ? 's' : ''}</p>
                        {Object.entries(day.activities)
                          .filter(([_, count]) => count > 0)
                          .map(([type, count]) => (
                            <p key={type} className="text-muted-foreground">
                              {type}: {count}
                            </p>
                          ))}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </TooltipProvider>
        </div>

        {/* Légende intensité */}
        <div className="flex items-center justify-end gap-2 mt-3 text-xs text-muted-foreground">
          <span>Moins</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-muted/30" />
            <div className="w-3 h-3 rounded-sm bg-success/20" />
            <div className="w-3 h-3 rounded-sm bg-success/40" />
            <div className="w-3 h-3 rounded-sm bg-success/60" />
            <div className="w-3 h-3 rounded-sm bg-success/80" />
            <div className="w-3 h-3 rounded-sm bg-success" />
          </div>
          <span>Plus</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;
