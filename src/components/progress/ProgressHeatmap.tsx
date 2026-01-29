import { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ActivityData {
  date: string;
  count: number;
}

interface ProgressHeatmapProps {
  data: ActivityData[];
  className?: string;
}

export function ProgressHeatmap({ data, className }: ProgressHeatmapProps) {
  const weeks = useMemo(() => {
    const result: (ActivityData | null)[][] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 84); // 12 weeks
    
    // Create a map of dates to counts
    const dataMap = new Map(data.map(d => [d.date, d.count]));
    
    let currentWeek: (ActivityData | null)[] = [];
    const currentDate = new Date(startDate);
    
    // Fill until we reach today
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const count = dataMap.get(dateStr) || 0;
      
      currentWeek.push({ date: dateStr, count });
      
      if (currentDate.getDay() === 6) { // Saturday = end of week
        result.push(currentWeek);
        currentWeek = [];
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }
    
    return result;
  }, [data]);

  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-muted/30";
    if (count <= 2) return "bg-success/30";
    if (count <= 5) return "bg-success/50";
    if (count <= 10) return "bg-success/70";
    return "bg-success";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <TooltipProvider>
      <div className={cn("space-y-2", className)}>
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 pr-2">
            {dayLabels.map((day, i) => (
              <div key={i} className="h-3 text-[10px] text-muted-foreground flex items-center">
                {i % 2 === 0 ? day : ""}
              </div>
            ))}
          </div>
          
          {/* Weeks */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                day ? (
                  <Tooltip key={dayIndex}>
                    <TooltipTrigger>
                      <div
                        className={cn(
                          "w-3 h-3 rounded-sm transition-colors hover:ring-1 hover:ring-primary",
                          getIntensityClass(day.count)
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{formatDate(day.date)}</p>
                      <p className="text-muted-foreground text-xs">
                        {day.count} {day.count === 1 ? 'révision' : 'révisions'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <div key={dayIndex} className="w-3 h-3" />
                )
              ))}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Moins</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-muted/30" />
            <div className="w-3 h-3 rounded-sm bg-success/30" />
            <div className="w-3 h-3 rounded-sm bg-success/50" />
            <div className="w-3 h-3 rounded-sm bg-success/70" />
            <div className="w-3 h-3 rounded-sm bg-success" />
          </div>
          <span>Plus</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
