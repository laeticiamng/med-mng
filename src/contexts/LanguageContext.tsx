
import React, { createContext, useContext, useEffect, useState } from 'react';
import { TRANSLATIONS_DICT } from '@/locales/translations-dictionary';

export type Language = 'fr' | 'en' | 'de';
export type SupportedLanguage = Language; // Alias pour compatibilité

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' },
];

// Alias pour compatibilité
export const SUPPORTED_LANGUAGES: Record<string, LanguageInfo> = LANGUAGES.reduce((acc, lang) => {
  acc[lang.code] = lang;
  return acc;
}, {} as Record<string, LanguageInfo>);

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

export const LanguageProvider = React.forwardRef<HTMLDivElement, LanguageProviderProps>(function LanguageProvider({ children }, ref) {
  const [currentLanguage, setCurrentLanguageState] = useState<Language>(() => {
    // Récupérer la langue depuis localStorage ou utiliser français par défaut
    const savedLanguage = localStorage.getItem('medmng-language');
    return (savedLanguage as Language) || 'fr';
  });

  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Importer les traductions statiquement pour éviter les problèmes Vite
  // Charger les traductions pour la langue courante
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        // Utiliser des imports statiques conditionnels
        let translationModule: any;
        switch (currentLanguage) {
          case 'en':
            translationModule = await import('../locales/en/common.json');
            break;
          case 'de':
            translationModule = await import('../locales/de/common.json');
            break;
          case 'fr':
          default:
            translationModule = await import('../locales/fr/common.json');
            break;
        }
        setTranslations(translationModule.default || translationModule);
      } catch (error) {
        console.warn(`Erreur lors du chargement des traductions pour ${currentLanguage}:`, error);
        // Fallback vers le français
        try {
          const fallbackModule = await import('../locales/fr/common.json');
          setTranslations(fallbackModule.default || fallbackModule);
        } catch (fallbackError) {
          console.error('Erreur lors du chargement des traductions de fallback:', fallbackError);
          setTranslations({});
        }
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  const setCurrentLanguage = (language: Language) => {
    setCurrentLanguageState(language);
    localStorage.setItem('medmng-language', language);
    
    // Émettre un événement pour notifier les autres composants
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: language }));
  };

  // Fonction de traduction avec support des paramètres
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback : retourner la clé si pas de traduction
        console.warn(`Traduction manquante pour la clé: ${key} (langue: ${currentLanguage})`);
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Valeur de traduction invalide pour: ${key}`);
      return key;
    }
    
    // Remplacer les paramètres dans la traduction
    if (params) {
      return Object.entries(params).reduce((text, [param, val]) => {
        return text.replace(new RegExp(`{{${param}}}`, 'g'), String(val));
      }, value);
    }
    
    return value;
  };

  // Fonction de traduction de texte libre via dictionnaire statique
  const translate = async (text: string, targetLanguage?: Language): Promise<string> => {
    const target = targetLanguage || currentLanguage;
    
    // Si c'est déjà en français, retourner tel quel
    if (target === 'fr') {
      return text;
    }

    // Lookup dans le dictionnaire statique
    const entry = TRANSLATIONS_DICT[text];
    if (entry && entry[target]) {
      return entry[target];
    }

    // Fallback: retourner le texte original (français)
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
});
LanguageProvider.displayName = 'LanguageProvider';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
