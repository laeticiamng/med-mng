// ==========================================
// MED-MNG PREMIUM CONFIGURATION
// Architecture centralisée pour plateforme de niveau mondial
// ==========================================

export interface APIConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  rateLimiting: {
    maxRequests: number;
    windowMs: number;
  };
}

export interface PerformanceConfig {
  cacheStrategy: 'memory' | 'localStorage' | 'indexedDB';
  cacheTTL: number;
  preloadStrategy: 'eager' | 'lazy' | 'viewport';
  imageOptimization: boolean;
  bundleCompression: boolean;
}

export interface AccessibilityConfig {
  wcagLevel: 'AA' | 'AAA';
  screenReaderSupport: boolean;
  keyboardNavigation: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  voiceCommands: boolean;
}

export interface MedicalConfig {
  specialties: string[];
  difficultyLevels: string[];
  learningObjectives: string[];
  assessmentTypes: string[];
}

export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  version: string;
  
  // API Configuration
  apis: {
    suno: APIConfig & { 
      models: string[];
      maxDuration: number;
      supportedFormats: string[];
    };
    openai: APIConfig & {
      models: string[];
      maxTokens: number;
      temperature: number;
    };
    elevenlabs: APIConfig & {
      voices: string[];
      maxCharacters: number;
      supportedLanguages: string[];
    };
  };
  
  // Performance & Caching
  performance: PerformanceConfig;
  
  // Accessibility
  accessibility: AccessibilityConfig;
  
  // Medical Platform Specific
  medical: MedicalConfig;
  
  // Features
  features: {
    realTimeSync: boolean;
    offlineMode: boolean;
    progressTracking: boolean;
    socialLearning: boolean;
    adaptiveLearning: boolean;
    gamification: boolean;
  };
  
  // Analytics & Monitoring
  monitoring: {
    performanceTracking: boolean;
    errorReporting: boolean;
    userAnalytics: boolean;
    webVitals: boolean;
  };
}

// Configuration par environnement
const configs: Record<string, AppConfig> = {
  development: {
    environment: 'development',
    version: '2.0.0-dev',
    
    apis: {
      suno: {
        baseURL: 'https://api.suno.ai/v1',
        timeout: 60000,
        retryAttempts: 3,
        rateLimiting: { maxRequests: 10, windowMs: 60000 },
        models: ['chirp-v3-5', 'chirp-v3-0'],
        maxDuration: 240,
        supportedFormats: ['mp3', 'wav', 'flac']
      },
      openai: {
        baseURL: 'https://api.openai.com/v1',
        timeout: 30000,
        retryAttempts: 2,
        rateLimiting: { maxRequests: 60, windowMs: 60000 },
        models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
        maxTokens: 4096,
        temperature: 0.7
      },
      elevenlabs: {
        baseURL: 'https://api.elevenlabs.io/v1',
        timeout: 30000,
        retryAttempts: 2,
        rateLimiting: { maxRequests: 100, windowMs: 60000 },
        voices: ['Aria', 'Roger', 'Sarah', 'Laura'],
        maxCharacters: 5000,
        supportedLanguages: ['en', 'fr', 'es', 'de']
      }
    },
    
    performance: {
      cacheStrategy: 'memory',
      cacheTTL: 300000, // 5 minutes
      preloadStrategy: 'viewport',
      imageOptimization: true,
      bundleCompression: false
    },
    
    accessibility: {
      wcagLevel: 'AAA',
      screenReaderSupport: true,
      keyboardNavigation: true,
      highContrast: true,
      reducedMotion: true,
      voiceCommands: false
    },
    
    medical: {
      specialties: ['Cardiologie', 'Neurologie', 'Pneumologie', 'Endocrinologie'],
      difficultyLevels: ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'],
      learningObjectives: ['Mémorisation', 'Compréhension', 'Application', 'Analyse'],
      assessmentTypes: ['QCM', 'Cas cliniques', 'Simulations', 'Examens oraux']
    },
    
    features: {
      realTimeSync: false,
      offlineMode: true,
      progressTracking: true,
      socialLearning: false,
      adaptiveLearning: true,
      gamification: true
    },
    
    monitoring: {
      performanceTracking: true,
      errorReporting: true,
      userAnalytics: false,
      webVitals: true
    }
  },
  
  production: {
    environment: 'production',
    version: '2.0.0',
    
    apis: {
      suno: {
        baseURL: 'https://api.suno.ai/v1',
        timeout: 90000,
        retryAttempts: 5,
        rateLimiting: { maxRequests: 50, windowMs: 60000 },
        models: ['chirp-v3-5', 'chirp-v3-0'],
        maxDuration: 300,
        supportedFormats: ['mp3', 'wav', 'flac', 'aac']
      },
      openai: {
        baseURL: 'https://api.openai.com/v1',
        timeout: 45000,
        retryAttempts: 3,
        rateLimiting: { maxRequests: 200, windowMs: 60000 },
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
        maxTokens: 8192,
        temperature: 0.7
      },
      elevenlabs: {
        baseURL: 'https://api.elevenlabs.io/v1',
        timeout: 45000,
        retryAttempts: 3,
        rateLimiting: { maxRequests: 500, windowMs: 60000 },
        voices: ['Aria', 'Roger', 'Sarah', 'Laura', 'Charlie', 'George'],
        maxCharacters: 10000,
        supportedLanguages: ['en', 'fr', 'es', 'de', 'it', 'pt']
      }
    },
    
    performance: {
      cacheStrategy: 'indexedDB',
      cacheTTL: 900000, // 15 minutes
      preloadStrategy: 'lazy',
      imageOptimization: true,
      bundleCompression: true
    },
    
    accessibility: {
      wcagLevel: 'AAA',
      screenReaderSupport: true,
      keyboardNavigation: true,
      highContrast: true,
      reducedMotion: true,
      voiceCommands: true
    },
    
    medical: {
      specialties: [
        'Cardiologie', 'Neurologie', 'Pneumologie', 'Endocrinologie',
        'Gastroentérologie', 'Néphrologie', 'Rhumatologie', 'Dermatologie',
        'Hématologie', 'Oncologie', 'Psychiatrie', 'Pédiatrie'
      ],
      difficultyLevels: ['Débutant', 'Intermédiaire', 'Avancé', 'Expert', 'Recherche'],
      learningObjectives: [
        'Mémorisation', 'Compréhension', 'Application', 'Analyse', 
        'Synthèse', 'Évaluation', 'Création'
      ],
      assessmentTypes: [
        'QCM', 'Cas cliniques', 'Simulations', 'Examens oraux',
        'Analyses de dossiers', 'Examens pratiques'
      ]
    },
    
    features: {
      realTimeSync: true,
      offlineMode: true,
      progressTracking: true,
      socialLearning: true,
      adaptiveLearning: true,
      gamification: true
    },
    
    monitoring: {
      performanceTracking: true,
      errorReporting: true,
      userAnalytics: true,
      webVitals: true
    }
  }
};

// Configuration active basée sur l'environnement
const getCurrentEnvironment = (): string => {
  return import.meta.env.MODE || 'development';
};

export const appConfig: AppConfig = configs[getCurrentEnvironment()];

// Utilitaires de configuration
export const isProduction = () => appConfig.environment === 'production';
export const isDevelopment = () => appConfig.environment === 'development';
export const getAPIConfig = (service: 'suno' | 'openai' | 'elevenlabs') => appConfig.apis[service];
export const getPerformanceConfig = () => appConfig.performance;
export const getAccessibilityConfig = () => appConfig.accessibility;
export const getMedicalConfig = () => appConfig.medical;

// Configuration de la PWA
export const pwaConfig = {
  name: 'MED-MNG - Formation Médicale par la Musique',
  shortName: 'MED-MNG',
  description: 'Plateforme premium d\'apprentissage médical par la musique générée par IA',
  themeColor: '#1e40af',
  backgroundColor: '#ffffff',
  display: 'standalone',
  orientation: 'portrait',
  scope: '/',
  startUrl: '/',
  icons: [
    { src: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
    { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
    { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
    { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
    { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
    { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
  ]
};

export default appConfig;