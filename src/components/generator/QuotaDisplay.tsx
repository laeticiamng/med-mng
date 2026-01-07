import React, { useEffect, useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Zap, Crown, TrendingUp, ExternalLink, Music } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { useSunoCredits } from '@/hooks/useSunoCredits';

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
      <div className="mb-12">
        <div className="bg-gradient-to-r from-success/10 to-success/5 p-6 rounded-2xl border border-success/20 shadow-lg shadow-success/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center">
                <Zap className="h-5 w-5 text-success" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">
                  <TranslatedText text="Essai gratuit" />
                </h4>
                <span className="text-success font-bold text-lg">
                  {remainingFree}/{maxFreeGenerations} <TranslatedText text="générations restantes" />
                </span>
              </div>
            </div>
          </div>
          <Progress value={usagePercentage} className={`h-2 ${progressColor}`} />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              <TranslatedText text="Connectez-vous pour sauvegarder vos créations" />
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TrendingUp className="h-4 w-4 text-success cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Créez un compte pour des quotas illimités</p>
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
      <div className="mb-12">
        <div className={`p-6 rounded-2xl border shadow-lg ${
          isExhausted 
            ? 'bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/20 shadow-destructive/10'
            : isLow
              ? 'bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20 shadow-warning/10'
              : 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-primary/10'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isExhausted ? 'bg-destructive/20' : isLow ? 'bg-warning/20' : 'bg-primary/20'
              }`}>
                <Crown className={`h-5 w-5 ${
                  isExhausted ? 'text-destructive' : isLow ? 'text-warning' : 'text-primary'
                }`} />
              </div>
              <div>
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <TranslatedText text="Quota mensuel" />
                  {isExhausted && (
                    <Badge variant="destructive" className="text-xs animate-pulse">
                      <TranslatedText text="Épuisé" />
                    </Badge>
                  )}
                </h4>
                <span className={`font-bold text-lg ${
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
              className="text-muted-foreground hover:text-foreground"
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
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
              <div className="flex items-center gap-2">
                <Music className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Crédits Suno API:
                </span>
                <Badge 
                  variant={hasLowCredits ? "destructive" : "secondary"} 
                  className="text-xs"
                >
                  {displayCredits}
                </Badge>
              </div>
              {hasLowCredits && (
                <span className="text-xs text-warning">⚠️ Crédits faibles</span>
              )}
            </div>
          )}
          
          {isExhausted && (
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-destructive font-medium">
                <TranslatedText text="Améliorez votre abonnement pour continuer" />
              </p>
              <Link to={ROUTE_PATHS.medMngPricing}>
                <Button size="sm" variant="destructive" className="h-6 text-xs gap-1">
                  <ExternalLink className="h-3 w-3" />
                  <TranslatedText text="Voir les offres" />
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