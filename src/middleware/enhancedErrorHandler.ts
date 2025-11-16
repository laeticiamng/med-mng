import type { NextFunction, Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import { notifyIncident } from '../services/alertService';
import {
  AppError,
  ErrorCategory,
  ErrorSeverity,
  generateRequestId,
} from '../utils/errorStandardization';
import { log } from '../../supabase/functions/med-mng-api/logger';

const SENSITIVE_HEADER_KEYS = ['authorization', 'cookie', 'x-api-key', 'x-supabase-api-key', 'x-csrf-token'];
const SENSITIVE_BODY_FIELDS = ['password', 'token', 'secret', 'apiKey', 'refreshToken'];

export interface EnhancedErrorHandlerOptions {
  enableSentry?: boolean;
  enableAlerts?: boolean;
  enableDetailedLogging?: boolean;
  maskSensitiveData?: boolean;
}

const DEFAULT_OPTIONS: Required<EnhancedErrorHandlerOptions> = {
  enableSentry: true,
  enableAlerts: true,
  enableDetailedLogging: true,
  maskSensitiveData: false,
};

function sanitizeHeaders(headers: Request['headers'], maskSensitive: boolean) {
  if (!headers) return headers;
  if (!maskSensitive) return headers;

  return Object.entries(headers).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (SENSITIVE_HEADER_KEYS.includes(key.toLowerCase())) {
      acc[key] = Array.isArray(value) ? value.map(() => '***MASKED***') : '***MASKED***';
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function sanitizeBody(body: unknown, maskSensitive: boolean) {
  if (!body || typeof body !== 'object' || !maskSensitive) {
    return body;
  }

  const clone: Record<string, unknown> = { ...body as Record<string, unknown> };
  SENSITIVE_BODY_FIELDS.forEach((field) => {
    if (typeof clone[field] === 'string') {
      clone[field] = '***MASKED***';
    }
  });
  return clone;
}

function shouldSendAlert(error: AppError): boolean {
  return (
    error.severity === ErrorSeverity.HIGH ||
    error.severity === ErrorSeverity.CRITICAL ||
    error.code >= 500
  );
}

function buildRequestSnapshot(req: Request, maskSensitive: boolean) {
  return {
    method: req.method,
    url: req.originalUrl,
    user: (req as unknown as { user?: { id?: string } }).user?.id,
    headers: sanitizeHeaders(req.headers, maskSensitive),
    body: sanitizeBody(req.body, maskSensitive),
    ip: req.ip,
  };
}

export function createEnhancedErrorHandler(options: EnhancedErrorHandlerOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return function errorMiddleware(error: unknown, req: Request, res: Response, _next: NextFunction) {
    const userId = (req as unknown as { user?: { id?: string } }).user?.id;
    const baseContext = { url: req.originalUrl, method: req.method, userId };

    const normalizedError = error instanceof AppError
      ? error
      : new AppError(
        error instanceof Error ? error.message : 'Internal Server Error',
        error instanceof AppError ? error.code : 500,
        ErrorCategory.SYSTEM,
        ErrorSeverity.HIGH,
        baseContext,
      );

    const response = normalizedError.toStandardResponse();
    const requestId = response.requestId || generateRequestId();
    response.requestId = requestId;
    response.path = response.path || req.originalUrl;

    if (config.enableDetailedLogging) {
      log('error', response.message, {
        request: buildRequestSnapshot(req, config.maskSensitiveData),
        context: {
          userId,
          userAgent: req.get?.('user-agent'),
          method: req.method,
          url: req.originalUrl,
          ip: req.ip,
          requestId,
        },
        error:
          error instanceof Error
            ? { name: error.name, stack: error.stack }
            : { value: error },
      });
    }

    if (config.enableSentry) {
      Sentry.withScope((scope) => {
        scope.setTag('requestId', requestId);
        scope.setTag('errorCategory', normalizedError.category);
        scope.setTag('errorSeverity', normalizedError.severity);
        scope.setUser({ id: userId, ip_address: req.ip });
        scope.setContext('request', { method: req.method, url: req.originalUrl });
        Sentry.captureException(error instanceof Error ? error : new Error(response.message));
      });
    }

    if (config.enableAlerts && shouldSendAlert(normalizedError)) {
      notifyIncident({
        type: 'BACKEND_ERROR',
        message: normalizedError.message,
        severity: normalizedError.severity,
        details: {
          requestId,
          error: response.error,
          path: req.originalUrl,
          method: req.method,
        },
      }).catch((alertError) => log('error', 'Failed to dispatch incident alert', alertError));
    }

    res.status(response.code || 500).json(response);
  };
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(
    new AppError(
      `Route ${req.method} ${req.originalUrl} not found`,
      404,
      ErrorCategory.BUSINESS_LOGIC,
      ErrorSeverity.LOW,
      { method: req.method, url: req.originalUrl },
    ),
  );
}
