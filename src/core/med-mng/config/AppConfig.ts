/**
 * ⚡ MED-MNG - Configuration Centrale Premium
 * Architecture unifiée pour la plateforme d'apprentissage médical par la musique
 */

export const MED_MNG_CONFIG = {
  // 🎯 Application Core
  APP_NAME: 'MED-MNG',
  APP_VERSION: '2.0.0',
  APP_DESCRIPTION: 'Plateforme d\'apprentissage médical par la musique avec IA',
  
  // 🎵 API Integrations
  APIS: {
    SUNO: {
      BASE_URL: 'https://api.suno.ai/v1',
      MODELS: {
        BARK: 'bark',
        CHIRP: 'chirp-v3',
        DEFAULT: 'chirp-v3'
      },
      LIMITS: {
        MAX_DURATION: 240, // 4 minutes
        MAX_PROMPT_LENGTH: 200,
        RATE_LIMIT: 50 // par heure
      }
    },
    OPENAI: {
      MODELS: {
        GPT4: 'gpt-4.1-2025-04-14',
        GPT5: 'gpt-5-2025-08-07',
        TTS: 'tts-1-hd',
        DALLE: 'dall-e-3'
      },
      TTS_VOICES: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
    },
    ELEVEN_LABS: {
      MODELS: {
        MULTILINGUAL: 'eleven_multilingual_v2',
        TURBO: 'eleven_turbo_v2_5'
      },
      VOICES: {
        ARIA: '9BWtsMINqrJLrRacOk9x',
        SARAH: 'EXAVITQu4vr4xnSDxMaL',
        CHARLIE: 'IKne3meq5aSn9XLyUdCD'
      }
    }
  },

  // 🎓 Medical Learning
  MEDICAL: {
    EDN_ITEMS_TOTAL: 367,
    SPECIALTIES: [
      'Cardiologie', 'Neurologie', 'Psychiatrie', 'Pédiatrie', 
      'Gynécologie-Obstétrique', 'Cancérologie', 'Urgences'
    ],
    DIFFICULTY_LEVELS: ['Rang A', 'Rang B', 'Rang A+B'],
    QUIZ_TYPES: ['QCM', 'QROC', 'LCA', 'Immersif']
  },

  // 🎯 Performance
  PERFORMANCE: {
    CACHE_DURATION: 15 * 60 * 1000, // 15 minutes
    LAZY_LOADING_THRESHOLD: 2000, // 2s
    MAX_CONCURRENT_GENERATIONS: 3,
    AUDIO_BUFFER_SIZE: 8192
  },

  // ♿ Accessibility
  ACCESSIBILITY: {
    WCAG_LEVEL: 'AAA',
    SCREEN_READER_SUPPORT: true,
    KEYBOARD_NAVIGATION: true,
    HIGH_CONTRAST: true,
    REDUCED_MOTION: true,
    FOCUS_MANAGEMENT: true
  },

  // 🔐 Security
  SECURITY: {
    RATE_LIMITING: true,
    INPUT_VALIDATION: true,
    XSS_PROTECTION: true,
    CSRF_PROTECTION: true,
    CONTENT_SECURITY_POLICY: true
  },

  // 📊 Analytics
  ANALYTICS: {
    TRACK_USER_PROGRESS: true,
    TRACK_MUSIC_ENGAGEMENT: true,
    TRACK_LEARNING_PATTERNS: true,
    PERFORMANCE_MONITORING: true
  }
} as const;

export type MedMngConfig = typeof MED_MNG_CONFIG;