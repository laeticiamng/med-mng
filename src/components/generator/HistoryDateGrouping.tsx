/**
 * Regroupement de l'historique par date
 * ✅ NOUVEAU: Groupe les tracks par jour/semaine/mois
 */

import React, { useMemo } from 'react';
import { isToday, isYesterday, isThisWeek, isThisMonth, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DateGroupHeaderProps {
  date: Date;
  count: number;
  className?: string;
}

export const DateGroupHeader: React.FC<DateGroupHeaderProps> = ({
  date,
  count,
  className
}) => {
  const getLabel = () => {
    if (isToday(date)) return "Aujourd'hui";
    if (isYesterday(date)) return "Hier";
    if (isThisWeek(date, { locale: fr })) return format(date, 'EEEE', { locale: fr });
    if (isThisMonth(date)) return format(date, 'd MMMM', { locale: fr });
    return format(date, 'MMMM yyyy', { locale: fr });
  };

  const getIcon = () => {
    if (isToday(date)) return <Clock className="h-3.5 w-3.5" />;
    return <Calendar className="h-3.5 w-3.5" />;
  };

  return (
    <div className={cn(
      "flex items-center gap-2 py-2 px-3 bg-muted/30 rounded-lg sticky top-0 z-10",
      className
    )}>
      {getIcon()}
      <span className="text-sm font-medium capitalize">{getLabel()}</span>
      <Badge variant="secondary" className="text-xs ml-auto">
        {count} {count > 1 ? 'pistes' : 'piste'}
      </Badge>
    </div>
  );
};

// Type pour les groupes
export interface DateGroup<T> {
  date: Date;
  label: string;
  items: T[];
}

// Hook utilitaire pour grouper par date
export function useGroupByDate<T extends { created_at: string }>(
  items: T[]
): DateGroup<T>[] {
  return useMemo(() => {
    const groups = new Map<string, { date: Date; items: T[] }>();

    items.forEach(item => {
      const date = new Date(item.created_at);
      const key = getDateKey(date);
      
      if (!groups.has(key)) {
        groups.set(key, { date, items: [] });
      }
      groups.get(key)!.items.push(item);
    });

    return Array.from(groups.entries())
      .map(([key, { date, items }]) => ({
        date,
        label: key,
        items
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [items]);
}

function getDateKey(date: Date): string {
  if (isToday(date)) return 'today';
  if (isYesterday(date)) return 'yesterday';
  if (isThisWeek(date, { locale: fr })) return `week_${format(date, 'EEEE', { locale: fr })}`;
  if (isThisMonth(date)) return `month_${format(date, 'd')}`;
  return format(date, 'yyyy-MM');
}

// Composant wrapper pour afficher une liste groupée
interface GroupedListProps<T extends { created_at: string; id: string }> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  showHeaders?: boolean;
}

export function GroupedHistoryList<T extends { created_at: string; id: string }>({
  items,
  renderItem,
  className,
  showHeaders = true
}: GroupedListProps<T>) {
  const groups = useGroupByDate(items);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {groups.map((group, groupIndex) => (
        <div key={group.label} className="space-y-2">
          {showHeaders && (
            <DateGroupHeader date={group.date} count={group.items.length} />
          )}
          <div className="space-y-2">
            {group.items.map((item, itemIndex) => (
              <React.Fragment key={item.id}>
                {renderItem(item, groupIndex * 100 + itemIndex)}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
