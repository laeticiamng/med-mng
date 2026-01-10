/**
 * Bannière d'avertissement quota bas
 * S'affiche automatiquement quand le quota est faible
 */

/**
 * Bannière d'avertissement quota/crédits
 */

import React from 'react';
import { AlertTriangle, ExternalLink, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { cn } from '@/lib/utils';

interface QuotaWarningBannerProps {
  usagePercentage: number;
  hasNoCredits: boolean;
  hasLowCredits: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const QuotaWarningBanner: React.FC<QuotaWarningBannerProps> = ({
  usagePercentage,
  hasNoCredits,
  hasLowCredits,
  onDismiss,
  className
}) => {
  // Déterminer le niveau d'alerte
  const isCritical = hasNoCredits || usagePercentage >= 95;
  const isWarning = hasLowCredits || usagePercentage >= 80;
  
  if (!isWarning && !isCritical) return null;

  return (
    <Alert 
      variant={isCritical ? "destructive" : "default"}
      className={cn(
        "relative",
        isCritical 
          ? "bg-destructive/10 border-destructive/30" 
          : "bg-warning/10 border-warning/30",
        className
      )}
    >
      <AlertTriangle className={cn(
        "h-4 w-4",
        isCritical ? "text-destructive" : "text-warning"
      )} />
      
      <AlertTitle className={cn(
        "text-sm font-semibold",
        isCritical ? "text-destructive" : "text-warning"
      )}>
        {isCritical ? "Quota épuisé" : "Quota presque atteint"}
      </AlertTitle>
      
      <AlertDescription className="text-xs mt-1">
        {hasNoCredits && "Vous n'avez plus de crédits Suno. Rechargez pour continuer à générer."}
        {hasLowCredits && !hasNoCredits && "Vos crédits Suno sont faibles. Pensez à recharger."}
        {!hasNoCredits && !hasLowCredits && usagePercentage >= 95 && "Votre quota mensuel est presque épuisé."}
        {!hasNoCredits && !hasLowCredits && usagePercentage >= 80 && usagePercentage < 95 && "Vous avez utilisé plus de 80% de votre quota."}
        
        <Link to={ROUTE_PATHS.medMngPricing} className="ml-2">
          <Button variant="link" size="sm" className="h-auto p-0 text-xs">
            Voir les offres <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </AlertDescription>
      
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6"
          onClick={onDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Alert>
  );
};
