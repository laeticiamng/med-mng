/**
 * Système de logging professionnel pour MED-MNG
 * Remplace tous les console.log/error par un système structuré
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: string;
  userId?: string;
  metadata?: Record<string, any>;
  stack?: string;
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  constructor() {
    // Set log level based on environment
    this.logLevel = process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level];
    const contextStr = context ? ` [${context}]` : '';
    return `${timestamp} ${levelStr}${contextStr}: ${message}`;
  }

  private log(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>) {
    if (!this.shouldLog(level)) return;

    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      metadata,
      stack: level === LogLevel.ERROR ? new Error().stack : undefined,
    };

    // Add to internal log store
    this.logs.unshift(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Output to console in development
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = this.formatMessage(level, message, context);
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage, metadata);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage, metadata);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, metadata);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage, metadata);
          break;
      }
    }

    // Send critical errors to monitoring service
    if (level === LogLevel.ERROR && process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(logEntry);
    }
  }

  private async sendToMonitoringService(logEntry: LogEntry) {
    try {
      // Send to external monitoring service (Sentry, LogRocket, etc.)
      // This is where you would integrate with your monitoring service
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      // Fallback to console if monitoring service fails
      console.error('Failed to send log to monitoring service:', error);
    }
  }

  debug(message: string, context?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context, metadata);
  }

  info(message: string, context?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context, metadata);
  }

  warn(message: string, context?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context, metadata);
  }

  error(message: string, context?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, metadata);
  }

  // Performance logging
  time(label: string) {
    performance.mark(`${label}-start`);
    this.debug(`Timer started: ${label}`, 'Performance');
  }

  timeEnd(label: string) {
    try {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      const measure = performance.getEntriesByName(label)[0];
      this.debug(`Timer finished: ${label} (${measure.duration.toFixed(2)}ms)`, 'Performance');
      performance.clearMarks(`${label}-start`);
      performance.clearMarks(`${label}-end`);
      performance.clearMeasures(label);
    } catch (error) {
      this.warn(`Could not measure timer: ${label}`, 'Performance');
    }
  }

  // User action logging
  userAction(action: string, userId?: string, metadata?: Record<string, any>) {
    this.info(`User action: ${action}`, 'UserActivity', { 
      userId, 
      timestamp: Date.now(),
      ...metadata 
    });
  }

  // API request logging
  apiRequest(method: string, url: string, status?: number, duration?: number) {
    const level = status && status >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, `API ${method} ${url}`, 'API', { status, duration });
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(0, count);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    this.info('Logs cleared', 'Logger');
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Create singleton instance
export const logger = new Logger();

// Convenience functions for common use cases
export const logError = (error: Error | string, context?: string, metadata?: Record<string, any>) => {
  const message = error instanceof Error ? error.message : error;
  const meta = error instanceof Error ? { ...metadata, stack: error.stack } : metadata;
  logger.error(message, context, meta);
};

export const logPerformance = (action: string, startTime: number, metadata?: Record<string, any>) => {
  const duration = performance.now() - startTime;
  logger.info(`Performance: ${action} completed in ${duration.toFixed(2)}ms`, 'Performance', metadata);
};

export const logUserInteraction = (element: string, action: string, userId?: string) => {
  logger.userAction(`${action} on ${element}`, userId, { element, action });
};

// Error boundary logging
export const logErrorBoundary = (error: Error, errorInfo: any) => {
  logger.error(`Error Boundary caught: ${error.message}`, 'ErrorBoundary', {
    stack: error.stack,
    componentStack: errorInfo.componentStack,
  });
};

export default logger;