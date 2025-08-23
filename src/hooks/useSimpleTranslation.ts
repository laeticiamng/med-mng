import { useState } from 'react';
import { useLanguage } from '@/contexts/SimpleLanguageContext';

export const useTranslation = (originalText: string) => {
  const { currentLanguage } = useLanguage();
  
  return {
    text: originalText, // Retourne simplement le texte original pour éviter les erreurs
    isLoading: false,
    error: null,
    originalText
  };
};