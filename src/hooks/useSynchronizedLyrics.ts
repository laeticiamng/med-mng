import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { checkAndUseCredits } from '@/hooks/useIAQuota';
import type { LyricsAlignmentLog, LyricsSegment } from '@/types/music';

export interface LyricsLine {
  time: number; // start time in seconds for compatibility
  text: string;
  startMs: number;
  endMs: number;
  role?: string | null;
}

export interface SynchronizedLyricsData {
  song_id: string;
  lyrics_data: LyricsLine[];
  source: 'aligned' | 'manual' | 'ai_generated';
  alignment?: {
    confidence?: number | null;
    method?: string;
    runAt?: string;
    durationMs?: number | null;
    segmentCount?: number | null;
  };
}

type LyricsExportFormat = 'lrc' | 'srt' | 'txt' | 'json' | 'md';

export const useSynchronizedLyrics = (songId?: string) => {
  const [lyricsData, setLyricsData] = useState<SynchronizedLyricsData | null>(null);
  const [alignmentLog, setAlignmentLog] = useState<LyricsAlignmentLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [aligning, setAligning] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const { toast } = useToast();

  const fetchSegments = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lyrics_segments')
        .select('track_id, idx, start_ms, end_ms, text, role')
        .eq('track_id', id)
        .order('idx', { ascending: true });

      if (error) {
        if (error.code !== 'PGRST116') {
          throw error;
        }
      }

      if (!data || data.length === 0) {
        setLyricsData(null);
        setAlignmentLog(null);
        return;
      }

      const mapped = data.map(mapSegmentToLyricsLine);
      setLyricsData({
        song_id: id,
        lyrics_data: mapped,
        source: 'aligned',
      });

      const { data: log } = await supabase
        .from('lyrics_alignment_logs')
        .select('id, track_id, run_at, duration_ms, segment_count, method, confidence, notes, metadata, created_by, created_at, updated_at')
        .eq('track_id', id)
        .order('run_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (log) {
        setAlignmentLog({
          id: log.id,
          trackId: log.track_id,
          runAt: log.run_at,
          durationMs: log.duration_ms,
          segmentCount: log.segment_count,
          method: log.method,
          confidence: log.confidence,
          notes: log.notes ?? undefined,
          metadata: (log.metadata as Record<string, unknown>) ?? undefined,
          createdBy: log.created_by ?? undefined,
        });
        setLyricsData((prev) =>
          prev
            ? {
                ...prev,
                alignment: {
                  confidence: log.confidence,
                  method: log.method,
                  runAt: log.run_at,
                  durationMs: log.duration_ms,
                  segmentCount: log.segment_count,
                },
              }
            : prev,
        );
      }
    } catch (error) {
      console.error('Erreur chargement segments lyrics:', error);
      toast({
        title: 'Erreur',
        description: "Impossible de charger les paroles synchronisées",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadSynchronizedLyrics = useCallback(async (targetSongId?: string) => {
    const id = targetSongId || songId;
    if (!id) return;

    await fetchSegments(id);
  }, [fetchSegments, songId]);

  useEffect(() => {
    if (songId) {
      loadSynchronizedLyrics(songId);
    }
  }, [songId, loadSynchronizedLyrics]);

  const alignFromSource = useCallback(async (targetSongId?: string) => {
    const id = targetSongId || songId;
    if (!id) return false;

    try {
      setAligning(true);
      const hasCredits = await checkAndUseCredits('music', 'generation', { song_id: id });
      if (!hasCredits) {
        toast({
          title: 'Quota insuffisant',
          description: 'Pas assez de crédits pour synchroniser les paroles',
          variant: 'destructive',
        });
        return false;
      }

      const { data, error } = await supabase.functions.invoke('lyrics-aligner', {
        body: {
          action: 'align',
          trackId: id,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.segments) {
      const mappedSegments: LyricsSegment[] = data.segments.map((segment: any) => ({
        trackId: id,
        idx: segment.idx,
        startMs: segment.start_ms,
        endMs: segment.end_ms,
        text: segment.text,
        role: segment.role ?? null,
      }));

      setLyricsData({
        song_id: id,
        lyrics_data: mappedSegments.map((segment) => ({
          time: segment.startMs / 1000,
          text: segment.text,
          startMs: segment.startMs,
          endMs: segment.endMs,
          role: segment.role ?? null,
        })),
          source: 'aligned',
          alignment: {
            confidence: data?.meta?.confidence,
            durationMs: data?.meta?.duration_ms,
            method: 'heuristic_v1',
            runAt: new Date().toISOString(),
            segmentCount: mappedSegments.length,
          },
        });

        toast({
          title: '🎤 Paroles synchronisées',
          description: 'Alignement des paroles terminé',
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur alignement paroles:', error);
      toast({
        title: 'Erreur alignement',
        description: "Impossible d'aligner les paroles automatiquement",
        variant: 'destructive',
      });
      return false;
    } finally {
      setAligning(false);
      await loadSynchronizedLyrics(targetSongId);
    }
  }, [loadSynchronizedLyrics, songId, toast]);

  const saveSynchronizedLyrics = useCallback(
    async (
      targetSongId: string,
      lyrics: LyricsLine[],
      metadata?: { notes?: string; method?: string }
    ) => {
      if (!targetSongId || lyrics.length === 0) {
        toast({
          title: 'Erreur',
          description: 'Aucune parole à sauvegarder',
          variant: 'destructive',
        });
        return false;
      }

      try {
        const segmentsPayload = linesToSegments(lyrics, targetSongId);
        const { error } = await supabase.rpc('replace_lyrics_segments', {
          p_track_id: targetSongId,
          p_segments: segmentsPayload.map((segment) => ({
            idx: segment.idx,
            start_ms: segment.startMs,
            end_ms: segment.endMs,
            text: segment.text,
            role: segment.role ?? null,
          })),
          p_log: {
            method: metadata?.method ?? 'manual_edit',
            notes: metadata?.notes ?? null,
            confidence: 1,
            segment_count: segmentsPayload.length,
            created_by: null,
          },
        });

        if (error) {
          throw error;
        }

        toast({
          title: '💾 Paroles sauvegardées',
          description: 'Synchronisation mise à jour avec succès',
        });

        await loadSynchronizedLyrics(targetSongId);
        return true;
      } catch (error) {
        console.error('Erreur sauvegarde paroles synchronisées:', error);
        toast({
          title: 'Erreur',
          description: "Impossible de sauvegarder les paroles synchronisées",
          variant: 'destructive',
        });
        return false;
      }
    },
    [loadSynchronizedLyrics, toast],
  );

  const updateCurrentLine = useCallback(
    (currentTimeSeconds: number) => {
      if (!lyricsData?.lyrics_data?.length) {
        setCurrentLineIndex(-1);
        return;
      }

      const currentMs = currentTimeSeconds * 1000;
      const index = lyricsData.lyrics_data.findIndex((line, idx) => {
        const start = line.startMs;
        const end = idx === lyricsData.lyrics_data.length - 1 ? Number.POSITIVE_INFINITY : line.endMs;
        return currentMs >= start && currentMs < end + 150; // tolerance 150ms
      });

      setCurrentLineIndex(index);
    },
    [lyricsData],
  );

  const goToLine = useCallback(
    (lineIndex: number): number => {
      if (!lyricsData?.lyrics_data || lineIndex < 0 || lineIndex >= lyricsData.lyrics_data.length) {
        return 0;
      }

      const line = lyricsData.lyrics_data[lineIndex];
      setCurrentLineIndex(lineIndex);
      return line.startMs / 1000;
    },
    [lyricsData],
  );

  const searchInLyrics = useCallback(
    (query: string): { lineIndex: number; time: number }[] => {
      if (!lyricsData?.lyrics_data || !query.trim()) return [];

      const normalized = query.toLowerCase();
      return lyricsData.lyrics_data.reduce<{ lineIndex: number; time: number }[]>((results, line, index) => {
        if (line.text.toLowerCase().includes(normalized)) {
          results.push({ lineIndex: index, time: line.startMs / 1000 });
        }
        return results;
      }, []);
    },
    [lyricsData],
  );

  const exportLyrics = useCallback(
    (format: LyricsExportFormat): string => {
      if (!lyricsData?.lyrics_data) return '';

      switch (format) {
        case 'lrc':
          return exportToLRC(lyricsData.lyrics_data);
        case 'srt':
          return exportToSRT(lyricsData.lyrics_data);
        case 'json':
          return JSON.stringify(
            lyricsData.lyrics_data.map((line, index) => ({
              idx: index,
              start_ms: line.startMs,
              end_ms: line.endMs,
              text: line.text,
              role: line.role ?? undefined,
            })),
            null,
            2,
          );
        case 'md':
          return exportToMarkdown(lyricsData.lyrics_data);
        case 'txt':
        default:
          return lyricsData.lyrics_data.map((line) => line.text).join('\n');
      }
    },
    [lyricsData],
  );

  const hasLyrics = useMemo(() => (lyricsData?.lyrics_data?.length ?? 0) > 0, [lyricsData]);

  return {
    lyricsData,
    alignmentLog,
    loading,
    aligning,
    hasLyrics,
    currentLineIndex,
    updateCurrentLine,
    goToLine,
    searchInLyrics,
    exportLyrics,
    saveSynchronizedLyrics,
    alignFromSource,
    reload: loadSynchronizedLyrics,
  };
};

function mapSegmentToLyricsLine(segment: {
  track_id: string;
  idx: number;
  start_ms: number;
  end_ms: number;
  text: string;
  role?: string | null;
}): LyricsLine {
  const start = Math.max(0, Math.round(segment.start_ms));
  const end = Math.max(start + 500, Math.round(segment.end_ms));
  return {
    time: start / 1000,
    text: segment.text,
    startMs: start,
    endMs: end,
    role: segment.role ?? null,
  };
}

function linesToSegments(lyrics: LyricsLine[], trackId: string): LyricsSegment[] {
  const normalised = lyrics.map((line, index) => ({
    idx: index,
    startMs: Math.round(line.startMs ?? line.time * 1000),
    endMs: line.endMs ? Math.round(line.endMs) : undefined,
    text: line.text,
    role: line.role ?? null,
  }));

  const sorted = normalised.sort((a, b) => a.startMs - b.startMs);
  let cursor = 0;

  return sorted.map((line, index) => {
    const start = Math.max(cursor, line.startMs);
    let end = line.endMs;

    if (typeof end !== 'number') {
      const nextStart = sorted[index + 1]?.startMs;
      if (typeof nextStart === 'number') {
        end = Math.max(start + 800, nextStart - 100);
      } else {
        end = start + 4000;
      }
    }

    if (end <= start) {
      end = start + 800;
    }

    cursor = end;

    return {
      trackId,
      idx: index,
      startMs: start,
      endMs: end,
      text: line.text,
      role: line.role,
    } satisfies LyricsSegment;
  });
}

function exportToLRC(lyrics: LyricsLine[]): string {
  return lyrics
    .map((line) => {
      const minutes = Math.floor(line.startMs / 60000);
      const seconds = Math.floor((line.startMs % 60000) / 1000);
      const centiseconds = Math.floor((line.startMs % 1000) / 10);
      return `[${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}]${line.text}`;
    })
    .join('\n');
}

function exportToSRT(lyrics: LyricsLine[]): string {
  return lyrics
    .map((line, index) => {
      const next = lyrics[index + 1];
      const start = formatSrtTime(line.startMs);
      const end = formatSrtTime(next ? next.startMs : line.endMs);
      return `${index + 1}\n${start} --> ${end}\n${line.text}\n`;
    })
    .join('\n');
}

function exportToMarkdown(lyrics: LyricsLine[]): string {
  return lyrics
    .map((line) => `- [${formatDisplayTime(line.startMs)} - ${formatDisplayTime(line.endMs)}] ${line.text}`)
    .join('\n');
}

function formatSrtTime(ms: number): string {
  const date = new Date(ms);
  const hours = Math.floor(ms / 3600000);
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  const milliseconds = date.getUTCMilliseconds();
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
}

function formatDisplayTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
