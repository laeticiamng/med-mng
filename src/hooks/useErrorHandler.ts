import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface AppError {
  id: string;
  type: 'network' | 'validation' | 'auth' | 'quota' | 'unknown';
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  resolved?: boolean;
}

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
}

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<AppError[]>([]);

  const logError = useCallback((
    type: AppError['type'],
    code: string,
    message: string,
    details?: any,
    context?: ErrorContext
  ) => {
    const error: AppError = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      code,
      message,
      details: { ...details, context },
      timestamp: new Date(),
      resolved: false
    };

    setErrors(prev => [error, ...prev.slice(0, 49)]); // Garder seulement les 50 dernières erreurs

    // Log pour le développement
    console.error(`[${type.toUpperCase()}] ${code}: ${message}`, {
      details,
      context,
      timestamp: error.timestamp
    });

    return error.id;
  }, []);

  const handleError = useCallback((
    type: AppError['type'],
    code: string,
    message: string,
    userMessage?: string,
    details?: any,
    context?: ErrorContext
  ) => {
    const errorId = logError(type, code, message, details, context);
    
    // Afficher un toast à l'utilisateur
    const displayMessage = userMessage || getDefaultUserMessage(type, code);
    
    switch (type) {
      case 'auth':
        toast.error(`🔒 ${displayMessage}`);
        break;
      case 'quota':
        toast.error(`⚠️ ${displayMessage}`);
        break;
      case 'network':
        toast.error(`🌐 ${displayMessage}`);
        break;
      case 'validation':
        toast.error(`⚠️ ${displayMessage}`);
        break;
      default:
        toast.error(`❌ ${displayMessage}`);
    }

    return errorId;
  }, [logError]);

  const resolveError = useCallback((errorId: string) => {
    setErrors(prev => 
      prev.map(error => 
        error.id === errorId 
          ? { ...error, resolved: true }
          : error
      )
    );
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getErrorsByType = useCallback((type: AppError['type']) => {
    return errors.filter(error => error.type === type && !error.resolved);
  }, [errors]);

  const hasUnresolvedErrors = useCallback(() => {
    return errors.some(error => !error.resolved);
  }, [errors]);

  return {
    errors,
    logError,
    handleError,
    resolveError,
    clearErrors,
    getErrorsByType,
    hasUnresolvedErrors
  };
};

const getDefaultUserMessage = (type: AppError['type'], code: string): string => {
  switch (type) {
    case 'auth':
      return 'Erreur d\'authentification. Veuillez vous reconnecter.';
    case 'quota':
      return 'Quota dépassé. Améliorez votre abonnement.';
    case 'network':
      return 'Erreur de connexion. Vérifiez votre internet.';
    case 'validation':
      return 'Données invalides. Vérifiez vos saisies.';
    default:
      return 'Une erreur inattendue s\'est produite.';
  }
};