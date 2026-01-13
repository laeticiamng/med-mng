// Contexts Central Index

// Error Context
export { ErrorProvider, useErrorHandler } from './ErrorContext';

// Global Audio Context
export { GlobalAudioProvider, useGlobalAudio } from './GlobalAudioContext';

// Internationalization Context
export { 
  InternationalizationProvider, 
  useInternationalization, 
  type Language as IntlLanguage,
  type TranslationData 
} from './InternationalizationContext';

// Language Context
export { 
  LanguageProvider, 
  useLanguage, 
  LANGUAGES,
  SUPPORTED_LANGUAGES,
  type Language, 
  type SupportedLanguage,
  type LanguageInfo 
} from './LanguageContext';

// Notification Context
export { NotificationProvider, useNotifications as useNotificationContext } from './NotificationContext';

// Performance Context
export { PerformanceProvider, usePerformance } from './PerformanceContext';

// Player Context
export { PlayerProvider, usePlayerContext } from './PlayerContext';
