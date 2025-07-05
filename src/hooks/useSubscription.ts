import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';

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
  status: string;
}

interface MusicQuota {
  can_generate: boolean;
  current_usage: number;
  quota_limit: number;
  plan_name: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
  const [musicQuota, setMusicQuota] = useState<MusicQuota | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setMusicQuota(null);
      setLoading(false);
      return;
    }

    try {
      // Get user subscription
      const { data: subData, error: subError } = await supabase
        .rpc('get_user_subscription', { user_uuid: user.id });

      if (subError) {
        console.error('Error fetching subscription:', subError);
        return;
      }

      if (subData && subData.length > 0) {
        const subInfo = subData[0];
        setSubscription({
          ...subInfo,
          features: subInfo.features as SubscriptionPlan['features']
        });
      }

      // Get music quota
      const { data: quotaData, error: quotaError } = await supabase
        .rpc('check_music_generation_quota', { user_uuid: user.id });

      if (quotaError) {
        console.error('Error fetching quota:', quotaError);
        return;
      }

      if (quotaData && quotaData.length > 0) {
        setMusicQuota(quotaData[0]);
      }
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementMusicUsage = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('increment_music_usage', { user_uuid: user.id });

      if (error) {
        console.error('Error incrementing music usage:', error);
        return false;
      }

      // Refresh quota after increment
      await fetchSubscription();
      return data;
    } catch (error) {
      console.error('Error in incrementMusicUsage:', error);
      return false;
    }
  };

  const hasFeatureAccess = (feature: keyof SubscriptionPlan['features']): boolean => {
    if (!subscription) return false;
    return subscription.features[feature] || false;
  };

  const canGenerateMusic = (): boolean => {
    if (!user) {
      // Free users can generate 3 songs without account
      return true;
    }
    return musicQuota?.can_generate || false;
  };

  const canSaveMusic = (): boolean => {
    return hasFeatureAccess('save_music');
  };

  const getUsageDisplay = (): string => {
    if (!musicQuota) return '';
    if (musicQuota.quota_limit === 0) return 'Plan gratuit';
    return `${musicQuota.current_usage}/${musicQuota.quota_limit} générations ce mois`;
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  return {
    subscription,
    musicQuota,
    loading,
    fetchSubscription,
    incrementMusicUsage,
    hasFeatureAccess,
    canGenerateMusic,
    canSaveMusic,
    getUsageDisplay,
  };
};