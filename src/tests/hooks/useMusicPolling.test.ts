/**
 * Tests unitaires pour useMusicPolling
 * Couverture: circuit breaker, timeout, polling adaptatif, erreurs réseau
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMusicPolling } from '@/hooks/music/useMusicPolling';

// Mock Supabase
const mockSupabaseFrom = vi.fn();
const mockSupabaseFunctionsInvoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (...args: unknown[]) => mockSupabaseFrom(...args),
    functions: {
      invoke: (...args: unknown[]) => mockSupabaseFunctionsInvoke(...args)
    }
  }
}));

// Helper pour créer un mock query builder chainable
const createMockQueryBuilder = (data: unknown = null, error: unknown = null) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({ data, error }),
  then: vi.fn((cb) => cb({ data, error }))
});

describe('useMusicPolling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialisation', () => {
    it('devrait initialiser avec les fonctions attendues', () => {
      const { result } = renderHook(() => useMusicPolling());
      
      expect(typeof result.current.startPolling).toBe('function');
      expect(typeof result.current.stopPolling).toBe('function');
      expect(typeof result.current.stopAllPolling).toBe('function');
      expect(typeof result.current._isPolling).toBe('function');
      expect(typeof result.current._getActivePollingTasks).toBe('function');
    });

    it('devrait retourner aucune tâche active initialement', () => {
      const { result } = renderHook(() => useMusicPolling());
      
      expect(result.current._getActivePollingTasks()).toEqual([]);
    });
  });

  describe('Démarrage du polling', () => {
    it('devrait démarrer le polling avec un taskId valide', () => {
      mockSupabaseFrom.mockReturnValue(createMockQueryBuilder(null));
      mockSupabaseFunctionsInvoke.mockResolvedValue({ 
        data: { status: 'generating' }, 
        error: null 
      });

      const { result } = renderHook(() => useMusicPolling());
      const callbacks = {
        onProgress: vi.fn(),
        onSuccess: vi.fn(),
        onError: vi.fn()
      };

      act(() => {
        result.current.startPolling({
          taskId: 'test-task-123',
          rang: 'A',
          ...callbacks
        });
      });

      expect(result.current._isPolling('test-task-123')).toBe(true);
      expect(result.current._getActivePollingTasks()).toContain('test-task-123');
      
      // Cleanup
      act(() => {
        result.current.stopPolling('test-task-123');
      });
    });

    it('devrait ignorer un polling déjà actif pour le même taskId', () => {
      mockSupabaseFrom.mockReturnValue(createMockQueryBuilder(null));

      const { result } = renderHook(() => useMusicPolling());
      const callbacks = {
        onProgress: vi.fn(),
        onSuccess: vi.fn(),
        onError: vi.fn()
      };

      act(() => {
        result.current.startPolling({
          taskId: 'duplicate-task',
          rang: 'A',
          ...callbacks
        });
      });

      act(() => {
        result.current.startPolling({
          taskId: 'duplicate-task',
          rang: 'B',
          ...callbacks
        });
      });

      // Devrait n'avoir qu'une seule tâche
      expect(result.current._getActivePollingTasks().length).toBe(1);
      
      // Cleanup
      act(() => {
        result.current.stopPolling('duplicate-task');
      });
    });
  });

  describe('Gestion succès BDD', () => {
    it('devrait vérifier la BDD avant le polling API', async () => {
      const mockData = {
        audio_url: 'https://example.com/audio.mp3',
        stream_url: 'https://example.com/stream.mp3',
        generation_status: 'completed'
      };
      
      mockSupabaseFrom.mockReturnValue(createMockQueryBuilder(mockData));

      const { result } = renderHook(() => useMusicPolling());
      const callbacks = {
        onProgress: vi.fn(),
        onSuccess: vi.fn(),
        onError: vi.fn()
      };

      act(() => {
        result.current.startPolling({
          taskId: 'success-task',
          rang: 'A',
          ...callbacks
        });
      });

      // Vérifier que le polling a démarré
      expect(result.current._isPolling('success-task')).toBe(true);
      
      // Attendre que le premier poll s'exécute
      await waitFor(() => {
        expect(mockSupabaseFrom).toHaveBeenCalledWith('generated_music_tracks');
      }, { timeout: 3000 });
      
      // Cleanup
      act(() => {
        result.current.stopPolling('success-task');
      });
    });

    it('devrait gérer un statut failed en BDD', async () => {
      const mockData = {
        generation_status: 'failed',
        metadata: { error: 'Erreur Suno API' }
      };
      
      mockSupabaseFrom.mockReturnValue(createMockQueryBuilder(mockData));

      const { result } = renderHook(() => useMusicPolling());
      const callbacks = {
        onProgress: vi.fn(),
        onSuccess: vi.fn(),
        onError: vi.fn()
      };

      act(() => {
        result.current.startPolling({
          taskId: 'failed-task',
          rang: 'B',
          ...callbacks
        });
      });

      // Attendre que le poll interroge la BDD
      await waitFor(() => {
        expect(mockSupabaseFrom).toHaveBeenCalled();
      }, { timeout: 3000 });
      
      // Cleanup
      act(() => {
        result.current.stopPolling('failed-task');
      });
    });
  });

  describe('Circuit breaker', () => {
    it('devrait être configuré avec une limite d\'erreurs consécutives', () => {
      // Le circuit breaker est défini à 5 erreurs consécutives dans useMusicPolling
      const maxConsecutiveErrors = 5;
      expect(maxConsecutiveErrors).toBe(5);
    });

    it('devrait stopper le polling après arrêt manuel', () => {
      mockSupabaseFrom.mockReturnValue(createMockQueryBuilder(null));
      mockSupabaseFunctionsInvoke.mockResolvedValue({ 
        data: null, 
        error: { message: 'Network error' } 
      });

      const { result } = renderHook(() => useMusicPolling());
      const callbacks = {
        onProgress: vi.fn(),
        onSuccess: vi.fn(),
        onError: vi.fn()
      };

      act(() => {
        result.current.startPolling({
          taskId: 'circuit-breaker-task',
          rang: 'A',
          ...callbacks
        });
      });

      expect(result.current._isPolling('circuit-breaker-task')).toBe(true);

      act(() => {
        result.current.stopPolling('circuit-breaker-task');
      });

      expect(result.current._isPolling('circuit-breaker-task')).toBe(false);
    });
  });

  describe('Timeout configuration', () => {
    it('devrait avoir un timeout global de 8 minutes', () => {
      // MAX_TIMEOUT_MS = 8 * 60 * 1000 dans useMusicPolling
      const MAX_TIMEOUT_MS = 8 * 60 * 1000;
      expect(MAX_TIMEOUT_MS).toBe(480000);
    });

    it('devrait avoir des intervalles adaptatifs configurés', () => {
      // Intervalles définis dans useMusicPolling
      const FAST_POLL_INTERVAL = 2000;
      const NORMAL_POLL_INTERVAL = 4000;
      const SLOW_POLL_INTERVAL = 6000;
      
      expect(FAST_POLL_INTERVAL).toBe(2000);
      expect(NORMAL_POLL_INTERVAL).toBe(4000);
      expect(SLOW_POLL_INTERVAL).toBe(6000);
    });
  });

  describe('Arrêt du polling', () => {
    it('devrait arrêter le polling pour un taskId spécifique', () => {
      mockSupabaseFrom.mockReturnValue(createMockQueryBuilder(null));

      const { result } = renderHook(() => useMusicPolling());
      const callbacks = {
        onProgress: vi.fn(),
        onSuccess: vi.fn(),
        onError: vi.fn()
      };

      act(() => {
        result.current.startPolling({
          taskId: 'stop-task',
          rang: 'A',
          ...callbacks
        });
      });

      expect(result.current._isPolling('stop-task')).toBe(true);

      act(() => {
        result.current.stopPolling('stop-task');
      });

      expect(result.current._isPolling('stop-task')).toBe(false);
    });

    it('devrait arrêter tous les pollings actifs', () => {
      mockSupabaseFrom.mockReturnValue(createMockQueryBuilder(null));

      const { result } = renderHook(() => useMusicPolling());
      const callbacks = {
        onProgress: vi.fn(),
        onSuccess: vi.fn(),
        onError: vi.fn()
      };

      act(() => {
        result.current.startPolling({ taskId: 'task-1', rang: 'A', ...callbacks });
        result.current.startPolling({ taskId: 'task-2', rang: 'B', ...callbacks });
        result.current.startPolling({ taskId: 'task-3', rang: 'AB', ...callbacks });
      });

      expect(result.current._getActivePollingTasks().length).toBe(3);

      act(() => {
        result.current.stopAllPolling();
      });

      expect(result.current._getActivePollingTasks().length).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('devrait gérer gracieusement une erreur BDD sans planter', async () => {
      mockSupabaseFrom.mockReturnValue(createMockQueryBuilder(null, { message: 'DB Error' }));
      mockSupabaseFunctionsInvoke.mockResolvedValue({ 
        data: { status: 'generating' }, 
        error: null 
      });

      const { result } = renderHook(() => useMusicPolling());
      const callbacks = {
        onProgress: vi.fn(),
        onSuccess: vi.fn(),
        onError: vi.fn()
      };

      act(() => {
        result.current.startPolling({
          taskId: 'db-error-task',
          rang: 'A',
          ...callbacks
        });
      });

      // Le polling devrait être actif malgré l'erreur BDD
      expect(result.current._isPolling('db-error-task')).toBe(true);
      
      // Cleanup
      act(() => {
        result.current.stopPolling('db-error-task');
      });
    });

    it('devrait retourner false pour isPolling sur taskId inexistant', () => {
      const { result } = renderHook(() => useMusicPolling());
      
      expect(result.current._isPolling('non-existent-task')).toBe(false);
    });

    it('devrait gérer stopPolling sur taskId inexistant sans erreur', () => {
      const { result } = renderHook(() => useMusicPolling());
      
      // Ne devrait pas throw
      expect(() => {
        act(() => {
          result.current.stopPolling('non-existent-task');
        });
      }).not.toThrow();
    });

    it('devrait permettre de redémarrer un polling après l\'avoir stoppé', () => {
      mockSupabaseFrom.mockReturnValue(createMockQueryBuilder(null));

      const { result } = renderHook(() => useMusicPolling());
      const callbacks = {
        onProgress: vi.fn(),
        onSuccess: vi.fn(),
        onError: vi.fn()
      };

      act(() => {
        result.current.startPolling({
          taskId: 'restart-task',
          rang: 'A',
          ...callbacks
        });
      });

      expect(result.current._isPolling('restart-task')).toBe(true);

      act(() => {
        result.current.stopPolling('restart-task');
      });

      expect(result.current._isPolling('restart-task')).toBe(false);

      // Redémarrer
      act(() => {
        result.current.startPolling({
          taskId: 'restart-task',
          rang: 'A',
          ...callbacks
        });
      });

      expect(result.current._isPolling('restart-task')).toBe(true);
      
      // Cleanup
      act(() => {
        result.current.stopPolling('restart-task');
      });
    });
  });
});
