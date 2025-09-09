/**
 * Constantes globales de l'application
 */

// Routes principales
export const ROUTES = {
  HOME: '/',
  PLATFORM: '/platform',
  GENERATOR: '/generator',
  EDN: '/edn',
  ECOS: '/ecos',
  DASHBOARD: '/dashboard',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  ADMIN: '/admin',
  
  // MED-MNG specific
  MED_MNG: {
    LOGIN: '/med-mng/login',
    SIGNUP: '/med-mng/signup',
    DASHBOARD: '/med-mng/dashboard',
    CREATE: '/med-mng/create',
    LIBRARY: '/med-mng/library',
    PLAYER: '/med-mng/player',
    PLAYLISTS: '/med-mng/playlists',
    ANALYTICS: '/med-mng/analytics',
    SETTINGS: '/med-mng/settings'
  }
} as const;

// Status et états
export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

export const GENERATION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

export const CONTENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
} as const;

// Rôles utilisateur
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  TRIAL: 'trial',
  EXPIRED: 'expired'
} as const;

// Messages et labels
export const MESSAGES = {
  LOADING: 'Chargement en cours...',
  ERROR_GENERIC: 'Une erreur est survenue',
  ERROR_NETWORK: 'Erreur de connexion réseau',
  ERROR_TIMEOUT: 'Délai d\'attente dépassé',
  SUCCESS_SAVE: 'Sauvegarde réussie',
  SUCCESS_DELETE: 'Suppression réussie',
  CONFIRM_DELETE: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
  NO_DATA: 'Aucune donnée disponible',
  UNAUTHORIZED: 'Accès non autorisé',
  VALIDATION_REQUIRED: 'Ce champ est obligatoire'
} as const;

// Breakpoints responsive
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
  LARGE: 1536
} as const;

// Animations
export const ANIMATIONS = {
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    EASE_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const;

// Formats supportés
export const SUPPORTED_FORMATS = {
  AUDIO: ['mp3', 'wav', 'ogg', 'm4a', 'flac'],
  IMAGE: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
  VIDEO: ['mp4', 'webm', 'ogg'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'txt']
} as const;

// Genres musicaux
export const MUSIC_GENRES = [
  'ambient',
  'classical',
  'electronic',
  'jazz',
  'meditation',
  'nature',
  'binaural',
  'healing',
  'therapeutic'
] as const;

// Styles de génération
export const GENERATION_STYLES = [
  'medical_focused',
  'educational',
  'relaxing',
  'energizing',
  'concentration',
  'memory_aid'
] as const;

// Durées standards
export const DURATIONS = {
  SHORT: 30,
  MEDIUM: 60,
  LONG: 120,
  EXTENDED: 300
} as const;

// Limites par défaut
export const LIMITS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_SEARCH_RESULTS: 100,
  MAX_PLAYLIST_ITEMS: 1000,
  DEFAULT_PAGE_SIZE: 20,
  MAX_CONCURRENT_GENERATIONS: 3
} as const;

// Clés localStorage
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'med_mng_user_preferences',
  AUTH_TOKEN: 'med_mng_auth_token',
  THEME: 'med_mng_theme',
  LANGUAGE: 'med_mng_language',
  VOLUME: 'med_mng_volume',
  PLAYBACK_STATE: 'med_mng_playback_state'
} as const;

// Types pour les constantes
export type RouteKey = keyof typeof ROUTES;
export type StatusType = typeof STATUS[keyof typeof STATUS];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type MusicGenre = typeof MUSIC_GENRES[number];
export type GenerationStyle = typeof GENERATION_STYLES[number];