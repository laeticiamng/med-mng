
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EdnItemLyrics {
  paroles_musicales?: string[];
  item_code: string;
  title: string;
  subtitle?: string;
}

interface LyricsStats {
  totalVerses: number;
  totalLines: number;
  averageLinesPerVerse: number;
  estimatedDuration: number; // en secondes
  hasChorus: boolean;
  verseTitles: string[];
}

interface ParsedLyrics {
  verses: Array<{
    title: string;
    lines: string[];
    isChorus: boolean;
  }>;
  raw: string[];
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
        .select('item_code, title, subtitle, paroles_musicales')
        .eq('item_code', itemCode)
        .single();

      if (supabaseError) {
        setError('Item non trouvé');
        return;
      }

      if (data) {
        setLyrics({
          item_code: data.item_code,
          title: data.title,
          subtitle: data.subtitle,
          paroles_musicales: data.paroles_musicales || []
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

  // Parser les paroles en structure utilisable
  const parsedLyrics = useMemo((): ParsedLyrics | null => {
    if (!lyrics?.paroles_musicales || lyrics.paroles_musicales.length === 0) {
      return null;
    }

    const verses: ParsedLyrics['verses'] = [];
    let currentVerse: { title: string; lines: string[]; isChorus: boolean } | null = null;

    lyrics.paroles_musicales.forEach(line => {
      const trimmedLine = line.trim();

      // Détecter les titres de couplets/refrains
      if (trimmedLine.match(/^\[(.*)\]$/) || trimmedLine.match(/^(Couplet|Refrain|Verse|Chorus|Pont|Bridge|Intro|Outro)/i)) {
        if (currentVerse) {
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
        // Première ligne sans titre de section
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
      raw: lyrics.paroles_musicales
    };
  }, [lyrics]);

  // Statistiques sur les paroles
  const stats = useMemo((): LyricsStats | null => {
    if (!parsedLyrics) {
      return null;
    }

    const totalVerses = parsedLyrics.verses.length;
    const totalLines = parsedLyrics.verses.reduce((sum, v) => sum + v.lines.length, 0);
    const averageLinesPerVerse = totalVerses > 0 ? Math.round(totalLines / totalVerses) : 0;
    const hasChorus = parsedLyrics.verses.some(v => v.isChorus);
    const verseTitles = parsedLyrics.verses.map(v => v.title);

    // Estimation de durée: ~3 secondes par ligne
    const estimatedDuration = totalLines * 3;

    return {
      totalVerses,
      totalLines,
      averageLinesPerVerse,
      estimatedDuration,
      hasChorus,
      verseTitles
    };
  }, [parsedLyrics]);

  // Formater la durée estimée
  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Rechercher dans les paroles
  const searchInLyrics = useCallback((query: string): string[] => {
    if (!lyrics?.paroles_musicales || !query.trim()) return [];

    const queryLower = query.toLowerCase();
    return lyrics.paroles_musicales.filter(line =>
      line.toLowerCase().includes(queryLower)
    );
  }, [lyrics]);

  // Obtenir un couplet spécifique
  const getVerse = useCallback((index: number) => {
    if (!parsedLyrics || index < 0 || index >= parsedLyrics.verses.length) {
      return null;
    }
    return parsedLyrics.verses[index];
  }, [parsedLyrics]);

  // Obtenir le texte complet formaté
  const getFormattedText = useCallback((): string => {
    if (!lyrics?.paroles_musicales) return '';
    return lyrics.paroles_musicales.join('\n');
  }, [lyrics]);

  // Refetch manuel
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
    refetch
  };
};
