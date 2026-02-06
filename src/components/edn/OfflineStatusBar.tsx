import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, HardDrive, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OfflineStatusBarProps {
  isOnline: boolean;
  downloadedCount: number;
  pendingSync: number;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const OfflineStatusBar: React.FC<OfflineStatusBarProps> = ({
  isOnline,
  downloadedCount,
  pendingSync,
  onSync,
  isSyncing = false,
}) => {
  // Only show if offline or has downloaded items
  if (isOnline && downloadedCount === 0 && pendingSync === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Connection status */}
      <Badge
        variant="outline"
        className={isOnline
          ? 'border-success/30 text-success'
          : 'border-destructive/30 text-destructive'
        }
      >
        {isOnline ? (
          <><Wifi className="h-3 w-3 mr-1" /> En ligne</>
        ) : (
          <><WifiOff className="h-3 w-3 mr-1" /> Hors-ligne</>
        )}
      </Badge>

      {/* Downloaded items count */}
      {downloadedCount > 0 && (
        <Badge variant="outline" className="border-primary/30 text-primary">
          <HardDrive className="h-3 w-3 mr-1" />
          {downloadedCount} item{downloadedCount > 1 ? 's' : ''} sauvegardé{downloadedCount > 1 ? 's' : ''}
        </Badge>
      )}

      {/* Pending sync indicator */}
      {pendingSync > 0 && isOnline && onSync && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSync}
          disabled={isSyncing}
          className="h-7 text-xs text-warning hover:text-warning"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
          {pendingSync} en attente
        </Button>
      )}
    </div>
  );
};
