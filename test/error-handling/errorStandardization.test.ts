import { describe, it, expect, beforeEach } from 'vitest';
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NetworkError,
  DatabaseError,
  ExternalAPIError,
  QuotaExceededError,
  NotFoundError,
  ErrorSeverity,
  ErrorCategory,
  createStandardErrorResponse,
  isRetryableError,
  shouldNotifyUser,
  shouldAlertDevelopers,
  generateRequestId
} from '../../src/utils/errorStandardization';

describe('ErrorStandardization', () => {
  describe('AppError', () => {
    it('should create a basic AppError with defaults', () => {
      const error = new AppError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(500);
      expect(error.category).toBe(ErrorCategory.SYSTEM);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.retryable).toBe(false);
      expect(error.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
    });

    it('should create AppError with custom parameters', () => {
      const context = {
        userId: 'user123',
        url: '/api/test',
        component: 'TestComponent'
      };

      const error = new AppError(
        'Custom error',
        400,
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW,
        context,
        true
      );

      expect(error.message).toBe('Custom error');
      expect(error.code).toBe(400);
      expect(error.category).toBe(ErrorCategory.VALIDATION);
      expect(error.severity).toBe(ErrorSeverity.LOW);
      expect(error.context).toEqual(context);
      expect(error.retryable).toBe(true);
    });

    it('should generate standard error response', () => {
      const error = new AppError(
        'Test error',
        400,
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW,
        { url: '/api/test' }
      );

      const response = error.toStandardResponse();

      expect(response).toMatchObject({
        error: 'VALIDATION_ERROR',
        code: 400,
        message: 'Test error',
        path: '/api/test',
        details: {
          category: ErrorCategory.VALIDATION,
          severity: ErrorSeverity.LOW,
          retryable: false
        }
      });
      expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(response.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
    });
  });

  describe('Predefined Error Classes', () => {
    it('should create AuthenticationError correctly', () => {
      const error = new AuthenticationError();
      
      expect(error.message).toBe('Authentication required');
      expect(error.code).toBe(401);
      expect(error.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    });

    it('should create AuthorizationError correctly', () => {
      const error = new AuthorizationError('Custom auth message');
      
      expect(error.message).toBe('Custom auth message');
      expect(error.code).toBe(403);
      expect(error.category).toBe(ErrorCategory.AUTHORIZATION);
    });

    it('should create ValidationError with fields', () => {
      const error = new ValidationError('Invalid fields', ['email', 'password']);
      
      expect(error.message).toBe('Invalid fields');
      expect(error.code).toBe(400);
      expect(error.category).toBe(ErrorCategory.VALIDATION);
      expect(error.context?.metadata?.invalidFields).toEqual(['email', 'password']);
    });

    it('should create NetworkError as retryable', () => {
      const error = new NetworkError();
      
      expect(error.retryable).toBe(true);
      expect(error.code).toBe(503);
      expect(error.category).toBe(ErrorCategory.NETWORK);
    });

    it('should create DatabaseError correctly', () => {
      const error = new DatabaseError('Connection failed');
      
      expect(error.message).toBe('Connection failed');
      expect(error.code).toBe(500);
      expect(error.category).toBe(ErrorCategory.DATABASE);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.retryable).toBe(true);
    });

    it('should create ExternalAPIError with service name', () => {
      const error = new ExternalAPIError('OpenAI API', 'Rate limit exceeded');
      
      expect(error.message).toBe('OpenAI API: Rate limit exceeded');
      expect(error.code).toBe(502);
      expect(error.category).toBe(ErrorCategory.EXTERNAL_API);
    });

    it('should create QuotaExceededError correctly', () => {
      const error = new QuotaExceededError('API calls');
      
      expect(error.message).toBe('Quota exceeded for API calls');
      expect(error.code).toBe(429);
      expect(error.category).toBe(ErrorCategory.BUSINESS_LOGIC);
      expect(error.retryable).toBe(true);
    });

    it('should create NotFoundError correctly', () => {
      const error = new NotFoundError('User');
      
      expect(error.message).toBe('User not found');
      expect(error.code).toBe(404);
      expect(error.category).toBe(ErrorCategory.BUSINESS_LOGIC);
    });
  });

  describe('Utility Functions', () => {
    it('should generate unique request IDs', () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      
      expect(id1).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it('should create standard error response from AppError', () => {
      const appError = new ValidationError('Invalid input');
      const response = createStandardErrorResponse(appError);
      
      expect(response.error).toBe('VALIDATION_ERROR');
      expect(response.code).toBe(400);
      expect(response.message).toBe('Invalid input');
    });

    it('should create standard error response from regular Error', () => {
      const error = new Error('Regular error');
      const response = createStandardErrorResponse(error);
      
      expect(response.error).toBe('INTERNAL_SERVER_ERROR');
      expect(response.code).toBe(500);
      expect(response.message).toBe('Regular error');
    });

    it('should create standard error response from unknown error', () => {
      const response = createStandardErrorResponse('string error', 'Default message');
      
      expect(response.error).toBe('INTERNAL_SERVER_ERROR');
      expect(response.code).toBe(500);
      expect(response.message).toBe('Default message');
    });

    it('should identify retryable errors correctly', () => {
      expect(isRetryableError(new NetworkError())).toBe(true);
      expect(isRetryableError(new DatabaseError())).toBe(true);
      expect(isRetryableError(new AuthenticationError())).toBe(false);
      expect(isRetryableError(new Error('Network timeout'))).toBe(true);
      expect(isRetryableError(new Error('Rate limit exceeded'))).toBe(true);
      expect(isRetryableError(new Error('Regular error'))).toBe(false);
    });

    it('should determine user notification necessity', () => {
      expect(shouldNotifyUser(new ValidationError('Invalid'))).toBe(true);
      expect(shouldNotifyUser(new AuthenticationError())).toBe(true);
      expect(shouldNotifyUser(new AppError('System error', 500, ErrorCategory.SYSTEM, ErrorSeverity.LOW))).toBe(false);
      expect(shouldNotifyUser(new AppError('System error', 500, ErrorCategory.SYSTEM, ErrorSeverity.HIGH))).toBe(false);
    });

    it('should determine developer alert necessity', () => {
      expect(shouldAlertDevelopers(new AppError('Error', 500, ErrorCategory.SYSTEM, ErrorSeverity.CRITICAL))).toBe(true);
      expect(shouldAlertDevelopers(new AppError('Error', 500, ErrorCategory.SYSTEM, ErrorSeverity.HIGH))).toBe(true);
      expect(shouldAlertDevelopers(new AppError('Error', 400, ErrorCategory.VALIDATION, ErrorSeverity.LOW))).toBe(false);
      expect(shouldAlertDevelopers(new Error('Any error'))).toBe(true);
    });
  });

  describe('Error Response Structure', () => {
    it('should include all required fields in standard response', () => {
      const error = new AppError('Test', 400, ErrorCategory.VALIDATION);
      const response = error.toStandardResponse();
      
      expect(response).toHaveProperty('error');
      expect(response).toHaveProperty('code');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('requestId');
    });

    it('should not include details for system errors', () => {
      const systemError = new AppError('System error', 500, ErrorCategory.SYSTEM);
      const response = systemError.toStandardResponse();
      
      expect(response.details).toBeUndefined();
    });

    it('should include details for non-system errors', () => {
      const validationError = new ValidationError('Validation failed');
      const response = validationError.toStandardResponse();
      
      expect(response.details).toBeDefined();
      expect(response.details.category).toBe(ErrorCategory.VALIDATION);
      expect(response.details.severity).toBe(ErrorSeverity.LOW);
    });
  });
});