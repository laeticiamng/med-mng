import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { toast } from 'sonner';

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
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
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
  details?: any;
}

// Type guards pour validation
const isValidSubscriptionPlan = (data: any): data is SubscriptionPlan => {
  return data && 
         typeof data.plan_id === 'string' &&
         typeof data.plan_name === 'string' &&
         typeof data.monthly_quota === 'number' &&
         data.features &&
         typeof data.features.tableaux === 'boolean' &&
         typeof data.features.quiz === 'boolean' &&
         typeof data.features.bande_dessinee === 'boolean' &&
         typeof data.features.save_music === 'boolean' &&
         ['active', 'canceled', 'past_due', 'unpaid'].includes(data.status);
};

const isValidMusicQuota = (data: any): data is MusicQuota => {
  return data &&
         typeof data.can_generate === 'boolean' &&
         typeof data.current_usage === 'number' &&
         typeof data.quota_limit === 'number' &&
         typeof data.plan_name === 'string';
};

// Helper pour normaliser le status
const normalizeStatus = (status: string): SubscriptionPlan['status'] => {
  const validStatuses: SubscriptionPlan['status'][] = ['active', 'canceled', 'past_due', 'unpaid'];
  return validStatuses.includes(status as SubscriptionPlan['status']) 
    ? status as SubscriptionPlan['status']
    : 'active';
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
  const [musicQuota, setMusicQuota] = useState<MusicQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<UseSubscriptionError | null>(null);
  
  // Use ref pour éviter les re-renders inutiles
  const fetchingRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!user || fetchingRef.current || userIdRef.current === user.id) {
      if (!user) {
        setSubscription(null);
        setMusicQuota(null);
        setLoading(false);
      }
      return;
    }

    fetchingRef.current = true;
    userIdRef.current = user.id;
    setError(null);

    try {
      // Get user subscription avec retry logic
      const { data: subData, error: subError } = await supabase
        .rpc('get_user_subscription', { user_uuid: user.id });

      if (subError) {
        const errorObj: UseSubscriptionError = {
          code: 'SUBSCRIPTION_FETCH_ERROR',
          message: 'Erreur lors de la récupération de l\'abonnement',
          details: subError
        };
        setError(errorObj);
        console.error('Error fetching subscription:', subError);
        toast.error('Erreur lors de la récupération de l\'abonnement');
        return;
      }

      if (subData && subData.length > 0) {
        const subInfo = subData[0];
        const normalizedSubscription: SubscriptionPlan = {
          plan_id: subInfo.plan_id,
          plan_name: subInfo.plan_name,
          monthly_quota: subInfo.monthly_quota,
          features: subInfo.features as SubscriptionPlan['features'],
          status: normalizeStatus(subInfo.status)
        };
        
        if (isValidSubscriptionPlan(normalizedSubscription)) {
          setSubscription(normalizedSubscription);
        } else {
          const errorObj: UseSubscriptionError = {
            code: 'INVALID_SUBSCRIPTION_DATA',
            message: 'Données d\'abonnement invalides',
            details: subInfo
          };
          setError(errorObj);
          console.error('Invalid subscription data received:', subInfo);
          toast.error('Erreur de validation des données d\'abonnement');
        }
      }

      // Get music quota depuis la nouvelle table user_quotas (musique uniquement)
      const { data: quotaData, error: quotaError } = await supabase
        .rpc('get_music_quota', { p_user_id: user.id });

      if (quotaError) {
        // Log mais ne pas bloquer - utiliser quota par défaut basé sur le plan
        console.warn('Quota check failed, using plan defaults:', quotaError);
        
        // Créer un quota par défaut basé sur l'abonnement
        const defaultQuota: MusicQuota = {
          can_generate: true, // Permettre la génération par défaut
          current_usage: 0,
          quota_limit: subscription?.monthly_quota || 3, // Utiliser le quota du plan
          plan_name: subscription?.plan_name || 'Gratuit'
        };
        setMusicQuota(defaultQuota);
      } else if (quotaData && quotaData.length > 0) {
        const quotaInfo = quotaData[0];
        
        // Adapter le format de get_user_quota au format MusicQuota
        const adaptedQuota: MusicQuota = {
          can_generate: quotaInfo.can_generate || false,
          current_usage: quotaInfo.credits_used_this_period || 0,
          quota_limit: quotaInfo.total_credits || 0,
          plan_name: subscription?.plan_name || 'Standard'
        };
        
        console.log('📊 Quota synchronized:', adaptedQuota);
        
        if (isValidMusicQuota(adaptedQuota)) {
          setMusicQuota(adaptedQuota);
        } else {
          console.warn('Invalid adapted quota data, using defaults:', adaptedQuota);
          // Utiliser quota par défaut si données invalides
          const defaultQuota: MusicQuota = {
            can_generate: true,
            current_usage: 0,
            quota_limit: subscription?.monthly_quota || 3,
            plan_name: subscription?.plan_name || 'Gratuit'
          };
          setMusicQuota(defaultQuota);
        }
      } else {
        // Aucune donnée retournée - utiliser quota par défaut
        const defaultQuota: MusicQuota = {
          can_generate: true,
          current_usage: 0,
          quota_limit: subscription?.monthly_quota || 3,
          plan_name: subscription?.plan_name || 'Gratuit'
        };
        setMusicQuota(defaultQuota);
      }
    } catch (error) {
      const errorObj: UseSubscriptionError = {
        code: 'UNKNOWN_ERROR',
        message: 'Erreur inconnue lors de la récupération des données',
        details: error
      };
      setError(errorObj);
      console.error('Error in fetchSubscription:', error);
      toast.error('Erreur inattendue lors de la récupération des données');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user]);

  const incrementMusicUsage = useCallback(async (): Promise<boolean> => {
    if (!user) {
      console.warn('Tentative d\'incrément de quota sans utilisateur connecté');
      return false;
    }

    try {
      const { data, error } = await supabase
        .rpc('increment_music_usage', { user_uuid: user.id });

      if (error) {
        console.error('Error incrementing music usage:', error);
        toast.error('Erreur lors de la mise à jour du quota');
        return false;
      }

      // Refresh quota après incrémentation (musique uniquement)
      const { data: quotaData, error: quotaError } = await supabase
        .rpc('get_music_quota', { p_user_id: user.id });

      if (!quotaError && quotaData && quotaData.length > 0) {
        const quotaInfo = quotaData[0];
        
        const adaptedQuota: MusicQuota = {
          can_generate: quotaInfo.can_generate || false,
          current_usage: quotaInfo.credits_used_this_period || 0,
          quota_limit: quotaInfo.total_credits || 0,
          plan_name: subscription?.plan_name || 'Standard'
        };
        
        if (isValidMusicQuota(adaptedQuota)) {
          setMusicQuota(adaptedQuota);
        }
      }

      return data;
    } catch (error) {
      console.error('Error in incrementMusicUsage:', error);
      toast.error('Erreur lors de l\'incrément du quota');
      return false;
    }
  }, [user]);

  const hasFeatureAccess = useCallback((feature: keyof SubscriptionPlan['features']): boolean => {
    if (!subscription) return false;
    return subscription.features[feature] || false;
  }, [subscription]);

  const canGenerateMusic = useCallback((): boolean => {
    if (!user) {
      // Free users can generate 3 songs without account
      return true;
    }
    // Si pas de quota chargé, permettre la génération par défaut
    // (le quota sera créé au premier usage via la RPC get_music_quota)
    if (musicQuota === null) {
      console.log('🎵 canGenerateMusic: Pas de quota chargé, autorisation par défaut');
      return true;
    }
    return musicQuota.can_generate;
  }, [user, musicQuota]);

  const canSaveMusic = useCallback((): boolean => {
    return hasFeatureAccess('save_music');
  }, [hasFeatureAccess]);

  const getUsageDisplay = useCallback((): string => {
    if (!musicQuota) return '';
    if (musicQuota.quota_limit === 0) return 'Plan gratuit';
    return `${musicQuota.current_usage}/${musicQuota.quota_limit} générations ce mois`;
  }, [musicQuota]);

  const getSunoModel = useCallback((): "V3_5" | "V4" | "V4_5" => {
    if (!subscription) return "V4_5"; // Plan gratuit = modèle premium pour découverte
    
    switch (subscription.plan_name) {
      case 'Plan Standard':
      case 'Basic':
      case 'basic':
        return "V3_5"; // 19€ = V3.5
      case 'Plan Pro':
      case 'Pro':
      case 'pro':
        return "V4"; // 29€ = V4
      case 'Plan Premium':
      case 'Premium':
      case 'premium':
        return "V4_5"; // 39€ = V4.5
      default:
        return "V3_5";
    }
  }, [subscription]);

  // Reset state when user changes
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

  // Get quota usage percentage
  const getQuotaPercentage = useCallback((): number => {
    if (!musicQuota || musicQuota.quota_limit === 0) return 0;
    return Math.round((musicQuota.current_usage / musicQuota.quota_limit) * 100);
  }, [musicQuota]);

  // Check if quota is critical (> 90%)
  const isQuotaCritical = useCallback((): boolean => {
    return getQuotaPercentage() >= 90;
  }, [getQuotaPercentage]);

  // Check if quota is low (> 75%)
  const isQuotaLow = useCallback((): boolean => {
    return getQuotaPercentage() >= 75;
  }, [getQuotaPercentage]);

  // Get remaining generations
  const getRemainingGenerations = useCallback((): number => {
    if (!musicQuota) return 0;
    return Math.max(0, musicQuota.quota_limit - musicQuota.current_usage);
  }, [musicQuota]);

  // Get subscription status display
  const getStatusDisplay = useCallback((): string => {
    if (!subscription) return 'Non abonné';

    switch (subscription.status) {
      case 'active': return 'Actif';
      case 'canceled': return 'Annulé';
      case 'past_due': return 'Paiement en retard';
      case 'unpaid': return 'Impayé';
      default: return 'Inconnu';
    }
  }, [subscription]);

  // Get status color class
  const getStatusColor = useCallback((): string => {
    if (!subscription) return 'text-gray-500';

    switch (subscription.status) {
      case 'active': return 'text-green-500';
      case 'canceled': return 'text-yellow-500';
      case 'past_due': return 'text-orange-500';
      case 'unpaid': return 'text-red-500';
      default: return 'text-gray-500';
    }
  }, [subscription]);

  // Check if subscription is active
  const isSubscriptionActive = useCallback((): boolean => {
    return subscription?.status === 'active';
  }, [subscription]);

  // Get available upgrade options
  const getUpgradeOptions = useCallback((): {
    planId: string;
    planName: string;
    monthlyQuota: number;
    price: number;
  }[] => {
    const allPlans = [
      { planId: 'basic', planName: 'Plan Standard', monthlyQuota: 10, price: 19 },
      { planId: 'pro', planName: 'Plan Pro', monthlyQuota: 30, price: 29 },
      { planId: 'premium', planName: 'Plan Premium', monthlyQuota: 100, price: 39 }
    ];

    const currentQuota = subscription?.monthly_quota || 0;
    return allPlans.filter(p => p.monthlyQuota > currentQuota);
  }, [subscription]);

  // Get plan features comparison
  const getPlanFeatures = useCallback((planName: string): {
    feature: string;
    included: boolean;
  }[] => {
    const features = [
      { feature: 'Tableaux de révision', basic: true, pro: true, premium: true },
      { feature: 'Quiz interactifs', basic: true, pro: true, premium: true },
      { feature: 'Bande dessinée EDN', basic: false, pro: true, premium: true },
      { feature: 'Sauvegarde musique', basic: false, pro: true, premium: true },
      { feature: 'Support prioritaire', basic: false, pro: false, premium: true },
      { feature: 'Accès anticipé', basic: false, pro: false, premium: true }
    ];

    const planKey = planName.toLowerCase().includes('standard') ? 'basic'
      : planName.toLowerCase().includes('pro') ? 'pro'
      : 'premium';

    return features.map(f => ({
      feature: f.feature,
      included: f[planKey as keyof typeof f] as boolean
    }));
  }, []);

  // Estimate when quota will run out
  const estimateQuotaExhaustion = useCallback((): string | null => {
    if (!musicQuota || musicQuota.quota_limit === 0) return null;

    const remaining = getRemainingGenerations();
    if (remaining <= 0) return 'Quota épuisé';

    // Estimate based on current usage rate (assume 1 month period)
    const daysRemaining = Math.round((remaining / Math.max(1, musicQuota.current_usage)) * 30);

    if (daysRemaining > 30) return 'Plus d\'un mois';
    if (daysRemaining > 7) return `Environ ${Math.round(daysRemaining / 7)} semaines`;
    if (daysRemaining > 1) return `Environ ${daysRemaining} jours`;
    return 'Moins d\'un jour';
  }, [musicQuota, getRemainingGenerations]);

  // Get quota reset date
  const getQuotaResetDate = useCallback((): Date => {
    // Quota resets on 1st of each month
    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return resetDate;
  }, []);

  // Get days until quota reset
  const getDaysUntilReset = useCallback((): number => {
    const resetDate = getQuotaResetDate();
    const now = new Date();
    const diff = resetDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [getQuotaResetDate]);

  // Format quota for display
  const formatQuotaDisplay = useCallback((): {
    used: string;
    total: string;
    percentage: string;
    status: 'ok' | 'warning' | 'critical';
  } => {
    if (!musicQuota) {
      return { used: '0', total: '0', percentage: '0%', status: 'ok' };
    }

    const percentage = getQuotaPercentage();
    let status: 'ok' | 'warning' | 'critical' = 'ok';
    if (percentage >= 90) status = 'critical';
    else if (percentage >= 75) status = 'warning';

    return {
      used: musicQuota.current_usage.toString(),
      total: musicQuota.quota_limit.toString(),
      percentage: `${percentage}%`,
      status
    };
  }, [musicQuota, getQuotaPercentage]);

  // Check if can upgrade
  const canUpgrade = useCallback((): boolean => {
    return getUpgradeOptions().length > 0;
  }, [getUpgradeOptions]);

  // Get current plan tier
  const getPlanTier = useCallback((): 'free' | 'basic' | 'pro' | 'premium' => {
    if (!subscription) return 'free';

    const planName = subscription.plan_name.toLowerCase();
    if (planName.includes('premium')) return 'premium';
    if (planName.includes('pro')) return 'pro';
    if (planName.includes('standard') || planName.includes('basic')) return 'basic';
    return 'free';
  }, [subscription]);

  return {
    subscription,
    musicQuota,
    loading,
    error,
    fetchSubscription,
    incrementMusicUsage,
    hasFeatureAccess,
    canGenerateMusic,
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
    getUpgradeOptions,
    getPlanFeatures,
    estimateQuotaExhaustion,
    getQuotaResetDate,
    getDaysUntilReset,
    formatQuotaDisplay,
    canUpgrade,
    getPlanTier
  };
};