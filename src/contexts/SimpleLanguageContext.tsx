import React, { createContext, useContext, useState } from 'react';

export type Language = 'fr' | 'en' | 'es' | 'it' | 'zh' | 'ja';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'zh', name: '中文', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', nativeName: '日本語', flag: '🇯🇵' },
];

interface LanguageContextType {
  currentLanguage: Language;
  setCurrentLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translate: (text: string, targetLanguage?: Language) => Promise<string>;
  isTranslating: boolean;
  languages: LanguageInfo[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const SimpleLanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<Language>('fr');
  const [isTranslating, setIsTranslating] = useState(false);

  const setCurrentLanguage = (language: Language) => {
    setCurrentLanguageState(language);
    localStorage.setItem('medmng-language', language);
  };

  // Fonction de traduction simple - retourne juste le texte original
  const t = (key: string, params?: Record<string, string | number>): string => {
    return key;
  };

  // Fonction de traduction de texte libre - retourne juste le texte original
  const translate = async (text: string, targetLanguage?: Language): Promise<string> => {
    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setCurrentLanguage,
        t,
        translate,
        isTranslating,
        languages: LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};