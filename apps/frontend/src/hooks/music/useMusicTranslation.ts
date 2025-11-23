
import logger from '@/lib/logger';
import { useLanguage, SupportedLanguage } from '@/contexts/LanguageContext';

export const useMusicTranslation = () => {
  let currentLanguage, translate;
  
  try {
    logger.debug('🎵 HOOK - Tentative d\'utilisation de useLanguage');
    const languageContext = useLanguage();
    currentLanguage = languageContext.currentLanguage;
    translate = languageContext.translate;
    logger.debug('🎵 HOOK - useLanguage réussi, langue:', currentLanguage);
  } catch (error) {
    logger.error('❌ HOOK - Erreur avec useLanguage:', error);
    currentLanguage = 'fr';
    translate = async (text: string) => text;
  }

  const translateLyricsIfNeeded = async (lyrics: string): Promise<string> => {
    if (currentLanguage === 'fr' || !lyrics) {
      return lyrics;
    }

    logger.debug(`🌍 Traduction des paroles du français vers ${currentLanguage}...`);
    const translatedLyrics = await translate(lyrics, currentLanguage);
    logger.debug(`✅ Paroles traduites`);
    return translatedLyrics;
  };

  return {
    currentLanguage,
    translateLyricsIfNeeded
  };
};
