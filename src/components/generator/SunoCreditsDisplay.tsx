import React from 'react';
import { useSunoCredits } from '@/hooks/useSunoCredits';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

interface SunoCreditsDisplayProps {
  className?: string;
  showRefresh?: boolean;
  autoRefresh?: boolean;
  showProgress?: boolean;
}

export const SunoCreditsDisplay: React.FC<SunoCreditsDisplayProps> = ({
  className,
  showRefresh = true,
  autoRefresh = false,
  showProgress = false
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
    plan,
    usagePercentage,
    used,
    total,
    lastUpdatedText
  } = useSunoCredits(autoRefresh);

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
      <div className={cn('flex items-center gap-2', className)} role="status" aria-live="polite">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={getBadgeVariant()} 
              className={cn(getBadgeClassName(), 'gap-1.5 cursor-help')}
              aria-label={`${displayCredits} crédits Suno restants`}
            >
              {hasLowCredits && <AlertTriangle className="h-3 w-3" aria-hidden="true" />}
              {!hasLowCredits && <Coins className="h-3 w-3" aria-hidden="true" />}
              <span className="font-medium">
                {loading ? '...' : displayCredits}
              </span>
              <span className="text-xs opacity-70">crédits</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm space-y-1">
              <p className="font-medium">Crédits Suno API</p>
              {!creditsUnknown && (
                <>
                  <p className="text-muted-foreground">
                    Plan: {plan} • {credits} crédits restants
                  </p>
                  {showProgress && total > 0 && (
                    <div className="mt-2">
                      <Progress value={usagePercentage} className="h-1.5" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {used} / {total} utilisés ({usagePercentage}%)
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground/70">
                    {lastUpdatedText}
                  </p>
                </>
              )}
              {error && (
                <p className="text-destructive text-xs mt-1">{error}</p>
              )}
              {hasNoCredits && (
                <p className="text-destructive text-xs mt-1">
                  Rechargez vos crédits pour continuer à générer
                </p>
              )}
              {hasLowCredits && !hasNoCredits && (
                <p className="text-warning text-xs mt-1">
                  Crédits bientôt épuisés, pensez à recharger
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
            aria-label="Rafraîchir les crédits Suno"
          >
            <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} aria-hidden="true" />
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
};
