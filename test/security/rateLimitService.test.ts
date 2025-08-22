import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RateLimitService } from '@/services/rateLimitService';
import { MemoryRateLimitStore } from '@/services/stores/MemoryRateLimitStore';
import { SupabaseRateLimitStore } from '@/services/stores/SupabaseRateLimitStore';

// Mock Express request object
const createMockRequest = (ip: string = '127.0.0.1', path: string = '/test') => ({
  ip,
  path,
  method: 'GET',
  headers: {},
  connection: { remoteAddress: ip }
});

// Mock Express response object
const createMockResponse = () => {
  const res: any = {
    headers: {},
    statusCode: 200,
    set: vi.fn((headers) => {
      Object.assign(res.headers, headers);
    }),
    status: vi.fn((code) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((data) => {
      res.body = data;
      return res;
    })
  };
  return res;
};

describe('RateLimitService', () => {
  let store: MemoryRateLimitStore;
  let service: RateLimitService;

  beforeEach(() => {
    store = new MemoryRateLimitStore(5000); // 5 second cleanup interval for tests
    service = new RateLimitService(store, {
      windowMs: 60000, // 1 minute window
      maxRequests: 5
    });
  });

  afterEach(() => {
    store.destroy();
  });

  describe('Basic Rate Limiting', () => {
    it('should allow requests within the limit', async () => {
      const req = createMockRequest('192.168.1.1');
      
      // First request should be allowed
      const result1 = await service.checkRateLimit(req);
      expect(result1.allowed).toBe(true);
      expect(result1.currentCount).toBe(1);
      expect(result1.remainingRequests).toBe(4);
      
      // Second request should be allowed
      const result2 = await service.checkRateLimit(req);
      expect(result2.allowed).toBe(true);
      expect(result2.currentCount).toBe(2);
      expect(result2.remainingRequests).toBe(3);
    });

    it('should block requests when limit is exceeded', async () => {
      const req = createMockRequest('192.168.1.2');
      
      // Make 5 requests (at the limit)
      for (let i = 1; i <= 5; i++) {
        const result = await service.checkRateLimit(req);
        expect(result.allowed).toBe(true);
        expect(result.currentCount).toBe(i);
      }
      
      // 6th request should be blocked
      const result = await service.checkRateLimit(req);
      expect(result.allowed).toBe(false);
      expect(result.currentCount).toBe(6);
      expect(result.remainingRequests).toBe(0);
    });

    it('should isolate different IP addresses', async () => {
      const req1 = createMockRequest('192.168.1.1');
      const req2 = createMockRequest('192.168.1.2');
      
      // Make requests from first IP
      await service.checkRateLimit(req1);
      await service.checkRateLimit(req1);
      await service.checkRateLimit(req1);
      
      // Request from second IP should start fresh
      const result = await service.checkRateLimit(req2);
      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBe(1);
      expect(result.remainingRequests).toBe(4);
    });
  });

  describe('Custom Key Generator', () => {
    it('should use custom key generator', async () => {
      const customService = new RateLimitService(store, {
        windowMs: 60000,
        maxRequests: 3,
        keyGenerator: (req) => `user:${req.userId || 'anonymous'}`
      });

      const req1 = { ...createMockRequest(), userId: 'user123' };
      const req2 = { ...createMockRequest(), userId: 'user456' };
      
      // Make requests for user123
      await customService.checkRateLimit(req1);
      await customService.checkRateLimit(req1);
      
      // Request for user456 should start fresh
      const result = await customService.checkRateLimit(req2);
      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBe(1);
    });
  });

  describe('Skip Condition', () => {
    it('should skip rate limiting when condition is met', async () => {
      const skipService = new RateLimitService(store, {
        windowMs: 60000,
        maxRequests: 1,
        skipCondition: (req) => req.headers.authorization === 'Bearer admin-token'
      });

      const adminReq = createMockRequest();
      adminReq.headers.authorization = 'Bearer admin-token';
      
      // Multiple requests should be allowed for admin
      for (let i = 0; i < 5; i++) {
        const result = await skipService.checkRateLimit(adminReq);
        expect(result.allowed).toBe(true);
        expect(result.identifier).toBe('skipped');
      }
    });
  });

  describe('Status Check', () => {
    it('should get status without incrementing counter', async () => {
      const req = createMockRequest('192.168.1.3');
      
      // Make some requests
      await service.checkRateLimit(req);
      await service.checkRateLimit(req);
      
      // Check status without incrementing
      const status1 = await service.getStatus(req);
      expect(status1.currentCount).toBe(2);
      expect(status1.remainingRequests).toBe(3);
      
      // Status should remain the same
      const status2 = await service.getStatus(req);
      expect(status2.currentCount).toBe(2);
      expect(status2.remainingRequests).toBe(3);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset counter for specific identifier', async () => {
      const req = createMockRequest('192.168.1.4');
      
      // Make some requests
      await service.checkRateLimit(req);
      await service.checkRateLimit(req);
      await service.checkRateLimit(req);
      
      // Check current status
      const statusBefore = await service.getStatus(req);
      expect(statusBefore.currentCount).toBe(3);
      
      // Reset counter
      await service.reset(req);
      
      // Status should be reset
      const statusAfter = await service.getStatus(req);
      expect(statusAfter.currentCount).toBe(0);
      expect(statusAfter.remainingRequests).toBe(5);
    });
  });

  describe('Express Middleware', () => {
    it('should create working middleware', async () => {
      const middleware = service.middleware();
      const req = createMockRequest('192.168.1.5');
      const res = createMockResponse();
      const next = vi.fn();
      
      // First request should pass through
      await middleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.headers['X-RateLimit-Limit']).toBe('5');
      expect(res.headers['X-RateLimit-Remaining']).toBe('4');
    });

    it('should block requests when rate limited', async () => {
      const middleware = service.middleware();
      const req = createMockRequest('192.168.1.6');
      const res = createMockResponse();
      const next = vi.fn();
      
      // Exhaust the rate limit
      for (let i = 0; i < 5; i++) {
        await middleware(req, res, next);
      }
      
      // Next request should be blocked
      await middleware(req, res, next);
      expect(res.statusCode).toBe(429);
      expect(res.body.error).toBe('Too Many Requests');
    });
  });

  describe('Configuration Updates', () => {
    it('should update configuration', () => {
      const originalConfig = service.getConfig();
      expect(originalConfig.maxRequests).toBe(5);
      
      service.updateConfig({ maxRequests: 10 });
      
      const newConfig = service.getConfig();
      expect(newConfig.maxRequests).toBe(10);
      expect(newConfig.windowMs).toBe(60000); // Should remain unchanged
    });
  });

  describe('Cleanup', () => {
    it('should clean up expired counters', async () => {
      const req = createMockRequest('192.168.1.7');
      
      // Make some requests
      await service.checkRateLimit(req);
      await service.checkRateLimit(req);
      
      // Get initial stats
      const statsBefore = store.getStats();
      expect(statsBefore.totalCounters).toBeGreaterThan(0);
      
      // Run cleanup (should not delete anything as counters are not expired)
      const deletedCount = await service.cleanup();
      
      const statsAfter = store.getStats();
      expect(statsAfter.totalCounters).toBe(statsBefore.totalCounters);
    });
  });
});

describe('Multiple Instance Simulation', () => {
  let store: MemoryRateLimitStore;
  let service1: RateLimitService;
  let service2: RateLimitService;

  beforeEach(() => {
    // Simulate multiple instances using the same store
    store = new MemoryRateLimitStore();
    service1 = new RateLimitService(store, {
      windowMs: 60000,
      maxRequests: 3
    });
    service2 = new RateLimitService(store, {
      windowMs: 60000,
      maxRequests: 3
    });
  });

  afterEach(() => {
    store.destroy();
  });

  it('should maintain consistent counters across multiple instances', async () => {
    const req = createMockRequest('192.168.1.100');
    
    // Make request from instance 1
    const result1 = await service1.checkRateLimit(req);
    expect(result1.currentCount).toBe(1);
    expect(result1.remainingRequests).toBe(2);
    
    // Make request from instance 2 with same identifier
    const result2 = await service2.checkRateLimit(req);
    expect(result2.currentCount).toBe(2);
    expect(result2.remainingRequests).toBe(1);
    
    // Make final request from instance 1
    const result3 = await service1.checkRateLimit(req);
    expect(result3.currentCount).toBe(3);
    expect(result3.remainingRequests).toBe(0);
    
    // Next request should be rate limited from any instance
    const result4 = await service2.checkRateLimit(req);
    expect(result4.allowed).toBe(false);
    expect(result4.currentCount).toBe(4);
  });

  it('should handle concurrent requests correctly', async () => {
    const req = createMockRequest('192.168.1.101');
    
    // Make concurrent requests from both instances
    const promises = [
      service1.checkRateLimit(req),
      service2.checkRateLimit(req),
      service1.checkRateLimit(req),
      service2.checkRateLimit(req)
    ];
    
    const results = await Promise.all(promises);
    
    // All requests should have consistent counting
    const counts = results.map(r => r.currentCount);
    expect(counts.sort()).toEqual([1, 2, 3, 4]);
    
    // Last request should be rate limited
    expect(results[3].allowed).toBe(false);
  });
});

describe('SupabaseRateLimitStore Integration', () => {
  // Mock Supabase client
  const mockSupabase = {
    rpc: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle Supabase rate limit check', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: {
        identifier: '192.168.1.1',
        current_count: 1,
        max_requests: 5,
        remaining_requests: 4,
        rate_limited: false,
        window_start: new Date().toISOString(),
        window_end: new Date(Date.now() + 60000).toISOString(),
        reset_time: new Date(Date.now() + 60000).toISOString()
      },
      error: null
    });

    // Mock the supabase import
    vi.mock('@/integrations/supabase/client', () => ({
      supabase: mockSupabase
    }));

    const store = new SupabaseRateLimitStore();
    const result = await store.checkAndIncrement('192.168.1.1', 60, 5);
    
    expect(result.allowed).toBe(true);
    expect(result.currentCount).toBe(1);
    expect(result.remainingRequests).toBe(4);
    expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_rate_limit_counter', {
      p_identifier: '192.168.1.1',
      p_window_duration_seconds: 60,
      p_max_requests: 5
    });
  });

  it('should handle Supabase errors gracefully', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'Database connection failed' }
    });

    const store = new SupabaseRateLimitStore();
    
    await expect(store.checkAndIncrement('192.168.1.1', 60, 5))
      .rejects.toThrow('Rate limit check failed: Database connection failed');
  });
});
