
import { useLanguage, SupportedLanguage } from '@/contexts/LanguageContext';

export const useMusicTranslation = () => {
  let currentLanguage, translate;
  
  try {
    console.log('🎵 HOOK - Tentative d\'utilisation de useLanguage');
    const languageContext = useLanguage();
    currentLanguage = languageContext.currentLanguage;
    translate = languageContext.translate;
    console.log('🎵 HOOK - useLanguage réussi, langue:', currentLanguage);
  } catch (error) {
    console.error('❌ HOOK - Erreur avec useLanguage:', error);
    currentLanguage = 'fr';
    translate = async (text: string) => text;
  }

  const translateLyricsIfNeeded = async (lyrics: string): Promise<string> => {
    if (currentLanguage === 'fr' || !lyrics) {
      return lyrics;
    }

    console.log(`🌍 Traduction des paroles du français vers ${currentLanguage}...`);
    const translatedLyrics = await translate(lyrics, currentLanguage);
    console.log(`✅ Paroles traduites`);
    return translatedLyrics;
  };

  return {
    currentLanguage,
    translateLyricsIfNeeded
  };
};
