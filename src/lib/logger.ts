/**
 * Production-ready logging system
 * Replaces console.log with structured logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  itemCode?: string;
  count?: number;
  expectedCount?: number;
  actualCount?: number;
  duration?: string;
  filename?: string;
  key?: string;
  hitCount?: number;
  replacements?: number;
  deletedCount?: number;
  remainingSize?: number;
  size?: number;
  metadata?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.isDevelopment && level === 'debug') return;
    
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...context
    };

    // In development, use console for better debugging experience
    if (this.isDevelopment) {
      const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'info';
      console[method](`[${level.toUpperCase()}]`, message, context || '');
      return;
    }

    // In production, send to monitoring service
    this.sendToMonitoring(logData);
  }

  private sendToMonitoring(logData: any): void {
    // Integration with monitoring service (Sentry, etc.)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'log', {
        custom_parameter: JSON.stringify(logData)
      });
    }
  }

  debug(message: string, context?: LogContext): void {
    this.formatMessage('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.formatMessage('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.formatMessage('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.formatMessage('error', message, context);
  }

  performance(label: string, startTime: number, context?: LogContext): void {
    const duration = performance.now() - startTime;
    this.info(`Performance: ${label}`, {
      ...context,
      duration: `${duration.toFixed(2)}ms`
    });
  }
}

export const logger = new Logger();