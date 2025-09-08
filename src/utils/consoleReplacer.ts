/**
 * 🔧 CONSOLE REPLACER - MED-MNG v3.0
 * Outil automatique pour remplacer tous les console.log par le logger unifié
 */

import { logger } from '@/lib/logger';

// Remplacement automatique des console.* par le logger unifié
if (import.meta.env.DEV) {
  // Sauvegarder les méthodes originales
  const originalConsole = { ...console };

  // Remplacer console.log
  console.log = (...args: unknown[]) => {
    const message = args[0]?.toString() || 'Log message';
    const data = args.slice(1);
    logger.info('app', message, data.length ? data : undefined);
  };

  // Remplacer console.info
  console.info = (...args: unknown[]) => {
    const message = args[0]?.toString() || 'Info message';
    const data = args.slice(1);
    logger.info('app', message, data.length ? data : undefined);
  };

  // Remplacer console.warn
  console.warn = (...args: unknown[]) => {
    const message = args[0]?.toString() || 'Warning message';
    const data = args.slice(1);
    logger.warn('app', message, data.length ? data : undefined);
  };

  // Remplacer console.error
  console.error = (...args: unknown[]) => {
    const message = args[0]?.toString() || 'Error message';
    const data = args.slice(1);
    logger.error('app', message, data.length ? data : undefined);
  };

  // Laisser console.debug intact pour le développement
  console.debug = originalConsole.debug;
  
  // Méthodes utilitaires toujours disponibles
  console.time = originalConsole.time;
  console.timeEnd = originalConsole.timeEnd;
  console.table = originalConsole.table;
  console.group = originalConsole.group;
  console.groupEnd = originalConsole.groupEnd;
  console.clear = originalConsole.clear;

  logger.info('app', '🔧 Console methods replaced with unified logger');
}

export { logger };