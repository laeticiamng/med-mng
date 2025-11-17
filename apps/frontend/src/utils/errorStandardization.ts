/**
 * Error severity levels
 */
export enum ErrorSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * Error categories
 */
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NETWORK = 'network',
  EXTERNAL_API = 'external_api',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  statusCode: number;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.category = category;
    this.severity = severity;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Standard error response format
 */
export interface StandardErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    category: ErrorCategory;
    severity: ErrorSeverity;
    timestamp: string;
    context?: any;
  };
}

/**
 * Determine if user should be notified about this error
 * @param error - AppError to check
 * @returns true if user should be notified
 */
export function shouldNotifyUser(error: AppError): boolean {
  // Always notify for critical errors
  if (error.severity === ErrorSeverity.CRITICAL) {
    return true;
  }

  // Notify for high severity unless it's a system error
  if (error.severity === ErrorSeverity.HIGH && error.category !== ErrorCategory.SYSTEM) {
    return true;
  }

  // Notify for authentication and authorization errors
  if (
    error.category === ErrorCategory.AUTHENTICATION ||
    error.category === ErrorCategory.AUTHORIZATION
  ) {
    return true;
  }

  // Notify for validation errors
  if (error.category === ErrorCategory.VALIDATION) {
    return true;
  }

  return false;
}

/**
 * Check if error is retryable
 * @param error - Error to check
 * @returns true if error can be retried
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) {
    // Network errors are usually retryable
    if (error.category === ErrorCategory.NETWORK) {
      return true;
    }

    // Specific status codes that are retryable
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    if (retryableStatusCodes.includes(error.statusCode)) {
      return true;
    }
  }

  // Check for network-related errors
  if (error instanceof Error) {
    const networkErrorMessages = ['network', 'timeout', 'fetch', 'connection'];
    return networkErrorMessages.some((msg) =>
      error.message.toLowerCase().includes(msg)
    );
  }

  return false;
}

/**
 * Create standardized error response
 * @param error - Error to standardize
 * @returns Standardized error response
 */
export function createStandardErrorResponse(error: unknown): StandardErrorResponse {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.name,
        statusCode: error.statusCode,
        category: error.category,
        severity: error.severity,
        timestamp: new Date().toISOString(),
        context: error.context,
      },
    };
  }

  // Handle standard Error
  if (error instanceof Error) {
    return {
      success: false,
      error: {
        message: error.message,
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Handle unknown error types
  return {
    success: false,
    error: {
      message: 'An unknown error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date().toISOString(),
      context: { originalError: String(error) },
    },
  };
}
