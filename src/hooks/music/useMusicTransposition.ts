
import { useToast } from '@/hooks/use-toast';
import { callSunoApi } from '../musicGenerationApi';
import { createRequestBody } from '../musicGenerationUtils';
import { SupportedLanguage } from '@/contexts/LanguageContext';
import { useMusicTranslation } from './useMusicTranslation';

export const useMusicTransposition = () => {
  const { toast } = useToast();
  const { translateLyricsIfNeeded } = useMusicTranslation();

  const transposeMusicToLanguage = async (
    originalLyrics: string,
    targetLanguage: SupportedLanguage,
    selectedStyle: string,
    duration: number = 240
  ) => {
    try {
      console.log(`🌍 Transposition vers ${targetLanguage}...`);
      const translatedLyrics = await translateLyricsIfNeeded(originalLyrics);
      
      const requestBody = createRequestBody(translatedLyrics, selectedStyle, 'TRANSPOSE', duration, targetLanguage, false);

      const { audioUrl } = await callSunoApi(requestBody);

      toast({
        title: "🎉 Transposition réussie !",
        description: `Musique transposée en ${targetLanguage} avec succès !`,
      });

      return audioUrl;
    } catch (error) {
      const errorMessage = error.message || "Erreur lors de la transposition";
      toast({
        title: "Erreur de transposition",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    transposeMusicToLanguage
  };
};
