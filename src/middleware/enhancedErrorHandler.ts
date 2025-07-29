import { Request, Response, NextFunction } from 'express';
import { log } from '../../supabase/functions/med-mng-api/logger';
import { notifyIncident } from '../services/alertService';
import * as Sentry from '@sentry/node';
import { 
  AppError, 
  createStandardErrorResponse, 
  shouldAlertDevelopers,
  ErrorSeverity,
  ErrorCategory,
  generateRequestId
} from '../utils/errorStandardization';

export interface EnhancedErrorHandlerOptions {
  enableSentry?: boolean;
  enableAlerts?: boolean;
  enableDetailedLogging?: boolean;
  maskSensitiveData?: boolean;
}

export function createEnhancedErrorHandler(options: EnhancedErrorHandlerOptions = {}) {
  const {
    enableSentry = true,
    enableAlerts = true,
    enableDetailedLogging = true,
    maskSensitiveData = true
  } = options;

  return function enhancedErrorHandler(
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    const requestId = generateRequestId();
    const context = {
      userId: req.user?.id,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
      ip: getClientIP(req),
      requestId
    };

    // Create standardized error response
    const errorResponse = createStandardErrorResponse(err, 'Internal Server Error', context);

    // Enhanced logging with context
    const logData = {
      requestId,
      error: {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        name: err instanceof Error ? err.name : 'UnknownError'
      },
      request: {
        method: req.method,
        url: req.originalUrl,
        headers: maskSensitiveData ? maskSensitiveHeaders(req.headers) : req.headers,
        body: maskSensitiveData ? maskSensitiveBody(req.body) : req.body,
        user: req.user?.id || 'anonymous'
      },
      context
    };

    if (enableDetailedLogging) {
      log('error', `Enhanced Error Handler - ${errorResponse.error}`, logData);
    }

    // Sentry integration with enhanced context
    if (enableSentry) {
      Sentry.withScope((scope) => {
        scope.setTag('requestId', requestId);
        scope.setTag('errorCategory', err instanceof AppError ? err.category : ErrorCategory.SYSTEM);
        scope.setTag('errorSeverity', err instanceof AppError ? err.severity : ErrorSeverity.HIGH);
        scope.setUser({
          id: req.user?.id || 'anonymous',
          ip_address: getClientIP(req)
        });
        scope.setContext('request', {
          method: req.method,
          url: req.originalUrl,
          headers: maskSensitiveHeaders(req.headers)
        });
        Sentry.captureException(err);
      });
    }

    // Alert system for critical errors
    if (enableAlerts && shouldAlertDevelopers(err)) {
      void notifyIncident({
        type: 'BACKEND_ERROR',
        severity: err instanceof AppError ? err.severity : ErrorSeverity.HIGH,
        message: errorResponse.message,
        details: {
          requestId,
          error: errorResponse.error,
          path: req.originalUrl,
          method: req.method,
          userAgent: req.get('User-Agent'),
          timestamp: errorResponse.timestamp
        },
      });
    }

    // Rate limiting for error patterns
    trackErrorPattern(err, req.originalUrl);

    // Send standardized response
    res.status(errorResponse.code).json(errorResponse);
  };
}

// Error pattern tracking to detect systemic issues
const errorPatterns = new Map<string, { count: number; lastSeen: number; urls: Set<string> }>();

function trackErrorPattern(err: unknown, url: string) {
  const errorKey = err instanceof Error ? err.message : 'unknown_error';
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  if (!errorPatterns.has(errorKey)) {
    errorPatterns.set(errorKey, { count: 0, lastSeen: now, urls: new Set() });
  }

  const pattern = errorPatterns.get(errorKey)!;
  
  // Reset counter if last occurrence was more than an hour ago
  if (now - pattern.lastSeen > oneHour) {
    pattern.count = 0;
    pattern.urls.clear();
  }

  pattern.count++;
  pattern.lastSeen = now;
  pattern.urls.add(url);

  // Alert if error pattern exceeds threshold
  if (pattern.count >= 10) {
    void notifyIncident({
      type: 'ERROR_PATTERN_DETECTED',
      severity: ErrorSeverity.CRITICAL,
      message: `Error pattern detected: "${errorKey}" occurred ${pattern.count} times in the last hour`,
      details: {
        errorMessage: errorKey,
        occurrences: pattern.count,
        affectedUrls: Array.from(pattern.urls),
        timeWindow: '1 hour'
      }
    });

    // Reset counter to avoid spam
    pattern.count = 0;
  }
}

function getClientIP(req: Request): string {
  return (req.ip || 
          req.connection.remoteAddress || 
          req.socket.remoteAddress || 
          (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
          'unknown').replace('::ffff:', '');
}

function maskSensitiveHeaders(headers: any): any {
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
  const masked = { ...headers };
  
  sensitiveHeaders.forEach(header => {
    if (masked[header]) {
      masked[header] = '***MASKED***';
    }
  });
  
  return masked;
}

function maskSensitiveBody(body: any): any {
  if (!body || typeof body !== 'object') return body;
  
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'apiKey', 'accessToken'];
  const masked = { ...body };
  
  sensitiveFields.forEach(field => {
    if (masked[field]) {
      masked[field] = '***MASKED***';
    }
  });
  
  return masked;
}

// Specialized error handlers for common scenarios
export function asyncErrorHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  const error = new AppError(
    `Route ${req.method} ${req.originalUrl} not found`,
    404,
    ErrorCategory.BUSINESS_LOGIC,
    ErrorSeverity.LOW,
    {
      url: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent')
    }
  );
  next(error);
}