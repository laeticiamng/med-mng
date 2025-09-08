/**
 * 🔧 CONSOLE REPLACER - MED-MNG v3.0  
 * Outil automatique pour remplacer tous les console.log par le logger unifié
 */

import { nativeConsole } from '@/utils/nativeConsole';
import { logger } from '@/lib/logger';

// Remplacement automatique des console.* par le logger unifié
if (import.meta.env.DEV) {
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

  // Conserver les méthodes utiles non remplacées
  console.debug = nativeConsole.debug;
  console.time = nativeConsole.time;
  console.timeEnd = nativeConsole.timeEnd;
  console.table = nativeConsole.table;
  console.group = nativeConsole.group;
  console.groupEnd = nativeConsole.groupEnd;
  console.clear = nativeConsole.clear;

  logger.info('app', '🔧 Console methods replaced with unified logger');
}