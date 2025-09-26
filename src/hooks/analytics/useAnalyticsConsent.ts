import { useCallback, useEffect, useState, useRef } from 'react';
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

// Circuit breaker to prevent spam when Supabase is not available
let supabaseAccessible = true;
let lastFailureTime = 0;
const CIRCUIT_BREAKER_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const useAnalyticsConsent = (): AnalyticsConsentState => {
  const { user } = useAuth();
  const [optIn, setOptIn] = useState(false);
  const [retentionDays, setRetentionDays] = useState(DEFAULT_RETENTION_DAYS);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    // Check circuit breaker first
    if (!supabaseAccessible) {
      const now = Date.now();
      if (now - lastFailureTime < CIRCUIT_BREAKER_TIMEOUT) {
        // Still in circuit breaker timeout, use defaults silently
        if (!user) {
          setOptIn(false);
          setRetentionDays(DEFAULT_RETENTION_DAYS);
          setAnalyticsContext(undefined, false);
        } else {
          setOptIn(false);
          setRetentionDays(DEFAULT_RETENTION_DAYS);
          setAnalyticsContext(user.id, false);
        }
        setLoading(false);
        return;
      } else {
        // Reset circuit breaker after timeout
        supabaseAccessible = true;
      }
    }

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
        // Handle various types of connection errors
        if (
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('relation') || 
          error.message?.includes('does not exist') ||
          error.message?.includes('Network Error') ||
          error.code === 'ENOTFOUND' ||
          error.code === 'ECONNREFUSED'
        ) {
          // Trigger circuit breaker
          supabaseAccessible = false;
          lastFailureTime = Date.now();
          
          console.debug('[analytics] Supabase not accessible, using defaults (circuit breaker active)');
          const nextOptIn = false;
          const nextRetention = DEFAULT_RETENTION_DAYS;
          setOptIn(nextOptIn);
          setRetentionDays(nextRetention);
          setAnalyticsContext(user.id, nextOptIn);
          setLoading(false);
          return;
        }
        console.warn('[analytics] Unable to load privacy preferences', error);
      }

      // Success case - ensure circuit breaker is reset
      supabaseAccessible = true;
      
      const nextOptIn = data?.analytics_opt_in ?? false;
      const nextRetention = data?.retention_days ?? DEFAULT_RETENTION_DAYS;

      setOptIn(nextOptIn);
      setRetentionDays(nextRetention);
      setAnalyticsContext(user.id, nextOptIn);
    } catch (networkError: any) {
      // Trigger circuit breaker on any network error
      supabaseAccessible = false;
      lastFailureTime = Date.now();
      
      console.debug('[analytics] Network error, activating circuit breaker:', networkError?.message);
      setOptIn(false);
      setRetentionDays(DEFAULT_RETENTION_DAYS);
      setAnalyticsContext(user.id, false);
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
