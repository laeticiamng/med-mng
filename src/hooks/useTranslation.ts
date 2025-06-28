
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const useTranslation = (originalText: string) => {
  const { currentLanguage, translate, isTranslating } = useLanguage();
  const [translatedText, setTranslatedText] = useState(originalText);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translateText = async () => {
      if (currentLanguage === 'fr' || !originalText.trim()) {
        setTranslatedText(originalText);
        return;
      }

      setIsLoading(true);
      try {
        const translated = await translate(originalText);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(originalText);
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
  }, [originalText, currentLanguage, translate]);

  return {
    text: translatedText,
    isLoading: isLoading || isTranslating,
    originalText
  };
};

export const useTranslateArray = (originalArray: string[]) => {
  const { currentLanguage, translate } = useLanguage();
  const [translatedArray, setTranslatedArray] = useState(originalArray);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translateArray = async () => {
      if (currentLanguage === 'fr' || originalArray.length === 0) {
        setTranslatedArray(originalArray);
        return;
      }

      setIsLoading(true);
      try {
        const translations = await Promise.all(
          originalArray.map(text => translate(text))
        );
        setTranslatedArray(translations);
      } catch (error) {
        console.error('Array translation error:', error);
        setTranslatedArray(originalArray);
      } finally {
        setIsLoading(false);
      }
    };

    translateArray();
  }, [originalArray, currentLanguage, translate]);

  return {
    array: translatedArray,
    isLoading,
    originalArray
  };
};
