/**
 * Tests unitaires pour useMusicGenerationOrchestrator
 * Couverture: retry avec backoff, gestion états, catégorisation erreurs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMusicGenerationOrchestrator } from '@/hooks/music/useMusicGenerationOrchestrator';

// Mock du toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock Supabase
const mockSupabaseFunctionsInvoke = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => mockSupabaseFunctionsInvoke(...args)
    },
    from: () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
    })
  }
}));

// Mock useMusicPolling
const mockStartPolling = vi.fn();
const mockStopPolling = vi.fn();
const mockStopAllPolling = vi.fn();
const mockIsPolling = vi.fn().mockReturnValue(false);
const mockGetActivePollingTasks = vi.fn().mockReturnValue([]);

vi.mock('@/hooks/music/useMusicPolling', () => ({
  useMusicPolling: () => ({
    startPolling: mockStartPolling,
    stopPolling: mockStopPolling,
    stopAllPolling: mockStopAllPolling,
    isPolling: mockIsPolling,
    getActivePollingTasks: mockGetActivePollingTasks
  })
}));

// Mock useRetryWithBackoff
const mockExecuteWithRetry = vi.fn();
const mockAbortRetry = vi.fn();
vi.mock('@/hooks/useRetryWithBackoff', () => ({
  useRetryWithBackoff: () => ({
    executeWithRetry: mockExecuteWithRetry,
    isRetrying: false,
    retryCount: 0,
    abort: mockAbortRetry
  }),
  isRetryableError: (error: Error) => error.message.includes('retry')
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn().mockReturnValue(null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('useMusicGenerationOrchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Initialisation', () => {
    it('devrait initialiser avec les fonctions attendues', () => {
      const { result } = renderHook(() => useMusicGenerationOrchestrator());
      
      expect(typeof result.current.startGeneration).toBe('function');
      expect(typeof result.current.cancelGeneration).toBe('function');
      expect(typeof result.current.cancelAllGenerations).toBe('function');
      expect(typeof result.current.isRangGenerating).toBe('function');
      expect(typeof result.current.getActiveTasks).toBe('function');
    });

    it('devrait retourner aucun rang en génération initialement', () => {
      const { result } = renderHook(() => useMusicGenerationOrchestrator());
      
      expect(result.current.isRangGenerating('A')).toBe(false);
      expect(result.current.isRangGenerating('B')).toBe(false);
      expect(result.current.isRangGenerating('AB')).toBe(false);
      expect(result.current.generatingRangs).toEqual([]);
    });
  });

  describe('Démarrage de génération', () => {
    it('devrait démarrer une génération avec succès immédiat', async () => {
      const audioUrl = 'https://example.com/audio.mp3';
      mockExecuteWithRetry.mockResolvedValue({
        status: 'success',
        audioUrl
      });

      const { result } = renderHook(() => useMusicGenerationOrchestrator());
      const onProgress = vi.fn();
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const validateAndNormalizeAudioUrl = vi.fn().mockReturnValue(audioUrl);

      await act(async () => {
        await result.current.startGeneration({
          rang: 'A',
          translatedLyrics: 'Test lyrics',
          selectedStyle: 'pop',
          duration: 120,
          currentLanguage: 'fr',
          onProgress,
          onSuccess,
          onError,
          validateAndNormalizeAudioUrl
        });
      });

      expect(onSuccess).toHaveBeenCalledWith('A', audioUrl);
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringContaining('réussie') })
      );
    });

    it('devrait démarrer le polling quand taskId est retourné', async () => {
      const taskId = 'task-123';
      mockExecuteWithRetry.mockResolvedValue({
        status: 'pending',
        trackId: taskId
      });

      const { result } = renderHook(() => useMusicGenerationOrchestrator());
      const callbacks = {
        onProgress: vi.fn(),
        onSuccess: vi.fn(),
        onError: vi.fn(),
        validateAndNormalizeAudioUrl: vi.fn().mockReturnValue('url')
      };

      await act(async () => {
        await result.current.startGeneration({
          rang: 'B',
          translatedLyrics: 'Test lyrics',
          selectedStyle: 'rock',
          duration: 180,
          currentLanguage: 'en',
          ...callbacks
        });
      });

      expect(mockStartPolling).toHaveBeenCalledWith(
        expect.objectContaining({ taskId, rang: 'B' })
      );
    });

    it('devrait empêcher une génération en double pour le même rang', async () => {
      mockExecuteWithRetry.mockResolvedValue({ trackId: 'task-1' });

      const { result } = renderHook(() => useMusicGenerationOrchestrator());
      const callbacks = {
        onProgress: vi.fn(),
        onSuccess: vi.fn(),
        onError: vi.fn(),
        validateAndNormalizeAudioUrl: vi.fn()
      };

      // Première génération
      await act(async () => {
        await result.current.startGeneration({
          rang: 'A',
          translatedLyrics: 'Lyrics 1',
          selectedStyle: 'pop',
          duration: 120,
          currentLanguage: 'fr',
          ...callbacks
        });
      });

      // Tenter une deuxième génération pour le même rang
      await act(async () => {
        await result.current.startGeneration({
          rang: 'A',
          translatedLyrics: 'Lyrics 2',
          selectedStyle: 'rock',
          duration: 180,
          currentLanguage: 'fr',
          ...callbacks
        });
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ 
          title: 'Génération en cours',
          description: expect.stringContaining('Rang A')
        })
      );
    });

    it('devrait gérer l\'absence de trackId', async () => {
      mockExecuteWithRetry.mockResolvedValue({ status: 'pending' }); // Pas de trackId

      const { result } = renderHook(() => useMusicGenerationOrchestrator());
      const onError = vi.fn();

      await act(async () => {
        await result.current.startGeneration({
          rang: 'A',
          translatedLyrics: 'Test',
          selectedStyle: 'pop',
          duration: 120,
          currentLanguage: 'fr',
          onProgress: vi.fn(),
          onSuccess: vi.fn(),
          onError,
          validateAndNormalizeAudioUrl: vi.fn()
        });
      });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('trackId') })
      );
    });
  });

  describe('Catégorisation des erreurs', () => {
    const testErrorCategorization = async (
      errorMessage: string, 
      expectedTitleContains: string
    ) => {
      mockExecuteWithRetry.mockResolvedValue({ trackId: 'task-1' });

      const { result } = renderHook(() => useMusicGenerationOrchestrator());
      const onError = vi.fn();

      await act(async () => {
        await result.current.startGeneration({
          rang: 'A',
          translatedLyrics: 'Test',
          selectedStyle: 'pop',
          duration: 120,
          currentLanguage: 'fr',
          onProgress: vi.fn(),
          onSuccess: vi.fn(),
          onError,
          validateAndNormalizeAudioUrl: vi.fn()
        });
      });

      // Simuler une erreur via le callback de polling
      const pollingConfig = mockStartPolling.mock.calls[0][0];
      act(() => {
        pollingConfig.onError(new Error(errorMessage));
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ 
          title: expect.stringContaining(expectedTitleContains),
          variant: 'destructive'
        })
      );
    };

    it('devrait catégoriser les erreurs timeout', async () => {
      await testErrorCategorization('Timeout de génération', 'trop longue');
    });

    it('devrait catégoriser les erreurs réseau', async () => {
      await testErrorCategorization('Erreur réseau persistante', 'connexion');
    });

    it('devrait catégoriser les erreurs 429 (rate limit)', async () => {
      await testErrorCategorization('429 Too Many Requests', 'Limite de taux');
    });

    it('devrait catégoriser les erreurs d\'annulation', async () => {
      await testErrorCategorization('Génération annulée', 'annulée');
    });

    it('devrait catégoriser les erreurs de crédits', async () => {
      // Le code source cherche "crédits" ou "credits" dans le message
      await testErrorCategorization('crédits insuffisants', 'Crédits');
    });
  });

  describe('Annulation', () => {
    it('devrait annuler une génération spécifique', async () => {
      mockExecuteWithRetry.mockResolvedValue({ trackId: 'cancel-task' });

      const { result } = renderHook(() => useMusicGenerationOrchestrator());

      await act(async () => {
        await result.current.startGeneration({
          rang: 'A',
          translatedLyrics: 'Test',
          selectedStyle: 'pop',
          duration: 120,
          currentLanguage: 'fr',
          onProgress: vi.fn(),
          onSuccess: vi.fn(),
          onError: vi.fn(),
          validateAndNormalizeAudioUrl: vi.fn()
        });
      });

      act(() => {
        result.current.cancelGeneration('cancel-task');
      });

      expect(mockStopPolling).toHaveBeenCalledWith('cancel-task');
      expect(mockAbortRetry).toHaveBeenCalled();
    });

    it('devrait annuler toutes les générations', async () => {
      const { result } = renderHook(() => useMusicGenerationOrchestrator());

      act(() => {
        result.current.cancelAllGenerations();
      });

      expect(mockStopAllPolling).toHaveBeenCalled();
      expect(mockAbortRetry).toHaveBeenCalled();
      expect(result.current.generatingRangs).toEqual([]);
    });
  });

  describe('Persistance localStorage', () => {
    it('devrait charger les tâches actives depuis localStorage', () => {
      const storedTasks = [
        ['task-1', { taskId: 'task-1', rang: 'A', startTime: Date.now() - 1000, status: 'generating' }]
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedTasks));

      const { result } = renderHook(() => useMusicGenerationOrchestrator());
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('mng_active_generation_tasks');
    });

    it('devrait sauvegarder les tâches dans localStorage après démarrage', async () => {
      mockExecuteWithRetry.mockResolvedValue({ trackId: 'persist-task' });

      const { result } = renderHook(() => useMusicGenerationOrchestrator());

      await act(async () => {
        await result.current.startGeneration({
          rang: 'A',
          translatedLyrics: 'Test',
          selectedStyle: 'pop',
          duration: 120,
          currentLanguage: 'fr',
          onProgress: vi.fn(),
          onSuccess: vi.fn(),
          onError: vi.fn(),
          validateAndNormalizeAudioUrl: vi.fn()
        });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'mng_active_generation_tasks',
        expect.any(String)
      );
    });

    it('devrait filtrer les tâches expirées au chargement', () => {
      const oldTask = { 
        taskId: 'old-task', 
        rang: 'A', 
        startTime: Date.now() - 15 * 60 * 1000, // 15 minutes ago
        status: 'generating' 
      };
      const storedTasks = [['old-task', oldTask]];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedTasks));

      const { result } = renderHook(() => useMusicGenerationOrchestrator());
      
      // Les tâches de plus de 10 minutes devraient être filtrées
      expect(result.current.getActiveTasks().length).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('devrait gérer une erreur API lors du démarrage', async () => {
      mockExecuteWithRetry.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useMusicGenerationOrchestrator());
      const onError = vi.fn();

      await act(async () => {
        await result.current.startGeneration({
          rang: 'A',
          translatedLyrics: 'Test',
          selectedStyle: 'pop',
          duration: 120,
          currentLanguage: 'fr',
          onProgress: vi.fn(),
          onSuccess: vi.fn(),
          onError,
          validateAndNormalizeAudioUrl: vi.fn()
        });
      });

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'destructive' })
      );
    });

    it('devrait trouver une tâche par rang', async () => {
      mockExecuteWithRetry.mockResolvedValue({ trackId: 'rang-task' });

      const { result } = renderHook(() => useMusicGenerationOrchestrator());

      await act(async () => {
        await result.current.startGeneration({
          rang: 'B',
          translatedLyrics: 'Test',
          selectedStyle: 'pop',
          duration: 120,
          currentLanguage: 'fr',
          onProgress: vi.fn(),
          onSuccess: vi.fn(),
          onError: vi.fn(),
          validateAndNormalizeAudioUrl: vi.fn()
        });
      });

      const task = result.current.getTaskByRang('B');
      expect(task).toBeDefined();
      expect(task?.rang).toBe('B');
    });

    it('devrait retourner undefined pour un rang sans tâche', () => {
      const { result } = renderHook(() => useMusicGenerationOrchestrator());
      
      expect(result.current.getTaskByRang('AB')).toBeUndefined();
    });
  });
});
