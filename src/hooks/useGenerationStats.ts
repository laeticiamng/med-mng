/**
 * Hook pour les statistiques de génération avec cache
 * ✅ NOUVEAU: Cache localStorage + calculs optimisés
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import type { GenerationStats } from '@/types/music';

const CACHE_KEY = 'mng_generation_stats';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedStats {
  data: GenerationStats;
  timestamp: number;
}

const defaultStats: GenerationStats = {
  totalGenerations: 0,
  successfulGenerations: 0,
  failedGenerations: 0,
  averageDuration: 0,
  favoriteCount: 0,
  byRang: { A: 0, B: 0, AB: 0 },
  byStyle: {}
};

export const useGenerationStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<GenerationStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger depuis le cache
  const loadFromCache = useCallback((): GenerationStats | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedStats = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          return parsed.data;
        }
      }
    } catch {}
    return null;
  }, []);

  // Sauvegarder dans le cache
  const saveToCache = useCallback((data: GenerationStats) => {
    try {
      const cached: CachedStats = { data, timestamp: Date.now() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    } catch {}
  }, []);

  // Charger les stats depuis la BDD
  const loadStats = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setStats(defaultStats);
      setLoading(false);
      return;
    }

    // Vérifier le cache d'abord
    if (!forceRefresh) {
      const cached = loadFromCache();
      if (cached) {
        setStats(cached);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      // Charger les données avec une seule requête
      const { data: tracks, error: tracksError } = await supabase
        .from('user_generated_music')
        .select('rang, music_style, is_favorite, created_at')
        .eq('user_id', user.id);

      if (tracksError) throw tracksError;

      const generatedTracks = tracks || [];

      // Calculer les statistiques
      const byRang = { A: 0, B: 0, AB: 0 };
      const byStyle: Record<string, number> = {};
      let favoriteCount = 0;

      generatedTracks.forEach((track) => {
        // Par rang
        if (track.rang === 'A') byRang.A++;
        else if (track.rang === 'B') byRang.B++;
        else if (track.rang === 'AB') byRang.AB++;

        // Par style
        if (track.music_style) {
          byStyle[track.music_style] = (byStyle[track.music_style] || 0) + 1;
        }

        // Favoris
        if (track.is_favorite) favoriteCount++;
      });

      const newStats: GenerationStats = {
        totalGenerations: generatedTracks.length,
        successfulGenerations: generatedTracks.length, // Tous ceux en BDD sont réussis
        failedGenerations: 0,
        averageDuration: 240, // Durée moyenne par défaut
        favoriteCount,
        byRang,
        byStyle
      };

      setStats(newStats);
      saveToCache(newStats);

    } catch (err) {
      console.error('Erreur chargement stats:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [user, loadFromCache, saveToCache]);

  // Charger au montage
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Invalider le cache (après une génération par ex.)
  const invalidateCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {}
  }, []);

  // Style le plus populaire
  const mostPopularStyle = useMemo(() => {
    const entries = Object.entries(stats.byStyle);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  }, [stats.byStyle]);

  // Rang le plus utilisé
  const mostUsedRang = useMemo(() => {
    const { A, B, AB } = stats.byRang;
    if (A >= B && A >= AB) return 'A';
    if (B >= A && B >= AB) return 'B';
    return 'AB';
  }, [stats.byRang]);

  return {
    stats,
    loading,
    error,
    refresh: () => loadStats(true),
    invalidateCache,
    mostPopularStyle,
    mostUsedRang
  };
};
