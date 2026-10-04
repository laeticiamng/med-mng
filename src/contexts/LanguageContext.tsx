
import React, { createContext, useContext, useEffect, useState } from 'react';
import { TRANSLATIONS_DICT } from '@/locales/translations-dictionary';

export type Language = 'fr' | 'en' | 'de' | 'es';
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
  { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
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

/** Clé où l'ancien sélecteur de langue enregistrait le choix (effacée au démarrage). */
export const CLE_LANGUE_ENREGISTREE = 'medmng-language';

/**
 * Med MNG est en français uniquement (D42, 04.10.2026). Le sélecteur de langue
 * (drapeau flottant) ne traduisait que quelques libellés de navigation via un
 * dictionnaire statique ; le contenu restait en français. Il est retiré, et un
 * ancien choix (« English »…) enregistré dans le navigateur est effacé : sinon,
 * sans sélecteur, ces personnes resteraient bloquées sur des libellés anglais.
 */
export const LanguageProvider = React.forwardRef<HTMLDivElement, LanguageProviderProps>(function LanguageProvider({ children }, ref) {
  const currentLanguage = 'fr' as Language;

  useEffect(() => {
    try {
      localStorage.removeItem(CLE_LANGUE_ENREGISTREE);
    } catch {
      // stockage indisponible (navigation privée) : rien à effacer
    }
  }, []);

  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Libellés français (seule langue de l'interface).
  useEffect(() => {
    let actif = true;
    import('../locales/fr/common.json')
      .then((module) => {
        if (actif) setTranslations((module as { default?: Record<string, any> }).default ?? (module as Record<string, any>));
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des libellés :', error);
        if (actif) setTranslations({});
      });
    return () => {
      actif = false;
    };
  }, []);

  // Français uniquement : conservé pour la compatibilité des appelants, sans effet.
  const setCurrentLanguage = (_language: Language) => {};

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
        languages: LANGUAGES.filter((l) => l.code === 'fr'),
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
