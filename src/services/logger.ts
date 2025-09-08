// Service de logging unifié et optimisé
// Remplace tous les console.error/warn pour une meilleure expérience

interface LogContext {
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
  timestamp?: number;
}

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: Array<{ level: LogLevel; message: string; context?: LogContext; timestamp: number }> = [];
  private maxLogs = 1000; // Limiter la mémoire

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context.component || 'App'}]` : '';
    return `${timestamp}${contextStr} ${level.toUpperCase()}: ${message}`;
  }

  private addToHistory(level: LogLevel, message: string, context?: LogContext) {
    this.logs.push({
      level,
      message,
      context,
      timestamp: Date.now()
    });
    
    // Nettoyer les anciens logs pour éviter les fuites mémoire
    if (this.logs.length > this.maxLogs) {
      this.logs.splice(0, this.logs.length - this.maxLogs);
    }
  }

  error(message: string, context?: LogContext) {
    this.addToHistory('error', message, context);
    
    if (this.isDevelopment) {
      console.error(this.formatMessage('error', message, context));
      if (context?.metadata) {
        console.error('Context:', context.metadata);
      }
    }
    
    // En production, on pourrait envoyer à un service de monitoring
    // this.sendToMonitoring('error', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.addToHistory('warn', message, context);
    
    if (this.isDevelopment) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    this.addToHistory('info', message, context);
    
    if (this.isDevelopment) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  debug(message: string, context?: LogContext) {
    this.addToHistory('debug', message, context);
    
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  // Méthodes utilitaires
  getRecentLogs(level?: LogLevel): typeof this.logs {
    return level 
      ? this.logs.filter(log => log.level === level)
      : this.logs;
  }

  clearLogs() {
    this.logs = [];
  }

  // Helpers pour les erreurs courantes
  apiError(endpoint: string, error: any, context?: Omit<LogContext, 'action'>) {
    this.error(`API Error on ${endpoint}: ${error?.message || 'Unknown error'}`, {
      ...context,
      action: 'api_call',
      metadata: { endpoint, error }
    });
  }

  dbError(operation: string, error: any, context?: Omit<LogContext, 'action'>) {
    this.error(`Database Error during ${operation}: ${error?.message || 'Unknown error'}`, {
      ...context,
      action: 'database_operation',
      metadata: { operation, error }
    });
  }

  audioError(operation: string, url?: string, error?: any, context?: Omit<LogContext, 'action'>) {
    this.error(`Audio Error during ${operation}: ${error?.message || 'Audio operation failed'}`, {
      ...context,
      action: 'audio_operation',
      metadata: { operation, url, error }
    });
  }

  validationError(field: string, value: any, context?: Omit<LogContext, 'action'>) {
    this.warn(`Validation failed for ${field}`, {
      ...context,
      action: 'validation',
      metadata: { field, value }
    });
  }
}

// Instance singleton
export const logger = new Logger();

// Helpers pour faciliter l'adoption
export const logError = (message: string, context?: LogContext) => logger.error(message, context);
export const logWarn = (message: string, context?: LogContext) => logger.warn(message, context);
export const logInfo = (message: string, context?: LogContext) => logger.info(message, context);
export const logDebug = (message: string, context?: LogContext) => logger.debug(message, context);