import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { toast } from 'sonner';
import {
  FORMULES_PREMIUM,
  NOM_OFFRE_PREMIUM,
  QUOTA_GENERATIONS_AUDIO_PREMIUM,
  type FormulePremium,
} from '@/config/offre';

/**
 * Abonnement MED MNG de l'utilisateur connecté.
 *
 * Source unique : RPC `get_user_subscription` (alimentée par le webhook
 * Stripe mm-stripe-webhook), recoupée avec la ligne de `user_subscriptions`
 * (statut + fin de période) pour ne jamais considérer comme actif un
 * abonnement résilié ou échu — y compris tant que la migration
 * 20260924120000_mm_abonnement_statut n'est pas appliquée.
 */

export type StatutAbonnement = 'active' | 'trialing' | 'canceled' | 'past_due' | 'unpaid' | 'inactive';

interface SubscriptionPlan {
  plan_id: string;
  plan_name: string;
  monthly_quota: number;
  features: {
    tableaux: boolean;
    quiz: boolean;
    bande_dessinee: boolean;
    save_music: boolean;
  };
  status: StatutAbonnement;
  /** Fin de la période en cours (renouvellement ou fin d'accès), si connue. */
  current_period_end?: string | null;
}

interface MusicQuota {
  can_generate: boolean;
  current_usage: number;
  quota_limit: number;
  plan_name: string;
}

interface UseSubscriptionError {
  code: string;
  message: string;
  details?: unknown;
}

const STATUTS_CONNUS: StatutAbonnement[] = ['active', 'trialing', 'canceled', 'past_due', 'unpaid', 'inactive'];

/** Valeur inconnue (« free », « cancelled », vide…) → 'inactive', jamais 'active'. */
export const normalizeStatus = (status: string | null | undefined): StatutAbonnement => {
  const s = (status || '').toLowerCase();
  if (s === 'cancelled') return 'canceled';
  return STATUTS_CONNUS.includes(s as StatutAbonnement) ? (s as StatutAbonnement) : 'inactive';
};

const FEATURES_PAR_DEFAUT: SubscriptionPlan['features'] = {
  tableaux: true,
  quiz: false,
  bande_dessinee: false,
  save_music: false,
};

const estStatutActif = (s: StatutAbonnement | undefined) => s === 'active' || s === 'trialing';

const periodeEnCours = (fin: string | null | undefined) =>
  !fin || new Date(fin).getTime() > Date.now();

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
  const [musicQuota, setMusicQuota] = useState<MusicQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<UseSubscriptionError | null>(null);

  const fetchingRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  /**
   * Charge l'abonnement. `force` ignore le cache par utilisateur : à utiliser
   * après un paiement (page de succès) ou une résiliation. Renvoie
   * l'abonnement lu (ou null), pour permettre un sondage.
   */
  const fetchSubscription = useCallback(async (force = false): Promise<SubscriptionPlan | null> => {
    if (!user) {
      setSubscription(null);
      setMusicQuota(null);
      setLoading(false);
      return null;
    }
    if (fetchingRef.current) return null;
    if (!force && userIdRef.current === user.id) return null;

    fetchingRef.current = true;
    userIdRef.current = user.id;
    setError(null);

    try {
      const [{ data: subData, error: subError }, { data: lignes }] = await Promise.all([
        supabase.rpc('get_user_subscription', { user_uuid: user.id }),
        supabase
          .from('user_subscriptions')
          .select('status, current_period_end')
          .eq('user_id', user.id)
          .order('current_period_end', { ascending: false, nullsFirst: false })
          .limit(5),
      ]);

      if (subError) {
        setError({ code: 'SUBSCRIPTION_FETCH_ERROR', message: "Erreur lors de la récupération de l'abonnement", details: subError });
        if (import.meta.env.DEV) console.error('Error fetching subscription:', subError);
        return null;
      }

      // Ligne réellement active (statut + période) dans user_subscriptions.
      const ligneActive = (lignes ?? []).find(
        (l) => estStatutActif(normalizeStatus(l.status)) && periodeEnCours(l.current_period_end)
      );

      const info = subData?.[0];
      let statut = normalizeStatus(info?.status);
      // Garde-fou : la RPC (avant migration) peut renvoyer « active » pour un
      // abonnement échu ; sans ligne réellement active, on rétrograde.
      if (estStatutActif(statut) && !ligneActive) statut = 'inactive';

      const resultat: SubscriptionPlan = {
        plan_id: info?.plan_id ?? 'free',
        plan_name: estStatutActif(statut) ? NOM_OFFRE_PREMIUM : (info?.plan_name ?? 'Gratuit'),
        monthly_quota: estStatutActif(statut) ? QUOTA_GENERATIONS_AUDIO_PREMIUM : 0,
        features: (info?.features as SubscriptionPlan['features']) ?? FEATURES_PAR_DEFAUT,
        status: statut,
        current_period_end: ligneActive?.current_period_end ?? null,
      };
      setSubscription(resultat);

      // Quota audio (indicatif : le contrôle qui fait foi est dans mm-generate-music).
      const { data: quotaData, error: quotaError } = await supabase
        .rpc('get_music_quota', { p_user_id: user.id });
      const limite = resultat.monthly_quota;
      if (!quotaError && quotaData && quotaData.length > 0) {
        const q = quotaData[0];
        const utilise = q.credits_used_this_period || 0;
        setMusicQuota({
          can_generate: estStatutActif(statut) && utilise < limite,
          current_usage: utilise,
          quota_limit: limite,
          plan_name: resultat.plan_name,
        });
      } else {
        setMusicQuota({
          can_generate: estStatutActif(statut),
          current_usage: 0,
          quota_limit: limite,
          plan_name: resultat.plan_name,
        });
      }

      return resultat;
    } catch (err) {
      setError({ code: 'UNKNOWN_ERROR', message: 'Erreur inconnue lors de la récupération des données', details: err });
      if (import.meta.env.DEV) console.error('Error in fetchSubscription:', err);
      return null;
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user]);

  /** Recharge sans tenir compte du cache (après paiement, résiliation…). */
  const refresh = useCallback(() => fetchSubscription(true), [fetchSubscription]);

  const incrementMusicUsage = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    try {
      const { data, error: rpcError } = await supabase.rpc('increment_music_usage', { user_uuid: user.id });
      if (rpcError) {
        if (import.meta.env.DEV) console.error('Error incrementing music usage:', rpcError);
        return false;
      }
      return Boolean(data);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error in incrementMusicUsage:', err);
      return false;
    }
  }, [user]);

  const isSubscriptionActive = useCallback((): boolean => estStatutActif(subscription?.status), [subscription]);

  const hasFeatureAccess = useCallback((feature: keyof SubscriptionPlan['features']): boolean => {
    if (isSubscriptionActive()) return true;
    if (!subscription) return feature === 'tableaux';
    return subscription.features[feature] || false;
  }, [subscription, isSubscriptionActive]);

  const canSaveMusic = useCallback((): boolean => isSubscriptionActive(), [isSubscriptionActive]);

  const getUsageDisplay = useCallback((): string => {
    if (!musicQuota) return '';
    if (musicQuota.quota_limit === 0) return 'Génération audio incluse dans MED MNG Premium';
    return `${musicQuota.current_usage}/${musicQuota.quota_limit} générations ce mois`;
  }, [musicQuota]);

  /** Le modèle est imposé côté serveur (mm-generate-music) ; valeur indicative. */
  const getSunoModel = useCallback((): "V4" | "V4_5" | "V4_5ALL" | "V4_5PLUS" | "V5" => 'V4_5ALL', []);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setMusicQuota(null);
      setError(null);
      userIdRef.current = null;
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const getQuotaPercentage = useCallback((): number => {
    if (!musicQuota || musicQuota.quota_limit === 0) return 0;
    return Math.round((musicQuota.current_usage / musicQuota.quota_limit) * 100);
  }, [musicQuota]);

  const isQuotaCritical = useCallback((): boolean => getQuotaPercentage() >= 90, [getQuotaPercentage]);
  const isQuotaLow = useCallback((): boolean => getQuotaPercentage() >= 75, [getQuotaPercentage]);

  const getRemainingGenerations = useCallback((): number => {
    if (!musicQuota) return 0;
    return Math.max(0, musicQuota.quota_limit - musicQuota.current_usage);
  }, [musicQuota]);

  const getStatusDisplay = useCallback((): string => {
    switch (subscription?.status) {
      case 'active': return 'Actif';
      case 'trialing': return 'Actif';
      case 'canceled': return 'Résilié';
      case 'past_due': return 'Paiement en attente';
      case 'unpaid': return 'Impayé';
      default: return 'Non abonné';
    }
  }, [subscription]);

  const getStatusColor = useCallback((): string => {
    switch (subscription?.status) {
      case 'active':
      case 'trialing': return 'text-success';
      case 'past_due': return 'text-warning';
      case 'unpaid': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  }, [subscription]);

  const getPlanTier = useCallback((): 'free' | 'premium' => (isSubscriptionActive() ? 'premium' : 'free'), [isSubscriptionActive]);

  const canUpgrade = useCallback((): boolean => !isSubscriptionActive(), [isSubscriptionActive]);

  const getQuotaResetDate = useCallback((): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }, []);

  const getDaysUntilReset = useCallback((): number => {
    const diff = getQuotaResetDate().getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [getQuotaResetDate]);

  const formatQuotaDisplay = useCallback(() => {
    if (!musicQuota) return { used: '0', total: '0', percentage: '0%', status: 'ok' as const };
    const percentage = getQuotaPercentage();
    const status: 'ok' | 'warning' | 'critical' = percentage >= 90 ? 'critical' : percentage >= 75 ? 'warning' : 'ok';
    return {
      used: musicQuota.current_usage.toString(),
      total: musicQuota.quota_limit.toString(),
      percentage: `${percentage}%`,
      status,
    };
  }, [musicQuota, getQuotaPercentage]);

  /**
   * Ouvre le paiement Stripe de MED MNG Premium (redirection dans l'onglet).
   * `renonciation` : case cochée « accès immédiat / perte du droit de
   * rétractation », exigée par mm-create-checkout.
   */
  const createCheckout = useCallback(async (formule: FormulePremium, renonciation: boolean): Promise<string | null> => {
    if (!user) {
      toast.error('Veuillez vous connecter pour vous abonner.');
      return null;
    }
    try {
      const { trackConversionEvent } = await import('@/lib/conversionTracking');
      trackConversionEvent('checkout_start', { plan: formule });

      const { data, error: fnError } = await supabase.functions.invoke('mm-create-checkout', {
        body: { plan: FORMULES_PREMIUM[formule].planCheckout, renonciation_retractation: renonciation },
      });

      if (fnError) {
        let message = 'Le paiement est momentanément indisponible. Réessayez plus tard.';
        const contexte = (fnError as { context?: Response }).context;
        if (contexte && typeof contexte.json === 'function') {
          try {
            const corps = await contexte.clone().json();
            if (typeof corps?.error === 'string') message = corps.error;
          } catch { /* corps non JSON */ }
        }
        toast.error(message);
        return null;
      }
      if (data?.url) {
        window.location.href = data.url;
        return data.url;
      }
      toast.error('Le paiement est momentanément indisponible. Réessayez plus tard.');
      return null;
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error creating checkout:', err);
      toast.error('Le paiement est momentanément indisponible. Réessayez plus tard.');
      return null;
    }
  }, [user]);

  /** Portail Stripe : gérer / résilier l'abonnement, factures. */
  const openCustomerPortal = useCallback(async (): Promise<string | null> => {
    if (!user) {
      toast.error('Veuillez vous connecter pour gérer votre abonnement.');
      return null;
    }
    try {
      const { data, error: fnError } = await supabase.functions.invoke('mm-customer-portal');
      if (fnError) {
        let message = "Le portail de gestion est momentanément indisponible. Réessayez plus tard.";
        const contexte = (fnError as { context?: Response }).context;
        if (contexte && typeof contexte.json === 'function') {
          try {
            const corps = await contexte.clone().json();
            if (typeof corps?.error === 'string') message = corps.error;
          } catch { /* corps non JSON */ }
        }
        toast.error(message);
        return null;
      }
      if (data?.url) {
        window.location.href = data.url;
        return data.url;
      }
      return null;
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error opening customer portal:', err);
      toast.error('Une erreur est survenue. Réessayez plus tard.');
      return null;
    }
  }, [user]);

  return {
    subscription,
    musicQuota,
    loading,
    error,
    fetchSubscription,
    refresh,
    incrementMusicUsage,
    hasFeatureAccess,
    canSaveMusic,
    getUsageDisplay,
    getSunoModel,
    getQuotaPercentage,
    isQuotaCritical,
    isQuotaLow,
    getRemainingGenerations,
    getStatusDisplay,
    getStatusColor,
    isSubscriptionActive,
    getQuotaResetDate,
    getDaysUntilReset,
    formatQuotaDisplay,
    canUpgrade,
    getPlanTier,
    createCheckout,
    openCustomerPortal,
  };
};
