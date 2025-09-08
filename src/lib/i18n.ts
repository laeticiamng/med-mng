/**
 * 🌍 SYSTÈME I18N COMPLET - MED-MNG v3.0
 * Internationalisation avancée avec lazy loading et fallbacks
 */

import { logger } from '@/lib/logger';

// ==========================================
// TYPES ET INTERFACES
// ==========================================

export type SupportedLanguage = 'fr' | 'en' | 'es' | 'de' | 'it';

export interface TranslationKey {
  [key: string]: string | TranslationKey;
}

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  dateFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    currency: string;
  };
}

export interface I18nContext {
  currentLanguage: SupportedLanguage;
  availableLanguages: LanguageConfig[];
  translations: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
}

// ==========================================
// CONFIGURATION DES LANGUES
// ==========================================

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  fr: {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      decimal: ',',
      thousands: ' ',
      currency: '€'
    }
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    dateFormat: 'MM/dd/yyyy',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: '$'
    }
  },
  es: {
    code: 'es',
    name: 'Español',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      currency: '€'
    }
  },
  de: {
    code: 'de',
    name: 'Deutsch',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false,
    dateFormat: 'dd.MM.yyyy',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      currency: '€'
    }
  },
  it: {
    code: 'it',
    name: 'Italiano',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    rtl: false,
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      currency: '€'
    }
  }
};

// ==========================================
// CLASSE I18N MANAGER
// ==========================================

class I18nManager {
  private currentLanguage: SupportedLanguage = 'fr';
  private translations: Map<SupportedLanguage, Record<string, unknown>> = new Map();
  private fallbackLanguage: SupportedLanguage = 'en';
  private loadingPromises: Map<SupportedLanguage, Promise<void>> = new Map();

  constructor() {
    this.detectInitialLanguage();
    this.loadTranslations(this.currentLanguage);
  }

  // ==========================================
  // DÉTECTION DE LANGUE
  // ==========================================

  private detectInitialLanguage(): void {
    // 1. Langue stockée en localStorage
    const storedLang = localStorage.getItem('med-mng-language') as SupportedLanguage;
    if (storedLang && this.isLanguageSupported(storedLang)) {
      this.currentLanguage = storedLang;
      return;
    }

    // 2. Langue du navigateur
    const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
    if (this.isLanguageSupported(browserLang)) {
      this.currentLanguage = browserLang;
      return;
    }

    // 3. Fallback par défaut
    this.currentLanguage = 'fr';

    logger.info('i18n', `🌍 Language detected: ${this.currentLanguage}`);
  }

  private isLanguageSupported(language: string): language is SupportedLanguage {
    return Object.keys(SUPPORTED_LANGUAGES).includes(language);
  }

  // ==========================================
  // CHARGEMENT DES TRADUCTIONS
  // ==========================================

  async loadTranslations(language: SupportedLanguage): Promise<void> {
    if (this.translations.has(language)) {
      return; // Déjà chargé
    }

    if (this.loadingPromises.has(language)) {
      return this.loadingPromises.get(language); // En cours de chargement
    }

    const loadPromise = this.fetchTranslations(language);
    this.loadingPromises.set(language, loadPromise);

    try {
      await loadPromise;
      logger.info('i18n', `✅ Translations loaded for ${language}`);
    } catch (error) {
      logger.error('i18n', `❌ Failed to load translations for ${language}`, error);
      throw error;
    } finally {
      this.loadingPromises.delete(language);
    }
  }

  private async fetchTranslations(language: SupportedLanguage): Promise<void> {
    try {
      // Import dynamique des traductions
      const translations = await import(`../locales/${language}.json`);
      this.translations.set(language, translations.default || translations);
    } catch (error) {
      // Fallback avec traductions de base si le fichier n'existe pas
      logger.warn('i18n', `Using fallback translations for ${language}`);
      this.translations.set(language, this.createFallbackTranslations(language));
    }
  }

  private createFallbackTranslations(language: SupportedLanguage): Record<string, unknown> {
    // Traductions de base en cas d'échec de chargement
    const fallbacks: Record<SupportedLanguage, Record<string, unknown>> = {
      fr: {
        common: {
          loading: 'Chargement...',
          error: 'Erreur',
          success: 'Succès',
          cancel: 'Annuler',
          save: 'Enregistrer',
          delete: 'Supprimer',
          edit: 'Modifier',
          create: 'Créer',
          search: 'Rechercher'
        },
        navigation: {
          home: 'Accueil',
          dashboard: 'Tableau de bord',
          profile: 'Profil',
          settings: 'Paramètres'
        }
      },
      en: {
        common: {
          loading: 'Loading...',
          error: 'Error',
          success: 'Success',
          cancel: 'Cancel',
          save: 'Save',
          delete: 'Delete',
          edit: 'Edit',
          create: 'Create',
          search: 'Search'
        },
        navigation: {
          home: 'Home',
          dashboard: 'Dashboard',
          profile: 'Profile',
          settings: 'Settings'
        }
      },
      es: {
        common: {
          loading: 'Cargando...',
          error: 'Error',
          success: 'Éxito',
          cancel: 'Cancelar',
          save: 'Guardar',
          delete: 'Eliminar',
          edit: 'Editar',
          create: 'Crear',
          search: 'Buscar'
        },
        navigation: {
          home: 'Inicio',
          dashboard: 'Panel',
          profile: 'Perfil',
          settings: 'Configuración'
        }
      },
      de: {
        common: {
          loading: 'Laden...',
          error: 'Fehler',
          success: 'Erfolg',
          cancel: 'Abbrechen',
          save: 'Speichern',
          delete: 'Löschen',
          edit: 'Bearbeiten',
          create: 'Erstellen',
          search: 'Suchen'
        },
        navigation: {
          home: 'Startseite',
          dashboard: 'Dashboard',
          profile: 'Profil',
          settings: 'Einstellungen'
        }
      },
      it: {
        common: {
          loading: 'Caricamento...',
          error: 'Errore',
          success: 'Successo',
          cancel: 'Annulla',
          save: 'Salva',
          delete: 'Elimina',
          edit: 'Modifica',
          create: 'Crea',
          search: 'Cerca'
        },
        navigation: {
          home: 'Home',
          dashboard: 'Dashboard',
          profile: 'Profilo',
          settings: 'Impostazioni'
        }
      }
    };

    return fallbacks[language] || fallbacks.en;
  }

  // ==========================================
  // TRADUCTION
  // ==========================================

  t(key: string, params?: Record<string, string | number>): string {
    const translation = this.getTranslation(key);
    
    if (!params) {
      return translation;
    }

    // Interpolation des paramètres
    return Object.entries(params).reduce((text, [param, value]) => {
      return text.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
    }, translation);
  }

  private getTranslation(key: string): string {
    const currentTranslations = this.translations.get(this.currentLanguage);
    let translation = this.getNestedValue(currentTranslations, key);

    // Fallback vers la langue de secours
    if (!translation && this.currentLanguage !== this.fallbackLanguage) {
      const fallbackTranslations = this.translations.get(this.fallbackLanguage);
      translation = this.getNestedValue(fallbackTranslations, key);
    }

    // Dernière option : retourner la clé elle-même
    return translation || key;
  }

  private getNestedValue(obj: Record<string, unknown> | undefined, path: string): string | undefined {
    if (!obj) return undefined;

    return path.split('.').reduce((current: any, key: string) => {
      return current && typeof current === 'object' ? current[key] : undefined;
    }, obj) as string | undefined;
  }

  // ==========================================
  // FORMATAGE
  // ==========================================

  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const config = SUPPORTED_LANGUAGES[this.currentLanguage];
    return new Intl.DateTimeFormat(this.currentLanguage, {
      ...options,
      localeMatcher: 'best fit'
    }).format(date);
  }

  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLanguage, {
      ...options,
      localeMatcher: 'best fit'
    }).format(number);
  }

  formatCurrency(amount: number, currency?: string): string {
    const config = SUPPORTED_LANGUAGES[this.currentLanguage];
    return new Intl.NumberFormat(this.currentLanguage, {
      style: 'currency',
      currency: currency || (this.currentLanguage === 'en' ? 'USD' : 'EUR'),
      localeMatcher: 'best fit'
    }).format(amount);
  }

  formatRelativeTime(date: Date): string {
    const rtf = new Intl.RelativeTimeFormat(this.currentLanguage, { numeric: 'auto' });
    const diff = Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return rtf.format(diff, 'day');
  }

  // ==========================================
  // GESTION DE LANGUE
  // ==========================================

  async changeLanguage(language: SupportedLanguage): Promise<void> {
    if (!this.isLanguageSupported(language)) {
      throw new Error(`Language ${language} is not supported`);
    }

    await this.loadTranslations(language);
    this.currentLanguage = language;
    
    // Sauvegarder la préférence
    localStorage.setItem('med-mng-language', language);
    
    // Mettre à jour l'attribut lang du document
    document.documentElement.lang = language;
    document.documentElement.dir = SUPPORTED_LANGUAGES[language].rtl ? 'rtl' : 'ltr';

    logger.info('i18n', `🌍 Language changed to ${language}`);
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  getAvailableLanguages(): LanguageConfig[] {
    return Object.values(SUPPORTED_LANGUAGES);
  }

  getLanguageConfig(language?: SupportedLanguage): LanguageConfig {
    return SUPPORTED_LANGUAGES[language || this.currentLanguage];
  }

  // ==========================================
  // PLURALISATION
  // ==========================================

  plural(key: string, count: number, params?: Record<string, string | number>): string {
    const pluralRules = new Intl.PluralRules(this.currentLanguage);
    const rule = pluralRules.select(count);
    
    // Essayer la forme plurielle spécifique
    const pluralKey = `${key}.${rule}`;
    let translation = this.getTranslation(pluralKey);
    
    // Fallback vers la forme de base
    if (!translation || translation === pluralKey) {
      translation = this.getTranslation(key);
    }

    return this.t(translation, { ...params, count });
  }

  // ==========================================
  // UTILITAIRES
  // ==========================================

  isRTL(): boolean {
    return SUPPORTED_LANGUAGES[this.currentLanguage].rtl;
  }

  getDirection(): 'ltr' | 'rtl' {
    return this.isRTL() ? 'rtl' : 'ltr';
  }

  preloadLanguage(language: SupportedLanguage): Promise<void> {
    return this.loadTranslations(language);
  }

  clearCache(): void {
    this.translations.clear();
    this.loadingPromises.clear();
    logger.info('i18n', '🌍 Translation cache cleared');
  }
}

// ==========================================
// INSTANCE GLOBALE
// ==========================================

export const i18n = new I18nManager();

// Helpers pour usage facile
export const t = (key: string, params?: Record<string, string | number>) => i18n.t(key, params);
export const plural = (key: string, count: number, params?: Record<string, string | number>) => i18n.plural(key, count, params);
export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => i18n.formatDate(date, options);
export const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => i18n.formatNumber(number, options);
export const formatCurrency = (amount: number, currency?: string) => i18n.formatCurrency(amount, currency);
export const changeLanguage = (language: SupportedLanguage) => i18n.changeLanguage(language);
export const getCurrentLanguage = () => i18n.getCurrentLanguage();
export const getAvailableLanguages = () => i18n.getAvailableLanguages();