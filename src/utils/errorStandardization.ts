/**
 * Standard Error Response Types and Utilities
 * Implements consistent error handling across the application
 */

export interface StandardErrorResponse {
  error: string;           // Error code for i18n
  code: number;           // HTTP status code
  message: string;        // Human-readable message
  timestamp: string;      // ISO string
  path?: string;          // Request path for debugging
  details?: any;          // Additional context
  requestId?: string;     // Unique request identifier
}

export interface ErrorContext {
  userId?: string;
  userAgent?: string;
  url?: string;
  component?: string;
  action?: string;
  method?: string;
  ip?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  AUTHENTICATION = 'auth',
  AUTHORIZATION = 'authz',
  VALIDATION = 'validation',
  NETWORK = 'network',
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
  BUSINESS_LOGIC = 'business',
  SYSTEM = 'system',
  USER_INPUT = 'user_input'
}

export class AppError extends Error {
  public readonly code: number;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly context?: ErrorContext;
  public readonly requestId?: string;
  public readonly retryable: boolean;

  constructor(
    message: string,
    code: number = 500,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: ErrorContext,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.context = { ...context };
    this.requestId = generateRequestId();
    this.retryable = retryable;
  }

  toStandardResponse(): StandardErrorResponse {
    return {
      error: this.getErrorCode(),
      code: this.code,
      message: this.message,
      timestamp: new Date().toISOString(),
      path: this.context?.url,
      requestId: this.requestId,
      details: this.category === ErrorCategory.SYSTEM ? undefined : {
        category: this.category,
        severity: this.severity,
        retryable: this.retryable
      }
    };
  }

  private getErrorCode(): string {
    const categoryMap = {
      [ErrorCategory.AUTHENTICATION]: 'AUTH_ERROR',
      [ErrorCategory.AUTHORIZATION]: 'PERMISSION_DENIED',
      [ErrorCategory.VALIDATION]: 'VALIDATION_ERROR',
      [ErrorCategory.NETWORK]: 'NETWORK_ERROR',
      [ErrorCategory.DATABASE]: 'DATABASE_ERROR',
      [ErrorCategory.EXTERNAL_API]: 'EXTERNAL_SERVICE_ERROR',
      [ErrorCategory.BUSINESS_LOGIC]: 'BUSINESS_RULE_VIOLATION',
      [ErrorCategory.SYSTEM]: 'INTERNAL_SERVER_ERROR',
      [ErrorCategory.USER_INPUT]: 'INVALID_INPUT'
    };
    return categoryMap[this.category];
  }
}

// Predefined common errors
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: ErrorContext) {
    super(message, 401, ErrorCategory.AUTHENTICATION, ErrorSeverity.MEDIUM, context);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', context?: ErrorContext) {
    super(message, 403, ErrorCategory.AUTHORIZATION, ErrorSeverity.MEDIUM, context);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, fields?: string[], context?: ErrorContext) {
    super(message, 400, ErrorCategory.VALIDATION, ErrorSeverity.LOW, context);
    if (fields && this.context) {
      (this as any).context = { ...this.context, metadata: { invalidFields: fields } };
    }
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network connection failed', context?: ErrorContext) {
    super(message, 503, ErrorCategory.NETWORK, ErrorSeverity.MEDIUM, context, true);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', context?: ErrorContext) {
    super(message, 500, ErrorCategory.DATABASE, ErrorSeverity.HIGH, context, true);
  }
}

export class ExternalAPIError extends AppError {
  constructor(service: string, message: string, context?: ErrorContext) {
    super(`${service}: ${message}`, 502, ErrorCategory.EXTERNAL_API, ErrorSeverity.MEDIUM, context, true);
  }
}

export class QuotaExceededError extends AppError {
  constructor(resource: string, context?: ErrorContext) {
    super(`Quota exceeded for ${resource}`, 429, ErrorCategory.BUSINESS_LOGIC, ErrorSeverity.LOW, context, true);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, context?: ErrorContext) {
    super(`${resource} not found`, 404, ErrorCategory.BUSINESS_LOGIC, ErrorSeverity.LOW, context);
  }
}

// Utility functions
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function createStandardErrorResponse(
  error: unknown,
  defaultMessage: string = 'An unexpected error occurred',
  context?: ErrorContext
): StandardErrorResponse {
  if (error instanceof AppError) {
    return error.toStandardResponse();
  }

  if (error instanceof Error) {
    const appError = new AppError(
      error.message || defaultMessage,
      500,
      ErrorCategory.SYSTEM,
      ErrorSeverity.HIGH,
      context
    );
    return appError.toStandardResponse();
  }

  const appError = new AppError(
    defaultMessage,
    500,
    ErrorCategory.SYSTEM,
    ErrorSeverity.HIGH,
    context
  );
  return appError.toStandardResponse();
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.retryable;
  }
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('timeout') || 
           message.includes('connection') ||
           message.includes('rate limit');
  }
  
  return false;
}

export function shouldNotifyUser(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.severity !== ErrorSeverity.LOW && 
           error.category !== ErrorCategory.SYSTEM;
  }
  return true;
}

export function shouldAlertDevelopers(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.severity === ErrorSeverity.HIGH || 
           error.severity === ErrorSeverity.CRITICAL;
  }
  return true;
}