
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Hook pour traduire automatiquement du contenu basé sur la langue actuelle
export const useGlobalTranslation = () => {
  const { currentLanguage, translate } = useLanguage();

  const translateContent = async (content: string): Promise<string> => {
    if (currentLanguage === 'fr' || !content) {
      return content;
    }
    
    try {
      const translated = await translate(content, currentLanguage);
      return translated;
    } catch (error) {
      console.warn('Translation failed, using original content:', error);
      return content;
    }
  };

  const translateArray = async (contentArray: string[]): Promise<string[]> => {
    if (currentLanguage === 'fr' || !contentArray.length) {
      return contentArray;
    }

    try {
      const translatedArray = await Promise.all(
        contentArray.map(async (content, index) => {
          // Délai entre les traductions pour éviter le rate limiting
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          return await translate(content, currentLanguage);
        })
      );
      return translatedArray;
    } catch (error) {
      console.warn('Array translation failed, using original content:', error);
      return contentArray;
    }
  };

  return {
    translateContent,
    translateArray,
    currentLanguage,
    isTranslationNeeded: currentLanguage !== 'fr'
  };
};
