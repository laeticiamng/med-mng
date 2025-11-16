/**
 * Centralized Logging Service
 * Structured logging with context, levels, and remote reporting
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  user_id?: string;
  session_id?: string;
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  data?: any;
  stack?: string;
}

class Logger {
  private context: LogContext = {};
  private isProduction: boolean;
  private isDevelopment: boolean;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  constructor() {
    this.isProduction = import.meta.env.PROD;
    this.isDevelopment = import.meta.env.DEV;
  }

  /**
   * Set global context that will be included in all logs
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear specific context keys or all context
   */
  clearContext(keys?: string[]): void {
    if (!keys) {
      this.context = {};
      return;
    }
    keys.forEach(key => delete this.context[key]);
  }

  /**
   * Debug level - only in development
   */
  debug(message: string, data?: any, additionalContext?: LogContext): void {
    if (this.isDevelopment) {
      this.log('debug', message, data, additionalContext);
    }
  }

  /**
   * Info level - general information
   */
  info(message: string, data?: any, additionalContext?: LogContext): void {
    this.log('info', message, data, additionalContext);
  }

  /**
   * Warning level - something unexpected but not critical
   */
  warn(message: string, data?: any, additionalContext?: LogContext): void {
    this.log('warn', message, data, additionalContext);
  }

  /**
   * Error level - critical issues
   */
  error(message: string, error?: Error | any, additionalContext?: LogContext): void {
    const stack = error instanceof Error ? error.stack : undefined;
    const errorData = error instanceof Error
      ? { name: error.name, message: error.message }
      : error;

    this.log('error', message, errorData, additionalContext, stack);
  }

  /**
   * Core logging function
   */
  private log(
    level: LogLevel,
    message: string,
    data?: any,
    additionalContext?: LogContext,
    stack?: string
  ): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.context, ...additionalContext },
      data,
      stack,
    };

    // Add to buffer
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    // Console output in development
    if (this.isDevelopment) {
      this.consoleLog(entry);
    }

    // Send to remote in production for errors and warnings
    if (this.isProduction && (level === 'error' || level === 'warn')) {
      this.sendToRemote(entry);
    }
  }

  /**
   * Format and output to console
   */
  private consoleLog(entry: LogEntry): void {
    const prefix = `[${entry.level.toUpperCase()}]`;
    const contextStr = entry.context && Object.keys(entry.context).length > 0
      ? `[${Object.entries(entry.context).map(([k, v]) => `${k}=${v}`).join(', ')}]`
      : '';

    const fullMessage = `${prefix} ${contextStr} ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(fullMessage, entry.data || '');
        break;
      case 'info':
        console.info(fullMessage, entry.data || '');
        break;
      case 'warn':
        console.warn(fullMessage, entry.data || '');
        break;
      case 'error':
        console.error(fullMessage, entry.data || '');
        if (entry.stack) {
          console.error(entry.stack);
        }
        break;
    }
  }

  /**
   * Send logs to remote service (Sentry, LogRocket, etc.)
   */
  private async sendToRemote(entry: LogEntry): Promise<void> {
    try {
      // TODO: Integrate with your logging service (Sentry, LogRocket, custom backend)
      // Example with custom backend:
      /*
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      */

      // For now, we'll use Supabase to log errors
      if (typeof window !== 'undefined' && window.supabase) {
        await window.supabase
          .from('application_logs')
          .insert({
            level: entry.level,
            message: entry.message,
            context: entry.context,
            data: entry.data,
            stack: entry.stack,
            timestamp: entry.timestamp,
          });
      }
    } catch (error) {
      // Fail silently to avoid infinite loops
      console.error('Failed to send log to remote:', error);
    }
  }

  /**
   * Get recent logs from buffer
   */
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  /**
   * Clear log buffer
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }

  /**
   * Create a child logger with fixed context
   */
  createChild(context: LogContext): Logger {
    const child = new Logger();
    child.setContext({ ...this.context, ...context });
    return child;
  }
}

// Create singleton instance
const logger = new Logger();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).__logger = logger;
}

export default logger;

// Named exports for convenience
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export const setLogContext = logger.setContext.bind(logger);
export const clearLogContext = logger.clearContext.bind(logger);

/**
 * Performance logging utility
 */
export class PerformanceLogger {
  private startTime: number;
  private marks: Map<string, number>;

  constructor(private operation: string, private context?: LogContext) {
    this.startTime = performance.now();
    this.marks = new Map();
    logger.debug(`Starting: ${operation}`, undefined, context);
  }

  /**
   * Mark a checkpoint
   */
  mark(label: string): void {
    const elapsed = performance.now() - this.startTime;
    this.marks.set(label, elapsed);
    logger.debug(`${this.operation} - ${label}`, { elapsed_ms: elapsed.toFixed(2) }, this.context);
  }

  /**
   * End and log total duration
   */
  end(success: boolean = true): void {
    const duration = performance.now() - this.startTime;
    const level = duration > 1000 ? 'warn' : 'debug';

    logger[level](
      `${success ? 'Completed' : 'Failed'}: ${this.operation}`,
      {
        duration_ms: duration.toFixed(2),
        marks: Object.fromEntries(this.marks),
      },
      this.context
    );
  }
}

/**
 * HOC for component error boundaries
 */
export const logComponentError = (
  componentName: string,
  error: Error,
  errorInfo: React.ErrorInfo
): void => {
  logger.error(
    `React component error: ${componentName}`,
    {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    },
    { component: componentName }
  );
};

/**
 * Log user actions
 */
export const logUserAction = (
  action: string,
  details?: any,
  context?: LogContext
): void => {
  logger.info(`User action: ${action}`, details, context);
};

/**
 * Log API calls
 */
export const logApiCall = (
  method: string,
  endpoint: string,
  status?: number,
  duration?: number
): void => {
  const level = status && status >= 400 ? 'error' : 'debug';
  logger[level](
    `API ${method} ${endpoint}`,
    { status, duration_ms: duration },
    { api: endpoint }
  );
};

/**
 * Declare window.__logger type
 */
declare global {
  interface Window {
    __logger?: Logger;
    supabase?: any;
  }
}
