import { RateLimitService } from '@/services/rateLimitService';
import { SupabaseRateLimitStore } from '@/services/stores/SupabaseRateLimitStore';
import { logService } from '@/services/logService';
import { Request, Response, NextFunction } from 'express';

// Mock logService
jest.mock('@/services/logService', () => ({
  logService: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    http: jest.fn()
  }
}));

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn()
  }
}));

describe('Rate Limit Service Logging', () => {
  let rateLimitService: RateLimitService;
  let store: SupabaseRateLimitStore;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    
    store = new SupabaseRateLimitStore();
    rateLimitService = new RateLimitService(store, {
      windowMs: 60000, // 1 minute
      maxRequests: 100
    });

    mockRequest = {
      ip: '127.0.0.1',
      url: '/test',
      method: 'GET',
      headers: {}
    };

    mockResponse = {
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();
  });

  describe('RateLimitService middleware logging', () => {
    test('should log errors with context when middleware fails', async () => {
      // Simuler une erreur dans le store
      jest.spyOn(store, 'checkAndIncrement').mockRejectedValue(new Error('Database connection failed'));

      const middleware = rateLimitService.middleware();
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Vérifier que logService.error a été appelé avec le bon contexte
      expect(logService.error).toHaveBeenCalledWith(
        'Rate limiting middleware failed',
        expect.any(Error),
        expect.objectContaining({
          identifier: expect.any(String),
          windowMs: 60000,
          maxRequests: 100,
          endpoint: '/test',
          method: 'GET'
        })
      );

      // Le middleware doit permettre à la requête de continuer
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('SupabaseRateLimitStore logging', () => {
    test('should log checkAndIncrement errors with context', async () => {
      const mockSupabase = require('@/integrations/supabase/client').supabase;
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Function not found', code: '42883' }
      });

      await expect(store.checkAndIncrement('test-id', 60, 100))
        .rejects.toThrow('Rate limit check failed');

      expect(logService.error).toHaveBeenCalledWith(
        'Supabase rate limit check failed',
        undefined,
        expect.objectContaining({
          identifier: 'test-id',
          windowDurationSeconds: 60,
          maxRequests: 100,
          operation: 'checkAndIncrement'
        })
      );
    });

    test('should log getStatus errors with context', async () => {
      const mockSupabase = require('@/integrations/supabase/client').supabase;
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Permission denied', code: '42501' }
      });

      await expect(store.getStatus('test-id', 60, 100))
        .rejects.toThrow('Rate limit status failed');

      expect(logService.error).toHaveBeenCalledWith(
        'Supabase rate limit status check failed',
        undefined,
        expect.objectContaining({
          identifier: 'test-id',
          windowDurationSeconds: 60,
          maxRequests: 100,
          operation: 'getStatus'
        })
      );
    });

    test('should log cleanup errors with context', async () => {
      const mockSupabase = require('@/integrations/supabase/client').supabase;
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Connection timeout', code: '08006' }
      });

      await expect(store.cleanup()).rejects.toThrow('Cleanup failed');

      expect(logService.error).toHaveBeenCalledWith(
        'Supabase rate limit cleanup failed',
        undefined,
        expect.objectContaining({
          operation: 'cleanup'
        })
      );
    });

    test('should log reset errors with context', async () => {
      const mockSupabase = require('@/integrations/supabase/client').supabase;
      mockSupabase.from.mockReturnValue({
        delete: () => ({
          eq: () => Promise.resolve({
            error: { message: 'Table not found', code: '42P01' }
          })
        })
      });

      await expect(store.reset('test-id')).rejects.toThrow('Reset failed');

      expect(logService.error).toHaveBeenCalledWith(
        'Supabase rate limit reset failed',
        undefined,
        expect.objectContaining({
          identifier: 'test-id',
          operation: 'reset'
        })
      );
    });

    test('should handle cleanup gracefully on error without throwing', async () => {
      const mockSupabase = require('@/integrations/supabase/client').supabase;
      mockSupabase.rpc.mockRejectedValue(new Error('Network error'));

      const result = await store.cleanup();

      expect(result).toBe(0);
      expect(logService.error).toHaveBeenCalledWith(
        'Rate limit cleanup operation failed',
        expect.any(Error),
        expect.objectContaining({
          operation: 'cleanup'
        })
      );
    });
  });

  describe('Error context validation', () => {
    test('should include all required context fields in rate limit errors', async () => {
      jest.spyOn(store, 'checkAndIncrement').mockRejectedValue(new Error('Test error'));

      const middleware = rateLimitService.middleware();
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const errorCall = (logService.error as jest.Mock).mock.calls[0];
      const context = errorCall[2];

      expect(context).toHaveProperty('identifier');
      expect(context).toHaveProperty('windowMs');
      expect(context).toHaveProperty('maxRequests');
      expect(context).toHaveProperty('endpoint');
      expect(context).toHaveProperty('method');
    });
  });
});