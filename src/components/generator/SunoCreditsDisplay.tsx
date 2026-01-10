import React, { useEffect } from 'react';
import { useSunoCredits } from '@/hooks/useSunoCredits';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SunoCreditsDisplayProps {
  className?: string;
  showRefresh?: boolean;
  autoRefresh?: boolean;
}

export const SunoCreditsDisplay: React.FC<SunoCreditsDisplayProps> = ({
  className,
  showRefresh = true,
  autoRefresh = false
}) => {
  const {
    credits,
    loading,
    error,
    fetchCredits,
    hasLowCredits,
    hasNoCredits,
    creditsUnknown,
    displayCredits,
    plan
  } = useSunoCredits(autoRefresh);

  // ✅ Supprimé: Le hook gère maintenant l'appel au montage automatiquement

  const getBadgeVariant = () => {
    if (hasNoCredits) return 'destructive';
    if (hasLowCredits) return 'outline';
    return 'secondary';
  };

  const getBadgeClassName = () => {
    if (hasNoCredits) return 'bg-destructive/10 text-destructive border-destructive/20';
    if (hasLowCredits) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-primary/10 text-primary border-primary/20';
  };

  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-2', className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={getBadgeVariant()} 
              className={cn(getBadgeClassName(), 'gap-1.5 cursor-help')}
            >
              {hasLowCredits && <AlertTriangle className="h-3 w-3" />}
              {!hasLowCredits && <Coins className="h-3 w-3" />}
              <span className="font-medium">
                {loading ? '...' : displayCredits}
              </span>
              <span className="text-xs opacity-70">crédits</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-medium">Crédits Suno API</p>
              {!creditsUnknown && (
                <p className="text-muted-foreground">
                  Plan: {plan} • {credits} crédits restants
                </p>
              )}
              {error && (
                <p className="text-destructive text-xs mt-1">{error}</p>
              )}
              {hasNoCredits && (
                <p className="text-destructive text-xs mt-1">
                  Rechargez vos crédits pour continuer à générer
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {showRefresh && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => fetchCredits()}
            disabled={loading}
            title="Rafraîchir les crédits"
            aria-label="Rafraîchir les crédits Suno"
          >
            <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} aria-hidden="true" />
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
};
