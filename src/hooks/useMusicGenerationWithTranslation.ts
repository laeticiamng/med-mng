import { useSunoMusicGeneration } from './music/useSunoMusicGeneration';
import { useSubscription } from './useSubscription';
import { useCallback, useMemo } from 'react';

interface AdvancedSunoParams {
  vocalGender?: 'male' | 'female' | 'mixed';
  negativeTags?: string;
  styleWeight?: number;
  weirdnessConstraint?: number;
}

export const useMusicGenerationWithTranslation = () => {
  const sunoGeneration = useSunoMusicGeneration();
  const { getSunoModel } = useSubscription();

  const generateMusicInLanguage = useCallback(async (
    rang: 'A' | 'B' | 'AB',
    paroles: string[], 
    selectedStyle: string, 
    duration: number = 240,
    modelOverride?: "V4" | "V4_5" | "V4_5ALL" | "V4_5PLUS" | "V5",
    advancedParams?: Partial<AdvancedSunoParams>
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
      // Récupérer le modèle selon l'abonnement ou utiliser l'override
      const model = modelOverride || getSunoModel();
      
      // ✅ Passer les paramètres avancés à l'API Suno
      const audioUrl = await sunoGeneration.generateMusicInLanguage(rang, validLyrics, selectedStyle, duration, model, advancedParams);
      
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

