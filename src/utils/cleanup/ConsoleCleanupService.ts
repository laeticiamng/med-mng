/**
 * Service de nettoyage des console.* pour production
 * Remplace tous les console.error/warn par le système unifié
 */

import { errorService } from '@/services/core/ErrorService';

export class ConsoleCleanupService {
  /**
   * Remplace console.error par le système unifié
   */
  static handleError(message: string, error?: any, context: string = 'console_cleanup') {
    errorService.handleError(
      error || new Error(message), 
      context as any, 
      true
    );
  }

  /**
   * Remplace console.warn par le système unifié
   */
  static handleWarning(message: string, metadata?: any, context: string = 'console_cleanup') {
    errorService.handleWarning(message, context as any, metadata);
  }

  /**
   * Log pour développement uniquement
   */
  static devLog(message: string, data?: any) {
    if (import.meta.env.DEV) {
      console.log(`[DEV] ${message}`, data);
    }
  }

  /**
   * Log optimisé pour production
   */
  static prodLog(message: string, level: 'info' | 'debug' = 'info') {
    if (level === 'info') {
      errorService.handleWarning(message, 'system');
    }
  }
}

// Export des méthodes comme raccourcis
export const handleError = ConsoleCleanupService.handleError;
export const handleWarning = ConsoleCleanupService.handleWarning;
export const devLog = ConsoleCleanupService.devLog;
export const prodLog = ConsoleCleanupService.prodLog;