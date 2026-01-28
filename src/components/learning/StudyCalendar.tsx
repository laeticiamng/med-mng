import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useAdaptiveSRS } from '@/hooks/useAdaptiveSRS';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Calendar, ChevronLeft, ChevronRight, Download, Flame, Star, Trophy } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface DayData {
  date: Date;
  predicted: number;
  completed: number;
  isToday: boolean;
  isPast: boolean;
}

export const StudyCalendar: React.FC = () => {
  const { getSRSStats } = useAdaptiveSRS();
  const { getHeatmapData, getStreak, getActiveDaysCount } = useActivityTracking();
  const { stats: gamificationStats } = useGamification();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [streakInfo, setStreakInfo] = useState({ current: 0, longest: 0 });
  const [activeDays, setActiveDays] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get SRS stats for predictions
      const srsStats = await getSRSStats(user.id);
      setStats(srsStats);

      // Get streak info
      const streak = await getStreak();
      setStreakInfo(streak);

      // Get active days this month
      const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
      const activeDaysCount = await getActiveDaysCount(daysInMonth);
      setActiveDays(activeDaysCount);

      // Get past activity
      const heatmapData = await getHeatmapData(60);

      // Build calendar data
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const days: DayData[] = [];
      
      // Pad with days from previous month
      const startPadding = firstDay.getDay();
      for (let i = startPadding - 1; i >= 0; i--) {
        const date = new Date(year, month, -i);
        days.push({
          date,
          predicted: 0,
          completed: 0,
          isToday: false,
          isPast: true
        });
      }

      // Days of current month
      for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(year, month, d);
        const dateStr = date.toISOString().split('T')[0];
        const heatmapEntry = heatmapData.find(h => h.date === dateStr);
        
        // Calculate predicted workload for future days
        let predicted = 0;
        if (date >= today && srsStats?.predictedWorkload) {
          const daysFromToday = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysFromToday < 7) {
            predicted = srsStats.predictedWorkload[daysFromToday] || 0;
          }
        }

        days.push({
          date,
          predicted,
          completed: heatmapEntry?.count || 0,
          isToday: date.getTime() === today.getTime(),
          isPast: date < today
        });
      }

      // Pad with days from next month
      const endPadding = 42 - days.length; // 6 rows of 7 days
      for (let i = 1; i <= endPadding; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
          date,
          predicted: 0,
          completed: 0,
          isToday: false,
          isPast: false
        });
      }

      setCalendarData(days);
      setLoading(false);
    };

    loadData();
  }, [currentMonth, getSRSStats, getHeatmapData, getStreak, getActiveDaysCount]);

  const { toast } = useToast();

  const navigateMonth = (delta: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  // Export to iCal format
  const exportToICal = useCallback(() => {
    if (!stats?.predictedWorkload) {
      toast({ title: 'Aucune donnée', description: 'Pas de révisions prévues à exporter.', variant: 'destructive' });
      return;
    }

    const events: string[] = [];
    const today = new Date();
    
    stats.predictedWorkload.forEach((count, dayOffset) => {
      if (count > 0) {
        const eventDate = new Date(today);
        eventDate.setDate(eventDate.getDate() + dayOffset);
        const dateStr = eventDate.toISOString().split('T')[0].replace(/-/g, '');
        
        events.push(
          `BEGIN:VEVENT`,
          `DTSTART;VALUE=DATE:${dateStr}`,
          `DTEND;VALUE=DATE:${dateStr}`,
          `SUMMARY:📚 Révisions EDN (${count} items)`,
          `DESCRIPTION:${count} cartes à réviser - MED-MNG`,
          `END:VEVENT`
        );
      }
    });

    if (events.length === 0) {
      toast({ title: 'Aucune révision', description: 'Aucune révision prévue dans les 7 prochains jours.' });
      return;
    }

    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MED-MNG//EDN Revisions//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...events,
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revisions-edn-${today.toISOString().split('T')[0]}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: 'Export réussi', description: 'Fichier iCal téléchargé. Importez-le dans votre calendrier.' });
  }, [stats, toast]);

  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getIntensityClass = (day: DayData): string => {
    if (day.isPast) {
      if (day.completed === 0) return 'bg-muted/30';
      if (day.completed < 5) return 'bg-success/20';
      if (day.completed < 15) return 'bg-success/40';
      if (day.completed < 30) return 'bg-success/60';
      return 'bg-success/80';
    } else if (day.isToday) {
      return 'bg-primary/20 ring-2 ring-primary';
    } else {
      if (day.predicted === 0) return 'bg-muted/20';
      if (day.predicted < 5) return 'bg-warning/20';
      if (day.predicted < 15) return 'bg-warning/40';
      return 'bg-warning/60';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-48 bg-muted rounded" />
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
            Planning de révision
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium capitalize w-32 text-center">
              {monthName}
            </span>
            <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Streak & Activity Summary */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="gap-1 text-xs">
            <Flame className="h-3 w-3 text-orange-500" />
            Série: {streakInfo.current} jours
          </Badge>
          <Badge variant="outline" className="gap-1 text-xs">
            <Trophy className="h-3 w-3 text-amber-500" />
            Record: {streakInfo.longest} jours
          </Badge>
          <Badge variant="outline" className="gap-1 text-xs">
            <Star className="h-3 w-3 text-yellow-500" />
            {activeDays} jours actifs ce mois
          </Badge>
          {gamificationStats && (
            <Badge variant="outline" className="gap-1 text-xs">
              Niveau {gamificationStats.level}
            </Badge>
          )}
        </div>
        
        {/* Export Button */}
        <div className="flex justify-end mt-2">
          <Button variant="outline" size="sm" onClick={exportToICal} className="gap-1 text-xs">
            <Download className="h-3 w-3" />
            Exporter iCal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((day, index) => {
            const isCurrentMonth = day.date.getMonth() === currentMonth.getMonth();
            
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div
                    className={`aspect-square p-1 rounded-md transition-colors cursor-pointer hover:ring-2 hover:ring-primary/30 ${
                      getIntensityClass(day)
                    } ${!isCurrentMonth ? 'opacity-30' : ''}`}
                  >
                    <div className="h-full flex flex-col items-center justify-center">
                      <span className={`text-xs ${day.isToday ? 'font-bold text-primary' : ''}`}>
                        {day.date.getDate()}
                      </span>
                      {isCurrentMonth && (day.completed > 0 || day.predicted > 0) && (
                        <span className="text-[10px] text-muted-foreground">
                          {day.isPast ? day.completed : day.predicted}
                        </span>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                {isCurrentMonth && (
                  <TooltipContent side="top" className="text-xs">
                    <p className="font-medium">
                      {day.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    {day.isPast ? (
                      <p className={day.completed > 0 ? 'text-success' : 'text-muted-foreground'}>
                        {day.completed > 0 ? `✓ ${day.completed} activités complétées` : 'Aucune activité'}
                      </p>
                    ) : day.isToday ? (
                      <p className="text-primary">
                        {day.predicted > 0 ? `${day.predicted} révisions prévues` : 'Continuez votre série !'}
                      </p>
                    ) : (
                      <p className="text-warning">
                        {day.predicted > 0 ? `${day.predicted} révisions prévues` : 'Repos prévu'}
                      </p>
                    )}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-success/40" />
              <span>Passé</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-warning/40" />
              <span>Prévu</span>
            </div>
          </div>
          
          {stats && (
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1 text-xs">
                <Brain className="h-3 w-3" />
                {stats.dueToday} aujourd'hui
              </Badge>
              {stats.overdue > 0 && (
                <Badge variant="destructive" className="gap-1 text-xs">
                  {stats.overdue} en retard
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyCalendar;
