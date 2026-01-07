import { useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const useMusicTranslation = () => {
  // Toujours appeler le hook - les hooks doivent être appelés inconditionnellement
  const languageContext = useLanguage();
  const currentLanguage = languageContext?.currentLanguage ?? 'fr';
  const translate = languageContext?.translate;

  const translateLyricsIfNeeded = useCallback(async (lyrics: string): Promise<string> => {
    if (currentLanguage === 'fr' || !lyrics) {
      return lyrics;
    }

    if (!translate) {
      return lyrics;
    }

    const translatedLyrics = await translate(lyrics, currentLanguage);
    return translatedLyrics;
  }, [currentLanguage, translate]);

  return {
    currentLanguage,
    translateLyricsIfNeeded
  };
};
