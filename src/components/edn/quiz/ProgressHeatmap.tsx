import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProgressHeatmapProps {
  itemCode?: string;
  days?: number;
}

interface ActivityDay {
  date: string;
  count: number;
}

export const ProgressHeatmap: React.FC<ProgressHeatmapProps> = ({ 
  itemCode, 
  days = 30 
}) => {
  const [activityData, setActivityData] = useState<ActivityDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from('quiz_results')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString());

      if (itemCode) {
        query = query.eq('item_code', itemCode);
      }

      const { data } = await query;

      // Aggregate by day
      const dayMap: Record<string, number> = {};
      data?.forEach(result => {
        const day = new Date(result.created_at).toISOString().split('T')[0];
        dayMap[day] = (dayMap[day] || 0) + 1;
      });

      const activity: ActivityDay[] = [];
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const dateStr = date.toISOString().split('T')[0];
        activity.push({
          date: dateStr,
          count: dayMap[dateStr] || 0
        });
      }

      setActivityData(activity);
      setLoading(false);
    };

    fetchActivity();
  }, [itemCode, days]);

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-muted';
    if (count === 1) return 'bg-success/30';
    if (count <= 3) return 'bg-success/50';
    if (count <= 5) return 'bg-success/70';
    return 'bg-success';
  };

  const totalActivity = activityData.reduce((sum, d) => sum + d.count, 0);
  const activeDays = activityData.filter(d => d.count > 0).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="animate-pulse grid grid-cols-7 gap-1">
            {Array(28).fill(0).map((_, i) => (
              <div key={i} className="aspect-square rounded bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Activité ({days}j)
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            {activeDays} jours actifs
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Heatmap grid */}
        <div className="grid grid-cols-7 gap-1">
          {activityData.map((day, idx) => (
            <div
              key={idx}
              className={`aspect-square rounded-sm ${getIntensity(day.count)} transition-colors`}
              title={`${day.date}: ${day.count} quiz`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Total: {totalActivity} quiz</span>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Moins</span>
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <div className="w-3 h-3 rounded-sm bg-success/30" />
            <div className="w-3 h-3 rounded-sm bg-success/50" />
            <div className="w-3 h-3 rounded-sm bg-success/70" />
            <div className="w-3 h-3 rounded-sm bg-success" />
            <span className="text-muted-foreground">Plus</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
