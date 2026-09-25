import { SUPABASE_URL, getSupabaseHeaders } from '@/lib/supabaseConstants';
import { appendEdnCacheParams, getEdnCacheBuster, subscribeEdnCacheBuster } from '@/utils/ednCache';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { chargerContenuImmersifItem } from '@/hooks/useContenuImmersifItem';

/**
 * Paroles d'un item pour le générateur audio.
 *
 * Titre et sous-titre : colonnes publiques d'`edn_items_complete` (REST).
 * Paroles : RPC `mm_contenu_immersif_item` uniquement — le serveur ne les
 * renvoie que pour un item d'essai ou un abonné Premium (`verrouille` sinon),
 * d'après le JWT de la session. Le hook se recharge à la connexion /
 * déconnexion, puisque le droit en dépend.
 */

interface EdnItemLyrics {
  paroles_musicales?: string[];
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  item_code: string;
  title: string;
  subtitle?: string;
}

interface LyricsStats {
  totalVerses: number;
  totalLines: number;
  averageLinesPerVerse: number;
  estimatedDuration: number;
  hasChorus: boolean;
  verseTitles: string[];
  hasRangA: boolean;
  hasRangB: boolean;
  hasRangAB: boolean;
}

interface ParsedLyrics {
  verses: Array<{
    title: string;
    lines: string[];
    isChorus: boolean;
  }>;
  raw: string[];
  rangA: string[];
  rangB: string[];
  rangAB: string[];
}

export const useEdnItemLyrics = (itemCode: string | null) => {
  const [lyrics, setLyrics] = useState<EdnItemLyrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Le serveur a refusé les paroles de cet item (hors essai, sans Premium). */
  const [verrouille, setVerrouille] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(getEdnCacheBuster);
  const { user, loading: chargementAuth } = useAuth();
  const utilisateurId = user?.id ?? null;

  useEffect(() => {
    if (!itemCode) {
      setLyrics(null);
      setVerrouille(false);
      setLoading(false);
      return;
    }
    // On attend la restauration de la session : le droit aux paroles dépend du JWT.
    if (chargementAuth) {
      setLoading(true);
      return;
    }

    let isMounted = true;
    const unsubscribe = subscribeEdnCacheBuster((value) => {
      setCacheBuster(value);
    });
    
    const fetchLyrics = async () => {
      setLoading(true);
      setError(null);

      try {
        // Table canonique : `edn_items_complete` (367 lignes) — colonnes
        // publiques seulement. Les paroles (colonnes premium) viennent de la RPC.
        const baseUrl = `${SUPABASE_URL}/rest/v1/edn_items_complete?item_code=eq.${encodeURIComponent(itemCode)}&select=item_code,title,subtitle&limit=1`;
        const url = appendEdnCacheParams(baseUrl, cacheBuster, true);
        
        const [response, contenu] = await Promise.all([
          fetch(url, {
            headers: {
              ...getSupabaseHeaders(true),
              'Accept': 'application/json',
            },
            cache: 'no-store'
          }),
          chargerContenuImmersifItem(itemCode),
        ]);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (!isMounted) return;

        if (data && data.length > 0) {
          const item = data[0];
          setVerrouille(contenu.verrouille);
          setLyrics({
            item_code: item.item_code,
            title: item.title,
            subtitle: item.subtitle,
            paroles_musicales: contenu.contenu?.paroles_musicales || [],
            paroles_rang_a: contenu.contenu?.paroles_rang_a || [],
            paroles_rang_b: contenu.contenu?.paroles_rang_b || [],
            paroles_rang_ab: contenu.contenu?.paroles_rang_ab || []
          });
        } else {
          setVerrouille(false);
          setError('Aucune parole trouvée pour cet item');
        }
      } catch (err) {
        console.error('[useEdnItemLyrics] Erreur chargement paroles:', err);
        if (isMounted) {
          setError('Erreur lors du chargement des paroles');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLyrics();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [itemCode, cacheBuster, chargementAuth, utilisateurId]);

  // Parser les paroles en structure utilisable - prioriser rang A/B/AB
  const parsedLyrics = useMemo((): ParsedLyrics | null => {
    if (!lyrics) return null;

    const rangA = lyrics.paroles_rang_a || [];
    const rangB = lyrics.paroles_rang_b || [];
    const rangAB = lyrics.paroles_rang_ab || [];
    const legacy = lyrics.paroles_musicales || [];

    // Utiliser les paroles rang AB en priorité, sinon rang A + rang B, sinon legacy
    const allParoles = rangAB.length > 0 ? rangAB : 
                       (rangA.length > 0 || rangB.length > 0) ? [...rangA, ...rangB] : 
                       legacy;

    if (allParoles.length === 0) return null;

    const verses: ParsedLyrics['verses'] = [];
    let currentVerse: { title: string; lines: string[]; isChorus: boolean } | null = null;

    allParoles.forEach(line => {
      const trimmedLine = line.trim();

      if (trimmedLine.match(/^\[(.*)\]$/) || trimmedLine.match(/^(Couplet|Refrain|Verse|Chorus|Pont|Bridge|Intro|Outro)/i)) {
        if (currentVerse && currentVerse.lines.length > 0) {
          verses.push(currentVerse);
        }
        const title = trimmedLine.replace(/[\[\]]/g, '');
        currentVerse = {
          title,
          lines: [],
          isChorus: title.toLowerCase().includes('refrain') || title.toLowerCase().includes('chorus')
        };
      } else if (trimmedLine && currentVerse) {
        currentVerse.lines.push(trimmedLine);
      } else if (trimmedLine && !currentVerse) {
        currentVerse = {
          title: 'Couplet 1',
          lines: [trimmedLine],
          isChorus: false
        };
      }
    });

    if (currentVerse && currentVerse.lines.length > 0) {
      verses.push(currentVerse);
    }

    return {
      verses,
      raw: allParoles,
      rangA,
      rangB,
      rangAB
    };
  }, [lyrics]);

  // Statistiques sur les paroles
  const stats = useMemo((): LyricsStats | null => {
    if (!parsedLyrics) return null;

    const totalVerses = parsedLyrics.verses.length;
    const totalLines = parsedLyrics.verses.reduce((sum, v) => sum + v.lines.length, 0);
    const averageLinesPerVerse = totalVerses > 0 ? Math.round(totalLines / totalVerses) : 0;
    const hasChorus = parsedLyrics.verses.some(v => v.isChorus);
    const verseTitles = parsedLyrics.verses.map(v => v.title);
    const estimatedDuration = totalLines * 3;

    return {
      totalVerses,
      totalLines,
      averageLinesPerVerse,
      estimatedDuration,
      hasChorus,
      verseTitles,
      hasRangA: parsedLyrics.rangA.length > 0,
      hasRangB: parsedLyrics.rangB.length > 0,
      hasRangAB: parsedLyrics.rangAB.length > 0
    };
  }, [parsedLyrics]);

  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const searchInLyrics = useCallback((query: string): string[] => {
    if (!parsedLyrics || !query.trim()) return [];

    const queryLower = query.toLowerCase();
    return parsedLyrics.raw.filter(line =>
      line.toLowerCase().includes(queryLower)
    );
  }, [parsedLyrics]);

  const getVerse = useCallback((index: number) => {
    if (!parsedLyrics || index < 0 || index >= parsedLyrics.verses.length) {
      return null;
    }
    return parsedLyrics.verses[index];
  }, [parsedLyrics]);

  const getFormattedText = useCallback((): string => {
    if (!parsedLyrics) return '';
    return parsedLyrics.raw.join('\n');
  }, [parsedLyrics]);

  const getRangAText = useCallback((): string => {
    return parsedLyrics?.rangA.join('\n') || '';
  }, [parsedLyrics]);

  const getRangBText = useCallback((): string => {
    return parsedLyrics?.rangB.join('\n') || '';
  }, [parsedLyrics]);

  const getRangABText = useCallback((): string => {
    return parsedLyrics?.rangAB.join('\n') || '';
  }, [parsedLyrics]);

  // refetch réinitialise le state pour forcer un rechargement
  const refetch = useCallback(() => {
    setLyrics(null);
    setError(null);
  }, []);

  return {
    lyrics,
    loading,
    error,
    verrouille,
    parsedLyrics,
    stats,
    formatDuration,
    searchInLyrics,
    getVerse,
    getFormattedText,
    getRangAText,
    getRangBText,
    getRangABText,
    refetch
  };
};
