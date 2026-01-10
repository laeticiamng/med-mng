/**
 * Indicateur de connexion realtime
 * Affiche l'état de la connexion Supabase Realtime
 */

import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface RealtimeIndicatorProps {
  isConnected: boolean;
  connectionError?: string | null;
  onReconnect?: () => void;
  showLabel?: boolean;
  size?: 'sm' | 'default';
}

export const RealtimeIndicator: React.FC<RealtimeIndicatorProps> = ({
  isConnected,
  connectionError,
  onReconnect,
  showLabel = false,
  size = 'sm'
}) => {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <>
                <div className={`${iconSize} rounded-full bg-success animate-pulse`} />
                {showLabel && (
                  <span className="text-xs text-success">Connecté</span>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1">
                <WifiOff className={`${iconSize} text-destructive`} />
                {showLabel && (
                  <span className="text-xs text-destructive">Déconnecté</span>
                )}
                {onReconnect && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0"
                    onClick={onReconnect}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">
            {isConnected 
              ? 'Mises à jour en temps réel actives' 
              : connectionError || 'Connexion perdue - cliquez pour reconnecter'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
