import { useToast } from '@/hooks/use-toast';
import { logService } from '@/services/logService';
import { AlertTriangle, Clock, Database, Shield } from 'lucide-react';
import React, { createContext, useCallback, useContext } from 'react';

interface APIError {
  error: string;
  code: number;
  message: string;
  details?: any;
}

interface ErrorContextType {
  handleAPIError: (error: any, context?: string) => void;
  handleNetworkError: (error: any) => void;
  handleAuthError: (error: any) => void;
  showRetryableError: (message: string, retryFn: () => void) => void;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  const handleAPIError = useCallback((error: any, context = 'Action') => {
    logService.error('api', 'API Error', { error });

    // Parse standardized error format
    let errorData: APIError = {
      error: 'UNKNOWN_ERROR',
      code: 500,
      message: 'Une erreur inattendue s\'est produite'
    };

    if (error?.error) {
      errorData = error;
    } else if (error?.message) {
      errorData.message = error.message;
      errorData.code = error.status || 500;
    }

    // Map specific error codes to user-friendly messages
    const errorMessages: Record<string, { title: string; description: string; icon: any }> = {
      'RATE_LIMIT': {
        title: '⏱️ Limite de requêtes atteinte',
        description: 'Veuillez patienter quelques instants avant de réessayer',
        icon: Clock
      },
      'QUOTA_EXCEEDED': {
        title: '📊 Quota épuisé',
        description: 'Votre quota mensuel est épuisé. Passez à un plan supérieur',
        icon: Database
      },
      'AUTH_REQUIRED': {
        title: '🔐 Authentification requise',
        description: 'Veuillez vous connecter pour continuer',
        icon: Shield
      },
      'INVALID_AUTH': {
        title: '🔐 Session expirée',
        description: 'Votre session a expiré. Veuillez vous reconnecter',
        icon: Shield
      },
      'CSRF_TOKEN_MISSING': {
        title: '🛡️ Erreur de sécurité',
        description: 'Token de sécurité manquant. Actualisez la page',
        icon: Shield
      },
      'CSRF_TOKEN_INVALID': {
        title: '🛡️ Token de sécurité invalide',
        description: 'Votre session de sécurité a expiré. Actualisez la page',
        icon: Shield
      },
      'VALIDATION_ERROR': {
        title: '⚠️ Données invalides',
        description: 'Veuillez vérifier les informations saisies',
        icon: AlertTriangle
      },
      'NOT_FOUND': {
        title: '🔍 Ressource introuvable',
        description: 'L\'élément demandé n\'existe pas ou plus',
        icon: AlertTriangle
      },
      'SERVICE_UNAVAILABLE': {
        title: '🔧 Service temporairement indisponible',
        description: 'Le service est en maintenance. Réessayez dans quelques instants',
        icon: AlertTriangle
      }
    };

    const errorInfo = errorMessages[errorData.error] || {
      title: `Erreur ${context}`,
      description: errorData.message,
      icon: AlertTriangle
    };

    toast({
      title: errorInfo.title,
      description: errorInfo.description,
      variant: errorData.code >= 500 ? 'destructive' : 'default',
    });

    // Special handling for critical errors
    if (errorData.code >= 500) {
      logService.error('api', 'Critical API Error', {
        error: errorData,
        context,
        timestamp: new Date().toISOString()
      });
    }

    // Auto-refresh for CSRF errors
    if (errorData.error.includes('CSRF')) {
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }

    // Redirect to login for auth errors
    if (errorData.error.includes('AUTH') || errorData.code === 401) {
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  }, [toast]);

  const handleNetworkError = useCallback((error: any) => {
    logService.error('api', 'Network Error', { error });

    const isOnline = navigator.onLine;
    
    toast({
      title: isOnline ? 'Erreur de connexion' : 'Connexion perdue',
      description: isOnline ? 
        'Impossible de contacter le serveur. Vérifiez votre connexion.' :
        'Aucune connexion internet détectée',
      variant: 'destructive',
    });
  }, [toast]);

  const handleAuthError = useCallback((error: any) => {
    logService.error('auth', 'Auth Error', { error });
    
    toast({
      title: '🔐 Erreur d\'authentification',
      description: 'Votre session a expiré. Redirection vers la connexion...',
      variant: 'destructive',
    });

    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  }, [toast]);

  const showRetryableError = useCallback((message: string, retryFn: () => void) => {
    toast({
      title: '⚠️ Action échouée',
      description: message,
      variant: 'default',
      action: (
        <button 
          onClick={retryFn}
          className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90"
        >
          Réessayer
        </button>
      ),
    });
  }, [toast]);

  return (
    <ErrorContext.Provider value={{
      handleAPIError,
      handleNetworkError,
      handleAuthError,
      showRetryableError
    }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useErrorHandler() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorHandler must be used within ErrorProvider');
  }
  return context;
}