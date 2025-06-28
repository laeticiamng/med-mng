
import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 
  | 'fr' | 'en' | 'es' | 'de' | 'pt' | 'ar' | 'zh' | 'ja' | 'ru' | 'hi' 
  | 'it' | 'ko' | 'tr' | 'nl' | 'pl';

export const SUPPORTED_LANGUAGES = {
  fr: { name: 'Français', flag: '🇫🇷' },
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  pt: { name: 'Português', flag: '🇧🇷' },
  ar: { name: 'العربية', flag: '🇸🇦' },
  zh: { name: '中文', flag: '🇨🇳' },
  ja: { name: '日本語', flag: '🇯🇵' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  hi: { name: 'हिन्दी', flag: '🇮🇳' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  ko: { name: '한국어', flag: '🇰🇷' },
  tr: { name: 'Türkçe', flag: '🇹🇷' },
  nl: { name: 'Nederlands', flag: '🇳🇱' },
  pl: { name: 'Polski', flag: '🇵🇱' }
};

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  translate: (text: string, targetLanguage?: SupportedLanguage) => Promise<string>;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('selectedLanguage');
    return (saved as SupportedLanguage) || 'fr';
  });
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    localStorage.setItem('selectedLanguage', currentLanguage);
  }, [currentLanguage]);

  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
  };

  const translate = async (text: string, targetLanguage?: SupportedLanguage): Promise<string> => {
    const target = targetLanguage || currentLanguage;
    
    // Si c'est déjà en français, pas de traduction nécessaire
    if (target === 'fr' || !text.trim()) {
      return text;
    }

    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLanguage: target,
          sourceLanguage: 'fr'
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const result = await response.json();
      return result.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Retourner le texte original en cas d'erreur
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, translate, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
};
