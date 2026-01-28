import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useSunoCredits } from '@/hooks/useSunoCredits';
import { Crown, ExternalLink, Music, RefreshCw, TrendingUp, Zap } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

interface QuotaDisplayProps {
  user: any;
  remainingFree: number;
  maxFreeGenerations: number;
  musicQuota: any;
  getUsageDisplay: () => string;
  onRefresh?: () => void;
}

export const QuotaDisplay: React.FC<QuotaDisplayProps> = ({
  user,
  remainingFree,
  maxFreeGenerations,
  musicQuota,
  getUsageDisplay,
  onRefresh
}) => {
  const { logActivity } = useActivityTracking();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Crédits Suno réels
  const { credits: sunoCredits, loading: sunoLoading, fetchCredits, hasLowCredits, creditsUnknown, displayCredits } = useSunoCredits();

  // Track quota view
  useEffect(() => {
    if (user || remainingFree > 0) {
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { type: 'quota_view', remainingFree, hasUser: !!user }
      });
    }
  }, [logActivity, user, remainingFree]);

  // Charger les crédits Suno au montage si utilisateur connecté
  useEffect(() => {
    if (user && creditsUnknown) {
      fetchCredits();
    }
  }, [user, creditsUnknown, fetchCredits]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Rafraîchir les crédits Suno en parallèle
      await Promise.all([
        fetchCredits(),
        onRefresh?.()
      ]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Calculer le pourcentage utilisé
  const getUsagePercentage = () => {
    if (!user && remainingFree >= 0) {
      return ((maxFreeGenerations - remainingFree) / maxFreeGenerations) * 100;
    }
    if (musicQuota) {
      return (musicQuota.used / musicQuota.limit) * 100;
    }
    return 0;
  };

  const usagePercentage = getUsagePercentage();
  
  // Couleur dynamique de la barre de progression
  const progressColor = useMemo(() => {
    if (usagePercentage >= 90) return '[&>div]:bg-destructive';
    if (usagePercentage >= 70) return '[&>div]:bg-warning';
    return '';
  }, [usagePercentage]);

  if (!user && remainingFree > 0) {
    return (
      <div className="mb-6 sm:mb-12">
        <div className="bg-gradient-to-r from-success/10 to-success/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-success/20 shadow-lg shadow-success/10">
          <div className="flex items-center justify-between mb-3 gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-success/20 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-foreground text-sm sm:text-base truncate">
                  <TranslatedText text="Essai gratuit" />
                </h4>
                <span className="text-success font-bold text-base sm:text-lg">
                  {remainingFree}/{maxFreeGenerations}
                </span>
              </div>
            </div>
          </div>
          <Progress value={usagePercentage} className={`h-2 ${progressColor}`} />
          <div className="flex items-center justify-between mt-2 gap-2">
            <p className="text-xs text-muted-foreground truncate">
              <TranslatedText text="Connectez-vous pour sauvegarder" />
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TrendingUp className="h-4 w-4 text-success cursor-help shrink-0" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Créez un compte pour plus</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    );
  }

  if (user && musicQuota) {
    const isLow = usagePercentage >= 80;
    const isExhausted = !musicQuota.can_generate;
    
    return (
      <div className="mb-6 sm:mb-12">
        <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border shadow-lg ${
          isExhausted 
            ? 'bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/20 shadow-destructive/10'
            : isLow
              ? 'bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20 shadow-warning/10'
              : 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-primary/10'
        }`}>
          <div className="flex items-center justify-between mb-3 gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
                isExhausted ? 'bg-destructive/20' : isLow ? 'bg-warning/20' : 'bg-primary/20'
              }`}>
                <Crown className={`h-4 w-4 sm:h-5 sm:w-5 ${
                  isExhausted ? 'text-destructive' : isLow ? 'text-warning' : 'text-primary'
                }`} />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
                  <span className="truncate"><TranslatedText text="Quota" /></span>
                  {isExhausted && (
                    <Badge variant="destructive" className="text-xs animate-pulse shrink-0">
                      <TranslatedText text="Épuisé" />
                    </Badge>
                  )}
                </h4>
                <span className={`font-bold text-base sm:text-lg ${
                  isExhausted ? 'text-destructive' : isLow ? 'text-warning' : 'text-primary'
                }`}>
                  {getUsageDisplay()}
                </span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || sunoLoading}
              className="text-muted-foreground hover:text-foreground min-h-[40px] min-w-[40px] shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing || sunoLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <Progress 
            value={usagePercentage} 
            className={`h-2 ${progressColor}`} 
          />
          
          {/* Crédits Suno réels */}
          {!creditsUnknown && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Music className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Crédits Suno:
                </span>
                <Badge 
                  variant={hasLowCredits ? "destructive" : "secondary"} 
                  className="text-xs"
                >
                  {displayCredits}
                </Badge>
              </div>
              {hasLowCredits && (
                <span className="text-xs text-warning shrink-0">⚠️</span>
              )}
            </div>
          )}
          
          {isExhausted && (
            <div className="flex items-center justify-between mt-2 gap-2">
              <p className="text-xs text-destructive font-medium truncate">
                <TranslatedText text="Améliorez votre abonnement" />
              </p>
              <Link to={ROUTE_PATHS.medMngPricing}>
                <Button size="sm" variant="destructive" className="h-7 text-xs gap-1 shrink-0">
                  <ExternalLink className="h-3 w-3" />
                  <span className="hidden sm:inline"><TranslatedText text="Offres" /></span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};