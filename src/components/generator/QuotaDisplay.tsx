import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { NOM_OFFRE_PREMIUM, QUOTA_GENERATIONS_AUDIO_PREMIUM } from '@/config/offre';
import { ROUTE_PATHS } from '@/config/routes';
import { Crown, ExternalLink, RefreshCw } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

interface QuotaDisplayProps {
  user: { id: string } | null;
  musicQuota: {
    can_generate: boolean;
    current_usage: number;
    quota_limit: number;
    plan_name: string;
  } | null;
  /** Accès Premium effectif (abonnement ou administrateur). */
  aAccesPremium: boolean;
  /** Administrateur : accès Premium sans abonnement (même règle que le serveur). */
  estAdmin?: boolean;
  onRefresh?: () => Promise<void> | void;
}

/**
 * Compteur des générations audio du mois : X / 30 avec Med MNG Premium.
 * Le chiffre est compté sur la même table que le serveur (useSubscription →
 * generated_music_tracks) ; le contrôle qui fait foi reste mm-generate-music.
 */
export const QuotaDisplay: React.FC<QuotaDisplayProps> = ({
  user,
  musicQuota,
  aAccesPremium,
  estAdmin = false,
  onRefresh
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const utilise = musicQuota?.current_usage ?? 0;
  const limite = aAccesPremium ? (musicQuota?.quota_limit || QUOTA_GENERATIONS_AUDIO_PREMIUM) : 0;
  const usagePercentage = limite > 0 ? Math.min(100, (utilise / limite) * 100) : 0;
  const restantes = Math.max(0, limite - utilise);

  const progressColor = useMemo(() => {
    if (usagePercentage >= 90) return '[&>div]:bg-destructive';
    if (usagePercentage >= 70) return '[&>div]:bg-warning';
    return '';
  }, [usagePercentage]);

  if (!user) return null;

  if (!aAccesPremium) {
    return (
      <div className="mb-6 sm:mb-12">
        <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 shadow-lg shadow-primary/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 bg-primary/20">
                <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-foreground text-sm sm:text-base">Génération audio</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {QUOTA_GENERATIONS_AUDIO_PREMIUM} générations audio par mois avec {NOM_OFFRE_PREMIUM}.
                </p>
              </div>
            </div>
            <Link to={ROUTE_PATHS.medMngPricing}>
              <Button size="sm" className="h-8 text-xs gap-1 shrink-0">
                <ExternalLink className="h-3 w-3" />
                Voir l'offre
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isLow = usagePercentage >= 80;
  const isExhausted = restantes === 0;

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
                <span className="truncate"><TranslatedText text="Générations audio ce mois" /></span>
                {isExhausted && (
                  <Badge variant="destructive" className="text-xs shrink-0">
                    <TranslatedText text="Épuisé" />
                  </Badge>
                )}
              </h4>
              <span className={`font-bold text-base sm:text-lg ${
                isExhausted ? 'text-destructive' : isLow ? 'text-warning' : 'text-primary'
              }`}>
                {utilise}/{limite}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                {isExhausted ? 'Le compteur repart le 1er du mois prochain.' : `${restantes} restante${restantes > 1 ? 's' : ''} · ${musicQuota?.plan_name ?? NOM_OFFRE_PREMIUM}`}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Actualiser le compteur"
            className="text-muted-foreground hover:text-foreground min-h-[40px] min-w-[40px] shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <Progress value={usagePercentage} className={`h-2 ${progressColor}`} />
        {estAdmin && (
          <p className="mt-2 text-xs text-muted-foreground">
            Compte administrateur : accès Premium sans abonnement (même règle que le serveur).
          </p>
        )}
      </div>
    </div>
  );
};
