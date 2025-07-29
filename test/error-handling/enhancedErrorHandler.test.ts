import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { createEnhancedErrorHandler, notFoundHandler } from '../../src/middleware/enhancedErrorHandler';
import { AppError, ErrorCategory, ErrorSeverity } from '../../src/utils/errorStandardization';

// Mock dependencies
vi.mock('../../supabase/functions/med-mng-api/logger', () => ({
  log: vi.fn()
}));

vi.mock('../../src/services/alertService', () => ({
  notifyIncident: vi.fn()
}));

vi.mock('@sentry/node', () => ({
  withScope: vi.fn((callback) => callback({
    setTag: vi.fn(),
    setUser: vi.fn(),
    setContext: vi.fn()
  })),
  captureException: vi.fn()
}));

describe('EnhancedErrorHandler', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let jsonSpy: ReturnType<typeof vi.fn>;
  let statusSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonSpy = vi.fn();
    statusSpy = vi.fn().mockReturnValue({ json: jsonSpy });
    
    req = {
      method: 'GET',
      originalUrl: '/api/test',
      get: vi.fn().mockReturnValue('test-user-agent'),
      body: {},
      headers: {},
      ip: '127.0.0.1',
      user: { id: 'user123' }
    };
    
    res = {
      status: statusSpy,
      json: jsonSpy
    };
    
    next = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Error Handling', () => {
    it('should handle AppError correctly', () => {
      const errorHandler = createEnhancedErrorHandler();
      const error = new AppError(
        'Test error',
        400,
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW
      );

      errorHandler(error, req as Request, res as Response, next);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'VALIDATION_ERROR',
          code: 400,
          message: 'Test error',
          timestamp: expect.any(String),
          requestId: expect.stringMatching(/^req_\d+_[a-z0-9]+$/)
        })
      );
    });

    it('should handle regular Error objects', () => {
      const errorHandler = createEnhancedErrorHandler();
      const error = new Error('Regular error');

      errorHandler(error, req as Request, res as Response, next);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'INTERNAL_SERVER_ERROR',
          code: 500,
          message: 'Internal Server Error',
          timestamp: expect.any(String)
        })
      );
    });

    it('should handle unknown errors', () => {
      const errorHandler = createEnhancedErrorHandler();
      const error = 'string error';

      errorHandler(error, req as Request, res as Response, next);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'INTERNAL_SERVER_ERROR',
          code: 500,
          message: 'Internal Server Error'
        })
      );
    });
  });

  describe('Error Handler Options', () => {
    it('should respect enableSentry option', () => {
      const Sentry = require('@sentry/node');
      const errorHandler = createEnhancedErrorHandler({ enableSentry: false });
      const error = new Error('Test error');

      errorHandler(error, req as Request, res as Response, next);

      expect(Sentry.withScope).not.toHaveBeenCalled();
    });

    it('should respect enableAlerts option', () => {
      const { notifyIncident } = require('../../src/services/alertService');
      const errorHandler = createEnhancedErrorHandler({ enableAlerts: false });
      const error = new AppError('Critical error', 500, ErrorCategory.SYSTEM, ErrorSeverity.CRITICAL);

      errorHandler(error, req as Request, res as Response, next);

      expect(notifyIncident).not.toHaveBeenCalled();
    });

    it('should respect enableDetailedLogging option', () => {
      const { log } = require('../../supabase/functions/med-mng-api/logger');
      const errorHandler = createEnhancedErrorHandler({ enableDetailedLogging: false });
      const error = new Error('Test error');

      errorHandler(error, req as Request, res as Response, next);

      expect(log).not.toHaveBeenCalled();
    });
  });

  describe('Sensitive Data Masking', () => {
    it('should mask sensitive headers when enabled', () => {
      const { log } = require('../../supabase/functions/med-mng-api/logger');
      const errorHandler = createEnhancedErrorHandler({ maskSensitiveData: true });
      
      req.headers = {
        authorization: 'Bearer secret-token',
        'x-api-key': 'secret-key',
        'user-agent': 'test-agent'
      };

      const error = new Error('Test error');
      errorHandler(error, req as Request, res as Response, next);

      expect(log).toHaveBeenCalledWith(
        'error',
        expect.any(String),
        expect.objectContaining({
          request: expect.objectContaining({
            headers: expect.objectContaining({
              authorization: '***MASKED***',
              'x-api-key': '***MASKED***',
              'user-agent': 'test-agent'
            })
          })
        })
      );
    });

    it('should mask sensitive body fields when enabled', () => {
      const { log } = require('../../supabase/functions/med-mng-api/logger');
      const errorHandler = createEnhancedErrorHandler({ maskSensitiveData: true });
      
      req.body = {
        username: 'user123',
        password: 'secret-password',
        apiKey: 'secret-key',
        data: 'public-data'
      };

      const error = new Error('Test error');
      errorHandler(error, req as Request, res as Response, next);

      expect(log).toHaveBeenCalledWith(
        'error',
        expect.any(String),
        expect.objectContaining({
          request: expect.objectContaining({
            body: expect.objectContaining({
              username: 'user123',
              password: '***MASKED***',
              apiKey: '***MASKED***',
              data: 'public-data'
            })
          })
        })
      );
    });
  });

  describe('Context Enrichment', () => {
    it('should enrich error context with request data', () => {
      const { log } = require('../../supabase/functions/med-mng-api/logger');
      const errorHandler = createEnhancedErrorHandler();
      const error = new Error('Test error');

      errorHandler(error, req as Request, res as Response, next);

      expect(log).toHaveBeenCalledWith(
        'error',
        expect.any(String),
        expect.objectContaining({
          request: expect.objectContaining({
            method: 'GET',
            url: '/api/test',
            user: 'user123'
          }),
          context: expect.objectContaining({
            userId: 'user123',
            userAgent: 'test-user-agent',
            url: '/api/test',
            method: 'GET',
            ip: '127.0.0.1'
          })
        })
      );
    });

    it('should handle requests without user context', () => {
      const errorHandler = createEnhancedErrorHandler();
      req.user = undefined;
      const error = new Error('Test error');

      errorHandler(error, req as Request, res as Response, next);

      expect(statusSpy).toHaveBeenCalledWith(500);
      // Should not throw and should handle gracefully
    });
  });

  describe('Sentry Integration', () => {
    it('should set Sentry context correctly', () => {
      const Sentry = require('@sentry/node');
      const mockScope = {
        setTag: vi.fn(),
        setUser: vi.fn(),
        setContext: vi.fn()
      };
      
      Sentry.withScope.mockImplementation((callback) => callback(mockScope));
      
      const errorHandler = createEnhancedErrorHandler();
      const error = new AppError('Test error', 400, ErrorCategory.VALIDATION, ErrorSeverity.LOW);

      errorHandler(error, req as Request, res as Response, next);

      expect(mockScope.setTag).toHaveBeenCalledWith('requestId', expect.stringMatching(/^req_\d+_[a-z0-9]+$/));
      expect(mockScope.setTag).toHaveBeenCalledWith('errorCategory', ErrorCategory.VALIDATION);
      expect(mockScope.setTag).toHaveBeenCalledWith('errorSeverity', ErrorSeverity.LOW);
      expect(mockScope.setUser).toHaveBeenCalledWith({
        id: 'user123',
        ip_address: '127.0.0.1'
      });
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });
  });

  describe('Alert System', () => {
    it('should send alerts for critical errors', () => {
      const { notifyIncident } = require('../../src/services/alertService');
      const errorHandler = createEnhancedErrorHandler();
      const error = new AppError('Critical error', 500, ErrorCategory.SYSTEM, ErrorSeverity.CRITICAL);

      errorHandler(error, req as Request, res as Response, next);

      expect(notifyIncident).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'BACKEND_ERROR',
          severity: ErrorSeverity.CRITICAL,
          message: 'Critical error',
          details: expect.objectContaining({
            requestId: expect.stringMatching(/^req_\d+_[a-z0-9]+$/),
            error: 'INTERNAL_SERVER_ERROR',
            path: '/api/test',
            method: 'GET'
          })
        })
      );
    });

    it('should not send alerts for low severity errors', () => {
      const { notifyIncident } = require('../../src/services/alertService');
      const errorHandler = createEnhancedErrorHandler();
      const error = new AppError('Low error', 400, ErrorCategory.VALIDATION, ErrorSeverity.LOW);

      errorHandler(error, req as Request, res as Response, next);

      expect(notifyIncident).not.toHaveBeenCalled();
    });
  });

  describe('NotFoundHandler', () => {
    it('should create appropriate 404 error', () => {
      notFoundHandler(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Route GET /api/test not found',
          code: 404,
          category: ErrorCategory.BUSINESS_LOGIC,
          severity: ErrorSeverity.LOW
        })
      );
    });
  });
});