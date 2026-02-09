import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EdnItem {
  id: string;
  item_number: number;
  item_code: string;
  title: string;
  specialty: string;
  rang: 'A' | 'B';
  objectives: string[];
  keywords: string[];
}

export interface UseEdnCacheReturn {
  items: EdnItem[];
  isLoading: boolean;
  isStale: boolean;
  isRefreshing: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  getItemByCode: (code: string) => EdnItem | undefined;
  getItemsBySpecialty: (specialty: string) => EdnItem[];
  searchItems: (query: string) => EdnItem[];
  lastUpdated: Date | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CACHE_KEY = 'med-mng-edn-items-cache';
const CACHE_TS_KEY = 'med-mng-edn-items-cache-ts';
const STALE_TIME_MS = 30 * 60 * 1000; // 30 minutes
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const QUERY_KEY = ['edn-items-cache'] as const;

// ---------------------------------------------------------------------------
// Row shape coming back from Supabase (edn_items_immersive)
// ---------------------------------------------------------------------------

interface SupabaseEdnRow {
  id: string;
  item_code: string;
  title: string;
  specialite: string | null;
  mots_cles: string[] | null;
  competences_oic_rang_a: unknown;
  competences_oic_rang_b: unknown;
  competences_count_rang_a: number | null;
  competences_count_rang_b: number | null;
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

function readCachedItems(): EdnItem[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: EdnItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function readCacheTimestamp(): number | null {
  try {
    const raw = localStorage.getItem(CACHE_TS_KEY);
    if (!raw) return null;
    const ts = Number(raw);
    return Number.isFinite(ts) ? ts : null;
  } catch {
    return null;
  }
}

function writeCachedItems(items: EdnItem[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items));
    localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
  } catch {
    // localStorage may be full or unavailable – silently ignore
  }
}

function clearCachedItems(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TS_KEY);
  } catch {
    // Ignore
  }
}

function isCacheExpired(): boolean {
  const ts = readCacheTimestamp();
  if (ts === null) return true;
  return Date.now() - ts > MAX_AGE_MS;
}

function isCacheStale(): boolean {
  const ts = readCacheTimestamp();
  if (ts === null) return true;
  return Date.now() - ts > STALE_TIME_MS;
}

// ---------------------------------------------------------------------------
// Parse item_number from item_code (e.g. "001" -> 1, "245" -> 245)
// ---------------------------------------------------------------------------

function parseItemNumber(itemCode: string): number {
  const num = parseInt(itemCode.replace(/\D/g, ''), 10);
  return Number.isFinite(num) ? num : 0;
}

// ---------------------------------------------------------------------------
// Derive the dominant rang for an item.
// If rang A competences exist we label 'A'; otherwise 'B'.
// ---------------------------------------------------------------------------

function deriveRang(row: SupabaseEdnRow): 'A' | 'B' {
  const countA = row.competences_count_rang_a ?? 0;
  const countB = row.competences_count_rang_b ?? 0;
  return countA >= countB ? 'A' : 'B';
}

// ---------------------------------------------------------------------------
// Extract objective strings from the competences JSON payload.
// The payload is typically an array of objects with a `titre` or `label` key.
// ---------------------------------------------------------------------------

function extractObjectives(payload: unknown): string[] {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    return payload
      .map((entry: Record<string, unknown>) => {
        if (typeof entry === 'string') return entry;
        if (typeof entry === 'object' && entry !== null) {
          const label =
            (entry as Record<string, unknown>).titre ??
            (entry as Record<string, unknown>).label ??
            (entry as Record<string, unknown>).title ??
            (entry as Record<string, unknown>).name;
          return typeof label === 'string' ? label : '';
        }
        return '';
      })
      .filter((s): s is string => s.length > 0);
  }
  return [];
}

// ---------------------------------------------------------------------------
// Map a Supabase row to the public EdnItem shape
// ---------------------------------------------------------------------------

function mapRowToEdnItem(row: SupabaseEdnRow): EdnItem {
  const objectivesA = extractObjectives(row.competences_oic_rang_a);
  const objectivesB = extractObjectives(row.competences_oic_rang_b);
  const rang = deriveRang(row);

  return {
    id: row.id,
    item_number: parseItemNumber(row.item_code),
    item_code: row.item_code,
    title: row.title,
    specialty: row.specialite ?? '',
    rang,
    objectives: rang === 'A' ? objectivesA : objectivesB,
    keywords: row.mots_cles ?? [],
  };
}

// ---------------------------------------------------------------------------
// Supabase fetch function
// ---------------------------------------------------------------------------

async function fetchEdnItemsFromSupabase(): Promise<EdnItem[]> {
  const { data, error } = await supabase
    .from('edn_items_immersive')
    .select(
      'id, item_code, title, specialite, mots_cles, competences_oic_rang_a, competences_oic_rang_b, competences_count_rang_a, competences_count_rang_b'
    )
    .order('item_code');

  if (error) {
    throw new Error(error.message);
  }

  if (!data || !Array.isArray(data)) {
    throw new Error('Unexpected response format from Supabase');
  }

  const items = (data as unknown as SupabaseEdnRow[]).map(mapRowToEdnItem);

  // Persist to localStorage for next session
  writeCachedItems(items);

  return items;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useEdnCache(): UseEdnCacheReturn {
  const queryClient = useQueryClient();

  // ---- Online / offline detection ----------------------------------------
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ---- Stale tracking ----------------------------------------------------
  const [isStale, setIsStale] = useState<boolean>(isCacheStale());

  // Recalculate staleness whenever the query settles
  const recalcStale = useCallback(() => {
    setIsStale(isCacheStale());
  }, []);

  // ---- Initial (synchronous) data from localStorage ----------------------
  const initialData = useMemo<EdnItem[] | undefined>(() => {
    const cached = readCachedItems();
    if (cached && !isCacheExpired()) {
      return cached;
    }
    // If expired beyond max age, drop it so we don't show very old data
    if (cached && isCacheExpired()) {
      clearCachedItems();
    }
    return undefined;
  }, []);

  // ---- React Query -------------------------------------------------------
  const {
    data: items = [],
    isLoading,
    isFetching,
    error: queryError,
    refetch: rqRefetch,
  } = useQuery<EdnItem[], Error>({
    queryKey: QUERY_KEY,
    queryFn: fetchEdnItemsFromSupabase,

    // If we have localStorage data, serve it immediately and mark as not
    // loading so the UI can render right away (SWR behaviour).
    initialData,

    // Keep data fresh in React Query's memory cache for 30 min
    staleTime: STALE_TIME_MS,

    // Keep unused data in the garbage-collection queue for 24 h
    gcTime: MAX_AGE_MS,

    // Do not fetch if offline
    enabled: isOnline,

    // On success, recalculate staleness flag
    meta: {
      onSettled: recalcStale,
    },
  });

  // React Query v5 does not support onSuccess directly; use effect instead
  useEffect(() => {
    if (!isFetching) {
      recalcStale();
    }
  }, [isFetching, recalcStale]);

  // When going back online and cache is stale, trigger a background refetch
  useEffect(() => {
    if (isOnline && isCacheStale()) {
      rqRefetch().catch(() => {
        // Silently ignore – the hook exposes the error via `error`
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  // ---- lastUpdated -------------------------------------------------------
  const lastUpdated = useMemo<Date | null>(() => {
    const ts = readCacheTimestamp();
    return ts !== null ? new Date(ts) : null;
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Public refetch wrapper --------------------------------------------
  const refetch = useCallback(async (): Promise<void> => {
    if (!isOnline) return;
    clearCachedItems();
    queryClient.removeQueries({ queryKey: QUERY_KEY });
    await rqRefetch();
  }, [isOnline, queryClient, rqRefetch]);

  // ---- Lookup helpers (memoised with a Map for O(1) code lookups) --------
  const itemsByCode = useMemo<Map<string, EdnItem>>(() => {
    const map = new Map<string, EdnItem>();
    for (const item of items) {
      map.set(item.item_code, item);
    }
    return map;
  }, [items]);

  const getItemByCode = useCallback(
    (code: string): EdnItem | undefined => itemsByCode.get(code),
    [itemsByCode],
  );

  const getItemsBySpecialty = useCallback(
    (specialty: string): EdnItem[] => {
      const lowerSpecialty = specialty.toLowerCase();
      return items.filter(
        (item) => item.specialty.toLowerCase() === lowerSpecialty,
      );
    },
    [items],
  );

  const searchItems = useCallback(
    (query: string): EdnItem[] => {
      const trimmed = query.trim();
      if (trimmed.length === 0) return items;

      const lowerQuery = trimmed.toLowerCase();
      return items.filter((item) => {
        if (item.item_code.toLowerCase().includes(lowerQuery)) return true;
        if (item.title.toLowerCase().includes(lowerQuery)) return true;
        if (item.specialty.toLowerCase().includes(lowerQuery)) return true;
        if (
          item.keywords.some((kw) => kw.toLowerCase().includes(lowerQuery))
        ) {
          return true;
        }
        if (
          item.objectives.some((obj) =>
            obj.toLowerCase().includes(lowerQuery),
          )
        ) {
          return true;
        }
        return false;
      });
    },
    [items],
  );

  // ---- Derive error as Error | null --------------------------------------
  const error: Error | null = queryError ?? null;

  // isRefreshing: we already have data but are fetching fresh data in background
  const isRefreshing = isFetching && items.length > 0;

  return {
    items,
    isLoading: isLoading && items.length === 0,
    isStale,
    isRefreshing,
    error,
    refetch,
    getItemByCode,
    getItemsBySpecialty,
    searchItems,
    lastUpdated,
  };
}
