import { Request, Response, NextFunction } from 'express';
import { RateLimitService, RateLimitStore, RateLimitResult } from '@/services/rateLimitService';
import { SupabaseRateLimitStore } from '@/services/stores/SupabaseRateLimitStore';
import { logService } from '@/services/logService';

// Mock logService
jest.mock('@/services/logService', () => ({
  logService: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
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

describe('Rate Limit Service', () => {
  let mockStore: jest.Mocked<RateLimitStore>;
  let rateLimitService: RateLimitService;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  const mockRateLimitResult: RateLimitResult = {
    allowed: true,
    identifier: '127.0.0.1',
    currentCount: 5,
    maxRequests: 100,
    remainingRequests: 95,
    resetTime: new Date(Date.now() + 900000), // 15 minutes from now
    windowStart: new Date(),
    windowEnd: new Date(Date.now() + 900000)
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock store
    mockStore = {
      checkAndIncrement: jest.fn(),
      getStatus: jest.fn(),
      cleanup: jest.fn(),
      reset: jest.fn()
    };

    // Create service with mock store
    rateLimitService = new RateLimitService(mockStore, {
      windowMs: 60000, // 1 minute for tests
      maxRequests: 10   // Low limit for easier testing
    });

    // Mock request/response
    mockReq = {
      ip: '127.0.0.1',
      url: '/test',
      method: 'GET',
      headers: {},
      get: jest.fn()
    };

    mockRes = {
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();
  });

  describe('RateLimitService Core Functionality', () => {
    test('should allow requests under the limit', async () => {
      mockStore.checkAndIncrement.mockResolvedValue({
        ...mockRateLimitResult,
        allowed: true,
        currentCount: 5,
        remainingRequests: 5
      });

      const result = await rateLimitService.checkRateLimit(mockReq as Request);

      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBe(5);
      expect(result.remainingRequests).toBe(5);
      expect(mockStore.checkAndIncrement).toHaveBeenCalledWith('127.0.0.1', 60, 10);
    });

    test('should block requests over the limit', async () => {
      mockStore.checkAndIncrement.mockResolvedValue({
        ...mockRateLimitResult,
        allowed: false,
        currentCount: 11,
        remainingRequests: 0
      });

      const result = await rateLimitService.checkRateLimit(mockReq as Request);

      expect(result.allowed).toBe(false);
      expect(result.currentCount).toBe(11);
      expect(result.remainingRequests).toBe(0);
    });

    test('should use custom key generator when provided', async () => {
      const customService = new RateLimitService(mockStore, {
        windowMs: 60000,
        maxRequests: 10,
        keyGenerator: (req) => `user:${req.get('Authorization') || 'anonymous'}`
      });

      mockReq.get = jest.fn().mockReturnValue('Bearer token123');
      mockStore.checkAndIncrement.mockResolvedValue(mockRateLimitResult);

      await customService.checkRateLimit(mockReq as Request);

      expect(mockStore.checkAndIncrement).toHaveBeenCalledWith('user:Bearer token123', 60, 10);
    });

    test('should skip rate limiting when condition is met', async () => {
      const skipService = new RateLimitService(mockStore, {
        windowMs: 60000,
        maxRequests: 10,
        skipCondition: (req) => req.get('X-Admin-Key') === 'admin123'
      });

      mockReq.get = jest.fn().mockReturnValue('admin123');

      const result = await skipService.checkRateLimit(mockReq as Request);

      expect(result.allowed).toBe(true);
      expect(result.identifier).toBe('skipped');
      expect(mockStore.checkAndIncrement).not.toHaveBeenCalled();
    });

    test('should handle X-Forwarded-For header correctly', async () => {
      mockReq.headers = { 'x-forwarded-for': '192.168.1.100, 10.0.0.1' };
      mockStore.checkAndIncrement.mockResolvedValue(mockRateLimitResult);

      await rateLimitService.checkRateLimit(mockReq as Request);

      // Should use the first IP from X-Forwarded-For
      const expectedIdentifier = '192.168.1.100';
      expect(mockStore.checkAndIncrement).toHaveBeenCalledWith(expectedIdentifier, 60, 10);
    });
  });

  describe('Middleware Functionality', () => {
    test('should set rate limit headers for allowed requests', async () => {
      mockStore.checkAndIncrement.mockResolvedValue({
        ...mockRateLimitResult,
        allowed: true,
        currentCount: 3,
        remainingRequests: 7,
        resetTime: new Date('2024-01-01T12:00:00Z')
      });

      const middleware = rateLimitService.middleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith({
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '7',
        'X-RateLimit-Reset': '1704110400', // Unix timestamp
        'X-RateLimit-Window': '60000'
      });

      expect(mockNext).toHaveBeenCalled();
    });

    test('should return 429 for rate limited requests', async () => {
      const resetTime = new Date(Date.now() + 300000); // 5 minutes from now
      
      mockStore.checkAndIncrement.mockResolvedValue({
        ...mockRateLimitResult,
        allowed: false,
        currentCount: 11,
        remainingRequests: 0,
        resetTime
      });

      const middleware = rateLimitService.middleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Too Many Requests',
        message: expect.stringContaining('Rate limit exceeded'),
        retryAfter: expect.any(Number)
      });

      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should log rate limit errors and allow request to continue', async () => {
      mockStore.checkAndIncrement.mockRejectedValue(new Error('Database connection failed'));

      const middleware = rateLimitService.middleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(logService.error).toHaveBeenCalledWith(
        'Rate limiting middleware failed',
        expect.any(Error),
        expect.objectContaining({
          identifier: '127.0.0.1',
          windowMs: 60000,
          maxRequests: 10,
          endpoint: '/test',
          method: 'GET'
        })
      );

      // Should allow request to continue despite error
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('Status and Management Operations', () => {
    test('should get status without incrementing counter', async () => {
      mockStore.getStatus.mockResolvedValue({
        ...mockRateLimitResult,
        currentCount: 5,
        remainingRequests: 5
      });

      const status = await rateLimitService.getStatus(mockReq as Request);

      expect(status.currentCount).toBe(5);
      expect(mockStore.getStatus).toHaveBeenCalledWith('127.0.0.1', 60, 10);
      expect(mockStore.checkAndIncrement).not.toHaveBeenCalled();
    });

    test('should reset rate limit for specific request', async () => {
      mockStore.reset!.mockResolvedValue();

      await rateLimitService.reset(mockReq as Request);

      expect(mockStore.reset).toHaveBeenCalledWith('127.0.0.1');
    });

    test('should handle reset gracefully when store does not support it', async () => {
      delete mockStore.reset;

      await expect(rateLimitService.reset(mockReq as Request)).resolves.toBeUndefined();
    });

    test('should cleanup expired counters', async () => {
      mockStore.cleanup!.mockResolvedValue(25);

      const cleanedCount = await rateLimitService.cleanup();

      expect(cleanedCount).toBe(25);
      expect(mockStore.cleanup).toHaveBeenCalled();
    });

    test('should return 0 when cleanup is not supported', async () => {
      delete mockStore.cleanup;

      const cleanedCount = await rateLimitService.cleanup();

      expect(cleanedCount).toBe(0);
    });
  });

  describe('Configuration Management', () => {
    test('should update configuration correctly', () => {
      const originalConfig = rateLimitService.getConfig();
      
      rateLimitService.updateConfig({
        maxRequests: 50,
        windowMs: 120000
      });

      const newConfig = rateLimitService.getConfig();

      expect(newConfig.maxRequests).toBe(50);
      expect(newConfig.windowMs).toBe(120000);
      expect(newConfig.keyGenerator).toBe(originalConfig.keyGenerator); // Should preserve existing values
    });

    test('should get current configuration', () => {
      const config = rateLimitService.getConfig();

      expect(config).toEqual({
        windowMs: 60000,
        maxRequests: 10
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle missing IP gracefully', async () => {
      mockReq.ip = undefined;
      delete (mockReq as any).connection;
      delete (mockReq as any).socket;
      mockReq.headers = {};

      mockStore.checkAndIncrement.mockResolvedValue(mockRateLimitResult);

      await rateLimitService.checkRateLimit(mockReq as Request);

      expect(mockStore.checkAndIncrement).toHaveBeenCalledWith('unknown', 60, 10);
    });

    test('should handle malformed X-Forwarded-For header', async () => {
      mockReq.headers = { 'x-forwarded-for': 'invalid-ip-format' };
      mockStore.checkAndIncrement.mockResolvedValue(mockRateLimitResult);

      await rateLimitService.checkRateLimit(mockReq as Request);

      expect(mockStore.checkAndIncrement).toHaveBeenCalledWith('invalid-ip-format', 60, 10);
    });

    test('should handle array X-Forwarded-For header', async () => {
      mockReq.headers = { 'x-forwarded-for': ['192.168.1.100', '10.0.0.1'] };
      mockStore.checkAndIncrement.mockResolvedValue(mockRateLimitResult);

      await rateLimitService.checkRateLimit(mockReq as Request);

      expect(mockStore.checkAndIncrement).toHaveBeenCalledWith('192.168.1.100', 60, 10);
    });

    test('should handle store errors during status check', async () => {
      mockStore.getStatus.mockRejectedValue(new Error('Store unavailable'));

      await expect(rateLimitService.getStatus(mockReq as Request))
        .rejects.toThrow('Store unavailable');
    });

    test('should handle store errors during reset', async () => {
      mockStore.reset!.mockRejectedValue(new Error('Reset failed'));

      await expect(rateLimitService.reset(mockReq as Request))
        .rejects.toThrow('Reset failed');
    });
  });

  describe('SupabaseRateLimitStore Integration', () => {
    let supabaseStore: SupabaseRateLimitStore;
    let mockSupabase: any;

    beforeEach(() => {
      mockSupabase = require('@/integrations/supabase/client').supabase;
      supabaseStore = new SupabaseRateLimitStore();
    });

    test('should handle successful rate limit check', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: {
          rate_limited: false,
          identifier: '127.0.0.1',
          current_count: 3,
          max_requests: 10,
          remaining_requests: 7,
          reset_time: '2024-01-01T13:00:00Z',
          window_start: '2024-01-01T12:00:00Z',
          window_end: '2024-01-01T13:00:00Z'
        },
        error: null
      });

      const result = await supabaseStore.checkAndIncrement('127.0.0.1', 3600, 10);

      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBe(3);
      expect(result.remainingRequests).toBe(7);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_rate_limit_counter', {
        p_identifier: '127.0.0.1',
        p_window_duration_seconds: 3600,
        p_max_requests: 10
      });
    });

    test('should handle rate limit exceeded from Supabase', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: {
          rate_limited: true,
          identifier: '127.0.0.1',
          current_count: 11,
          max_requests: 10,
          remaining_requests: 0,
          reset_time: '2024-01-01T13:00:00Z',
          window_start: '2024-01-01T12:00:00Z',
          window_end: '2024-01-01T13:00:00Z'
        },
        error: null
      });

      const result = await supabaseStore.checkAndIncrement('127.0.0.1', 3600, 10);

      expect(result.allowed).toBe(false);
      expect(result.currentCount).toBe(11);
      expect(result.remainingRequests).toBe(0);
    });

    test('should handle Supabase errors and log appropriately', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: {
          message: 'Function not found',
          code: '42883'
        }
      });

      await expect(supabaseStore.checkAndIncrement('127.0.0.1', 3600, 10))
        .rejects.toThrow('Rate limit check failed: Function not found');

      expect(logService.error).toHaveBeenCalledWith(
        'Supabase rate limit check failed',
        undefined,
        expect.objectContaining({
          identifier: '127.0.0.1',
          windowDurationSeconds: 3600,
          maxRequests: 10,
          operation: 'checkAndIncrement'
        })
      );
    });

    test('should handle cleanup operation', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 15,
        error: null
      });

      const cleanedCount = await supabaseStore.cleanup();

      expect(cleanedCount).toBe(15);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('cleanup_expired_rate_limit_counters');
    });

    test('should handle cleanup errors gracefully', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Cleanup failed' }
      });

      await expect(supabaseStore.cleanup()).rejects.toThrow('Cleanup failed');

      expect(logService.error).toHaveBeenCalledWith(
        'Supabase rate limit cleanup failed',
        undefined,
        expect.objectContaining({
          operation: 'cleanup'
        })
      );
    });

    test('should handle reset operation', async () => {
      mockSupabase.from.mockReturnValue({
        delete: () => ({
          eq: () => Promise.resolve({ error: null })
        })
      });

      await expect(supabaseStore.reset('127.0.0.1')).resolves.toBeUndefined();
    });

    test('should handle reset errors', async () => {
      mockSupabase.from.mockReturnValue({
        delete: () => ({
          eq: () => Promise.resolve({
            error: { message: 'Table not found' }
          })
        })
      });

      await expect(supabaseStore.reset('127.0.0.1'))
        .rejects.toThrow('Reset failed: Table not found');
    });
  });

  describe('Performance and Load Testing', () => {
    test('should handle multiple concurrent requests efficiently', async () => {
      mockStore.checkAndIncrement.mockImplementation(async () => {
        // Simulate slight delay
        await new Promise(resolve => setTimeout(resolve, 1));
        return mockRateLimitResult;
      });

      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(rateLimitService.checkRateLimit(mockReq as Request));
      }

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;

      expect(results).toHaveLength(10);
      expect(duration).toBeLessThan(100); // Should be fast due to concurrency
      expect(mockStore.checkAndIncrement).toHaveBeenCalledTimes(10);
    });

    test('should handle rapid sequential requests', async () => {
      let callCount = 0;
      mockStore.checkAndIncrement.mockImplementation(async () => {
        callCount++;
        return {
          ...mockRateLimitResult,
          currentCount: callCount,
          remainingRequests: Math.max(0, 10 - callCount),
          allowed: callCount <= 10
        };
      });

      const middleware = rateLimitService.middleware();

      // Make requests rapidly
      for (let i = 0; i < 15; i++) {
        await middleware(mockReq as Request, mockRes as Response, mockNext);
      }

      // Should have blocked the last 5 requests
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.status).toHaveBeenCalledTimes(5); // Last 5 requests blocked
    });
  });
});