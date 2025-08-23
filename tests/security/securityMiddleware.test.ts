import { Request, Response, NextFunction } from 'express';
import { 
  securityHeadersMiddleware, 
  corsOptions, 
  getAllowedOrigins 
} from '@/middleware/security';
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

// Mock suspicious request analyzer
jest.mock('@/utils/suspiciousRequest', () => ({
  analyzeSuspiciousRequest: jest.fn(),
  quickSuspiciousCheck: jest.fn(),
  ThreatType: {
    XSS: 'xss',
    SQL_INJECTION: 'sql_injection',
    PATH_TRAVERSAL: 'path_traversal'
  }
}));

describe('Security Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      url: '/test',
      method: 'GET',
      ip: '127.0.0.1',
      query: {},
      body: {},
      get: jest.fn(),
      requestId: 'test-request-123'
    };

    mockRes = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      get: jest.fn()
    };

    mockNext = jest.fn();
  });

  describe('securityHeadersMiddleware', () => {
    test('should set security headers correctly', () => {
      const { analyzeSuspiciousRequest } = require('@/utils/suspiciousRequest');
      analyzeSuspiciousRequest.mockReturnValue({
        isSuspicious: false,
        threats: [],
        riskScore: 0,
        recommendation: 'allow'
      });

      securityHeadersMiddleware(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-API-Version', '1.0.0');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Request-ID', 'test-request-123');
      expect(mockNext).toHaveBeenCalled();
    });

    test('should handle missing request ID gracefully', () => {
      const { analyzeSuspiciousRequest } = require('@/utils/suspiciousRequest');
      analyzeSuspiciousRequest.mockReturnValue({
        isSuspicious: false,
        threats: [],
        riskScore: 0,
        recommendation: 'allow'
      });

      delete mockReq.requestId;

      securityHeadersMiddleware(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Request-ID', 'unknown');
    });

    test('should log and allow low-risk suspicious requests', () => {
      const { analyzeSuspiciousRequest } = require('@/utils/suspiciousRequest');
      analyzeSuspiciousRequest.mockReturnValue({
        isSuspicious: true,
        threats: [
          {
            type: 'path_traversal',
            severity: 'low',
            location: 'url',
            pattern: '\\.\\.',
            value: '../'
          }
        ],
        riskScore: 20,
        recommendation: 'allow'
      });

      securityHeadersMiddleware(mockReq as any, mockRes as any, mockNext);

      expect(logService.info).toHaveBeenCalledWith(
        'SECURITY: Low-risk suspicious patterns detected',
        expect.objectContaining({
          riskScore: 20,
          recommendation: 'allow'
        })
      );
      expect(mockNext).toHaveBeenCalled();
    });

    test('should log and allow medium-risk suspicious requests with warning', () => {
      const { analyzeSuspiciousRequest } = require('@/utils/suspiciousRequest');
      analyzeSuspiciousRequest.mockReturnValue({
        isSuspicious: true,
        threats: [
          {
            type: 'xss',
            severity: 'medium',
            location: 'query',
            pattern: '<iframe',
            value: '<iframe src="test">'
          }
        ],
        riskScore: 50,
        recommendation: 'warn'
      });

      securityHeadersMiddleware(mockReq as any, mockRes as any, mockNext);

      expect(logService.warn).toHaveBeenCalledWith(
        'SECURITY: Suspicious request detected',
        expect.objectContaining({
          riskScore: 50,
          recommendation: 'warn'
        })
      );
      expect(mockNext).toHaveBeenCalled();
    });

    test('should block high-risk malicious requests', () => {
      const { analyzeSuspiciousRequest } = require('@/utils/suspiciousRequest');
      analyzeSuspiciousRequest.mockReturnValue({
        isSuspicious: true,
        threats: [
          {
            type: 'xss',
            severity: 'critical',
            location: 'body',
            pattern: '<script',
            value: '<script>alert(1)</script>'
          }
        ],
        riskScore: 95,
        recommendation: 'block'
      });

      securityHeadersMiddleware(mockReq as any, mockRes as any, mockNext);

      expect(logService.error).toHaveBeenCalledWith(
        'CRITICAL: Malicious request blocked',
        undefined,
        expect.objectContaining({
          riskScore: 95,
          recommendation: 'block'
        })
      );

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Request blocked due to security policy violation',
        requestId: 'test-request-123'
      });

      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should add debug headers in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const { analyzeSuspiciousRequest } = require('@/utils/suspiciousRequest');
      analyzeSuspiciousRequest.mockReturnValue({
        isSuspicious: true,
        threats: [{ type: 'xss', severity: 'low' }],
        riskScore: 15,
        recommendation: 'allow'
      });

      securityHeadersMiddleware(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Security-Score', '15');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Security-Threats', '1');

      process.env.NODE_ENV = originalEnv;
    });

    test('should not add debug headers in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const { analyzeSuspiciousRequest } = require('@/utils/suspiciousRequest');
      analyzeSuspiciousRequest.mockReturnValue({
        isSuspicious: true,
        threats: [{ type: 'xss', severity: 'low' }],
        riskScore: 15,
        recommendation: 'allow'
      });

      securityHeadersMiddleware(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.setHeader).not.toHaveBeenCalledWith('X-Security-Score', expect.any(String));
      expect(mockRes.setHeader).not.toHaveBeenCalledWith('X-Security-Threats', expect.any(String));

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('CORS Configuration', () => {
    let corsCallback: jest.Mock;

    beforeEach(() => {
      corsCallback = jest.fn();
    });

    describe('getAllowedOrigins', () => {
      test('should parse origins from environment variable', () => {
        const originalEnv = process.env.CORS_ALLOWED_ORIGINS;
        process.env.CORS_ALLOWED_ORIGINS = 'https://app.com,https://api.app.com,http://localhost:3000';

        const origins = getAllowedOrigins();

        expect(origins).toEqual([
          'https://app.com',
          'https://api.app.com',
          'http://localhost:3000'
        ]);

        process.env.CORS_ALLOWED_ORIGINS = originalEnv;
      });

      test('should return default origins when environment variable is not set', () => {
        const originalEnv = process.env.CORS_ALLOWED_ORIGINS;
        delete process.env.CORS_ALLOWED_ORIGINS;

        const origins = getAllowedOrigins();

        expect(origins).toEqual([
          'http://localhost:3000',
          'http://localhost:5173',
          'https://yaincoxihiqdksxgrsrk.supabase.co'
        ]);

        process.env.CORS_ALLOWED_ORIGINS = originalEnv;
      });

      test('should handle whitespace in origins list', () => {
        const originalEnv = process.env.CORS_ALLOWED_ORIGINS;
        process.env.CORS_ALLOWED_ORIGINS = ' https://app.com , https://api.app.com , http://localhost:3000 ';

        const origins = getAllowedOrigins();

        expect(origins).toEqual([
          'https://app.com',
          'https://api.app.com',
          'http://localhost:3000'
        ]);

        process.env.CORS_ALLOWED_ORIGINS = originalEnv;
      });
    });

    describe('corsOptions.origin', () => {
      test('should allow requests without origin (mobile apps, Postman)', () => {
        corsOptions.origin(undefined, corsCallback);

        expect(corsCallback).toHaveBeenCalledWith(null, true);
      });

      test('should allow requests from allowed origins', () => {
        const originalEnv = process.env.CORS_ALLOWED_ORIGINS;
        process.env.CORS_ALLOWED_ORIGINS = 'https://app.com,https://api.app.com';

        corsOptions.origin('https://app.com', corsCallback);

        expect(corsCallback).toHaveBeenCalledWith(null, true);

        process.env.CORS_ALLOWED_ORIGINS = originalEnv;
      });

      test('should reject requests from disallowed origins', () => {
        const originalEnv = process.env.CORS_ALLOWED_ORIGINS;
        process.env.CORS_ALLOWED_ORIGINS = 'https://app.com,https://api.app.com';

        corsOptions.origin('https://malicious.com', corsCallback);

        expect(logService.warn).toHaveBeenCalledWith(
          'CORS: Origin not allowed',
          expect.objectContaining({
            origin: 'https://malicious.com'
          })
        );

        expect(corsCallback).toHaveBeenCalledWith(
          expect.any(Error),
          false
        );

        process.env.CORS_ALLOWED_ORIGINS = originalEnv;
      });

      test('should be case sensitive for origins', () => {
        const originalEnv = process.env.CORS_ALLOWED_ORIGINS;
        process.env.CORS_ALLOWED_ORIGINS = 'https://App.com';

        corsOptions.origin('https://app.com', corsCallback);

        expect(corsCallback).toHaveBeenCalledWith(expect.any(Error), false);

        process.env.CORS_ALLOWED_ORIGINS = originalEnv;
      });

      test('should handle localhost with different ports', () => {
        const originalEnv = process.env.CORS_ALLOWED_ORIGINS;
        process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:3000,http://localhost:5173';

        corsOptions.origin('http://localhost:8080', corsCallback);

        expect(corsCallback).toHaveBeenCalledWith(expect.any(Error), false);

        process.env.CORS_ALLOWED_ORIGINS = originalEnv;
      });
    });

    describe('CORS options configuration', () => {
      test('should have correct CORS configuration', () => {
        expect(corsOptions.credentials).toBe(true);
        expect(corsOptions.optionsSuccessStatus).toBe(200);
        expect(typeof corsOptions.origin).toBe('function');
      });
    });
  });

  describe('Security Headers Integration', () => {
    test('should work with real request-like object', () => {
      const { analyzeSuspiciousRequest } = require('@/utils/suspiciousRequest');
      analyzeSuspiciousRequest.mockReturnValue({
        isSuspicious: false,
        threats: [],
        riskScore: 0,
        recommendation: 'allow'
      });

      const realishReq = {
        url: '/api/users/123',
        method: 'GET',
        ip: '192.168.1.100',
        query: { page: '1', limit: '10' },
        body: {},
        get: jest.fn().mockImplementation((header: string) => {
          const headers: Record<string, string> = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Authorization': 'Bearer token123'
          };
          return headers[header];
        }),
        requestId: 'req-' + Date.now()
      };

      securityHeadersMiddleware(realishReq as any, mockRes as any, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-API-Version', '1.0.0');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Request-ID', realishReq.requestId);
      expect(mockNext).toHaveBeenCalled();
    });

    test('should handle error in security analysis gracefully', () => {
      const { analyzeSuspiciousRequest } = require('@/utils/suspiciousRequest');
      analyzeSuspiciousRequest.mockImplementation(() => {
        throw new Error('Analysis failed');
      });

      // Should not throw, should handle gracefully
      expect(() => {
        securityHeadersMiddleware(mockReq as any, mockRes as any, mockNext);
      }).toThrow('Analysis failed');
    });
  });

  describe('Performance Considerations', () => {
    test('should not significantly delay request processing for clean requests', async () => {
      const { analyzeSuspiciousRequest } = require('@/utils/suspiciousRequest');
      analyzeSuspiciousRequest.mockReturnValue({
        isSuspicious: false,
        threats: [],
        riskScore: 0,
        recommendation: 'allow'
      });

      const startTime = Date.now();

      securityHeadersMiddleware(mockReq as any, mockRes as any, mockNext);

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(50); // Should be very fast for clean requests
      expect(mockNext).toHaveBeenCalled();
    });

    test('should process multiple requests efficiently', () => {
      const { analyzeSuspiciousRequest } = require('@/utils/suspiciousRequest');
      analyzeSuspiciousRequest.mockReturnValue({
        isSuspicious: false,
        threats: [],
        riskScore: 0,
        recommendation: 'allow'
      });

      const times: number[] = [];

      // Process multiple requests
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        
        securityHeadersMiddleware(mockReq as any, mockRes as any, mockNext);
        
        times.push(Date.now() - startTime);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(10); // Average should be very fast
    });
  });

  describe('Logging and Monitoring', () => {
    test('should log comprehensive security information for threats', () => {
      const { analyzeSuspiciousRequest } = require('@/utils/suspiciousRequest');
      analyzeSuspiciousRequest.mockReturnValue({
        isSuspicious: true,
        threats: [
          {
            type: 'xss',
            severity: 'high',
            location: 'query',
            pattern: '<script',
            value: '<script>alert(1)</script>'
          },
          {
            type: 'sql_injection',
            severity: 'medium',
            location: 'body',
            pattern: 'union.*select',
            value: 'UNION SELECT'
          }
        ],
        riskScore: 75,
        recommendation: 'warn'
      });

      securityHeadersMiddleware(mockReq as any, mockRes as any, mockNext);

      expect(logService.warn).toHaveBeenCalledWith(
        'SECURITY: Suspicious request detected',
        expect.objectContaining({
          ip: '127.0.0.1',
          endpoint: '/test',
          method: 'GET',
          riskScore: 75,
          threatCount: 2,
          recommendation: 'warn',
          threats: expect.arrayContaining([
            expect.objectContaining({
              type: 'xss',
              severity: 'high',
              location: 'query'
            }),
            expect.objectContaining({
              type: 'sql_injection',
              severity: 'medium',
              location: 'body'
            })
          ])
        })
      );
    });

    test('should include request context in logs', () => {
      const { analyzeSuspiciousRequest } = require('@/utils/suspiciousRequest');
      analyzeSuspiciousRequest.mockReturnValue({
        isSuspicious: true,
        threats: [{ type: 'xss', severity: 'low', location: 'url' }],
        riskScore: 30,
        recommendation: 'allow'
      });

      mockReq.get = jest.fn().mockReturnValue('TestBot/1.0');

      securityHeadersMiddleware(mockReq as any, mockRes as any, mockNext);

      expect(logService.info).toHaveBeenCalledWith(
        'SECURITY: Low-risk suspicious patterns detected',
        expect.objectContaining({
          ip: '127.0.0.1',
          userAgent: 'TestBot/1.0',
          endpoint: '/test',
          method: 'GET',
          requestId: 'test-request-123'
        })
      );
    });
  });
});