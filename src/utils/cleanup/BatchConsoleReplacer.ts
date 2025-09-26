/**
 * Script de remplacement en batch des console.* 
 * Pour traiter rapidement les 160+ occurrences restantes
 */

import { errorService } from '@/services/core/ErrorService';

// Catalogue des remplacements pour différents types de console.*
export const replaceConsolePatterns = {
  // console.error -> errorService.handleError
  'console.error': (message: string, error?: any, context: string = 'system') => {
    errorService.handleError(error || new Error(message), context as any, true);
  },

  // console.warn -> errorService.handleWarning  
  'console.warn': (message: string, metadata?: any, context: string = 'system') => {
    errorService.handleWarning(message, context as any, metadata);
  },

  // console.log -> développement uniquement
  'console.log': (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[DEV] ${message}`, data);
    }
  },

  // console.debug -> errorService.handleWarning avec niveau debug
  'console.debug': (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }
};

// Helper pour gérer les catch(console.error)
export const handleCatchError = (error: any, context: string = 'system') => {
  errorService.handleError(error, context as any, false);
};

// Fonction utilitaire pour les remplacements contextuels
export const getErrorContext = (filename: string): string => {
  if (filename.includes('admin/')) return 'system';
  if (filename.includes('auth')) return 'authentication';
  if (filename.includes('music')) return 'user_action';
  if (filename.includes('edn')) return 'user_action';
  return 'system';
};

// Export des fonctions directes pour les remplacements rapides
export const handleError = replaceConsolePatterns['console.error'];
export const handleWarning = replaceConsolePatterns['console.warn'];
export const devLog = replaceConsolePatterns['console.log'];
export const debugLog = replaceConsolePatterns['console.debug'];