
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Cache global pour éviter les traductions répétées
const translationCache = new Map<string, string>();
const activeRequests = new Map<string, Promise<string>>();

export const useTranslation = (originalText: string) => {
  const { currentLanguage, translate, isTranslating } = useLanguage();
  const [translatedText, setTranslatedText] = useState(originalText);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const translateText = async () => {
      if (currentLanguage === 'fr' || !originalText.trim()) {
        setTranslatedText(originalText);
        setError(null);
        return;
      }

      const cacheKey = `${originalText}_${currentLanguage}`;
      
      // Vérifier le cache d'abord
      if (translationCache.has(cacheKey)) {
        setTranslatedText(translationCache.get(cacheKey)!);
        setError(null);
        return;
      }

      // Vérifier si une requête est déjà en cours pour ce texte
      if (activeRequests.has(cacheKey)) {
        try {
          const result = await activeRequests.get(cacheKey)!;
          setTranslatedText(result);
          setError(null);
        } catch (error) {
          console.error('Translation error from active request:', error);
          setError(error instanceof Error ? error.message : 'Erreur de traduction');
          setTranslatedText(originalText);
        }
        return;
      }

      // Débouncer les requêtes pour éviter trop d'appels simultanés
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          // Créer la promesse et l'ajouter au cache des requêtes actives
          const translationPromise = translate(originalText);
          activeRequests.set(cacheKey, translationPromise);

          const translated = await translationPromise;
          
          // Sauvegarder dans le cache
          translationCache.set(cacheKey, translated);
          setTranslatedText(translated);
          
          // Nettoyer la requête active
          activeRequests.delete(cacheKey);
        } catch (error) {
          console.error('Translation error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Erreur de traduction';
          
          // Si c'est une erreur 429, on utilise le texte original sans afficher d'erreur
          if (errorMessage.includes('429')) {
            console.warn('Rate limit atteint, utilisation du texte original');
            setTranslatedText(originalText);
            setError(null);
          } else {
            setError(errorMessage);
            setTranslatedText(originalText);
          }
          
          // Nettoyer la requête active
          activeRequests.delete(cacheKey);
        } finally {
          setIsLoading(false);
        }
      }, 200); // Débounce de 200ms
    };

    translateText();

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
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
        // Traduire avec un délai entre chaque requête pour éviter le rate limiting
        const translations = [];
        for (let i = 0; i < originalArray.length; i++) {
          const text = originalArray[i];
          const cacheKey = `${text}_${currentLanguage}`;
          
          if (translationCache.has(cacheKey)) {
            translations.push(translationCache.get(cacheKey)!);
          } else {
            const translated = await translate(text);
            translationCache.set(cacheKey, translated);
            translations.push(translated);
            
            // Délai de 100ms entre chaque traduction pour éviter le rate limiting
            if (i < originalArray.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        }
        
        setTranslatedArray(translations);
      } catch (error) {
        console.error('Array translation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur de traduction';
        
        if (errorMessage.includes('429')) {
          console.warn('Rate limit atteint, utilisation du tableau original');
          setTranslatedArray(originalArray);
          setError(null);
        } else {
          setError(errorMessage);
          setTranslatedArray(originalArray);
        }
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
