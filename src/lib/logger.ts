/**
 * 🚀 SYSTÈME DE LOGGING OPTIMISÉ MED-MNG v2.0
 * Remplace tous les console.log pour de meilleures performances
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogContext = 'app' | 'api' | 'auth' | 'music' | 'ui' | 'performance' | 'security';

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private log(level: LogLevel, context: LogContext, message: string, data?: any): void {
    if (this.isDevelopment) {
      const emoji = context === 'music' ? '🎵' : context === 'performance' ? '📊' : '⚡';
      const prefix = `${emoji} [${context.toUpperCase()}]`;
      
      switch (level) {
        case 'debug':
          console.debug(`${prefix} ${message}`, data || '');
          break;
        case 'info':
          console.info(`${prefix} ${message}`, data || '');
          break;
        case 'warn':
          console.warn(`${prefix} ${message}`, data || '');
          break;
        case 'error':
          console.error(`${prefix} ${message}`, data || '');
          break;
      }
    }
  }

  debug(context: LogContext, message: string, data?: any): void {
    this.log('debug', context, message, data);
  }

  info(context: LogContext, message: string, data?: any): void {
    this.log('info', context, message, data);
  }

  warn(context: LogContext, message: string, data?: any): void {
    this.log('warn', context, message, data);
  }

  error(context: LogContext, message: string, data?: any): void {
    this.log('error', context, message, data);
  }

  performance(message: string, data?: any): void {
    this.info('performance', message, data);
  }
}

export const logger = new Logger();