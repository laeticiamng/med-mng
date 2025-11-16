import { useTemplateHistory } from '@/hooks/useTemplateHistory';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, Filter } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface TemplateHistoryProps {
  templateId?: string;
}

export const TemplateHistory = ({ templateId }: TemplateHistoryProps) => {
  const { history, isLoading, deleteHistoryEntry } = useTemplateHistory(templateId);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Chargement de l'historique...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Aucune application enregistrée pour le moment
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((entry) => (
        <Card key={entry.id} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {format(new Date(entry.applied_at), 'PPp', { locale: fr })}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({formatDistanceToNow(new Date(entry.applied_at), {
                    addSuffix: true,
                    locale: fr,
                  })})
                </span>
              </div>
              {entry.results_count !== null && (
                <div className="text-sm text-muted-foreground mb-2">
                  <strong>{entry.results_count}</strong> résultat{entry.results_count > 1 ? 's' : ''} trouvé{entry.results_count > 1 ? 's' : ''}
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => deleteHistoryEntry(entry.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Display applied filters */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Filter className="w-3 h-3" />
              <span>Filtres appliqués:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {entry.filters_applied.severity && entry.filters_applied.severity !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Sévérité: {entry.filters_applied.severity}
                </Badge>
              )}
              {entry.filters_applied.type && entry.filters_applied.type !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Type: {entry.filters_applied.type}
                </Badge>
              )}
              {entry.filters_applied.searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Recherche: "{entry.filters_applied.searchTerm}"
                </Badge>
              )}
              {entry.filters_applied.dateFrom && (
                <Badge variant="secondary" className="text-xs">
                  Du: {format(new Date(entry.filters_applied.dateFrom), 'P', { locale: fr })}
                </Badge>
              )}
              {entry.filters_applied.dateTo && (
                <Badge variant="secondary" className="text-xs">
                  Au: {format(new Date(entry.filters_applied.dateTo), 'P', { locale: fr })}
                </Badge>
              )}
              {entry.filters_applied.userEmail && (
                <Badge variant="secondary" className="text-xs">
                  Email: {entry.filters_applied.userEmail}
                </Badge>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
