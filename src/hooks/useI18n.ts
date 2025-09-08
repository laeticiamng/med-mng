/**
 * 🌍 HOOK I18N REACT - MED-MNG v3.0
 * Hook React pour l'internationalisation avec état réactif
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { i18n, SupportedLanguage, LanguageConfig } from '@/lib/i18n';
import { logger } from '@/lib/logger';

// ==========================================
// INTERFACE DU HOOK
// ==========================================

export interface UseI18nReturn {
  // Traduction
  t: (key: string, params?: Record<string, string | number>) => string;
  plural: (key: string, count: number, params?: Record<string, string | number>) => string;
  
  // Formatage
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatRelativeTime: (date: Date) => string;
  
  // Gestion de langue
  currentLanguage: SupportedLanguage;
  availableLanguages: LanguageConfig[];
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  
  // Utilitaires
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
  isLoading: boolean;
  
  // Actions
  preloadLanguage: (language: SupportedLanguage) => Promise<void>;
  clearCache: () => void;
}

// ==========================================
// HOOK PRINCIPAL
// ==========================================

export const useI18n = (): UseI18nReturn => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(i18n.getCurrentLanguage());
  const [isLoading, setIsLoading] = useState(false);

  // Mettre à jour l'état quand la langue change
  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLanguage(i18n.getCurrentLanguage());
    };

    // Listener pour les changements de langue (si on en ajoute un dans i18n)
    // Pour l'instant, on met à jour manuellement
    return () => {
      // Cleanup si nécessaire
    };
  }, []);

  // Fonction de traduction avec memoization
  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    return i18n.t(key, params);
  }, [currentLanguage]);

  // Fonction de pluralisation
  const plural = useCallback((key: string, count: number, params?: Record<string, string | number>) => {
    return i18n.plural(key, count, params);
  }, [currentLanguage]);

  // Fonctions de formatage
  const formatDate = useCallback((date: Date, options?: Intl.DateTimeFormatOptions) => {
    return i18n.formatDate(date, options);
  }, [currentLanguage]);

  const formatNumber = useCallback((number: number, options?: Intl.NumberFormatOptions) => {
    return i18n.formatNumber(number, options);
  }, [currentLanguage]);

  const formatCurrency = useCallback((amount: number, currency?: string) => {
    return i18n.formatCurrency(amount, currency);
  }, [currentLanguage]);

  const formatRelativeTime = useCallback((date: Date) => {
    return i18n.formatRelativeTime(date);
  }, [currentLanguage]);

  // Changement de langue avec gestion du loading
  const changeLanguage = useCallback(async (language: SupportedLanguage) => {
    if (language === currentLanguage) return;

    setIsLoading(true);
    try {
      await i18n.changeLanguage(language);
      setCurrentLanguage(language);
      logger.info('i18n', `🌍 Language changed to ${language} via hook`);
    } catch (error) {
      logger.error('i18n', 'Failed to change language', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage]);

  // Preload d'une langue
  const preloadLanguage = useCallback(async (language: SupportedLanguage) => {
    try {
      await i18n.preloadLanguage(language);
      logger.debug('i18n', `Language ${language} preloaded`);
    } catch (error) {
      logger.error('i18n', `Failed to preload language ${language}`, error);
      throw error;
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    i18n.clearCache();
    logger.info('i18n', 'Translation cache cleared via hook');
  }, []);

  // Valeurs calculées avec memoization
  const availableLanguages = useMemo(() => i18n.getAvailableLanguages(), []);
  const isRTL = useMemo(() => i18n.isRTL(), [currentLanguage]);
  const direction = useMemo(() => i18n.getDirection(), [currentLanguage]);

  return {
    // Traduction
    t,
    plural,
    
    // Formatage
    formatDate,
    formatNumber,
    formatCurrency,
    formatRelativeTime,
    
    // État
    currentLanguage,
    availableLanguages,
    isLoading,
    
    // Utilitaires
    isRTL,
    direction,
    
    // Actions
    changeLanguage,
    preloadLanguage,
    clearCache
  };
};

// ==========================================
// HOOKS SPÉCIALISÉS
// ==========================================

// Hook pour traduction simple
export const useTranslation = () => {
  const { t, plural } = useI18n();
  return { t, plural };
};

// Hook pour formatage
export const useFormatting = () => {
  const { formatDate, formatNumber, formatCurrency, formatRelativeTime } = useI18n();
  return { formatDate, formatNumber, formatCurrency, formatRelativeTime };
};

// Hook pour gestion de langue
export const useLanguage = () => {
  const { 
    currentLanguage, 
    availableLanguages, 
    changeLanguage, 
    preloadLanguage,
    isLoading,
    isRTL,
    direction
  } = useI18n();
  
  return {
    currentLanguage,
    availableLanguages,
    changeLanguage,
    preloadLanguage,
    isLoading,
    isRTL,
    direction
  };
};

// Hook pour validation avec traductions
export const useValidation = () => {
  const { t } = useI18n();

  const getValidationMessage = useCallback((rule: string, params?: Record<string, any>) => {
    return t(`validation.${rule}`, params);
  }, [t]);

  const validateRequired = useCallback((value: any) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return getValidationMessage('required');
    }
    return null;
  }, [getValidationMessage]);

  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return getValidationMessage('email');
    }
    return null;
  }, [getValidationMessage]);

  const validateMinLength = useCallback((value: string, minLength: number) => {
    if (value.length < minLength) {
      return getValidationMessage('minLength', { count: minLength });
    }
    return null;
  }, [getValidationMessage]);

  const validateMaxLength = useCallback((value: string, maxLength: number) => {
    if (value.length > maxLength) {
      return getValidationMessage('maxLength', { count: maxLength });
    }
    return null;
  }, [getValidationMessage]);

  return {
    getValidationMessage,
    validateRequired,
    validateEmail,
    validateMinLength,
    validateMaxLength
  };
};