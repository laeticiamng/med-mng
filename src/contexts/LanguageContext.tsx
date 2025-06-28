
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

// Rate limiting pour éviter de surcharger l'API
let requestCount = 0;
let resetTime = Date.now();
const MAX_REQUESTS_PER_MINUTE = 30;

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('selectedLanguage');
      return (saved as SupportedLanguage) || 'fr';
    } catch (error) {
      console.warn('Erreur lecture localStorage pour la langue:', error);
      return 'fr';
    }
  });
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('selectedLanguage', currentLanguage);
    } catch (error) {
      console.warn('Erreur sauvegarde localStorage pour la langue:', error);
    }
  }, [currentLanguage]);

  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
  };

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    
    // Reset le compteur chaque minute
    if (now - resetTime > 60000) {
      requestCount = 0;
      resetTime = now;
    }
    
    if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
      console.warn('Rate limit atteint, requête ignorée');
      return false;
    }
    
    requestCount++;
    return true;
  };

  const translate = async (text: string, targetLanguage?: SupportedLanguage): Promise<string> => {
    const target = targetLanguage || currentLanguage;
    
    // Si c'est déjà en français, pas de traduction nécessaire
    if (target === 'fr' || !text.trim()) {
      return text;
    }

    // Vérifier le rate limiting local
    if (!checkRateLimit()) {
      console.warn('Rate limit local atteint, retour du texte original');
      return text;
    }

    setIsTranslating(true);
    try {
      console.log('🔄 Traduction en cours:', { text: text.substring(0, 50) + '...', target });

      const { data, error } = await supabase.functions.invoke('translate', {
        body: {
          text,
          targetLanguage: target,
          sourceLanguage: 'fr'
        }
      });

      if (error) {
        console.error('❌ Erreur traduction:', error);
        
        // Si c'est une erreur 429, on retourne le texte original sans lever d'erreur
        if (error.message?.includes('429')) {
          console.warn('Rate limit API atteint, utilisation du texte original');
          return text;
        }
        
        throw new Error(`Erreur de traduction: ${error.message}`);
      }
      
      if (data?.error) {
        console.error('❌ Erreur dans la réponse:', data.error);
        
        // Si c'est une erreur 429, on retourne le texte original sans lever d'erreur
        if (data.error.includes('429')) {
          console.warn('Rate limit API atteint, utilisation du texte original');
          return text;
        }
        
        throw new Error(data.error);
      }

      const translatedText = data?.translatedText || text;
      console.log('✅ Traduction réussie');
      
      return translatedText;
    } catch (error) {
      console.error('❌ Erreur traduction:', error);
      
      // En cas d'erreur, retourner le texte original plutôt que de lever une erreur
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      if (errorMessage.includes('429')) {
        console.warn('Rate limit détecté, utilisation du texte original');
      }
      
      return text;
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
