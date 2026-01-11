/**
 * Indicateur de connexion temps réel (Supabase realtime)
 * ✅ AMÉLIORÉ: Animation de reconnexion + bouton retry
 */

import React from 'react';
import { Wifi, WifiOff, Radio, RefreshCw, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface RealtimeIndicatorProps {
  isConnected: boolean;
  isReconnecting?: boolean;
  connectionError?: string | null;
  label?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  className?: string;
}

export const RealtimeIndicator: React.FC<RealtimeIndicatorProps> = ({
  isConnected,
  isReconnecting = false,
  connectionError,
  label = "Temps réel",
  showRetry = true,
  onRetry,
  className
}) => {
  const getStatus = () => {
    if (isReconnecting) return 'reconnecting';
    if (isConnected) return 'connected';
    return 'disconnected';
  };

  const status = getStatus();

  const statusConfig = {
    connected: {
      icon: <Radio className="h-3 w-3 animate-pulse" />,
      className: "bg-success/10 text-success border-success/20",
      tooltip: "Connecté en temps réel - Les mises à jour arrivent instantanément"
    },
    reconnecting: {
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      className: "bg-warning/10 text-warning border-warning/20",
      tooltip: "Reconnexion en cours..."
    },
    disconnected: {
      icon: <WifiOff className="h-3 w-3" />,
      className: "bg-muted/50 text-muted-foreground border-muted",
      tooltip: connectionError || "Déconnecté du temps réel - Rafraîchissez manuellement"
    }
  };

  const config = statusConfig[status];

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1.5", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn(
                "gap-1 text-xs cursor-help transition-all duration-300",
                config.className
              )}
            >
              {config.icon}
              <span className="hidden sm:inline">{label}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="text-xs">{config.tooltip}</p>
              {connectionError && status === 'disconnected' && (
                <p className="text-xs text-destructive">{connectionError}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Bouton retry si déconnecté */}
        {showRetry && status === 'disconnected' && onRetry && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onRetry}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Reconnecter</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
