import { useSunoMusicGeneration } from './music/useSunoMusicGeneration';
import { useSubscription } from './useSubscription';
import { useCallback, useMemo } from 'react';

export const useMusicGenerationWithTranslation = () => {
  const sunoGeneration = useSunoMusicGeneration();
  const { getSunoModel } = useSubscription();

  const generateMusicInLanguage = useCallback(async (
    rang: 'A' | 'B' | 'AB',
    paroles: string[], 
    selectedStyle: string, 
    duration: number = 240
  ): Promise<string> => {
    // Validation des paroles avant génération
    if (!paroles || paroles.length === 0) {
      throw new Error('Aucune parole fournie pour la génération');
    }
    
    const validLyrics = paroles.filter(line => line && line.trim().length > 0);
    if (validLyrics.length === 0) {
      throw new Error('Les paroles sont vides ou invalides');
    }
    
    try {
      // Récupérer le modèle selon l'abonnement
      const model = getSunoModel();
      
      // Générer la musique et attendre l'URL audio (polling intégré)
      const audioUrl = await sunoGeneration.generateMusicInLanguage(rang, validLyrics, selectedStyle, duration, model);
      
      return audioUrl;
      
    } catch (error) {
      console.error('[useMusicGenerationWithTranslation] Erreur génération:', error);
      throw error;
    }
  }, [sunoGeneration, getSunoModel]);

  // Expose cancelGeneration avec le bon type
  const cancelGeneration = useCallback((rang?: 'A' | 'B' | 'AB') => {
    sunoGeneration.cancelGeneration(rang);
  }, [sunoGeneration]);

  // État de génération calculé avec useMemo pour éviter recalculs
  const isGeneratingAny = useMemo(() => 
    sunoGeneration.isGenerating?.rangA || 
    sunoGeneration.isGenerating?.rangB || 
    sunoGeneration.isGenerating?.rangAB,
  [sunoGeneration.isGenerating]);

  // Vérifier si un rang spécifique est en génération
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

