import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SpacedRepetitionItem } from '@/hooks/edn/useEdnProgressionData';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface SpacedRepetitionPlannerProps {
  items: SpacedRepetitionItem[];
  rankFilter: 'all' | 'A' | 'B';
  focusItemCode?: string | null;
}

const priorityColor: Record<SpacedRepetitionItem['priority'], string> = {
  high: 'bg-destructive/15 text-destructive border-destructive/40',
  medium: 'bg-amber-100/40 text-amber-800 border-amber-400/60',
  low: 'bg-emerald-100/40 text-emerald-800 border-emerald-400/60',
};

export const SpacedRepetitionPlanner: React.FC<SpacedRepetitionPlannerProps> = ({
  items,
  rankFilter,
  focusItemCode,
}) => {
  const filtered = React.useMemo(() => {
    if (rankFilter === 'all') return items;
    return items.filter((item) => item.rankFocus === rankFilter);
  }, [items, rankFilter]);

  const normalizedFocus = focusItemCode?.toLowerCase();

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Plan de répétition espacée</CardTitle>
        <p className="text-sm text-muted-foreground">
          Les items sont classés par urgence pour optimiser vos sessions de 8 minutes.
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Thème</TableHead>
              <TableHead>Rang</TableHead>
              <TableHead>Prochaine révision</TableHead>
              <TableHead>Intervalle</TableHead>
              <TableHead>Priorité</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 15).map((item) => {
              const nextReviewDate = parseISO(item.nextReview);
              const isFocused = normalizedFocus ? item.itemCode.toLowerCase() === normalizedFocus : false;
              return (
                <TableRow
                  key={`${item.itemCode}-${item.nextReview}`}
                  className={cn(isFocused && 'border-l-2 border-l-primary bg-primary/5 text-foreground')}
                >
                  <TableCell className="font-medium text-foreground">
                    <div>{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.itemCode}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.theme}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">Rang {item.rankFocus}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(nextReviewDate, 'dd MMM yyyy')} · {item.overdue ? 'En retard' : 'À venir'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.intervalDays} j</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${priorityColor[item.priority]}`}>
                      {item.priority === 'high' ? 'Priorité haute' : item.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                  Aucun item ne correspond au filtre sélectionné.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
