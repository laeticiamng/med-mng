/**
 * Hook pour gérer le refresh automatique des quotas
 * Avec cache local et refresh périodique
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';

interface QuotaData {
  remaining: number;
  total: number;
  used: number;
  resetDate?: string;
  lastUpdated: Date;
}

interface UseQuotaRefreshOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // en ms
  onQuotaLow?: (remaining: number) => void;
  lowThreshold?: number;
}

const CACHE_KEY = 'med_mng_quota_cache';
const DEFAULT_REFRESH_INTERVAL = 60000; // 1 minute

export const useQuotaRefresh = (options: UseQuotaRefreshOptions = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
    onQuotaLow,
    lowThreshold = 3
  } = options;

  const { user } = useAuth();
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastLowWarningRef = useRef<number>(0);

  // Charger depuis le cache local
  const loadFromCache = useCallback((): QuotaData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        // Vérifier si le cache est récent (moins de 5 minutes)
        const cacheAge = Date.now() - new Date(data.lastUpdated).getTime();
        if (cacheAge < 300000) { // 5 minutes
          return { ...data, lastUpdated: new Date(data.lastUpdated) };
        }
      }
    } catch (err) {
      console.warn('Erreur lecture cache quota:', err);
    }
    return null;
  }, []);

  // Sauvegarder dans le cache local
  const saveToCache = useCallback((data: QuotaData) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Erreur sauvegarde cache quota:', err);
    }
  }, []);

  // Récupérer les quotas depuis l'API
  const fetchQuota = useCallback(async (force = false): Promise<QuotaData | null> => {
    if (!user) {
      setQuota(null);
      return null;
    }

    // Utiliser le cache si pas de force refresh
    if (!force) {
      const cached = loadFromCache();
      if (cached) {
        setQuota(cached);
        return cached;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ia-quota', {
        body: { action: 'get' }
      });

      if (fnError) throw fnError;

      const quotaData: QuotaData = {
        remaining: data?.remaining ?? 10,
        total: data?.total ?? 10,
        used: data?.used ?? 0,
        resetDate: data?.resetDate,
        lastUpdated: new Date()
      };

      setQuota(quotaData);
      saveToCache(quotaData);

      // Vérifier si quota bas
      if (quotaData.remaining <= lowThreshold && onQuotaLow) {
        const now = Date.now();
        // Ne pas spammer les warnings (max 1 par minute)
        if (now - lastLowWarningRef.current > 60000) {
          lastLowWarningRef.current = now;
          onQuotaLow(quotaData.remaining);
        }
      }

      return quotaData;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur récupération quota';
      setError(errorMsg);
      console.error('Erreur quota:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, loadFromCache, saveToCache, lowThreshold, onQuotaLow]);

  // Refresh manuel
  const refresh = useCallback(() => {
    return fetchQuota(true);
  }, [fetchQuota]);

  // Décrémenter le quota localement (optimistic update)
  const decrementQuota = useCallback((amount = 1) => {
    setQuota(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        remaining: Math.max(0, prev.remaining - amount),
        used: prev.used + amount,
        lastUpdated: new Date()
      };
      saveToCache(updated);
      return updated;
    });
  }, [saveToCache]);

  // Setup auto-refresh
  useEffect(() => {
    if (!autoRefresh || !user) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Fetch initial
    fetchQuota();

    // Setup interval
    intervalRef.current = setInterval(() => {
      fetchQuota(true);
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, user, refreshInterval, fetchQuota]);

  // Refresh quand l'app redevient visible
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchQuota();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [user, fetchQuota]);

  return {
    quota,
    isLoading,
    error,
    refresh,
    decrementQuota,
    hasQuota: (quota?.remaining ?? 0) > 0,
    isLow: (quota?.remaining ?? 0) <= lowThreshold
  };
};
