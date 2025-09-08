import { useCallback } from 'react';

/**
 * Hook de logging optimisé qui évite les logs excessifs en production
 */
export const useDebugLogger = (context: string) => {
  const isDevelopment = import.meta.env.DEV;

  const log = useCallback((level: 'info' | 'warn' | 'error', message: string, data?: any) => {
    if (!isDevelopment && level === 'info') {
      return; // Éviter les logs info en production
    }

    const prefix = `[${context}]`;
    switch (level) {
      case 'info':
        console.log(prefix, message, data);
        break;
      case 'warn':
        console.warn(prefix, message, data);
        break;
      case 'error':
        console.error(prefix, message, data);
        break;
    }
  }, [context, isDevelopment]);

  const info = useCallback((message: string, data?: any) => {
    log('info', message, data);
  }, [log]);

  const warn = useCallback((message: string, data?: any) => {
    log('warn', message, data);
  }, [log]);

  const error = useCallback((message: string, data?: any) => {
    log('error', message, data);
  }, [log]);

  return { info, warn, error };
};