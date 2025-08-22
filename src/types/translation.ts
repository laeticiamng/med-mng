/**
 * Langues supportées par l'application
 */
export type Language = 'fr' | 'en' | 'es' | 'it' | 'zh' | 'ja';

/**
 * Structure d'une traduction avec support des paramètres
 */
export interface TranslationValue {
  [key: string]: string | TranslationValue;
}

/**
 * Structure complète des traductions pour une langue
 */
export interface Translations {
  common: CommonTranslations;
  navigation: NavigationTranslations;
  forms: FormTranslations;
  errors: ErrorTranslations;
  medical: MedicalTranslations;
  audio: AudioTranslations;
  quiz: QuizTranslations;
  notifications: NotificationTranslations;
}

/**
 * Traductions communes
 */
export interface CommonTranslations {
  loading: string;
  save: string;
  cancel: string;
  continue: string;
  back: string;
  next: string;
  previous: string;
  close: string;
  open: string;
  edit: string;
  delete: string;
  confirm: string;
  yes: string;
  no: string;
  ok: string;
  search: string;
  filter: string;
  sort: string;
  refresh: string;
  retry: string;
  settings: string;
  help: string;
  about: string;
  contact: string;
  privacy: string;
  terms: string;
  [key: string]: string;
}

/**
 * Traductions de navigation
 */
export interface NavigationTranslations {
  home: string;
  dashboard: string;
  profile: string;
  library: string;
  favorites: string;
  history: string;
  playlists: string;
  logout: string;
  [key: string]: string;
}

/**
 * Traductions de formulaires
 */
export interface FormTranslations {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  username: string;
  required: string;
  invalid: string;
  tooShort: string;
  tooLong: string;
  emailFormat: string;
  passwordMatch: string;
  [key: string]: string;
}

/**
 * Traductions d'erreurs
 */
export interface ErrorTranslations {
  networkError: string;
  serverError: string;
  notFound: string;
  unauthorized: string;
  forbidden: string;
  validationError: string;
  unknownError: string;
  sessionExpired: string;
  quotaExceeded: string;
  [key: string]: string;
}

/**
 * Traductions médicales
 */
export interface MedicalTranslations {
  diagnosis: string;
  treatment: string;
  symptoms: string;
  medication: string;
  examination: string;
  patient: string;
  doctor: string;
  appointment: string;
  prescription: string;
  laboratory: string;
  [key: string]: string;
}

/**
 * Traductions audio
 */
export interface AudioTranslations {
  play: string;
  pause: string;
  stop: string;
  volume: string;
  mute: string;
  unmute: string;
  duration: string;
  currentTime: string;
  loading: string;
  error: string;
  quality: string;
  [key: string]: string;
}

/**
 * Traductions de quiz
 */
export interface QuizTranslations {
  question: string;
  answer: string;
  correct: string;
  incorrect: string;
  score: string;
  result: string;
  explanation: string;
  nextQuestion: string;
  previousQuestion: string;
  finish: string;
  restart: string;
  [key: string]: string;
}

/**
 * Traductions de notifications
 */
export interface NotificationTranslations {
  success: string;
  error: string;
  warning: string;
  info: string;
  dismiss: string;
  viewMore: string;
  retry: string;
  undo: string;
  [key: string]: string;
}

/**
 * Paramètres pour l'interpolation de traductions
 */
export interface TranslationParams {
  [key: string]: string | number | boolean;
}

/**
 * Options de traduction
 */
export interface TranslationOptions {
  fallback?: string;
  params?: TranslationParams;
  defaultValue?: string;
  interpolation?: boolean;
}

/**
 * Fonction de traduction
 */
export type TranslationFunction = (
  key: string, 
  options?: TranslationOptions
) => string;

/**
 * Configuration du service de traduction
 */
export interface TranslationServiceConfig {
  defaultLanguage: Language;
  fallbackLanguage: Language;
  interpolationPrefix: string;
  interpolationSuffix: string;
  keySeparator: string;
  nsSeparator: string;
  pluralSeparator: string;
  debug: boolean;
}

/**
 * Résultat d'une traduction automatique
 */
export interface TranslationResult {
  original: string;
  translated: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  confidence: number;
  service: 'google' | 'deepl' | 'azure' | 'mock';
  timestamp: string;
}

/**
 * Erreur de traduction
 */
export interface TranslationError {
  code: 'MISSING_KEY' | 'SERVICE_ERROR' | 'INVALID_PARAMS' | 'NETWORK_ERROR';
  message: string;
  key?: string;
  language?: Language;
  details?: unknown;
}