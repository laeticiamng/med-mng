
import { useSunoMusicGeneration } from './music/useSunoMusicGeneration';
import { useSubscription } from './useSubscription';

export const useMusicGenerationWithTranslation = () => {
  const sunoGeneration = useSunoMusicGeneration();
  const { getSunoModel } = useSubscription();

  const generateMusicInLanguage = async (
    rang: 'A' | 'B' | 'AB',
    paroles: string[], 
    selectedStyle: string, 
    duration: number = 240
  ): Promise<string> => {
    try {
      // Récupérer le modèle selon l'abonnement
      const model = getSunoModel();
      
      // Générer la musique et attendre l'URL audio (polling intégré)
      const audioUrl = await sunoGeneration.generateMusicInLanguage(rang, paroles, selectedStyle, duration, model);
      
      return audioUrl;
      
    } catch (error) {
      throw error;
    }
  };

  return {
    ...sunoGeneration,
    generateMusicInLanguage
  };
};

