import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ProgressHistoryEntry } from '@/hooks/edn/useEdnProgressionData';
import { format, parseISO } from 'date-fns';

interface ProgressHistoryTimelineProps {
  entries: ProgressHistoryEntry[];
}

export const ProgressHistoryTimeline: React.FC<ProgressHistoryTimelineProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historique des révisions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Aucune révision enregistrée pour le moment. Lancez une session pour commencer à alimenter l'historique.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Historique des révisions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.slice(0, 12).map((entry) => {
          const date = parseISO(entry.updatedAt);
          return (
            <div key={`${entry.itemCode}-${entry.updatedAt}`} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <span className="w-2 h-2 rounded-full bg-primary mt-1" />
                <span className="flex-1 w-px bg-border" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{entry.title}</p>
                  <Badge variant="outline" className="text-xs">{entry.itemCode}</Badge>
                  <Badge variant="secondary" className="text-xs">{entry.theme}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Révisé le {format(date, 'dd MMM yyyy à HH:mm')} · progression {Math.round(entry.progressPercentage)}%
                </p>
                {entry.masteryLevel && (
                  <p className="text-xs text-muted-foreground/80">Statut : {entry.masteryLevel}</p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
