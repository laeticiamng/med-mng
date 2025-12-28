
import { useLanguage, SupportedLanguage } from '@/contexts/LanguageContext';

export const useMusicTranslation = () => {
  let currentLanguage, translate;
  
  try {
    const languageContext = useLanguage();
    currentLanguage = languageContext.currentLanguage;
    translate = languageContext.translate;
  } catch (error) {
    currentLanguage = 'fr';
    translate = async (text: string) => text;
  }

  const translateLyricsIfNeeded = async (lyrics: string): Promise<string> => {
    if (currentLanguage === 'fr' || !lyrics) {
      return lyrics;
    }

    const translatedLyrics = await translate(lyrics, currentLanguage);
    return translatedLyrics;
  };

  return {
    currentLanguage,
    translateLyricsIfNeeded
  };
};
