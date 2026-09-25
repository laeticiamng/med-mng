import { useSunoMusicGeneration, type OptionsGeneration, type ResultatGeneration } from './music/useSunoMusicGeneration';
import { useCallback, useMemo } from 'react';

export type { OptionsGeneration, ResultatGeneration };

/**
 * Génération audio avec traduction éventuelle des paroles (langue de
 * l'interface). Le modèle Suno est imposé par le serveur (mm-generate-music),
 * la durée calculée d'après les paroles : rien de tout cela ne se choisit ici.
 */
export const useMusicGenerationWithTranslation = () => {
  const sunoGeneration = useSunoMusicGeneration();

  const generateMusicInLanguage = useCallback(async (
    rang: 'A' | 'B' | 'AB',
    paroles: string[],
    selectedStyle: string,
    options: OptionsGeneration = {}
  ): Promise<ResultatGeneration> => {
    if (!paroles || paroles.length === 0) {
      throw new Error('Aucune parole fournie pour la génération');
    }

    const validLyrics = paroles.filter(line => typeof line === 'string' && line.trim().length > 0);
    if (validLyrics.length === 0) {
      throw new Error('Les paroles sont vides ou invalides');
    }

    try {
      return await sunoGeneration.generateMusicInLanguage(rang, validLyrics, selectedStyle, options);
    } catch (error) {
      if (import.meta.env.DEV) console.error('[useMusicGenerationWithTranslation] Erreur génération:', error);
      throw error;
    }
  }, [sunoGeneration]);

  const cancelGeneration = useCallback((rang?: 'A' | 'B' | 'AB') => {
    sunoGeneration.cancelGeneration(rang);
  }, [sunoGeneration]);

  const isGeneratingAny = useMemo(() =>
    sunoGeneration.isGenerating?.rangA ||
    sunoGeneration.isGenerating?.rangB ||
    sunoGeneration.isGenerating?.rangAB,
  [sunoGeneration.isGenerating]);

  const isGeneratingRang = useCallback((rang: 'A' | 'B' | 'AB') => {
    switch (rang) {
      case 'A': return sunoGeneration.isGenerating?.rangA || false;
      case 'B': return sunoGeneration.isGenerating?.rangB || false;
      case 'AB': return sunoGeneration.isGenerating?.rangAB || false;
      default: return false;
    }
  }, [sunoGeneration.isGenerating]);

  return {
    ...sunoGeneration,
    generateMusicInLanguage,
    cancelGeneration,
    isGeneratingAny,
    isGeneratingRang
  };
};
