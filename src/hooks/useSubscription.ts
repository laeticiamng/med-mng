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
        if (!subInfo) return;
        
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

      // Get music quota avec validation
      const { data: quotaData, error: quotaError } = await supabase
        .rpc('check_music_generation_quota', { user_uuid: user.id });

      if (quotaError) {
        const errorObj: UseSubscriptionError = {
          code: 'QUOTA_FETCH_ERROR',
          message: 'Erreur lors de la récupération du quota',
          details: quotaError
        };
        setError(errorObj);
        console.error('Error fetching quota:', quotaError);
        toast.error('Erreur lors de la récupération du quota');
        return;
      }

      if (quotaData && quotaData.length > 0) {
        const quotaInfo = quotaData[0];
        if (isValidMusicQuota(quotaInfo)) {
          setMusicQuota(quotaInfo);
        } else {
          const errorObj: UseSubscriptionError = {
            code: 'INVALID_QUOTA_DATA',
            message: 'Données de quota invalides',
            details: quotaInfo
          };
          setError(errorObj);
          console.error('Invalid quota data received:', quotaInfo);
          toast.error('Erreur de validation des données de quota');
        }
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

      // Refresh quota after increment de manière optimisée
      const { data: quotaData, error: quotaError } = await supabase
        .rpc('check_music_generation_quota', { user_uuid: user.id });

      if (!quotaError && quotaData && quotaData.length > 0) {
        const quotaInfo = quotaData[0];
        if (isValidMusicQuota(quotaInfo)) {
          setMusicQuota(quotaInfo);
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
    return musicQuota?.can_generate || false;
  }, [user, musicQuota]);

  const canSaveMusic = useCallback((): boolean => {
    return hasFeatureAccess('save_music');
  }, [hasFeatureAccess]);

  const getUsageDisplay = useCallback((): string => {
    if (!musicQuota) return '';
    if (musicQuota.quota_limit === 0) return 'Plan gratuit';
    return `${musicQuota.current_usage}/${musicQuota.quota_limit} générations ce mois`;
  }, [musicQuota]);

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
  };
};