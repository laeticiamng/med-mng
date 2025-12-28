import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  const fetchLyrics = useCallback(async () => {
    if (!itemCode) {
      setLyrics(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('edn_items_immersive')
        .select('item_code, title, subtitle, paroles_musicales, paroles_rang_a, paroles_rang_b, paroles_rang_ab')
        .eq('item_code', itemCode)
        .maybeSingle();

      if (supabaseError) {
        setError('Item non trouvé');
        return;
      }

      if (data) {
        setLyrics({
          item_code: data.item_code,
          title: data.title,
          subtitle: data.subtitle,
          paroles_musicales: data.paroles_musicales || [],
          paroles_rang_a: data.paroles_rang_a || [],
          paroles_rang_b: data.paroles_rang_b || [],
          paroles_rang_ab: data.paroles_rang_ab || []
        });
      } else {
        setError('Aucune donnée trouvée');
      }
    } catch (err) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [itemCode]);

  useEffect(() => {
    fetchLyrics();
  }, [fetchLyrics]);

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

  const refetch = useCallback(() => {
    fetchLyrics();
  }, [fetchLyrics]);

  return {
    lyrics,
    loading,
    error,
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
