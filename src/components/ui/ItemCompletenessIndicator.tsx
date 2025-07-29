import React, { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  Info
} from 'lucide-react';
import { useItemCompletenessChecker } from '@/hooks/useItemCompletenessChecker';

interface ItemCompletenessIndicatorProps {
  itemId: string;
  itemCode?: string;
  showDetails?: boolean;
  autoCheck?: boolean;
  onCompletenessChange?: (isComplete: boolean) => void;
}

export const ItemCompletenessIndicator: React.FC<ItemCompletenessIndicatorProps> = ({
  itemId,
  itemCode,
  showDetails = false,
  autoCheck = true,
  onCompletenessChange
}) => {
  const { 
    isChecking,
    checkItemCompleteness,
    getItemCompleteness,
    isItemIncomplete
  } = useItemCompletenessChecker();

  const completenessResult = getItemCompleteness(itemId);
  const isIncomplete = isItemIncomplete(itemId);

  // Vérification automatique au montage
  useEffect(() => {
    if (autoCheck && !completenessResult && !isChecking) {
      checkItemCompleteness(itemId);
    }
  }, [autoCheck, itemId, completenessResult, isChecking, checkItemCompleteness]);

  // Notifier les changements de complétude
  useEffect(() => {
    if (completenessResult && onCompletenessChange) {
      onCompletenessChange(completenessResult.status === 'complete');
    }
  }, [completenessResult, onCompletenessChange]);

  const handleRefresh = () => {
    checkItemCompleteness(itemId);
  };

  // État de chargement
  if (isChecking && !completenessResult) {
    return (
      <div className="flex items-center gap-2 p-2">
        <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Vérification...</span>
      </div>
    );
  }

  // Pas de données
  if (!completenessResult) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRefresh}
        className="gap-2"
      >
        <Info className="h-4 w-4" />
        Vérifier
      </Button>
    );
  }

  // Badge de statut principal
  const getStatusBadge = () => {
    switch (completenessResult.status) {
      case 'complete':
        return (
          <Badge variant="default" className="gap-1 bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3" />
            Complet ({completenessResult.completenessScore}%)
          </Badge>
        );
      case 'critical':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Critique ({completenessResult.completenessScore}%)
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Incomplet ({completenessResult.completenessScore}%)
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-3">
      {/* Badge principal avec action de refresh */}
      <div className="flex items-center gap-2">
        {getStatusBadge()}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isChecking}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Barre de progression */}
      <div className="space-y-1">
        <Progress 
          value={completenessResult.completenessScore} 
          className="h-2"
        />
        <div className="text-xs text-muted-foreground">
          {completenessResult.completenessScore}% complet
        </div>
      </div>

      {/* Détails étendus */}
      {showDetails && isIncomplete && (
        <Alert className={
          completenessResult.status === 'critical' 
            ? 'border-destructive bg-destructive/5' 
            : 'border-warning bg-warning/5'
        }>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">
                Item {itemCode || 'N/A'} nécessite une mise à jour
              </p>
              
              {completenessResult.missingFields.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-destructive">
                    Champs manquants:
                  </p>
                  <ul className="text-sm list-disc list-inside ml-2">
                    {completenessResult.missingFields.map(field => (
                      <li key={field}>{field}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {completenessResult.partialFields.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-warning">
                    Champs partiels:
                  </p>
                  <ul className="text-sm list-disc list-inside ml-2">
                    {completenessResult.partialFields.map(field => (
                      <li key={field}>{field}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Dernière vérification: {new Date(completenessResult.lastChecked).toLocaleString()}
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Message pour items complets */}
      {showDetails && completenessResult.status === 'complete' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="text-sm">
              ✅ Item {itemCode || 'N/A'} est complet et prêt à l'utilisation
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Dernière vérification: {new Date(completenessResult.lastChecked).toLocaleString()}
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};