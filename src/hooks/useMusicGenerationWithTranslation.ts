
import { useSunoMusicGeneration } from './music/useSunoMusicGeneration';

export const useMusicGenerationWithTranslation = () => {
  const sunoGeneration = useSunoMusicGeneration();

  const generateMusicInLanguage = async (
    rang: 'A' | 'B' | 'AB',
    paroles: string[], 
    selectedStyle: string, 
    duration: number = 240
  ) => {
    try {
      // Pour la version AB, utiliser le rang A avec des paroles combinées 
      const effectiveRang = rang === 'AB' ? 'A' : rang;
      const audioUrl = await sunoGeneration.generateMusicInLanguage(effectiveRang, paroles, selectedStyle, duration);
      
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
