import { useCallback, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Hook optimisé pour la traduction qui évite les re-rendus inutiles
 * et les logs excessifs
 */
export const useOptimizedTranslation = () => {
  const { currentLanguage, translate } = useLanguage();

  const memoizedTranslate = useCallback(async (text: string, targetLanguage?: string): Promise<string> => {
    const target = targetLanguage || currentLanguage;
    
    // Si c'est déjà en français ou la langue cible, retourner tel quel
    if (target === 'fr' || !text) {
      return text;
    }

    // Utiliser la fonction de traduction seulement si nécessaire
    return translate(text, target as any);
  }, [currentLanguage, translate]);

  const isTranslationNeeded = useCallback((text: string, targetLanguage?: string): boolean => {
    const target = targetLanguage || currentLanguage;
    return target !== 'fr' && !!text;
  }, [currentLanguage]);

  return useMemo(() => ({
    currentLanguage,
    translate: memoizedTranslate,
    isTranslationNeeded
  }), [currentLanguage, memoizedTranslate, isTranslationNeeded]);
};