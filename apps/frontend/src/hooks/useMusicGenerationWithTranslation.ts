
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
  ) => {
    try {
      // Récupérer le modèle selon l'abonnement
      const model = getSunoModel();
      
      // ✅ CORRECTION : Utiliser le rang exact sans transformation avec le bon modèle
      const audioUrl = await sunoGeneration.generateMusicInLanguage(rang, paroles, selectedStyle, duration, model);
      
      // Retourner l'URL audio pour le lecteur
      return audioUrl;
      
    } catch (error) {
      console.error('Erreur génération musique avec traduction:', error);
      throw error;
    }
  };

  return {
    ...sunoGeneration,
    generateMusicInLanguage
  };
};
