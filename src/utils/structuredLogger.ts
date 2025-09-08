/**
 * Système de logging structuré pour remplacer tous les console.log
 * Optimisé pour la production avec niveaux configurables
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  itemCode?: string;
  metadata?: Record<string, any>;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
}

class StructuredLogger {
  private currentLevel: LogLevel;
  private isProduction: boolean;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  constructor() {
    this.isProduction = import.meta.env.PROD;
    this.currentLevel = this.isProduction ? LogLevel.ERROR : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.currentLevel;
  }

  private createLogEntry(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error
    };
  }

  private writeToConsole(entry: LogEntry): void {
    if (this.isProduction && entry.level > LogLevel.ERROR) return;

    const emoji = this.getEmoji(entry.level);
    const contextStr = entry.context ? ` [${entry.context.component || 'App'}]` : '';
    const fullMessage = `${emoji}${contextStr} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(fullMessage, entry.context, entry.error);
        break;
      case LogLevel.WARN:
        console.warn(fullMessage, entry.context);
        break;
      case LogLevel.INFO:
        console.info(fullMessage, entry.context);
        break;
      default:
        console.log(fullMessage, entry.context);
    }
  }

  private getEmoji(level: LogLevel): string {
    const emojis = {
      [LogLevel.ERROR]: '🚨',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.INFO]: '📝',
      [LogLevel.DEBUG]: '🔍',
      [LogLevel.TRACE]: '🔬'
    };
    return emojis[level] || '📝';
  }

  error(message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error);
    this.writeToConsole(entry);
    this.addToBuffer(entry);
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    this.writeToConsole(entry);
    this.addToBuffer(entry);
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.writeToConsole(entry);
    this.addToBuffer(entry);
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    this.writeToConsole(entry);
    this.addToBuffer(entry);
  }

  trace(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.TRACE)) return;
    
    const entry = this.createLogEntry(LogLevel.TRACE, message, context);
    this.writeToConsole(entry);
    this.addToBuffer(entry);
  }

  // Méthodes spécialisées pour MED-MNG
  medicalAction(action: string, itemCode?: string, metadata?: Record<string, any>): void {
    this.info(`Action médicale: ${action}`, {
      component: 'MedicalPlatform',
      action,
      itemCode,
      metadata
    });
  }

  musicGeneration(message: string, itemCode?: string, rang?: string): void {
    this.info(`Génération musicale: ${message}`, {
      component: 'MusicGeneration',
      itemCode,
      metadata: { rang }
    });
  }

  authentication(message: string, userId?: string): void {
    this.info(`Authentification: ${message}`, {
      component: 'Authentication',
      userId
    });
  }

  performance(message: string, duration?: number, metadata?: Record<string, any>): void {
    this.debug(`Performance: ${message}`, {
      component: 'Performance',
      metadata: { duration, ...metadata }
    });
  }

  private addToBuffer(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  // Export pour analytics
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Instance singleton
export const logger = new StructuredLogger();

// Fonctions helper pour migration facile
export const logError = (message: string, context?: LogContext, error?: Error) => 
  logger.error(message, context, error);

export const logWarn = (message: string, context?: LogContext) => 
  logger.warn(message, context);

export const logInfo = (message: string, context?: LogContext) => 
  logger.info(message, context);

export const logDebug = (message: string, context?: LogContext) => 
  logger.debug(message, context);

// Helpers spécialisés
export const logMedicalAction = (action: string, itemCode?: string, metadata?: Record<string, any>) =>
  logger.medicalAction(action, itemCode, metadata);

export const logMusicGeneration = (message: string, itemCode?: string, rang?: string) =>
  logger.musicGeneration(message, itemCode, rang);

export const logAuthentication = (message: string, userId?: string) =>
  logger.authentication(message, userId);

export const logPerformance = (message: string, duration?: number, metadata?: Record<string, any>) =>
  logger.performance(message, duration, metadata);