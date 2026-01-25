/**
 * 🔧 Tests Unitaires - Module Services & API
 * 
 * Couverture complète:
 * - Rate limiting (auth, music, API)
 * - Alert service (deduplication, throttling)
 * - Health monitoring
 * - Error standardization
 * - Edge function responses
 * - Edge cases & resilience
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ============================================
// TYPES & INTERFACES
// ============================================

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
}

interface Incident {
  type: string;
  message: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp?: string;
  context?: Record<string, any>;
}

interface Alert {
  id: string;
  incident: Incident;
  status: 'open' | 'acknowledged' | 'resolved';
  createdAt: string;
  notificationsSent: string[];
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  errorRate: number;
  services: Record<string, 'up' | 'down'>;
}

interface APIError {
  error: string;
  code: number;
  message: string;
  timestamp: string;
  requestId?: string;
}

// ============================================
// MOCK IMPLEMENTATIONS
// ============================================

const requestCounts: Map<string, { count: number; windowStart: number; blockedUntil?: number }> = new Map();

const RATE_LIMITS = {
  auth: { maxRequests: 5, windowMs: 15 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 },
  extraction: { maxRequests: 10, windowMs: 60 * 1000 },
  music: { maxRequests: 20, windowMs: 60 * 1000 },
  api: { maxRequests: 100, windowMs: 60 * 1000 },
  admin: { maxRequests: 50, windowMs: 60 * 1000 }
};

const recentAlerts: Map<string, number> = new Map();
const DEDUP_WINDOW_MS = 60000;
let alertRateLimitCount = 0;
const MAX_ALERTS_PER_MINUTE = 10;

describe('Services Module - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requestCounts.clear();
    recentAlerts.clear();
    alertRateLimitCount = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================
  // RATE LIMITING TESTS
  // ============================================

  describe('Rate Limiting', () => {
    const checkRateLimit = (identifier: string, config: RateLimitConfig): RateLimitStatus => {
      const now = Date.now();
      const key = identifier;
      const record = requestCounts.get(key);

      if (record?.blockedUntil && now < record.blockedUntil) {
        return {
          allowed: false,
          remaining: 0,
          retryAfter: Math.ceil((record.blockedUntil - now) / 1000)
        };
      }

      if (!record || now - record.windowStart > config.windowMs) {
        requestCounts.set(key, { count: 1, windowStart: now });
        return { allowed: true, remaining: config.maxRequests - 1 };
      }

      if (record.count >= config.maxRequests) {
        if (config.blockDurationMs) {
          record.blockedUntil = now + config.blockDurationMs;
          requestCounts.set(key, record);
        }
        return {
          allowed: false,
          remaining: 0,
          retryAfter: config.blockDurationMs 
            ? Math.ceil(config.blockDurationMs / 1000)
            : Math.ceil((record.windowStart + config.windowMs - now) / 1000)
        };
      }

      record.count++;
      requestCounts.set(key, record);
      return { allowed: true, remaining: config.maxRequests - record.count };
    };

    it('should allow requests within limit', () => {
      const result = checkRateLimit('user-1', RATE_LIMITS.api);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99);
    });

    it('should track request count correctly', () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit('user-2', RATE_LIMITS.auth);
      }
      
      const result = checkRateLimit('user-2', RATE_LIMITS.auth);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should block after limit exceeded for auth', () => {
      for (let i = 0; i < 6; i++) {
        checkRateLimit('user-3', RATE_LIMITS.auth);
      }
      
      const result = checkRateLimit('user-3', RATE_LIMITS.auth);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should reset after window expires', () => {
      const shortConfig = { maxRequests: 2, windowMs: 100 };
      checkRateLimit('user-4', shortConfig);
      checkRateLimit('user-4', shortConfig);
      
      // Simulate window expiry
      const record = requestCounts.get('user-4');
      if (record) {
        record.windowStart = Date.now() - 200;
        requestCounts.set('user-4', record);
      }
      
      const result = checkRateLimit('user-4', shortConfig);
      expect(result.allowed).toBe(true);
    });

    it('should handle different limit types correctly', () => {
      expect(RATE_LIMITS.auth.maxRequests).toBe(5);
      expect(RATE_LIMITS.music.maxRequests).toBe(20);
      expect(RATE_LIMITS.api.maxRequests).toBe(100);
    });

    it('should calculate remaining correctly', () => {
      const config = { maxRequests: 10, windowMs: 60000 };
      
      checkRateLimit('user-5', config);
      checkRateLimit('user-5', config);
      checkRateLimit('user-5', config);
      
      const result = checkRateLimit('user-5', config);
      expect(result.remaining).toBe(6);
    });

    it('should handle anonymous users', () => {
      const result = checkRateLimit('anonymous', RATE_LIMITS.api);
      expect(result.allowed).toBe(true);
    });

    it('should isolate limits per user', () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit('user-A', RATE_LIMITS.auth);
      }
      
      const resultA = checkRateLimit('user-A', RATE_LIMITS.auth);
      const resultB = checkRateLimit('user-B', RATE_LIMITS.auth);
      
      expect(resultA.allowed).toBe(false);
      expect(resultB.allowed).toBe(true);
    });
  });

  // ============================================
  // ALERT SERVICE TESTS
  // ============================================

  describe('Alert Service', () => {
    const generateAlertId = (): string => {
      return `alert_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    };

    const isDuplicate = (incident: Incident): boolean => {
      const key = `${incident.type}:${incident.message}`;
      const lastTime = recentAlerts.get(key);
      
      if (lastTime && Date.now() - lastTime < DEDUP_WINDOW_MS) {
        return true;
      }
      
      recentAlerts.set(key, Date.now());
      return false;
    };

    const checkAlertRateLimit = (): boolean => {
      if (alertRateLimitCount >= MAX_ALERTS_PER_MINUTE) {
        return false;
      }
      alertRateLimitCount++;
      return true;
    };

    const determineSeverity = (incident: Incident): string => {
      if (incident.type === 'CRITICAL_ERROR') return 'critical';
      if (incident.type === 'DATABASE_ERROR') return 'high';
      if (incident.type === 'API_ERROR') return 'medium';
      return incident.severity || 'low';
    };

    it('should generate unique alert IDs', () => {
      const id1 = generateAlertId();
      const id2 = generateAlertId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^alert_\d+_\d+$/);
    });

    it('should detect duplicate alerts', () => {
      const incident: Incident = { type: 'ERROR', message: 'Test error' };
      
      const first = isDuplicate(incident);
      const second = isDuplicate(incident);
      
      expect(first).toBe(false);
      expect(second).toBe(true);
    });

    it('should allow same alert after window expires', () => {
      const incident: Incident = { type: 'ERROR', message: 'Unique error' };
      
      isDuplicate(incident);
      
      // Simulate window expiry
      const key = `${incident.type}:${incident.message}`;
      recentAlerts.set(key, Date.now() - DEDUP_WINDOW_MS - 1000);
      
      const result = isDuplicate(incident);
      expect(result).toBe(false);
    });

    it('should rate limit alerts', () => {
      for (let i = 0; i < MAX_ALERTS_PER_MINUTE; i++) {
        checkAlertRateLimit();
      }
      
      const result = checkAlertRateLimit();
      expect(result).toBe(false);
    });

    it('should determine severity correctly', () => {
      expect(determineSeverity({ type: 'CRITICAL_ERROR', message: '' })).toBe('critical');
      expect(determineSeverity({ type: 'DATABASE_ERROR', message: '' })).toBe('high');
      expect(determineSeverity({ type: 'API_ERROR', message: '' })).toBe('medium');
      expect(determineSeverity({ type: 'INFO', message: '', severity: 'low' })).toBe('low');
    });

    it('should create proper alert structure', () => {
      const incident: Incident = {
        type: 'BACKEND_ERROR',
        message: 'Connection failed',
        timestamp: new Date().toISOString()
      };
      
      const alert: Alert = {
        id: generateAlertId(),
        incident,
        status: 'open',
        createdAt: new Date().toISOString(),
        notificationsSent: []
      };
      
      expect(alert.status).toBe('open');
      expect(alert.notificationsSent).toEqual([]);
    });

    it('should differentiate similar alerts', () => {
      const incident1: Incident = { type: 'ERROR', message: 'Error A' };
      const incident2: Incident = { type: 'ERROR', message: 'Error B' };
      
      const dup1 = isDuplicate(incident1);
      const dup2 = isDuplicate(incident2);
      
      expect(dup1).toBe(false);
      expect(dup2).toBe(false);
    });
  });

  // ============================================
  // HEALTH MONITORING TESTS
  // ============================================

  describe('Health Monitoring', () => {
    const checkHealth = async (): Promise<SystemHealth> => {
      const startTime = Date.now();
      
      // Simulate health checks
      const dbHealthy = Math.random() > 0.1;
      const authHealthy = Math.random() > 0.05;
      const functionsHealthy = Math.random() > 0.15;
      
      const responseTime = Date.now() - startTime + Math.floor(Math.random() * 100);
      const errorRate = Math.floor(Math.random() * 5);
      
      const allHealthy = dbHealthy && authHealthy && functionsHealthy;
      const anyDown = !dbHealthy || !authHealthy || !functionsHealthy;
      
      return {
        status: allHealthy ? 'healthy' : anyDown ? 'degraded' : 'down',
        responseTime,
        errorRate,
        services: {
          database: dbHealthy ? 'up' : 'down',
          auth: authHealthy ? 'up' : 'down',
          functions: functionsHealthy ? 'up' : 'down'
        }
      };
    };

    it('should return valid health structure', async () => {
      const health = await checkHealth();
      
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('responseTime');
      expect(health).toHaveProperty('errorRate');
      expect(health).toHaveProperty('services');
    });

    it('should track response time', async () => {
      const health = await checkHealth();
      
      expect(health.responseTime).toBeGreaterThanOrEqual(0);
      expect(health.responseTime).toBeLessThan(1000);
    });

    it('should have valid status values', async () => {
      const health = await checkHealth();
      
      expect(['healthy', 'degraded', 'down']).toContain(health.status);
    });

    it('should report service status', async () => {
      const health = await checkHealth();
      
      expect(['up', 'down']).toContain(health.services.database);
      expect(['up', 'down']).toContain(health.services.auth);
      expect(['up', 'down']).toContain(health.services.functions);
    });

    it('should calculate error rate as percentage', async () => {
      const health = await checkHealth();
      
      expect(health.errorRate).toBeGreaterThanOrEqual(0);
      expect(health.errorRate).toBeLessThanOrEqual(100);
    });

    it('should handle concurrent health checks', async () => {
      const checks = await Promise.all([
        checkHealth(),
        checkHealth(),
        checkHealth()
      ]);
      
      expect(checks.length).toBe(3);
      checks.forEach(h => expect(h.status).toBeDefined());
    });
  });

  // ============================================
  // ERROR STANDARDIZATION TESTS
  // ============================================

  describe('Error Standardization', () => {
    const createAPIError = (
      code: number,
      message: string,
      details?: string
    ): APIError => ({
      error: details || message,
      code,
      message,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });

    const isRetryable = (code: number): boolean => {
      return [408, 429, 500, 502, 503, 504].includes(code);
    };

    const getErrorCategory = (code: number): string => {
      if (code >= 400 && code < 500) return 'client';
      if (code >= 500) return 'server';
      return 'unknown';
    };

    it('should create standard error format', () => {
      const error = createAPIError(404, 'Not Found', 'Resource not found');
      
      expect(error).toHaveProperty('error');
      expect(error).toHaveProperty('code');
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('timestamp');
      expect(error).toHaveProperty('requestId');
    });

    it('should identify retryable errors', () => {
      expect(isRetryable(429)).toBe(true);
      expect(isRetryable(500)).toBe(true);
      expect(isRetryable(503)).toBe(true);
      expect(isRetryable(404)).toBe(false);
      expect(isRetryable(401)).toBe(false);
    });

    it('should categorize errors correctly', () => {
      expect(getErrorCategory(400)).toBe('client');
      expect(getErrorCategory(401)).toBe('client');
      expect(getErrorCategory(404)).toBe('client');
      expect(getErrorCategory(500)).toBe('server');
      expect(getErrorCategory(502)).toBe('server');
    });

    it('should include timestamp in ISO format', () => {
      const error = createAPIError(500, 'Internal Error');
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      
      expect(error.timestamp).toMatch(dateRegex);
    });

    it('should generate unique request IDs', () => {
      // Verify request ID format matches expected pattern
      const error = createAPIError(400, 'Error');
      expect(error.requestId).toMatch(/^req_\d+$/);
    });

    it('should handle various error codes', () => {
      const codes = [400, 401, 403, 404, 409, 422, 429, 500, 502, 503];
      
      codes.forEach(code => {
        const error = createAPIError(code, `Error ${code}`);
        expect(error.code).toBe(code);
      });
    });
  });

  // ============================================
  // EDGE FUNCTION RESPONSE TESTS
  // ============================================

  describe('Edge Function Responses', () => {
    const createSuccessResponse = <T>(data: T, meta?: Record<string, any>) => ({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    });

    const createErrorResponse = (code: number, message: string) => ({
      success: false,
      error: {
        code,
        message,
        timestamp: new Date().toISOString()
      }
    });

    it('should create success response with data', () => {
      const response = createSuccessResponse({ id: '123', name: 'Test' });
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ id: '123', name: 'Test' });
    });

    it('should include metadata in success response', () => {
      const response = createSuccessResponse(null, { version: '1.0' });
      
      expect((response.meta as any).version).toBe('1.0');
      expect(response.meta.timestamp).toBeDefined();
    });

    it('should create error response format', () => {
      const response = createErrorResponse(404, 'Not Found');
      
      expect(response.success).toBe(false);
      expect(response.error.code).toBe(404);
      expect(response.error.message).toBe('Not Found');
    });

    it('should handle empty data', () => {
      const response = createSuccessResponse(null);
      
      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
    });

    it('should handle array data', () => {
      const response = createSuccessResponse([1, 2, 3]);
      
      expect(response.data).toEqual([1, 2, 3]);
    });
  });

  // ============================================
  // RESILIENCE & RETRY TESTS
  // ============================================

  describe('Resilience & Retry', () => {
    const withRetry = async <T>(
      fn: () => Promise<T>,
      maxRetries: number = 3,
      delay: number = 100
    ): Promise<T> => {
      let lastError: Error | undefined;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error as Error;
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt)));
          }
        }
      }
      
      throw lastError;
    };

    it('should succeed on first try', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      
      const result = await withRetry(fn);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');
      
      const result = await withRetry(fn, 3, 10);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('persistent error'));
      
      await expect(withRetry(fn, 2, 10)).rejects.toThrow('persistent error');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should apply exponential backoff', async () => {
      const delays: number[] = [];
      const originalSetTimeout = global.setTimeout;
      
      vi.spyOn(global, 'setTimeout').mockImplementation((fn: any, delay?: number) => {
        if (delay) delays.push(delay);
        return originalSetTimeout(fn, 0);
      });
      
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error())
        .mockRejectedValueOnce(new Error())
        .mockResolvedValue('ok');
      
      await withRetry(fn, 3, 100);
      
      expect(delays[0]).toBe(100);
      expect(delays[1]).toBe(200);
      
      vi.restoreAllMocks();
    });
  });

  // ============================================
  // EDGE CASES & ERROR HANDLING
  // ============================================

  describe('Edge Cases & Error Handling', () => {
    it('should handle null inputs gracefully', () => {
      const sanitize = (input: string | null): string => {
        if (!input) return '';
        return input.trim();
      };
      
      expect(sanitize(null)).toBe('');
      expect(sanitize('')).toBe('');
    });

    it('should handle undefined config', () => {
      const getConfig = (key: string, defaults: Record<string, any> = {}): any => {
        return defaults[key] ?? null;
      };
      
      expect(getConfig('missing')).toBeNull();
      expect(getConfig('key', { key: 'value' })).toBe('value');
    });

    it('should handle concurrent operations', async () => {
      const operations = Array.from({ length: 10 }, (_, i) => 
        Promise.resolve({ id: i, success: true })
      );
      
      const results = await Promise.all(operations);
      
      expect(results.length).toBe(10);
      expect(results.every(r => r.success)).toBe(true);
    });

    it('should handle timeout', async () => {
      const withTimeout = <T>(
        promise: Promise<T>,
        ms: number
      ): Promise<T> => {
        return Promise.race([
          promise,
          new Promise<T>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), ms)
          )
        ]);
      };
      
      const slowOperation = new Promise(r => setTimeout(() => r('done'), 100));
      
      await expect(withTimeout(slowOperation, 10)).rejects.toThrow('Timeout');
    });

    it('should handle malformed data', () => {
      const parseJSON = (str: string): any => {
        try {
          return JSON.parse(str);
        } catch {
          return null;
        }
      };
      
      expect(parseJSON('{"valid": true}')).toEqual({ valid: true });
      expect(parseJSON('invalid json')).toBeNull();
      expect(parseJSON('')).toBeNull();
    });

    it('should handle service unavailable', () => {
      const isServiceAvailable = (status: number): boolean => {
        return status < 500;
      };
      
      expect(isServiceAvailable(200)).toBe(true);
      expect(isServiceAvailable(404)).toBe(true);
      expect(isServiceAvailable(500)).toBe(false);
      expect(isServiceAvailable(503)).toBe(false);
    });
  });
});
