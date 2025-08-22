/**
 * Tests unitaires pour le service de rate limiting
 * Couvre le rate limiting distribué, la gestion des fenêtres temporelles, et les différents stores
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RateLimitService, type RateLimitStore, type RateLimitConfig } from '@/services/rateLimitService';

describe('RateLimitService', () => {
  let mockStore: RateLimitStore;
  let service: RateLimitService;
  let config: RateLimitConfig;

  beforeEach(() => {
    mockStore = {
      checkAndIncrement: vi.fn(),
      getStatus: vi.fn(),
      cleanup: vi.fn(),
      reset: vi.fn()
    };

    config = {
      windowMs: 60000, // 1 minute
      maxRequests: 10,
      keyGenerator: (req) => req.ip,
      skipCondition: (req) => req.skipRateLimit === true
    };

    service = new RateLimitService(mockStore, config);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rate Limit Checking', () => {
    it('should allow request when under rate limit', async () => {
      // Arrange
      const mockRequest = { ip: '192.168.1.1' };
      const mockResult = {
        allowed: true,
        identifier: '192.168.1.1',
        currentCount: 5,
        maxRequests: 10,
        remainingRequests: 5,
        resetTime: new Date(Date.now() + 60000),
        windowStart: new Date(),
        windowEnd: new Date(Date.now() + 60000)
      };
      (mockStore.checkAndIncrement as any).mockResolvedValue(mockResult);

      // Act
      const result = await service.checkRateLimit(mockRequest);

      // Assert
      expect(result.allowed).toBe(true);
      expect(result.remainingRequests).toBe(5);
      expect(mockStore.checkAndIncrement).toHaveBeenCalledWith('192.168.1.1', 60, 10);
    });

    it('should block request when rate limit exceeded', async () => {
      // Arrange
      const mockRequest = { ip: '192.168.1.1' };
      const mockResult = {
        allowed: false,
        identifier: '192.168.1.1',
        currentCount: 11,
        maxRequests: 10,
        remainingRequests: 0,
        resetTime: new Date(Date.now() + 60000),
        windowStart: new Date(),
        windowEnd: new Date(Date.now() + 60000)
      };
      (mockStore.checkAndIncrement as any).mockResolvedValue(mockResult);

      // Act
      const result = await service.checkRateLimit(mockRequest);

      // Assert
      expect(result.allowed).toBe(false);
      expect(result.remainingRequests).toBe(0);
      expect(result.currentCount).toBe(11);
    });

    it('should skip rate limiting when skip condition is met', async () => {
      // Arrange
      const mockRequest = { ip: '192.168.1.1', skipRateLimit: true };

      // Act
      const result = await service.checkRateLimit(mockRequest);

      // Assert
      expect(result.allowed).toBe(true);
      expect(result.identifier).toBe('skipped');
      expect(mockStore.checkAndIncrement).not.toHaveBeenCalled();
    });

    it('should use custom key generator when provided', async () => {
      // Arrange
      const customConfig = {
        ...config,
        keyGenerator: (req: any) => `user:${req.userId}`
      };
      const customService = new RateLimitService(mockStore, customConfig);
      const mockRequest = { ip: '192.168.1.1', userId: 'user123' };
      const mockResult = {
        allowed: true,
        identifier: 'user:user123',
        currentCount: 1,
        maxRequests: 10,
        remainingRequests: 9,
        resetTime: new Date(Date.now() + 60000),
        windowStart: new Date(),
        windowEnd: new Date(Date.now() + 60000)
      };
      (mockStore.checkAndIncrement as any).mockResolvedValue(mockResult);

      // Act
      const result = await customService.checkRateLimit(mockRequest);

      // Assert
      expect(result.identifier).toBe('user:user123');
      expect(mockStore.checkAndIncrement).toHaveBeenCalledWith('user:user123', 60, 10);
    });
  });

  describe('Status Checking', () => {
    it('should get current status without incrementing counter', async () => {
      // Arrange
      const mockRequest = { ip: '192.168.1.1' };
      const mockResult = {
        allowed: true,
        identifier: '192.168.1.1',
        currentCount: 3,
        maxRequests: 10,
        remainingRequests: 7,
        resetTime: new Date(Date.now() + 60000),
        windowStart: new Date(),
        windowEnd: new Date(Date.now() + 60000)
      };
      (mockStore.getStatus as any).mockResolvedValue(mockResult);

      // Act
      const result = await service.getStatus(mockRequest);

      // Assert
      expect(result.currentCount).toBe(3);
      expect(result.remainingRequests).toBe(7);
      expect(mockStore.getStatus).toHaveBeenCalledWith('192.168.1.1', 60, 10);
      expect(mockStore.checkAndIncrement).not.toHaveBeenCalled();
    });
  });

  describe('Reset and Cleanup', () => {
    it('should reset rate limit for specific identifier', async () => {
      // Arrange
      const mockRequest = { ip: '192.168.1.1' };

      // Act
      await service.reset(mockRequest);

      // Assert
      expect(mockStore.reset).toHaveBeenCalledWith('192.168.1.1');
    });

    it('should handle reset when store does not support it', async () => {
      // Arrange
      const storeWithoutReset = {
        checkAndIncrement: vi.fn(),
        getStatus: vi.fn()
      };
      const serviceWithoutReset = new RateLimitService(storeWithoutReset, config);
      const mockRequest = { ip: '192.168.1.1' };

      // Act & Assert
      await expect(serviceWithoutReset.reset(mockRequest)).resolves.not.toThrow();
    });

    it('should clean up expired counters', async () => {
      // Arrange
      (mockStore.cleanup as any).mockResolvedValue(5);

      // Act
      const result = await service.cleanup();

      // Assert
      expect(result).toBe(5);
      expect(mockStore.cleanup).toHaveBeenCalled();
    });

    it('should handle cleanup when store does not support it', async () => {
      // Arrange
      const storeWithoutCleanup = {
        checkAndIncrement: vi.fn(),
        getStatus: vi.fn()
      };
      const serviceWithoutCleanup = new RateLimitService(storeWithoutCleanup, config);

      // Act
      const result = await serviceWithoutCleanup.cleanup();

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('Middleware Creation', () => {
    it('should create middleware that allows requests under limit', async () => {
      // Arrange
      const mockRequest = { ip: '192.168.1.1' };
      const mockResponse = {
        set: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const mockNext = vi.fn();
      const mockResult = {
        allowed: true,
        identifier: '192.168.1.1',
        currentCount: 5,
        maxRequests: 10,
        remainingRequests: 5,
        resetTime: new Date(Date.now() + 60000),
        windowStart: new Date(),
        windowEnd: new Date(Date.now() + 60000)
      };
      (mockStore.checkAndIncrement as any).mockResolvedValue(mockResult);

      // Act
      const middleware = service.middleware();
      await middleware(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.set).toHaveBeenCalledWith({
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '5',
        'X-RateLimit-Reset': expect.any(String),
        'X-RateLimit-Window': '60000'
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should create middleware that blocks requests over limit', async () => {
      // Arrange
      const mockRequest = { ip: '192.168.1.1' };
      const mockResponse = {
        set: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const mockNext = vi.fn();
      const mockResult = {
        allowed: false,
        identifier: '192.168.1.1',
        currentCount: 11,
        maxRequests: 10,
        remainingRequests: 0,
        resetTime: new Date(Date.now() + 30000), // Reset in 30 seconds
        windowStart: new Date(),
        windowEnd: new Date(Date.now() + 60000)
      };
      (mockStore.checkAndIncrement as any).mockResolvedValue(mockResult);

      // Act
      const middleware = service.middleware();
      await middleware(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Too Many Requests',
        message: expect.stringContaining('Rate limit exceeded'),
        retryAfter: expect.any(Number)
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle middleware errors gracefully', async () => {
      // Arrange
      const mockRequest = { ip: '192.168.1.1' };
      const mockResponse = {
        set: vi.fn(),
        status: vi.fn(),
        json: vi.fn()
      };
      const mockNext = vi.fn();
      (mockStore.checkAndIncrement as any).mockRejectedValue(new Error('Store error'));

      // Act
      const middleware = service.middleware();
      await middleware(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled(); // Should continue despite error
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration', () => {
      // Arrange
      const newConfig = { maxRequests: 20 };

      // Act
      service.updateConfig(newConfig);
      const config = service.getConfig();

      // Assert
      expect(config.maxRequests).toBe(20);
      expect(config.windowMs).toBe(60000); // Should preserve other config
    });

    it('should get current configuration', () => {
      // Act
      const currentConfig = service.getConfig();

      // Assert
      expect(currentConfig).toEqual(config);
    });
  });

  describe('Default Identifier Generation', () => {
    it('should generate identifier from IP address', async () => {
      // Arrange
      const serviceWithoutKeyGen = new RateLimitService(mockStore, {
        windowMs: 60000,
        maxRequests: 10
      });
      const mockRequest = { ip: '192.168.1.1' };
      const mockResult = {
        allowed: true,
        identifier: '192.168.1.1',
        currentCount: 1,
        maxRequests: 10,
        remainingRequests: 9,
        resetTime: new Date(Date.now() + 60000),
        windowStart: new Date(),
        windowEnd: new Date(Date.now() + 60000)
      };
      (mockStore.checkAndIncrement as any).mockResolvedValue(mockResult);

      // Act
      await serviceWithoutKeyGen.checkRateLimit(mockRequest);

      // Assert
      expect(mockStore.checkAndIncrement).toHaveBeenCalledWith('192.168.1.1', 60, 10);
    });

    it('should use forwarded IP when available', async () => {
      // Arrange
      const serviceWithoutKeyGen = new RateLimitService(mockStore, {
        windowMs: 60000,
        maxRequests: 10
      });
      const mockRequest = { 
        headers: { 'x-forwarded-for': '203.0.113.1, 192.168.1.1' }
      };
      const mockResult = {
        allowed: true,
        identifier: '203.0.113.1',
        currentCount: 1,
        maxRequests: 10,
        remainingRequests: 9,
        resetTime: new Date(Date.now() + 60000),
        windowStart: new Date(),
        windowEnd: new Date(Date.now() + 60000)
      };
      (mockStore.checkAndIncrement as any).mockResolvedValue(mockResult);

      // Act
      await serviceWithoutKeyGen.checkRateLimit(mockRequest);

      // Assert
      expect(mockStore.checkAndIncrement).toHaveBeenCalledWith('203.0.113.1', 60, 10);
    });

    it('should fallback to unknown when no IP available', async () => {
      // Arrange
      const serviceWithoutKeyGen = new RateLimitService(mockStore, {
        windowMs: 60000,
        maxRequests: 10
      });
      const mockRequest = {}; // No IP information
      const mockResult = {
        allowed: true,
        identifier: 'unknown',
        currentCount: 1,
        maxRequests: 10,
        remainingRequests: 9,
        resetTime: new Date(Date.now() + 60000),
        windowStart: new Date(),
        windowEnd: new Date(Date.now() + 60000)
      };
      (mockStore.checkAndIncrement as any).mockResolvedValue(mockResult);

      // Act
      await serviceWithoutKeyGen.checkRateLimit(mockRequest);

      // Assert
      expect(mockStore.checkAndIncrement).toHaveBeenCalledWith('unknown', 60, 10);
    });
  });
});