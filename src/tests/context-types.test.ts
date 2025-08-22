/**
 * Tests de compilation TypeScript pour les types des contextes
 * Ce fichier vérifie que tous les types sont correctement définis et utilisables
 */

import { describe, it, expect } from 'vitest';
import type { 
  APIError, 
  NetworkError, 
  AuthError, 
  ErrorHandler 
} from '@/types/error';
import type { 
  AudioError, 
  AudioErrorEvent, 
  AudioMetrics 
} from '@/types/audio';
import type { 
  Language, 
  TranslationValue, 
  TranslationParams,
  TranslationFunction 
} from '@/types/translation';
import type { 
  NotificationType, 
  GenerationNotificationData, 
  PlaylistNotificationData, 
  StreamingNotificationData,
  QuotaNotificationData 
} from '@/types/notification';

describe('Context Types Compilation', () => {
  it('should compile error types correctly', () => {
    // Test APIError type
    const apiError: APIError = {
      error: 'VALIDATION_ERROR',
      code: 400,
      message: 'Invalid input',
      details: {
        field: 'email',
        validation: [{
          field: 'email',
          message: 'Invalid format',
          code: 'INVALID_FORMAT',
          value: 'test@'
        }]
      }
    };

    // Test NetworkError type
    const networkError: NetworkError = {
      type: 'network',
      message: 'Connection failed',
      status: 0,
      url: 'https://api.example.com',
      timestamp: new Date().toISOString()
    };

    // Test AuthError type
    const authError: AuthError = {
      type: 'expired',
      message: 'Session expired',
      code: 'SESSION_EXPIRED',
      redirectUrl: '/login',
      timestamp: new Date().toISOString()
    };

    // Test ErrorHandler function type
    const errorHandler: ErrorHandler = (error, context) => {
      console.log('Handling error:', error, 'in context:', context);
    };

    expect(apiError.code).toBe(400);
    expect(networkError.type).toBe('network');
    expect(authError.type).toBe('expired');
    expect(typeof errorHandler).toBe('function');
  });

  it('should compile audio types correctly', () => {
    // Test AudioError type
    const audioError: AudioError = {
      code: 1,
      message: 'Network error',
      type: 'MEDIA_ERR_NETWORK',
      url: 'https://example.com/audio.mp3',
      timestamp: new Date().toISOString()
    };

    // Test AudioMetrics type
    const audioMetrics: AudioMetrics = {
      loadStartTime: 100,
      metadataLoadTime: 200,
      canPlayTime: 300,
      playStartTime: 400,
      totalLoadTime: 500,
      bufferHealthScore: 85,
      errors: ['Network timeout'],
      url: 'https://example.com/audio.mp3',
      timestamp: new Date().toISOString()
    };

    expect(audioError.type).toBe('MEDIA_ERR_NETWORK');
    expect(audioMetrics.bufferHealthScore).toBe(85);
  });

  it('should compile translation types correctly', () => {
    // Test Language type
    const language: Language = 'fr';
    
    // Test TranslationValue type
    const translations: TranslationValue = {
      common: {
        loading: 'Chargement...',
        save: 'Sauvegarder'
      },
      navigation: {
        home: 'Accueil',
        profile: 'Profil'
      }
    };

    // Test TranslationParams type
    const params: TranslationParams = {
      name: 'John',
      count: 5,
      active: true
    };

    // Test TranslationFunction type
    const t: TranslationFunction = (key, options) => {
      return key; // Simple implementation for test
    };

    expect(language).toBe('fr');
    expect(translations.common).toBeDefined();
    expect(params.name).toBe('John');
    expect(typeof t).toBe('function');
  });

  it('should compile notification types correctly', () => {
    // Test NotificationType
    const notificationType: NotificationType = 'success';

    // Test GenerationNotificationData
    const generationData: GenerationNotificationData = {
      type: 'music',
      itemId: 'item-123',
      itemTitle: 'Test Song',
      progress: 75,
      estimatedTime: 30,
      message: 'Generating music...',
      onView: () => console.log('View clicked'),
      onCancel: () => console.log('Cancel clicked')
    };

    // Test PlaylistNotificationData
    const playlistData: PlaylistNotificationData = {
      playlistId: 'playlist-123',
      playlistName: 'My Playlist',
      trackId: 'track-456',
      trackTitle: 'Test Track',
      trackCount: 10,
      onView: () => console.log('View playlist'),
      onUndo: () => console.log('Undo action')
    };

    // Test StreamingNotificationData
    const streamingData: StreamingNotificationData = {
      trackId: 'track-789',
      trackTitle: 'Streaming Track',
      trackUrl: 'https://example.com/track.mp3',
      duration: 180,
      currentTime: 45,
      quality: 'high',
      error: {
        code: 'NETWORK_ERROR',
        message: 'Connection lost',
        retry: () => console.log('Retry streaming')
      }
    };

    // Test QuotaNotificationData
    const quotaData: QuotaNotificationData = {
      remaining: 10,
      total: 100,
      resetDate: new Date(),
      planType: 'premium',
      upgradeUrl: '/upgrade'
    };

    expect(notificationType).toBe('success');
    expect(generationData.type).toBe('music');
    expect(playlistData.trackCount).toBe(10);
    expect(streamingData.quality).toBe('high');
    expect(quotaData.remaining).toBe(10);
  });

  it('should handle union types correctly', () => {
    // Test que les types union fonctionnent
    const errors: (APIError | NetworkError | AuthError)[] = [
      {
        error: 'API_ERROR',
        code: 500,
        message: 'Server error'
      },
      {
        type: 'timeout',
        message: 'Request timeout',
        timestamp: new Date().toISOString()
      },
      {
        type: 'invalid',
        message: 'Invalid credentials',
        timestamp: new Date().toISOString()
      }
    ];

    expect(errors).toHaveLength(3);
    expect('error' in errors[0]).toBe(true);
    expect('type' in errors[1]).toBe(true);
    expect('type' in errors[2]).toBe(true);
  });

  it('should support optional properties correctly', () => {
    // Test des propriétés optionnelles
    const minimalApiError: APIError = {
      error: 'SIMPLE_ERROR',
      code: 400,
      message: 'Basic error'
      // details est optionnel
    };

    const minimalGenerationData: GenerationNotificationData = {
      type: 'quiz'
      // Toutes les autres propriétés sont optionnelles
    };

    expect(minimalApiError.details).toBeUndefined();
    expect(minimalGenerationData.itemId).toBeUndefined();
  });

  it('should support generic function signatures', () => {
    // Test des signatures de fonctions génériques
    const mockErrorHandler: ErrorHandler = (
      error,
      context
    ) => {
      console.log(`Handling ${context || 'unknown'} error:`, error);
    };

    // Doit pouvoir accepter différents types d'erreurs
    mockErrorHandler({
      error: 'TEST_ERROR',
      code: 400,
      message: 'Test'
    }, 'api_call');

    mockErrorHandler({
      type: 'network',
      message: 'Network issue',
      timestamp: new Date().toISOString()
    }, 'network');

    expect(typeof mockErrorHandler).toBe('function');
  });
});