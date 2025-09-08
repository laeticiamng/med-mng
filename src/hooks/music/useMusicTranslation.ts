
import { useLanguage, SupportedLanguage } from '@/contexts/LanguageContext';
import { useCallback, useMemo } from 'react';

export const useMusicTranslation = () => {
  const { currentLanguage, translate } = useLanguage();

  const translateLyricsIfNeeded = useCallback(async (lyrics: string): Promise<string> => {
    if (currentLanguage === 'fr' || !lyrics) {
      return lyrics;
    }

    console.log(`🌍 Traduction des paroles du français vers ${currentLanguage}...`);
    const translatedLyrics = await translate(lyrics, currentLanguage);
    console.log(`✅ Paroles traduites`);
    return translatedLyrics;
  }, [currentLanguage, translate]);

  return useMemo(() => ({
    currentLanguage,
    translateLyricsIfNeeded
  }), [currentLanguage, translateLyricsIfNeeded]);
};
