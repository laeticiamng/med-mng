import { useEffect, useState } from 'react';

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
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronisation des paroles une fois l'audio disponible.
  // Note finale vérifiée (05.10.2026) : cette fonction interrogeait mm-music-status pour obtenir des
  // « timestamped_lyrics » que le serveur ne renvoie pas (il ne connaît que statut et fichiers), avec
  // un identifiant fabriqué (« IC-150-A ») : 404 à chaque chanson générée (erreur console, appel inutile),
  // puis repli systématique sur la synchronisation automatique. Le repli devient le comportement direct.
  const loadTimestampedLyrics = async () => {
    if (!taskId && !audioId) return;
    setError(null);
    if (rawLyrics && enableAutoSync) {
      setLyrics(createAutoSyncedLyrics(rawLyrics));
    }
  };

  // Créer une synchronisation automatique basée sur la durée réelle de l'audio
  const createAutoSyncedLyrics = (rawLyrics: string, audioDuration?: number): LyricsLine[] => {
    const lines = rawLyrics
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) return [];

    // Utiliser la durée réelle de l'audio si disponible, sinon estimer
    const totalDuration = audioDuration || lines.length * 3.5;
    const avgTimePerLine = totalDuration / lines.length;
    const autoSyncedLyrics: LyricsLine[] = [];

    lines.forEach((line, index) => {
      // Calculer le temps basé sur la durée réelle
      const baseTime = index * avgTimePerLine;
      
      // Légère variation basée sur la longueur de la ligne (pas random)
      const lineVariation = (line.length / 50) * 0.5; // Plus longue = plus de temps
      const time = Math.max(0, baseTime);

      autoSyncedLyrics.push({
        time,
        text: line,
        duration: avgTimePerLine + lineVariation
      });
    });

    return autoSyncedLyrics;
  };

  // Générer une forme d'onde basée sur l'analyse audio (ou pattern cohérent)
  const generateBasicWaveform = (_duration: number = 180): number[] => {
    const points = 100;
    const waveform: number[] = [];

    for (let i = 0; i < points; i++) {
      // Pattern cohérent basé sur la position (pas random)
      const progress = i / points;
      // Forme d'onde réaliste: intro fade-in, corps stable, outro fade-out
      let amplitude: number;
      if (progress < 0.1) {
        // Intro: fade in
        amplitude = 0.3 + (progress / 0.1) * 0.4;
      } else if (progress > 0.9) {
        // Outro: fade out
        amplitude = 0.7 - ((progress - 0.9) / 0.1) * 0.5;
      } else {
        // Corps: variation musicale
        const beat = Math.sin(progress * Math.PI * 8);
        const melody = Math.sin(progress * Math.PI * 24) * 0.2;
        amplitude = 0.5 + beat * 0.25 + melody;
      }
      
      waveform.push(Math.max(0.1, Math.min(1, amplitude)));
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