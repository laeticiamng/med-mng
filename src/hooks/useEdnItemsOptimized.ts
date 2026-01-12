import { useState, useEffect, useMemo, useCallback } from 'react';

export interface EdnItemOptimized {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  updated_at: string;
  paroles_musicales?: string[];
  competences_count_rang_a?: number;
  competences_count_rang_b?: number;
  specialite?: string;
  mots_cles?: string[];
  competences_oic_rang_a?: any;
  competences_oic_rang_b?: any;
}

const SUPABASE_URL = "https://yaincoxihiqdksxgrsrk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU";

const CACHE_KEY = 'edn_items_cache_v2';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheData {
  items: EdnItemOptimized[];
  timestamp: number;
}

// ✅ Charger depuis le cache localStorage immédiatement
const loadFromCache = (): EdnItemOptimized[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: CacheData = JSON.parse(cached);
    const isExpired = Date.now() - data.timestamp > CACHE_TTL;
    
    // Retourner même si expiré (pour affichage immédiat), mais on refresh en background
    return data.items;
  } catch {
    return null;
  }
};

const saveToCache = (items: EdnItemOptimized[]) => {
  try {
    const data: CacheData = { items, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore localStorage errors
  }
};

export const useEdnItemsOptimized = () => {
  // ✅ Initialiser avec le cache pour affichage instantané
  const [items, setItems] = useState<EdnItemOptimized[]>(() => loadFromCache() || []);
  const [loading, setLoading] = useState(() => !loadFromCache());
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (showLoading = true) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    try {
      if (showLoading && items.length === 0) {
        setLoading(true);
      }

      // ✅ Requête unique optimisée - seulement les champs essentiels
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/edn_items_immersive?select=id,item_code,title,slug,updated_at,paroles_musicales,competences_count_rang_a,competences_count_rang_b&order=item_code`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Format de réponse inattendu');
      }

      if (data.length === 0) {
        setError('Aucun item EDN trouvé');
        setLoading(false);
        return;
      }

      const mappedItems: EdnItemOptimized[] = data.map((item: any) => ({
        id: item.id,
        item_code: item.item_code,
        title: item.title,
        slug: item.slug,
        updated_at: item.updated_at,
        paroles_musicales: item.paroles_musicales || undefined,
        // ✅ Utiliser directement les champs pré-calculés si disponibles
        competences_count_rang_a: item.competences_count_rang_a || 0,
        competences_count_rang_b: item.competences_count_rang_b || 0,
      }));

      setItems(mappedItems);
      saveToCache(mappedItems);
      setLoading(false);
      setError(null);

    } catch (err) {
      clearTimeout(timeoutId);
      
      if (err instanceof Error && err.name === 'AbortError') {
        // Timeout - utiliser le cache si disponible
        const cached = loadFromCache();
        if (cached && cached.length > 0) {
          setItems(cached);
          setLoading(false);
          return;
        }
        setError('Chargement trop long. Réessayez.');
      } else {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      }
      setLoading(false);
    }
  }, [items.length]);

  useEffect(() => {
    // Si on a des données en cache, refresh en background
    const cached = loadFromCache();
    if (cached && cached.length > 0) {
      fetchItems(false); // Background refresh sans loading
    } else {
      fetchItems(true);
    }
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const withRangA = items.filter(i => (i.competences_count_rang_a || 0) > 0).length;
    const withRangB = items.filter(i => (i.competences_count_rang_b || 0) > 0).length;
    const complete = items.filter(i => 
      (i.competences_count_rang_a || 0) > 0 && (i.competences_count_rang_b || 0) > 0
    ).length;
    const withMusic = items.filter(i => 
      i.paroles_musicales && i.paroles_musicales.length > 0
    ).length;

    const totalOicRangA = items.reduce((sum, i) => sum + (i.competences_count_rang_a || 0), 0);
    const totalOicRangB = items.reduce((sum, i) => sum + (i.competences_count_rang_b || 0), 0);
    const totalOicCompetences = totalOicRangA + totalOicRangB;

    const avgScore = total > 0 ? Math.round(
      items.reduce((sum, item) => {
        let score = 0;
        if ((item.competences_count_rang_a || 0) > 0) score += 35;
        if ((item.competences_count_rang_b || 0) > 0) score += 35;
        if (item.paroles_musicales && item.paroles_musicales.length > 0) score += 30;
        return sum + score;
      }, 0) / total
    ) : 0;

    return { total, withRangA, withRangB, complete, withMusic, avgScore, totalOicRangA, totalOicRangB, totalOicCompetences };
  }, [items]);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchItems(true);
  }, [fetchItems]);

  return { items, stats, loading, error, refresh };
};

export const invalidateEdnCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore
  }
};
