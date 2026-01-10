/**
 * Indicateur de connexion realtime
 * Affiche l'état de la connexion Supabase Realtime
 */

/**
 * Indicateur de connexion temps réel (Supabase realtime)
 */

import React from 'react';
import { Wifi, WifiOff, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface RealtimeIndicatorProps {
  isConnected: boolean;
  label?: string;
  className?: string;
}

export const RealtimeIndicator: React.FC<RealtimeIndicatorProps> = ({
  isConnected,
  label = "Temps réel",
  className
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              "gap-1 text-xs cursor-help",
              isConnected 
                ? "bg-success/10 text-success border-success/20" 
                : "bg-muted/50 text-muted-foreground border-muted",
              className
            )}
          >
            {isConnected ? (
              <Radio className="h-3 w-3 animate-pulse" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            <span className="hidden sm:inline">{label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {isConnected 
              ? "Connecté en temps réel - Les mises à jour arrivent instantanément"
              : "Déconnecté du temps réel - Rafraîchissez manuellement"
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
