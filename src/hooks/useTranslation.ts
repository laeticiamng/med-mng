
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const useTranslation = (originalText: string) => {
  const { currentLanguage, translate, isTranslating } = useLanguage();
  const [translatedText, setTranslatedText] = useState(originalText);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const translateText = async () => {
      if (currentLanguage === 'fr' || !originalText.trim()) {
        setTranslatedText(originalText);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const translated = await translate(originalText);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation error:', error);
        setError(error instanceof Error ? error.message : 'Erreur de traduction');
        setTranslatedText(originalText); // Fallback au texte original
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
  }, [originalText, currentLanguage, translate]);

  return {
    text: translatedText,
    isLoading: isLoading || isTranslating,
    error,
    originalText
  };
};

export const useTranslateArray = (originalArray: string[]) => {
  const { currentLanguage, translate } = useLanguage();
  const [translatedArray, setTranslatedArray] = useState(originalArray);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const translateArray = async () => {
      if (currentLanguage === 'fr' || originalArray.length === 0) {
        setTranslatedArray(originalArray);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const translations = await Promise.all(
          originalArray.map(text => translate(text))
        );
        setTranslatedArray(translations);
      } catch (error) {
        console.error('Array translation error:', error);
        setError(error instanceof Error ? error.message : 'Erreur de traduction');
        setTranslatedArray(originalArray); // Fallback au tableau original
      } finally {
        setIsLoading(false);
      }
    };

    translateArray();
  }, [originalArray, currentLanguage, translate]);

  return {
    array: translatedArray,
    isLoading,
    error,
    originalArray
  };
};
