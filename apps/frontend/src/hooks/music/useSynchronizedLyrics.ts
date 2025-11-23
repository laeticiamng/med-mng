import logger from '@/lib/logger';
import { useState, useEffect } from 'react';
import { secureSunoClient } from '@/lib/secureApiClient';

interface LyricsLine {
  time: number;
  text: string;
  duration?: number;
}

interface UseSynchronizedLyricsParams {
  audioId?: string;
  taskId?: string;
  rawLyrics?: string;
  enableAutoSync?: boolean;
}

export const useSynchronizedLyrics = ({
  audioId,
  taskId,
  rawLyrics,
  enableAutoSync = true
}: UseSynchronizedLyricsParams) => {
  const [lyrics, setLyrics] = useState<LyricsLine[]>([]);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les paroles synchronisées depuis l'API
  const loadTimestampedLyrics = async () => {
    if (!taskId && !audioId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await secureSunoClient.getGenerationStatus(taskId || audioId || '');

      if (result?.timestamped_lyrics) {
        const parsedLyrics = parseTimestampedLyrics(result.timestamped_lyrics);
        setLyrics(parsedLyrics);
        
        if (result.waveform) {
          setWaveform(result.waveform);
        }
      } else if (rawLyrics && enableAutoSync) {
        // Fallback: créer une synchronisation approximative
        const autoSyncedLyrics = createAutoSyncedLyrics(rawLyrics);
        setLyrics(autoSyncedLyrics);
      }
    } catch (err) {
      logger.error('Erreur lors du chargement des paroles synchronisées:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      
      // Fallback sur synchronisation automatique
      if (rawLyrics && enableAutoSync) {
        const autoSyncedLyrics = createAutoSyncedLyrics(rawLyrics);
        setLyrics(autoSyncedLyrics);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Parser les paroles avec timestamps
  const parseTimestampedLyrics = (timestampedData: any): LyricsLine[] => {
    if (Array.isArray(timestampedData)) {
      return timestampedData.map(item => ({
        time: item.time || 0,
        text: item.text || '',
        duration: item.duration
      }));
    }

    // Si c'est un format différent, essayer de le parser
    if (typeof timestampedData === 'string') {
      return parseLyricsFromString(timestampedData);
    }

    return [];
  };

  // Parser les paroles depuis une chaîne avec timestamps
  const parseLyricsFromString = (lyricsString: string): LyricsLine[] => {
    const lines = lyricsString.split('\n');
    const parsedLyrics: LyricsLine[] = [];

    lines.forEach(line => {
      // Format [mm:ss] texte ou [mm:ss.xxx] texte
      const match = line.match(/^\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)$/);
      
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const milliseconds = match[3] ? parseInt(match[3].padEnd(3, '0')) : 0;
        const time = minutes * 60 + seconds + milliseconds / 1000;
        const text = match[4].trim();

        if (text) {
          parsedLyrics.push({ time, text });
        }
      }
    });

    return parsedLyrics.sort((a, b) => a.time - b.time);
  };

  // Créer une synchronisation automatique approximative
  const createAutoSyncedLyrics = (rawLyrics: string): LyricsLine[] => {
    const lines = rawLyrics
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) return [];

    // Estimation: 3-4 secondes par ligne en moyenne
    const avgTimePerLine = 3.5;
    const autoSyncedLyrics: LyricsLine[] = [];

    lines.forEach((line, index) => {
      // Calculer le temps estimé
      const baseTime = index * avgTimePerLine;
      
      // Ajouter une variation aléatoire pour plus de réalisme
      const variation = (Math.random() - 0.5) * 1; // ±0.5 seconde
      const time = Math.max(0, baseTime + variation);

      autoSyncedLyrics.push({
        time,
        text: line,
        duration: avgTimePerLine
      });
    });

    return autoSyncedLyrics;
  };

  // Générer une forme d'onde basique
  const generateBasicWaveform = (duration: number = 180): number[] => {
    const points = 100;
    const waveform: number[] = [];

    for (let i = 0; i < points; i++) {
      // Simulation d'une forme d'onde avec variations
      const progress = i / points;
      const base = Math.sin(progress * Math.PI * 4) * 0.3 + 0.5;
      const noise = (Math.random() - 0.5) * 0.2;
      const amplitude = Math.max(0.1, Math.min(1, base + noise));
      
      waveform.push(amplitude);
    }

    return waveform;
  };

  // Effets
  useEffect(() => {
    loadTimestampedLyrics();
  }, [audioId, taskId]);

  // Si pas de waveform récupérée, en générer une basique
  useEffect(() => {
    if (lyrics.length > 0 && waveform.length === 0) {
      const estimatedDuration = lyrics[lyrics.length - 1]?.time + 10 || 180;
      setWaveform(generateBasicWaveform(estimatedDuration));
    }
  }, [lyrics]);

  // Utilitaires
  const exportLyrics = (format: 'srt' | 'lrc' | 'txt' = 'lrc') => {
    switch (format) {
      case 'srt':
        return exportToSRT(lyrics);
      case 'lrc':
        return exportToLRC(lyrics);
      case 'txt':
        return lyrics.map(line => line.text).join('\n');
      default:
        return '';
    }
  };

  const exportToLRC = (lyricsData: LyricsLine[]): string => {
    return lyricsData
      .map(line => {
        const minutes = Math.floor(line.time / 60);
        const seconds = Math.floor(line.time % 60);
        const centiseconds = Math.floor((line.time % 1) * 100);
        return `[${minutes.toString().padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}]${line.text}`;
      })
      .join('\n');
  };

  const exportToSRT = (lyricsData: LyricsLine[]): string => {
    return lyricsData
      .map((line, index) => {
        const start = formatSRTTime(line.time);
        const end = formatSRTTime(line.time + (line.duration || 3));
        return `${index + 1}\n${start} --> ${end}\n${line.text}\n`;
      })
      .join('\n');
  };

  const formatSRTTime = (time: number): string => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${milliseconds
      .toString()
      .padStart(3, '0')}`;
  };

  return {
    lyrics,
    waveform,
    isLoading,
    error,
    reloadLyrics: loadTimestampedLyrics,
    exportLyrics,
    hasTimestamps: lyrics.length > 0
  };
};