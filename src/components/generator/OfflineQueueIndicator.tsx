/**
 * Indicateur de file d'attente hors-ligne
 * ✅ NOUVEAU: Affiche les générations en attente quand hors-ligne
 */

import React from 'react';
import { WifiOff, Cloud, CloudOff, Upload, Check, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TranslatedText } from '@/components/TranslatedText';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';

interface QueuedGeneration {
  id: string;
  title: string;
  style: string;
  rang: string;
  timestamp: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
}

interface OfflineQueueIndicatorProps {
  queue?: QueuedGeneration[];
  onSync?: () => void;
  onClear?: () => void;
  className?: string;
}

export const OfflineQueueIndicator: React.FC<OfflineQueueIndicatorProps> = ({
  queue = [],
  onSync,
  onClear,
  className
}) => {
  const { isOnline, lastOfflineAt } = useNetworkStatus();
  const wasOffline = !!lastOfflineAt && (Date.now() - lastOfflineAt.getTime()) < 60000; // Offline dans la dernière minute
  
  const pendingCount = queue.filter(q => q.status === 'pending').length;
  const uploadingCount = queue.filter(q => q.status === 'uploading').length;
  const completedCount = queue.filter(q => q.status === 'completed').length;
  const failedCount = queue.filter(q => q.status === 'failed').length;
  
  const hasQueue = queue.length > 0;
  const isUploading = uploadingCount > 0;
  const uploadProgress = hasQueue ? (completedCount / queue.length) * 100 : 0;

  // Pas d'indicateur si en ligne sans file d'attente
  if (isOnline && !hasQueue && !wasOffline) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Alerte hors-ligne */}
      {!isOnline && (
        <Alert variant="destructive" className="py-2">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">
              <TranslatedText text="Mode hors-ligne - Les générations seront synchronisées au retour en ligne" />
            </span>
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingCount} en attente
              </Badge>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Indicateur de synchronisation */}
      {hasQueue && isOnline && (
        <Alert className="py-2 bg-primary/5 border-primary/20">
          <Cloud className="h-4 w-4 text-primary" />
          <AlertDescription className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {isUploading ? (
                  <TranslatedText text="Synchronisation en cours..." />
                ) : failedCount > 0 ? (
                  <TranslatedText text="Certaines synchronisations ont échoué" />
                ) : completedCount === queue.length ? (
                  <TranslatedText text="Synchronisation terminée !" />
                ) : (
                  <TranslatedText text="Prêt à synchroniser" />
                )}
              </span>
              <div className="flex items-center gap-2">
                {completedCount > 0 && (
                  <Badge variant="outline" className="text-success border-success/20">
                    <Check className="h-3 w-3 mr-1" />
                    {completedCount}
                  </Badge>
                )}
                {failedCount > 0 && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {failedCount}
                  </Badge>
                )}
                {pendingCount > 0 && (
                  <Badge variant="secondary">
                    <Upload className="h-3 w-3 mr-1" />
                    {pendingCount}
                  </Badge>
                )}
              </div>
            </div>

            {isUploading && (
              <Progress value={uploadProgress} className="h-1.5" />
            )}

            <div className="flex gap-2">
              {pendingCount > 0 && onSync && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSync}
                  disabled={isUploading}
                  className="h-7 text-xs"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Synchroniser maintenant
                </Button>
              )}
              {(completedCount === queue.length || failedCount > 0) && onClear && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                  className="h-7 text-xs"
                >
                  Effacer l'historique
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Liste des générations en file d'attente (si pertinent) */}
      {hasQueue && pendingCount > 0 && !isOnline && (
        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {queue
            .filter(q => q.status === 'pending')
            .slice(0, 3)
            .map(item => (
              <div 
                key={item.id}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs"
              >
                <CloudOff className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="truncate flex-1">{item.title}</span>
                <Badge variant="outline" className="text-[10px] h-4">{item.rang}</Badge>
              </div>
            ))}
          {pendingCount > 3 && (
            <p className="text-xs text-muted-foreground text-center">
              +{pendingCount - 3} autres en attente
            </p>
          )}
        </div>
      )}
    </div>
  );
};
