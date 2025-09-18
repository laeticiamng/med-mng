import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import {
  ANALYTICS_CONSENT_VERSION,
  setAnalyticsContext,
} from '@/services/CanonicalAnalyticsTracker';

interface AnalyticsConsentState {
  optIn: boolean;
  retentionDays: number;
  loading: boolean;
  updateConsent: (optIn: boolean, retentionDays?: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const DEFAULT_RETENTION_DAYS = 180;

export const useAnalyticsConsent = (): AnalyticsConsentState => {
  const { user } = useAuth();
  const [optIn, setOptIn] = useState(false);
  const [retentionDays, setRetentionDays] = useState(DEFAULT_RETENTION_DAYS);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    if (!user) {
      setOptIn(false);
      setRetentionDays(DEFAULT_RETENTION_DAYS);
      setAnalyticsContext(undefined, false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_privacy_preferences')
        .select('analytics_opt_in, retention_days')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('[analytics] Unable to load privacy preferences', error);
      }

      const nextOptIn = data?.analytics_opt_in ?? false;
      const nextRetention = data?.retention_days ?? DEFAULT_RETENTION_DAYS;

      setOptIn(nextOptIn);
      setRetentionDays(nextRetention);
      setAnalyticsContext(user.id, nextOptIn);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const updateConsent = useCallback(
    async (nextOptIn: boolean, nextRetentionDays?: number) => {
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      const retention = Math.max(30, nextRetentionDays ?? retentionDays ?? DEFAULT_RETENTION_DAYS);

      const { data, error } = await supabase.rpc('set_analytics_opt_in', {
        p_user_id: user.id,
        p_opt_in: nextOptIn,
        p_consent_version: ANALYTICS_CONSENT_VERSION,
        p_retention_days: retention,
      });

      if (error) {
        throw error;
      }

      setOptIn(data.analytics_opt_in);
      setRetentionDays(data.retention_days ?? retention);
      setAnalyticsContext(user.id, data.analytics_opt_in);
    },
    [user, retentionDays],
  );

  const refresh = useCallback(async () => {
    await bootstrap();
  }, [bootstrap]);

  return {
    optIn,
    retentionDays,
    loading,
    updateConsent,
    refresh,
  };
};
