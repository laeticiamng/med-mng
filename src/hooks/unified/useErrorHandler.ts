/**
 * Hook unifié de gestion d'erreurs
 * Interface simple pour toute l'application
 */

import { useCallback } from 'react';
import { errorService } from '@/services/core/ErrorService';
import type { AppError, ErrorContext } from '@/types/error';

export const useErrorHandler = () => {
  const handleError = useCallback(
    (error: AppError, context: ErrorContext = 'user_action', showToast = true) => {
      errorService.handleError(error, context, showToast);
    },
    []
  );

  const handleWarning = useCallback(
    (message: string, context: ErrorContext = 'user_action', metadata?: Record<string, unknown>) => {
      errorService.handleWarning(message, context, metadata);
    },
    []
  );

  const withRetry = useCallback(
    <T>(
      operation: () => Promise<T>,
      maxAttempts = 3,
      context: ErrorContext = 'api_call'
    ): Promise<T> => {
      return errorService.withRetry(operation, maxAttempts, 1000, context);
    },
    []
  );

  // Removed createBoundary - use UnifiedErrorBoundary component directly

  return {
    handleError,
    handleWarning,
    withRetry,
    
    // Utilitaires de debugging
    getLogs: errorService.getLogs.bind(errorService),
    exportLogs: errorService.exportLogs.bind(errorService),
    clearLogs: errorService.clearLogs.bind(errorService),
  };
};