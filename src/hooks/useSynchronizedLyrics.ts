import { useToast } from '@/hooks/use-toast';
import { checkAndUseCredits } from '@/hooks/useIAQuota';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

export interface LyricsLine {
  time: number; // Temps en secondes
  text: string; // Texte de la ligne
}

export interface SynchronizedLyricsData {
  song_id: string;
  lyrics_data: LyricsLine[];
  source: 'suno' | 'manual' | 'ai_generated';
}

export const useSynchronizedLyrics = (songId?: string) => {
  const [lyricsData, setLyricsData] = useState<SynchronizedLyricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const { toast } = useToast();

  // Charger les paroles synchronisées depuis la base
  const loadSynchronizedLyrics = async (targetSongId?: string) => {
    const id = targetSongId || songId;
    if (!id) return;

    try {
      setLoading(true);
      const { _data, _error } = await supabase
        .from('med_mng_synchronized_lyrics')
        .select('*')
        .eq('song_id', id)
        .maybeSingle();

      if (_error && _error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw _error;
      }

      if (_data) {
        setLyricsData({
          song_id: _data.song_id,
          lyrics_data: (_data.lyrics_data as unknown) as LyricsLine[],
          source: _data.source as 'suno' | 'manual' | 'ai_generated'
        });
      } else {
        // Essayer de générer automatiquement depuis les métadonnées de la chanson
        await generateLyricsFromSongMeta(id);
      }
    } catch (error) {
      console.error('Erreur chargement paroles synchronisées:', error);
    } finally {
      setLoading(false);
    }
  };

  // Générer automatiquement les paroles depuis les métadonnées de la chanson
  const generateLyricsFromSongMeta = async (targetSongId: string) => {
    try {
      // Vérifier et utiliser les crédits IA
      const canProceed = await checkAndUseCredits('music', 'generation', { song_id: targetSongId });
      if (!canProceed) {
        toast({
          title: "Quota insuffisant",
          description: "Pas assez de crédits pour générer les paroles synchronisées",
          variant: "destructive",
        });
        return;
      }
      // Récupérer les métadonnées de la chanson
      const { _data: song, _error } = await supabase
        .from('med_mng_songs')
        .select('meta, lyrics')
        .eq('id', targetSongId)
        .maybeSingle();

      if (_error || !song) return;

      // Essayer d'extraire les paroles depuis différentes sources
      let rawLyrics = '';
      
      if (song.lyrics && typeof song.lyrics === 'object' && 'text' in song.lyrics) {
        rawLyrics = (song.lyrics as any).text;
      } else if (song.meta && typeof song.meta === 'object' && 'lyrics' in song.meta) {
        rawLyrics = (song.meta as any).lyrics;
      } else if (song.meta && typeof song.meta === 'object' && 'prompt' in song.meta) {
        // Utiliser le prompt comme base
        rawLyrics = (song.meta as any).prompt;
      }

      if (rawLyrics) {
        const generatedLyrics = generateTimestampsFromText(rawLyrics);
        await saveSynchronizedLyrics(targetSongId, generatedLyrics, 'ai_generated');
      }
    } catch (error) {
      console.error('Erreur génération paroles:', error);
    }
  };

  // Générer des timestamps intelligents à partir du texte (basé sur longueur des lignes)
  const generateTimestampsFromText = (text: string, totalDuration?: number): LyricsLine[] => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];
    
    // Calculer le poids de chaque ligne basé sur sa longueur
    const totalChars = lines.reduce((sum, line) => sum + line.trim().length, 0);
    const duration = totalDuration || lines.length * 4; // Default 4s per line if no duration
    
    let currentTime = 0;
    return lines.map((line, _index) => {
      const lineText = line.trim();
      const lineWeight = lineText.length / totalChars;
      const lineDuration = Math.max(2, duration * lineWeight); // Minimum 2 seconds per line
      
      const result = {
        time: Math.round(currentTime * 100) / 100,
        text: lineText
      };
      
      currentTime += lineDuration;
      return result;
    });
  };

  // Fetch real timestamps from Suno API if available
  // Sauvegarder les paroles synchronisées
  const saveSynchronizedLyrics = async (
    targetSongId: string, 
    lyrics: LyricsLine[], 
    source: 'suno' | 'manual' | 'ai_generated' = 'manual'
  ) => {
    try {
      const { _error } = await supabase
        .from('med_mng_synchronized_lyrics')
        .upsert({
          song_id: targetSongId,
          lyrics_data: lyrics as any,
          source
        });

      if (_error) throw _error;

      setLyricsData({
        song_id: targetSongId,
        lyrics_data: lyrics,
        source
      });

      toast({
        title: "🎵 Paroles synchronisées",
        description: "Les paroles ont été sauvegardées avec succès",
      });

      return true;
    } catch (error) {
      console.error('Erreur sauvegarde paroles:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paroles",
        variant: "destructive",
      });
      return false;
    }
  };

  // Mettre à jour la ligne courante selon le temps de lecture
  const updateCurrentLine = (currentTime: number) => {
    if (!lyricsData?.lyrics_data) return;

    const lyrics = lyricsData.lyrics_data;
    let newIndex = -1;

    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        newIndex = i;
      } else {
        break;
      }
    }

    setCurrentLineIndex(newIndex);
  };

  // Aller à une ligne spécifique (pour la navigation)
  const goToLine = (lineIndex: number): number => {
    if (!lyricsData?.lyrics_data || lineIndex < 0 || lineIndex >= lyricsData.lyrics_data.length) {
      return 0;
    }
    
    setCurrentLineIndex(lineIndex);
    return lyricsData.lyrics_data[lineIndex].time;
  };

  // Rechercher dans les paroles
  const searchInLyrics = (query: string): { lineIndex: number; time: number }[] => {
    if (!lyricsData?.lyrics_data || !query.trim()) return [];

    const results: { lineIndex: number; time: number }[] = [];
    const normalizedQuery = query.toLowerCase();

    lyricsData.lyrics_data.forEach((line, index) => {
      if (line.text.toLowerCase().includes(normalizedQuery)) {
        results.push({
          lineIndex: index,
          time: line.time
        });
      }
    });

    return results;
  };

  // Exporter les paroles dans différents formats
  const exportLyrics = (format: 'lrc' | 'srt' | 'txt'): string => {
    if (!lyricsData?.lyrics_data) return '';

    const lyrics = lyricsData.lyrics_data;

    switch (format) {
      case 'lrc':
        return lyrics.map(line => {
          const minutes = Math.floor(line.time / 60);
          const seconds = (line.time % 60).toFixed(2);
          return `[${minutes.toString().padStart(2, '0')}:${seconds.padStart(5, '0')}]${line.text}`;
        }).join('\n');

      case 'srt':
        return lyrics.map((line, index) => {
          const startTime = formatSRTTime(line.time);
          const endTime = formatSRTTime(lyrics[index + 1]?.time || line.time + 4);
          return `${index + 1}\n${startTime} --> ${endTime}\n${line.text}\n`;
        }).join('\n');

      case 'txt':
        return lyrics.map(line => line.text).join('\n');

      default:
        return '';
    }
  };

  const formatSRTTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
  };

  useEffect(() => {
    if (songId) {
      loadSynchronizedLyrics();
    }
  }, [songId]);

  return {
    lyricsData,
    loading,
    currentLineIndex,
    loadSynchronizedLyrics,
    saveSynchronizedLyrics,
    updateCurrentLine,
    goToLine,
    searchInLyrics,
    exportLyrics,
    generateLyricsFromSongMeta
  };
};