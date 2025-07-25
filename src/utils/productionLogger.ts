// Production-safe logging utility
// Automatically filters out debug information in production

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isProduction = import.meta.env.PROD || window.location.hostname === 'med-mng.lovable.app';

class ProductionLogger {
  private shouldLog(level: LogLevel): boolean {
    if (isProduction) {
      // In production, only log warnings and errors
      return level === 'warn' || level === 'error';
    }
    return true; // Log everything in development
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(`🔍 [DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(`ℹ️ [INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`⚠️ [WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`❌ [ERROR] ${message}`, ...args);
    }
  }

  // MED-MNG specific logging
  medmng(operation: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(`🎵 [MED-MNG] ${operation}`, data);
    }
  }
}

export const logger = new ProductionLogger();

// Export for gradual migration from console.* calls
export { logger as productionLogger };