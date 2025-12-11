import React, { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Construction, 
  RefreshCw, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import { ItemCompletenessIndicator } from './ItemCompletenessIndicator';
import { useActivityTracking } from '@/hooks/useActivityTracking';

interface ItemFallbackProps {
  itemId: string;
  itemCode?: string;
  type: 'loading' | 'incomplete' | 'error' | 'maintenance';
  onRetry?: () => void;
  estimatedCompletionDays?: number;
  showCompletenessDetails?: boolean;
}

export const ItemFallback: React.FC<ItemFallbackProps> = ({
  itemId,
  itemCode,
  type,
  onRetry,
  estimatedCompletionDays,
  showCompletenessDetails = true
}) => {
  const { logActivity } = useActivityTracking();

  // Track fallback display
  useEffect(() => {
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { type: 'item_fallback_shown', fallbackType: type, itemId, itemCode }
    });
  }, [type, itemId, itemCode, logActivity]);

  const renderContent = () => {
    switch (type) {
      case 'loading':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <h3 className="font-semibold">Chargement de l'item {itemCode}</h3>
            </div>
            <p className="text-muted-foreground">
              Préparation du contenu en cours...
            </p>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        );

      case 'incomplete':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Construction className="h-5 w-5 text-warning" />
              <h3 className="font-semibold">Item {itemCode} en cours de mise à jour</h3>
            </div>
            <p className="text-muted-foreground">
              Cet item est actuellement en cours de complétion. Veuillez patienter pendant que nous finalisons le contenu.
            </p>
            {estimatedCompletionDays && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Finalisation estimée dans {estimatedCompletionDays} jour{estimatedCompletionDays > 1 ? 's' : ''}
              </p>
            )}
            {showCompletenessDetails && (
              <ItemCompletenessIndicator 
                itemId={itemId}
                itemCode={itemCode}
                showDetails={true}
              />
            )}
          </div>
        );

      case 'error':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold">Erreur de chargement</h3>
            </div>
            <p className="text-muted-foreground">
              Une erreur est survenue lors du chargement de l'item {itemCode}. 
              Veuillez réessayer ou contactez le support si le problème persiste.
            </p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </Button>
            )}
          </div>
        );

      case 'maintenance':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Construction className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Maintenance en cours</h3>
            </div>
            <p className="text-muted-foreground">
              L'item {itemCode} est temporairement indisponible pour maintenance. 
              Nous travaillons à restaurer l'accès dans les plus brefs délais.
            </p>
            <p className="text-sm text-primary">
              💡 Vous pouvez consulter d'autres items en attendant
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const getAlertVariant = () => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'incomplete':
      case 'maintenance':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <Alert variant={getAlertVariant()} className="text-center">
          <AlertDescription>
            {renderContent()}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};