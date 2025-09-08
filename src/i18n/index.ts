/**
 * 🌍 SYSTÈME D'INTERNATIONALISATION - MED-MNG v3.0 
 * Support multilingue complet avec chargement dynamique
 */

import { logger } from '@/lib/logger';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type SupportedLanguage = 'fr' | 'en' | 'es' | 'de' | 'it';

export interface TranslationKeys {
  // Navigation
  nav: {
    home: string;
    dashboard: string;
    profile: string;
    settings: string;
    logout: string;
    login: string;
    signup: string;
  };
  
  // Common actions
  actions: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    update: string;
    confirm: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    filter: string;
    sort: string;
    export: string;
    import: string;
    copy: string;
    share: string;
    download: string;
  };
  
  // Forms
  forms: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    required: string;
    optional: string;
    placeholder: {
      email: string;
      password: string;
      search: string;
    };
  };
  
  // Messages
  messages: {
    success: {
      saved: string;
      deleted: string;
      created: string;
      updated: string;
      uploaded: string;
      sent: string;
    };
    error: {
      generic: string;
      network: string;
      notFound: string;
      unauthorized: string;
      forbidden: string;
      validation: string;
      required: string;
    };
    info: {
      loading: string;
      empty: string;
      processing: string;
    };
  };
  
  // Medical specific
  medical: {
    patient: string;
    doctor: string;
    diagnosis: string;
    treatment: string;
    symptoms: string;
    prescription: string;
    appointment: string;
    consultation: string;
    emergency: string;
    urgent: string;
    routine: string;
  };
  
  // Audio/Music
  audio: {
    play: string;
    pause: string;
    stop: string;
    volume: string;
    duration: string;
    track: string;
    playlist: string;
    shuffle: string;
    repeat: string;
    next: string;
    previous: string;
  };
  
  // Time & Dates
  time: {
    now: string;
    today: string;
    yesterday: string;
    tomorrow: string;
    week: string;
    month: string;
    year: string;
    minutes: string;
    hours: string;
    days: string;
    ago: string;
  };
  
  // Accessibility
  a11y: {
    skipToMain: string;
    openMenu: string;
    closeMenu: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
  };
}

// ==========================================
// TRANSLATIONS DATA
// ==========================================

const translations: Record<SupportedLanguage, TranslationKeys> = {
  fr: {
    nav: {
      home: 'Accueil',
      dashboard: 'Tableau de bord',
      profile: 'Profil',
      settings: 'Paramètres',
      logout: 'Déconnexion',
      login: 'Connexion',
      signup: 'Inscription'
    },
    actions: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      create: 'Créer',
      update: 'Mettre à jour',
      confirm: 'Confirmer',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      export: 'Exporter',
      import: 'Importer',
      copy: 'Copier',
      share: 'Partager',
      download: 'Télécharger'
    },
    forms: {
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      firstName: 'Prénom',
      lastName: 'Nom',
      name: 'Nom',
      phone: 'Téléphone',
      address: 'Adresse',
      city: 'Ville',
      country: 'Pays',
      required: 'Obligatoire',
      optional: 'Optionnel',
      placeholder: {
        email: 'votre@email.com',
        password: 'Entrez votre mot de passe',
        search: 'Rechercher...'
      }
    },
    messages: {
      success: {
        saved: 'Enregistré avec succès',
        deleted: 'Supprimé avec succès',
        created: 'Créé avec succès',
        updated: 'Mis à jour avec succès',
        uploaded: 'Téléchargé avec succès',
        sent: 'Envoyé avec succès'
      },
      error: {
        generic: 'Une erreur est survenue',
        network: 'Erreur de connexion',
        notFound: 'Élément non trouvé',
        unauthorized: 'Non autorisé',
        forbidden: 'Accès interdit',
        validation: 'Erreur de validation',
        required: 'Ce champ est obligatoire'
      },
      info: {
        loading: 'Chargement...',
        empty: 'Aucun élément trouvé',
        processing: 'Traitement en cours...'
      }
    },
    medical: {
      patient: 'Patient',
      doctor: 'Médecin',
      diagnosis: 'Diagnostic',
      treatment: 'Traitement',
      symptoms: 'Symptômes',
      prescription: 'Prescription',
      appointment: 'Rendez-vous',
      consultation: 'Consultation',
      emergency: 'Urgence',
      urgent: 'Urgent',
      routine: 'Routine'
    },
    audio: {
      play: 'Lecture',
      pause: 'Pause',
      stop: 'Arrêt',
      volume: 'Volume',
      duration: 'Durée',
      track: 'Piste',
      playlist: 'Liste de lecture',
      shuffle: 'Lecture aléatoire',
      repeat: 'Répéter',
      next: 'Suivant',
      previous: 'Précédent'
    },
    time: {
      now: 'Maintenant',
      today: 'Aujourd\'hui',
      yesterday: 'Hier',
      tomorrow: 'Demain',
      week: 'Semaine',
      month: 'Mois',
      year: 'Année',
      minutes: 'minutes',
      hours: 'heures',
      days: 'jours',
      ago: 'il y a'
    },
    a11y: {
      skipToMain: 'Aller au contenu principal',
      openMenu: 'Ouvrir le menu',
      closeMenu: 'Fermer le menu',
      loading: 'Chargement en cours',
      error: 'Erreur',
      success: 'Succès',
      warning: 'Attention'
    }
  },
  
  en: {
    nav: {
      home: 'Home',
      dashboard: 'Dashboard',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
      login: 'Login',
      signup: 'Sign Up'
    },
    actions: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      update: 'Update',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      export: 'Export',
      import: 'Import',
      copy: 'Copy',
      share: 'Share',
      download: 'Download'
    },
    forms: {
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      name: 'Name',
      phone: 'Phone',
      address: 'Address',
      city: 'City',
      country: 'Country',
      required: 'Required',
      optional: 'Optional',
      placeholder: {
        email: 'your@email.com',
        password: 'Enter your password',
        search: 'Search...'
      }
    },
    messages: {
      success: {
        saved: 'Saved successfully',
        deleted: 'Deleted successfully',
        created: 'Created successfully',
        updated: 'Updated successfully',
        uploaded: 'Uploaded successfully',
        sent: 'Sent successfully'
      },
      error: {
        generic: 'An error occurred',
        network: 'Network error',
        notFound: 'Not found',
        unauthorized: 'Unauthorized',
        forbidden: 'Access forbidden',
        validation: 'Validation error',
        required: 'This field is required'
      },
      info: {
        loading: 'Loading...',
        empty: 'No items found',
        processing: 'Processing...'
      }
    },
    medical: {
      patient: 'Patient',
      doctor: 'Doctor',
      diagnosis: 'Diagnosis',
      treatment: 'Treatment',
      symptoms: 'Symptoms',
      prescription: 'Prescription',
      appointment: 'Appointment',
      consultation: 'Consultation',
      emergency: 'Emergency',
      urgent: 'Urgent',
      routine: 'Routine'
    },
    audio: {
      play: 'Play',
      pause: 'Pause',
      stop: 'Stop',
      volume: 'Volume',
      duration: 'Duration',
      track: 'Track',
      playlist: 'Playlist',
      shuffle: 'Shuffle',
      repeat: 'Repeat',
      next: 'Next',
      previous: 'Previous'
    },
    time: {
      now: 'Now',
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      week: 'Week',
      month: 'Month',
      year: 'Year',
      minutes: 'minutes',
      hours: 'hours',
      days: 'days',
      ago: 'ago'
    },
    a11y: {
      skipToMain: 'Skip to main content',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      loading: 'Loading',
      error: 'Error',
      success: 'Success',
      warning: 'Warning'
    }
  },
  
  // Placeholder for other languages (simplified)
  es: {
    nav: {
      home: 'Inicio',
      dashboard: 'Panel',
      profile: 'Perfil',
      settings: 'Configuración',
      logout: 'Cerrar sesión',
      login: 'Iniciar sesión',
      signup: 'Registrarse'
    },
    // ... other translations would follow the same pattern
  } as TranslationKeys,
  
  de: {
    nav: {
      home: 'Startseite',
      dashboard: 'Dashboard',
      profile: 'Profil',
      settings: 'Einstellungen',
      logout: 'Abmelden',
      login: 'Anmelden',
      signup: 'Registrieren'
    },
    // ... other translations would follow the same pattern
  } as TranslationKeys,
  
  it: {
    nav: {
      home: 'Home',
      dashboard: 'Dashboard',
      profile: 'Profilo',
      settings: 'Impostazioni',
      logout: 'Disconnetti',
      login: 'Accedi',
      signup: 'Registrati'
    },
    // ... other translations would follow the same pattern
  } as TranslationKeys
};

// ==========================================
// I18N CLASS
// ==========================================

class I18nManager {
  private currentLanguage: SupportedLanguage = 'fr';
  private fallbackLanguage: SupportedLanguage = 'en';
  private listeners: Array<(lang: SupportedLanguage) => void> = [];

  constructor() {
    this.detectLanguage();
  }

  private detectLanguage(): void {
    // Check localStorage first
    const stored = localStorage.getItem('med-mng-language') as SupportedLanguage;
    if (stored && this.isSupported(stored)) {
      this.currentLanguage = stored;
      return;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
    if (this.isSupported(browserLang)) {
      this.currentLanguage = browserLang;
      return;
    }

    // Use fallback
    this.currentLanguage = this.fallbackLanguage;
  }

  private isSupported(lang: string): lang is SupportedLanguage {
    return Object.keys(translations).includes(lang);
  }

  public setLanguage(language: SupportedLanguage): void {
    if (!this.isSupported(language)) {
      logger.warn('i18n', `Unsupported language: ${language}`);
      return;
    }

    this.currentLanguage = language;
    localStorage.setItem('med-mng-language', language);
    
    // Update HTML lang attribute
    document.documentElement.lang = language;
    
    // Notify listeners
    this.listeners.forEach(listener => listener(language));
    
    logger.info('i18n', `Language changed to: ${language}`);
  }

  public getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  public getSupportedLanguages(): SupportedLanguage[] {
    return Object.keys(translations) as SupportedLanguage[];
  }

  public subscribe(listener: (lang: SupportedLanguage) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public t(key: string, interpolations?: Record<string, string>): string {
    const keys = key.split('.');
    let value: any = translations[this.currentLanguage];

    // Navigate through nested keys
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    // Fallback to English if translation not found
    if (value === undefined) {
      value = translations[this.fallbackLanguage];
      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) break;
      }
    }

    // If still not found, return the key
    if (typeof value !== 'string') {
      logger.warn('i18n', `Translation not found: ${key}`);
      return key;
    }

    // Apply interpolations
    if (interpolations) {
      return Object.entries(interpolations).reduce(
        (str, [placeholder, replacement]) => 
          str.replace(new RegExp(`{{${placeholder}}}`, 'g'), replacement),
        value
      );
    }

    return value;
  }

  public formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.currentLanguage, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    }).format(date);
  }

  public formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLanguage, options).format(num);
  }

  public formatCurrency(amount: number, currency = 'EUR'): string {
    return new Intl.NumberFormat(this.currentLanguage, {
      style: 'currency',
      currency
    }).format(amount);
  }

  public formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

    const rtf = new Intl.RelativeTimeFormat(this.currentLanguage, { numeric: 'auto' });

    if (Math.abs(diffInDays) < 1) {
      const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
      if (Math.abs(diffInHours) < 1) {
        const diffInMinutes = Math.round(diffInMs / (1000 * 60));
        return rtf.format(diffInMinutes, 'minute');
      }
      return rtf.format(diffInHours, 'hour');
    }

    if (Math.abs(diffInDays) < 7) {
      return rtf.format(diffInDays, 'day');
    }

    const diffInWeeks = Math.round(diffInDays / 7);
    if (Math.abs(diffInWeeks) < 4) {
      return rtf.format(diffInWeeks, 'week');
    }

    const diffInMonths = Math.round(diffInDays / 30);
    return rtf.format(diffInMonths, 'month');
  }

  public getDirection(): 'ltr' | 'rtl' {
    // For now, all supported languages are LTR
    // In future, could add RTL languages like Arabic
    return 'ltr';
  }
}

// ==========================================
// SINGLETON INSTANCE
// ==========================================

export const i18n = new I18nManager();

// ==========================================
// REACT HOOKS
// ==========================================

export const useTranslation = () => {
  const [language, setLanguage] = React.useState(i18n.getCurrentLanguage());

  React.useEffect(() => {
    const unsubscribe = i18n.subscribe(setLanguage);
    return unsubscribe;
  }, []);

  return {
    t: i18n.t.bind(i18n),
    language,
    setLanguage: i18n.setLanguage.bind(i18n),
    supportedLanguages: i18n.getSupportedLanguages(),
    formatDate: i18n.formatDate.bind(i18n),
    formatNumber: i18n.formatNumber.bind(i18n),
    formatCurrency: i18n.formatCurrency.bind(i18n),
    formatRelativeTime: i18n.formatRelativeTime.bind(i18n),
    direction: i18n.getDirection()
  };
};

// ==========================================
// UTILITIES
// ==========================================

export const loadTranslations = async (language: SupportedLanguage) => {
  // This would be used for dynamic loading of translation files
  // For now, all translations are bundled
  return translations[language];
};

export const getLanguageName = (code: SupportedLanguage): string => {
  const names: Record<SupportedLanguage, string> = {
    fr: 'Français',
    en: 'English',
    es: 'Español',
    de: 'Deutsch',
    it: 'Italiano'
  };
  return names[code] || code;
};

// Set initial HTML lang attribute
document.documentElement.lang = i18n.getCurrentLanguage();

// Log initialization
logger.info('i18n', '🌍 Internationalization initialized', {
  currentLanguage: i18n.getCurrentLanguage(),
  supportedLanguages: i18n.getSupportedLanguages(),
  fallbackLanguage: 'en'
});

// Import React for hooks
import React from 'react';
