/**
 * Bannière d'avertissement quota bas
 * S'affiche automatiquement quand le quota est faible
 */

import React from 'react';
import { AlertTriangle, Crown, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { TranslatedText } from '@/components/TranslatedText';

interface QuotaWarningBannerProps {
  remaining: number;
  total: number;
  onDismiss?: () => void;
  showUpgradeLink?: boolean;
}

export const QuotaWarningBanner: React.FC<QuotaWarningBannerProps> = ({
  remaining,
  total,
  onDismiss,
  showUpgradeLink = true
}) => {
  // Ne pas afficher si quota > 20%
  const percentage = (remaining / total) * 100;
  if (percentage > 20) return null;

  const isVeryLow = remaining <= 1;
  const isCritical = remaining === 0;

  return (
    <div 
      className={`relative p-3 rounded-lg border flex items-center gap-3 animate-fade-in ${
        isCritical 
          ? 'bg-destructive/10 border-destructive/30' 
          : isVeryLow
            ? 'bg-warning/10 border-warning/30'
            : 'bg-accent/10 border-accent/30'
      }`}
    >
      <AlertTriangle className={`h-5 w-5 shrink-0 ${
        isCritical ? 'text-destructive' : isVeryLow ? 'text-warning' : 'text-accent'
      }`} />
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${
          isCritical ? 'text-destructive' : isVeryLow ? 'text-warning' : 'text-accent-foreground'
        }`}>
          {isCritical ? (
            <TranslatedText text="Quota épuisé ! Vous ne pouvez plus générer de musique." />
          ) : isVeryLow ? (
            <TranslatedText text={`Attention : plus que ${remaining} génération${remaining > 1 ? 's' : ''} !`} />
          ) : (
            <TranslatedText text={`Quota faible : ${remaining}/${total} générations restantes`} />
          )}
        </p>
      </div>

      {showUpgradeLink && (
        <Link to={ROUTE_PATHS.medMngPricing}>
          <Button 
            size="sm" 
            variant={isCritical ? 'destructive' : 'default'}
            className="gap-1.5 shrink-0"
          >
            <Crown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline"><TranslatedText text="Améliorer" /></span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      )}

      {onDismiss && !isCritical && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
