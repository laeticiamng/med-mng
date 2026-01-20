import React from 'react';
import { WifiOff, Wifi, RefreshCw, CloudOff, CloudCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  variant?: 'minimal' | 'compact' | 'detailed';
  className?: string;
  showSyncButton?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  variant = 'minimal',
  className,
  showSyncButton = true
}) => {
  const {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncTime,
    storageUsed,
    syncNow
  } = useOfflineSync();

  const formatStorageSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatLastSync = (date: Date | null): string => {
    if (!date) return 'Jamais';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  if (variant === 'minimal') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('flex items-center gap-1.5', className)}>
              {isOnline ? (
                <Wifi className="h-4 w-4 text-success" />
              ) : (
                <WifiOff className="h-4 w-4 text-destructive" />
              )}
              {pendingCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {pendingCount}
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isOnline ? 'En ligne' : 'Hors ligne'}</p>
            {pendingCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {pendingCount} modification(s) en attente
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex items-center gap-1.5">
          {isOnline ? (
            <CloudCheck className="h-4 w-4 text-success" />
          ) : (
            <CloudOff className="h-4 w-4 text-destructive" />
          )}
          <span className="text-sm">
            {isOnline ? 'Connecté' : 'Hors ligne'}
          </span>
        </div>

        {pendingCount > 0 && (
          <Badge variant="outline" className="gap-1">
            <RefreshCw className={cn('h-3 w-3', isSyncing && 'animate-spin')} />
            {pendingCount}
          </Badge>
        )}

        {showSyncButton && pendingCount > 0 && isOnline && !isSyncing && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={syncNow}
          >
            Synchroniser
          </Button>
        )}
      </div>
    );
  }

  // Detailed variant
  return (
    <div className={cn(
      'p-4 rounded-lg border',
      isOnline ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20',
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <CloudCheck className="h-5 w-5 text-success" />
              <span className="font-medium text-success">Connecté</span>
            </>
          ) : (
            <>
              <CloudOff className="h-5 w-5 text-destructive" />
              <span className="font-medium text-destructive">Hors ligne</span>
            </>
          )}
        </div>

        {showSyncButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={syncNow}
            disabled={!isOnline || isSyncing || pendingCount === 0}
            className="gap-1.5"
          >
            <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
            {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {/* Pending operations */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Opérations en attente</span>
          <Badge variant={pendingCount > 0 ? 'default' : 'secondary'}>
            {pendingCount}
          </Badge>
        </div>

        {/* Last sync time */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Dernière synchronisation</span>
          <span>{formatLastSync(lastSyncTime)}</span>
        </div>

        {/* Storage usage */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Stockage local</span>
            <span>{formatStorageSize(storageUsed)}</span>
          </div>
          <Progress
            value={Math.min((storageUsed / (5 * 1024 * 1024)) * 100, 100)}
            className="h-1.5"
          />
        </div>

        {/* Offline tips */}
        {!isOnline && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <p className="text-sm text-muted-foreground">
              💡 En mode hors ligne, vous pouvez consulter les items EDN déjà visités.
              Vos modifications seront synchronisées automatiquement à la reconnexion.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;
