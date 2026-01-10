/**
 * Barre de statut globale du générateur
 * Intègre: NetworkStatus, SunoCredits, RealtimeIndicator, QuotaWarning
 * ✅ Corrigé: Types optionnels + Skeleton loader + Meilleure UX
 */

import React, { useState } from 'react';
import { NetworkStatusIndicator } from './NetworkStatusIndicator';
import { SunoCreditsDisplay } from './SunoCreditsDisplay';
import { RealtimeIndicator } from './RealtimeIndicator';
import { QuotaWarningBanner } from './QuotaWarningBanner';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { useSunoCredits } from '@/hooks/useSunoCredits';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GeneratorStatusBarProps {
  isConnected?: boolean;
  musicQuota?: {
    used?: number;
    limit?: number;
    can_generate?: boolean;
  } | null;
  className?: string;
}

export const GeneratorStatusBar: React.FC<GeneratorStatusBarProps> = ({
  isConnected = false,
  musicQuota,
  className
}) => {
  const { user } = useAuth();
  const { hasLowCredits, hasNoCredits, loading: creditsLoading, fetchCredits, isFromCache } = useSunoCredits();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  
  // ✅ Calcul sécurisé du % utilisé avec valeurs par défaut
  const usedQuota = musicQuota?.used ?? 0;
  const limitQuota = musicQuota?.limit ?? 0;
  const usagePercentage = limitQuota > 0 ? (usedQuota / limitQuota) * 100 : 0;

  const showQuotaWarning = !bannerDismissed && (usagePercentage >= 80 || hasLowCredits || hasNoCredits);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Ligne de statut principale - responsive */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 sm:p-2.5 bg-muted/30 rounded-lg">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Indicateur réseau (s'affiche seulement si problème) */}
          <NetworkStatusIndicator showLabel className="text-xs" />
          
          {/* Indicateur temps réel */}
          {user && (
            <RealtimeIndicator 
              isConnected={isConnected} 
              label="Sync" 
            />
          )}
          
          {/* Indicateur si données du cache */}
          {isFromCache && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-1.5 sm:px-2 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground"
              onClick={() => fetchCredits()}
              title="Données en cache, cliquez pour rafraîchir"
            >
              <RefreshCw className="h-3 w-3 mr-0.5 sm:mr-1" />
              <span className="hidden xs:inline">Cache</span>
            </Button>
          )}
        </div>
        
        {/* Crédits Suno - avec skeleton pendant chargement */}
        {user && (
          creditsLoading ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Skeleton className="h-5 w-16 sm:w-20" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          ) : (
            <SunoCreditsDisplay 
              showRefresh={true}
              autoRefresh={false}
            />
          )
        )}
      </div>
      
      {/* Bannière d'avertissement quota */}
      {showQuotaWarning && (
        <QuotaWarningBanner 
          usagePercentage={usagePercentage}
          hasNoCredits={hasNoCredits}
          hasLowCredits={hasLowCredits}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}
    </div>
  );
};
