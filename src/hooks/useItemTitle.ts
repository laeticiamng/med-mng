import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ItemDetails {
  title: string;
  subtitle?: string;
  itemCode: string;
  rang?: string;
  numero?: number;
  category?: string;
  speciality?: string;
  hasMusic?: boolean;
  completenessScore?: number;
}

export interface UseItemTitleOptions {
  autoFetch?: boolean;
  includeDetails?: boolean;
  fallbackTitle?: string;
  cacheKey?: string;
}

export interface UseItemTitleReturn {
  title: string | null;
  subtitle: string | null;
  details: ItemDetails | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  formattedTitle: string;
  shortTitle: string;
  fullTitle: string;
  isValid: boolean;
}

// Cache global pour les titres
const titleCache = new Map<string, { data: ItemDetails; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Nettoyer le cache expiré
const cleanExpiredCache = () => {
  const now = Date.now();
  titleCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_TTL) {
      titleCache.delete(key);
    }
  });
};

export const useItemTitle = (
  itemCode: string | undefined | null,
  options: UseItemTitleOptions = {}
): UseItemTitleReturn => {
  const {
    autoFetch = true,
    includeDetails = false,
    fallbackTitle = 'Sans titre',
    cacheKey
  } = options;

  const [title, setTitle] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const [details, setDetails] = useState<ItemDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clé de cache effective
  const effectiveCacheKey = cacheKey || itemCode || '';

  // Vérifier le cache
  const getCachedData = useCallback(() => {
    if (!effectiveCacheKey) return null;

    const cached = titleCache.get(effectiveCacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return null;
  }, [effectiveCacheKey]);

  // Mettre en cache
  const setCachedData = useCallback((data: ItemDetails) => {
    if (!effectiveCacheKey) return;

    titleCache.set(effectiveCacheKey, {
      data,
      timestamp: Date.now()
    });

    // Nettoyer le cache expiré périodiquement
    if (titleCache.size > 100) {
      cleanExpiredCache();
    }
  }, [effectiveCacheKey]);

  // Fonction de récupération
  const fetchTitle = useCallback(async () => {
    if (!itemCode) {
      setTitle(null);
      setSubtitle(null);
      setDetails(null);
      setError(null);
      setLoading(false);
      return;
    }

    // Vérifier le cache d'abord
    const cached = getCachedData();
    if (cached) {
      setTitle(cached.title);
      setSubtitle(cached.subtitle || null);
      setDetails(cached);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Essayer d'abord la table immersive
      let query = supabase
        .from('edn_items_immersive')
        .select(includeDetails
          ? 'item_code, title, subtitle'
          : 'title, subtitle'
        )
        .eq('item_code', itemCode)
        .maybeSingle();

      let { _data, _error: queryError } = await query;

      // Si pas trouvé, essayer la table principale
      if (!_data && !queryError) {
        const { data: mainData, error: mainError } = await (supabase
          .from('edn_items_immersive') as any)
          .select(includeDetails
            ? 'item_code, title, rang'
            : 'title'
          )
          .eq('item_code', itemCode)
          .maybeSingle();

        if (mainError) {
          throw mainError;
        }

        _data = mainData;
      }

      if (queryError) {
        throw queryError;
      }

      if (_data) {
        const itemDetails: ItemDetails = {
          title: (_data as any).title || fallbackTitle,
          subtitle: (_data as any).subtitle,
          itemCode: itemCode,
          rang: (_data as any).rang,
          numero: (_data as any).numero,
          completenessScore: (_data as any).completeness_score
        };

        setTitle(itemDetails.title);
        setSubtitle(itemDetails.subtitle || null);
        setDetails(itemDetails);
        setCachedData(itemDetails);
      } else {
        // Item non trouvé
        setTitle(null);
        setSubtitle(null);
        setDetails(null);
      }
    } catch (err) {
      console.error('Error fetching item title:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      setTitle(null);
      setSubtitle(null);
      setDetails(null);
    } finally {
      setLoading(false);
    }
  }, [itemCode, includeDetails, fallbackTitle, getCachedData, setCachedData]);

  // Refetch manuel
  const refetch = useCallback(async () => {
    // Invalider le cache
    if (effectiveCacheKey) {
      titleCache.delete(effectiveCacheKey);
    }
    await fetchTitle();
  }, [effectiveCacheKey, fetchTitle]);

  // Auto-fetch au montage et quand itemCode change
  useEffect(() => {
    if (autoFetch) {
      fetchTitle();
    }
  }, [autoFetch, fetchTitle]);

  // Formattage du titre
  const formattedTitle = useMemo(() => {
    if (!title) return fallbackTitle;
    if (!itemCode) return title;
    return `${itemCode} - ${title}`;
  }, [title, itemCode, fallbackTitle]);

  const shortTitle = useMemo(() => {
    if (!title) return fallbackTitle;
    if (title.length <= 50) return title;
    return `${title.slice(0, 47)}...`;
  }, [title, fallbackTitle]);

  const fullTitle = useMemo(() => {
    const parts: string[] = [];
    if (itemCode) parts.push(itemCode);
    if (title) parts.push(title);
    if (subtitle) parts.push(`(${subtitle})`);
    return parts.join(' - ') || fallbackTitle;
  }, [itemCode, title, subtitle, fallbackTitle]);

  const isValid = useMemo(() => {
    return !loading && !error && title !== null;
  }, [loading, error, title]);

  return {
    title,
    subtitle,
    details,
    loading,
    error,
    refetch,
    formattedTitle,
    shortTitle,
    fullTitle,
    isValid
  };
};

// Hook pour récupérer plusieurs titres à la fois
export const useItemTitles = (itemCodes: string[]): {
  titles: Map<string, string>;
  loading: boolean;
  error: string | null;
} => {
  const [titles, setTitles] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTitles = async () => {
      if (itemCodes.length === 0) {
        setTitles(new Map());
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: queryError } = await (supabase
          .from('edn_items_immersive') as any)
          .select('item_code, title')
          .in('item_code', itemCodes);

        if (queryError) throw queryError;

        const titleMap = new Map<string, string>();
        data?.forEach((item: any) => {
          titleMap.set(item.item_code, item.title || 'Sans titre');
        });

        setTitles(titleMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur');
      } finally {
        setLoading(false);
      }
    };

    fetchTitles();
  }, [itemCodes.join(',')]);

  return { titles, loading, error };
};

// Fonction utilitaire pour vider le cache
export const clearTitleCache = () => {
  titleCache.clear();
};

// Fonction utilitaire pour pré-charger des titres
export const preloadTitles = async (itemCodes: string[]) => {
  if (itemCodes.length === 0) return;

  const { data } = await (supabase
    .from('edn_items_immersive') as any)
    .select('item_code, title')
    .in('item_code', itemCodes);

  data?.forEach((item: any) => {
    titleCache.set(item.item_code, {
      data: {
        title: item.title || 'Sans titre',
        itemCode: item.item_code
      },
      timestamp: Date.now()
    });
  });
};

export default useItemTitle;
