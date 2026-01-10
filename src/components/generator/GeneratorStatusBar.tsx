/**
 * Barre de statut globale du générateur
 * Intègre: NetworkStatus, SunoCredits, RealtimeIndicator, QuotaWarning
 */

import React, { useState } from 'react';
import { NetworkStatusIndicator } from './NetworkStatusIndicator';
import { SunoCreditsDisplay } from './SunoCreditsDisplay';
import { RealtimeIndicator } from './RealtimeIndicator';
import { QuotaWarningBanner } from './QuotaWarningBanner';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { useSunoCredits } from '@/hooks/useSunoCredits';
import { cn } from '@/lib/utils';

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
  const { hasLowCredits, hasNoCredits } = useSunoCredits();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  
  // Calculer le % utilisé
  const usagePercentage = (musicQuota && musicQuota.used != null && musicQuota.limit)
    ? (musicQuota.used / musicQuota.limit) * 100 
    : 0;

  
  const showQuotaWarning = !bannerDismissed && (usagePercentage >= 80 || hasLowCredits || hasNoCredits);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Ligne de statut principale */}
      <div className="flex items-center justify-between gap-2 p-2 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          {/* Indicateur réseau (s'affiche seulement si problème) */}
          <NetworkStatusIndicator showLabel className="text-xs" />
          
          {/* Indicateur temps réel */}
          {user && (
            <RealtimeIndicator 
              isConnected={isConnected} 
              label="Sync" 
            />
          )}
        </div>
        
        {/* Crédits Suno - utilise le composant existant */}
        {user && (
          <SunoCreditsDisplay 
            showRefresh={true}
            autoRefresh={false}
          />
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
