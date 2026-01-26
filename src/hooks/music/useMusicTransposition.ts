
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SupportedLanguage } from '@/contexts/LanguageContext';
import { useMusicTranslation } from './useMusicTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Model } from '@/music/generate';

interface TranspositionResult {
  audioUrl: string;
  taskId: string;
}

export const useMusicTransposition = () => {
  const { toast } = useToast();
  const { translateLyricsIfNeeded } = useMusicTranslation();
  const [isTransposing, setIsTransposing] = useState(false);
  const [progress, setProgress] = useState(0);

  const transposeMusicToLanguage = useCallback(async (
    originalLyrics: string,
    targetLanguage: SupportedLanguage,
    selectedStyle: string,
    duration: number = 240,
    model: Model = 'V4_5ALL'
  ): Promise<TranspositionResult> => {
    setIsTransposing(true);
    setProgress(0);

    try {
      // Étape 1: Traduire les paroles
      setProgress(10);
      const translatedLyrics = await translateLyricsIfNeeded(originalLyrics);
      setProgress(30);

      // Étape 2: Appeler l'API de génération
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: {
          lyrics: translatedLyrics,
          style: selectedStyle,
          rang: 'TRANSPOSE',
          duration: duration,
          language: targetLanguage,
          customMode: true,
          instrumental: false,
          model: model,
          title: `Transposition - ${targetLanguage.toUpperCase()}`
        }
      });

      if (error) throw error;
      if (!data?.trackId) throw new Error('Aucun taskId reçu');

      setProgress(50);

      // Étape 3: Polling pour l'audio
      const audioUrl = await pollForAudio(data.trackId);
      setProgress(100);

      toast({
        title: "🎉 Transposition réussie !",
        description: `Musique transposée en ${getLanguageName(targetLanguage)} avec succès !`,
      });

      return { audioUrl, taskId: data.trackId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la transposition";
      toast({
        title: "Erreur de transposition",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsTransposing(false);
      setProgress(0);
    }
  }, [toast, translateLyricsIfNeeded]);

  // Polling pour récupérer l'audio
  const pollForAudio = async (taskId: string, maxAttempts = 40): Promise<string> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Vérifier en BDD
      const { data: track } = await supabase
        .from('generated_music_tracks')
        .select('audio_url, generation_status')
        .eq('task_id', taskId)
        .maybeSingle();

      if (track?.audio_url && track.generation_status === 'completed') {
        return track.audio_url;
      }

      if (track?.generation_status === 'failed') {
        throw new Error('Génération échouée');
      }

      // Mettre à jour progress
      setProgress(50 + (attempt / maxAttempts) * 45);

      // Attendre avant le prochain check
      await new Promise(resolve => setTimeout(resolve, attempt < 10 ? 3000 : 5000));
    }

    throw new Error('Timeout: génération trop longue');
  };

  const getLanguageName = (lang: SupportedLanguage): string => {
    const names: Record<string, string> = {
      fr: 'Français',
      en: 'Anglais',
      es: 'Espagnol',
      de: 'Allemand',
      it: 'Italien',
      pt: 'Portugais',
      ar: 'Arabe',
      zh: 'Chinois'
    };
    return names[lang] || lang;
  };

  return {
    transposeMusicToLanguage,
    isTransposing,
    progress
  };
};
