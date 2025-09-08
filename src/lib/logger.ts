/**
 * 🚀 SYSTÈME DE LOGGING UNIFIÉ MED-MNG v3.0
 * Logger unique ultra-performant avec gestion avancée des erreurs
 */

import { nativeConsole } from '@/utils/nativeConsole';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogContext = 'app' | 'api' | 'auth' | 'music' | 'ui' | 'performance' | 'security' | 'database' | 'cache' | 'validation' | 'pwa' | 'testing' | 'accessibility' | 'i18n' | 'audio' | 'analytics';

interface LogEntry {
  level: LogLevel;
  context: LogContext;
  message: string;
  data?: unknown;
  timestamp: number;
  stack?: string;
}

interface LogConfig {
  maxHistorySize: number;
  enableConsole: boolean;
  enableHistory: boolean;  
  filterSensitiveData: boolean;
  productionLogLevel: LogLevel;
}

class UnifiedLogger {
  private isDevelopment = import.meta.env.DEV;
  private history: LogEntry[] = [];
  private config: LogConfig = {
    maxHistorySize: 1000,
    enableConsole: this.isDevelopment,
    enableHistory: true,
    filterSensitiveData: true,
    productionLogLevel: 'warn'
  };

  // Données sensibles à filtrer
  private sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credential'];

  private filterSensitiveData(data: unknown): unknown {
    if (!this.config.filterSensitiveData || !data) return data;
    
    if (typeof data === 'object' && data !== null) {
      const filtered = { ...data as Record<string, unknown> };
      
      Object.keys(filtered).forEach(key => {
        if (this.sensitiveKeys.some(sensitive => 
          key.toLowerCase().includes(sensitive)
        )) {
          filtered[key] = '[FILTERED]';
        }
      });
      
      return filtered;
    }
    
    return data;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentIndex = levels.indexOf(level);
    const minIndex = levels.indexOf(this.config.productionLogLevel);
    
    return currentIndex >= minIndex;
  }

  private addToHistory(entry: LogEntry): void {
    if (!this.config.enableHistory) return;
    
    this.history.push(entry);
    
    if (this.history.length > this.config.maxHistorySize) {
      this.history.splice(0, this.history.length - this.config.maxHistorySize);
    }
  }

  private getContextEmoji(context: LogContext): string {
    const emojis: Record<LogContext, string> = {
      app: '🚀',
      api: '🌐', 
      auth: '🔐',
      music: '🎵',
      ui: '🎨',
      performance: '📊',
      security: '🛡️',
      database: '🗄️',
      cache: '💾',
      validation: '✅',
      pwa: '📱',
      testing: '🧪',
      accessibility: '♿',
      i18n: '🌍',
      audio: '🔊',
      analytics: '📈'
    };
    return emojis[context] || '⚡';
  }

  private log(level: LogLevel, context: LogContext, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const filteredData = this.filterSensitiveData(data);
    const entry: LogEntry = {
      level,
      context,
      message,
      data: filteredData,
      timestamp: Date.now(),
      stack: level === 'error' ? new Error().stack : undefined
    };

    this.addToHistory(entry);

    // Utiliser les méthodes console natives pour éviter les boucles infinies
    if (this.config.enableConsole) {
      const emoji = this.getContextEmoji(context);
      const prefix = `${emoji} [${context.toUpperCase()}]`;
      const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
      
      switch (level) {
        case 'debug':
          nativeConsole.debug(`${timestamp} ${prefix} ${message}`, filteredData || '');
          break;
        case 'info':
          nativeConsole.info(`${timestamp} ${prefix} ${message}`, filteredData || '');
          break;
        case 'warn':
          nativeConsole.warn(`${timestamp} ${prefix} ${message}`, filteredData || '');
          break;
        case 'error':
          nativeConsole.error(`${timestamp} ${prefix} ${message}`, filteredData || '');
          if (entry.stack) nativeConsole.error('Stack:', entry.stack);
          break;
      }
    }
  }

  // API publique
  debug(context: LogContext, message: string, data?: unknown): void {
    this.log('debug', context, message, data);
  }

  info(context: LogContext, message: string, data?: unknown): void {
    this.log('info', context, message, data);
  }

  warn(context: LogContext, message: string, data?: unknown): void {
    this.log('warn', context, message, data);
  }

  error(context: LogContext, message: string, data?: unknown): void {
    this.log('error', context, message, data);
  }

  // Méthodes spécialisées
  performance(message: string, data?: unknown): void {
    this.info('performance', message, data);
  }

  security(message: string, data?: unknown): void {
    this.warn('security', message, data);
  }

  api(method: string, url: string, status?: number, error?: unknown): void {
    const level = status && status >= 400 ? 'error' : 'info';
    this.log(level, 'api', `${method} ${url}`, { status, error });
  }

  database(operation: string, table: string, error?: unknown): void {
    const level = error ? 'error' : 'debug';
    this.log(level, 'database', `${operation} ${table}`, { error });
  }

  // Aliases de compatibilité pour migration
  dbError(operation: string, error: unknown, context?: { component?: string; metadata?: unknown }): void {
    this.error('database', `Database error during ${operation}`, { error, ...context });
  }

  apiError(endpoint: string, error: unknown, context?: { component?: string; metadata?: unknown }): void {
    this.error('api', `API error on ${endpoint}`, { error, ...context });
  }

  // Utilitaires
  getHistory(context?: LogContext, level?: LogLevel): LogEntry[] {
    let filtered = this.history;
    
    if (context) {
      filtered = filtered.filter(entry => entry.context === context);
    }
    
    if (level) {
      filtered = filtered.filter(entry => entry.level === level);
    }
    
    return filtered;
  }

  clearHistory(): void {
    this.history = [];
  }

  configure(config: Partial<LogConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Monitoring des performances
  time(label: string): void {
    if (this.isDevelopment) {
      nativeConsole.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      nativeConsole.timeEnd(label);
    }
  }
}

// Instance singleton
export const logger = new UnifiedLogger();

// Helpers pour migration facile depuis l'ancien système
export const logError = (context: LogContext, message: string, data?: unknown) => logger.error(context, message, data);
export const logWarn = (context: LogContext, message: string, data?: unknown) => logger.warn(context, message, data);
export const logInfo = (context: LogContext, message: string, data?: unknown) => logger.info(context, message, data);
export const logDebug = (context: LogContext, message: string, data?: unknown) => logger.debug(context, message, data);