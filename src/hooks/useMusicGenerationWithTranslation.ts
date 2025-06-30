
import { useSunoMusicGeneration } from './music/useSunoMusicGeneration';

export const useMusicGenerationWithTranslation = () => {
  const sunoGeneration = useSunoMusicGeneration();

  const generateMusicInLanguage = async (
    rang: 'A' | 'B', 
    paroles: string[], 
    selectedStyle: string, 
    duration: number = 240
  ) => {
    try {
      const audioUrl = await sunoGeneration.generateMusicInLanguage(rang, paroles, selectedStyle, duration);
      
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
