import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useErrorHandling } from '../../src/hooks/useErrorHandling';
import { AppError, ErrorCategory, ErrorSeverity } from '../../src/utils/errorStandardization';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

vi.mock('@/utils/sentry', () => ({
  captureException: vi.fn(),
  addBreadcrumb: vi.fn()
}));

// Mock window methods
const mockConsole = {
  group: vi.fn(),
  groupEnd: vi.fn(),
  error: vi.fn()
};

Object.defineProperty(window, 'console', {
  value: mockConsole,
  writable: true
});

describe('useErrorHandling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock import.meta.env
    Object.defineProperty(import.meta, 'env', {
      value: { DEV: true },
      writable: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('handleError', () => {
    it('should handle AppError correctly', async () => {
      const { toast } = await import('@/hooks/use-toast');
      const { captureException } = await import('@/utils/sentry');
      
      const { result } = renderHook(() => useErrorHandling());
      const error = new AppError(
        'Test error',
        400,
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW
      );

      let handledError: AppError;
      act(() => {
        handledError = result.current.handleError(error);
      });

      expect(handledError!).toBe(error);
      expect(captureException).toHaveBeenCalledWith(error);
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'default',
          title: 'Invalid Input',
          description: 'Test error'
        })
      );
    });

    it('should convert regular Error to AppError', async () => {
      const { captureException } = await import('@/utils/sentry');
      
      const { result } = renderHook(() => useErrorHandling());
      const error = new Error('Regular error');

      let handledError: AppError;
      act(() => {
        handledError = result.current.handleError(error);
      });

      expect(handledError!).toBeInstanceOf(AppError);
      expect(handledError!.message).toBe('Regular error');
      expect(handledError!.category).toBe(ErrorCategory.SYSTEM);
      expect(captureException).toHaveBeenCalled();
    });

    it('should handle unknown errors', async () => {
      const { captureException } = await import('@/utils/sentry');
      
      const { result } = renderHook(() => useErrorHandling());
      const error = 'string error';

      let handledError: AppError;
      act(() => {
        handledError = result.current.handleError(error);
      });

      expect(handledError!).toBeInstanceOf(AppError);
      expect(handledError!.message).toBe('An unexpected error occurred');
      expect(captureException).toHaveBeenCalled();
    });

    it('should respect showToast option', async () => {
      const { toast } = await import('@/hooks/use-toast');
      
      const { result } = renderHook(() => useErrorHandling());
      const error = new AppError('Test error');

      act(() => {
        result.current.handleError(error, { showToast: false });
      });

      expect(toast).not.toHaveBeenCalled();
    });

    it('should respect logToSentry option', async () => {
      const { captureException } = await import('@/utils/sentry');
      
      const { result } = renderHook(() => useErrorHandling());
      const error = new AppError('Test error');

      act(() => {
        result.current.handleError(error, { logToSentry: false });
      });

      expect(captureException).not.toHaveBeenCalled();
    });

    it('should show destructive toast for high severity errors', async () => {
      const { toast } = await import('@/hooks/use-toast');
      
      const { result } = renderHook(() => useErrorHandling());
      const error = new AppError(
        'Critical error',
        500,
        ErrorCategory.SYSTEM,
        ErrorSeverity.CRITICAL
      );

      act(() => {
        result.current.handleError(error);
      });

      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive'
        })
      );
    });

    it('should include retry action for retryable errors', async () => {
      const { toast } = await import('@/hooks/use-toast');
      
      const { result } = renderHook(() => useErrorHandling());
      const error = new AppError(
        'Network error',
        503,
        ErrorCategory.NETWORK,
        ErrorSeverity.MEDIUM,
        undefined,
        true // retryable
      );

      act(() => {
        result.current.handleError(error);
      });

      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          action: expect.objectContaining({
            altText: 'Retry'
          })
        })
      );
    });
  });

  describe('withErrorBoundary', () => {
    it('should wrap synchronous functions', async () => {
      const { result } = renderHook(() => useErrorHandling());
      const mockFn = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      const wrappedFn = result.current.withErrorBoundary(mockFn, 'test-context');

      expect(() => {
        wrappedFn();
      }).toThrow('Test error');

      expect(mockFn).toHaveBeenCalled();
    });

    it('should wrap asynchronous functions', async () => {
      const { captureException } = await import('@/utils/sentry');
      
      const { result } = renderHook(() => useErrorHandling());
      const mockFn = vi.fn().mockRejectedValue(new Error('Async error'));

      const wrappedFn = result.current.withErrorBoundary(mockFn, 'async-context');

      await expect(wrappedFn()).rejects.toThrow('Async error');
      expect(captureException).toHaveBeenCalled();
    });

    it('should return result for successful functions', () => {
      const { result } = renderHook(() => useErrorHandling());
      const mockFn = vi.fn().mockReturnValue('success');

      const wrappedFn = result.current.withErrorBoundary(mockFn);
      const res = wrappedFn();

      expect(res).toBe('success');
      expect(mockFn).toHaveBeenCalled();
    });
  });

  describe('withRetry', () => {
    it('should retry failed operations', async () => {
      const { addBreadcrumb } = await import('@/utils/sentry');
      
      const { result } = renderHook(() => useErrorHandling());
      let attempts = 0;
      const mockFn = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Retryable error');
        }
        return 'success';
      });

      let res: string;
      await act(async () => {
        res = await result.current.withRetry(
          mockFn,
          { maxRetries: 3, retryDelay: 10 },
          'retry-test'
        );
      });

      expect(res!).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
      expect(addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Operation succeeded after 2 retries'
        })
      );
    });

    it('should fail after max retries for retryable errors', async () => {
      const { result } = renderHook(() => useErrorHandling());
      const mockFn = vi.fn().mockRejectedValue(new Error('Network timeout'));

      await act(async () => {
        await expect(
          result.current.withRetry(
            mockFn,
            { maxRetries: 2, retryDelay: 10 },
            'retry-test'
          )
        ).rejects.toThrow();
      });

      expect(mockFn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });

    it('should not retry non-retryable errors', async () => {
      const { result } = renderHook(() => useErrorHandling());
      const mockFn = vi.fn().mockRejectedValue(new Error('Validation error'));

      await act(async () => {
        await expect(
          result.current.withRetry(
            mockFn,
            { maxRetries: 3, retryDelay: 10 },
            'retry-test'
          )
        ).rejects.toThrow();
      });

      expect(mockFn).toHaveBeenCalledTimes(1); // No retries for non-retryable error
    });

    it('should implement exponential backoff', async () => {
      const { result } = renderHook(() => useErrorHandling());
      const delays: number[] = [];
      const originalSetTimeout = setTimeout;
      
      // Mock setTimeout to capture delays
      vi.stubGlobal('setTimeout', (callback: Function, delay: number) => {
        delays.push(delay);
        return originalSetTimeout(callback, 0); // Execute immediately for testing
      });

      const mockFn = vi.fn().mockRejectedValue(new Error('Network timeout'));

      await act(async () => {
        try {
          await result.current.withRetry(
            mockFn,
            { maxRetries: 2, retryDelay: 100, backoffMultiplier: 2 },
            'backoff-test'
          );
        } catch {}
      });

      expect(delays).toEqual([100, 200]); // 100ms, then 200ms (100 * 2)
      
      vi.unstubAllGlobals();
    });
  });

  describe('Global Error Handlers', () => {
    it('should set up global error event listeners', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      
      renderHook(() => useErrorHandling());

      expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    });

    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHook(() => useErrorHandling());
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    });
  });

  describe('Development Mode Logging', () => {
    it('should log errors to console in development mode', () => {
      const { result } = renderHook(() => useErrorHandling());
      const error = new Error('Dev error');

      act(() => {
        result.current.handleError(error, { context: 'dev-test' });
      });

      expect(mockConsole.group).toHaveBeenCalledWith('🚨 Error in dev-test');
      expect(mockConsole.error).toHaveBeenCalledWith('AppError:', expect.any(AppError));
      expect(mockConsole.error).toHaveBeenCalledWith('Original error:', error);
      expect(mockConsole.groupEnd).toHaveBeenCalled();
    });

    it('should not log to console in production mode', () => {
      // Mock production environment
      Object.defineProperty(import.meta, 'env', {
        value: { DEV: false },
        writable: true
      });

      const { result } = renderHook(() => useErrorHandling());
      const error = new Error('Prod error');

      act(() => {
        result.current.handleError(error);
      });

      expect(mockConsole.group).not.toHaveBeenCalled();
    });
  });
});