import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar } from 'lucide-react';

interface ProgressHeatmapProps {
  data: Array<{
    date: string;
    count: number;
    score?: number;
  }>;
}

export const ProgressHeatmap: React.FC<ProgressHeatmapProps> = ({ data }) => {
  const { weeks, maxCount, totalActivity, averageScore } = useMemo(() => {
    // Generate last 12 weeks of data
    const today = new Date();
    const weeks: Array<Array<{ date: string; count: number; score: number; dayName: string }>> = [];
    
    // Map data by date for quick lookup - handle empty data gracefully
    const safeData = data || [];
    const dataMap = new Map(safeData.map(d => [d.date, { count: d.count, score: d.score || 0 }]));
    
    let maxCount = 1;
    let totalActivity = 0;
    let scoreSum = 0;
    let scoreCount = 0;
    
    // Generate 12 weeks (84 days)
    for (let weekIdx = 11; weekIdx >= 0; weekIdx--) {
      const week: Array<{ date: string; count: number; score: number; dayName: string }> = [];
      
      for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (weekIdx * 7 + (6 - dayIdx)));
        const dateStr = date.toISOString().split('T')[0];
        const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        
        const entry = dataMap.get(dateStr) || { count: 0, score: 0 };
        if (entry.count > maxCount) maxCount = entry.count;
        totalActivity += entry.count;
        if (entry.score > 0) {
          scoreSum += entry.score;
          scoreCount++;
        }
        
        week.push({
          date: dateStr,
          count: entry.count,
          score: entry.score,
          dayName: dayNames[date.getDay()]
        });
      }
      
      weeks.push(week);
    }
    
    const averageScore = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0;
    
    return { weeks, maxCount, totalActivity, averageScore };
  }, [data]);

  const getColorIntensity = (count: number) => {
    if (count === 0) return 'bg-muted';
    const intensity = Math.min(count / maxCount, 1);
    if (intensity < 0.25) return 'bg-success/30';
    if (intensity < 0.5) return 'bg-success/50';
    if (intensity < 0.75) return 'bg-success/70';
    return 'bg-success';
  };

  const dayLabels = ['', 'Lun', '', 'Mer', '', 'Ven', ''];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Activité des 12 dernières semaines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-2 text-xs text-muted-foreground">
              {dayLabels.map((label, idx) => (
                <div key={idx} className="h-3 flex items-center">
                  {label}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            <div className="flex gap-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day, dayIdx) => (
                    <Tooltip key={day.date}>
                      <TooltipTrigger asChild>
                        <div 
                          className={`w-3 h-3 rounded-sm ${getColorIntensity(day.count)} cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all`}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <div className="font-medium">{new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
                        <div>{day.count} révision{day.count > 1 ? 's' : ''}</div>
                        {day.score > 0 && <div>Score moyen: {day.score}%</div>}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <span>Moins</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted" />
              <div className="w-3 h-3 rounded-sm bg-success/30" />
              <div className="w-3 h-3 rounded-sm bg-success/50" />
              <div className="w-3 h-3 rounded-sm bg-success/70" />
              <div className="w-3 h-3 rounded-sm bg-success" />
            </div>
            <span>Plus</span>
          </div>

          {/* Stats summary */}
          {totalActivity > 0 && (
            <div className="flex items-center justify-between mt-4 p-3 bg-muted/50 rounded-lg text-sm">
              <div className="flex items-center gap-4">
                <div>
                  <span className="font-medium text-primary">{totalActivity}</span>
                  <span className="text-muted-foreground ml-1">révisions totales</span>
                </div>
                {averageScore > 0 && (
                  <div>
                    <span className="font-medium text-success">{averageScore}%</span>
                    <span className="text-muted-foreground ml-1">score moyen</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty state message */}
          {totalActivity === 0 && (
            <div className="mt-4 p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Commencez à réviser pour voir votre activité ici ! 🚀
              </p>
            </div>
          )}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
