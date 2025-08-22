import React, { createContext, useContext, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Wifi, WifiOff, Database, Shield, Clock } from 'lucide-react';
import type { 
  AppError, 
  APIError, 
  NetworkError, 
  AuthError, 
  ErrorMessageConfig,
  ErrorContext as ErrorContextType_Import,
  ErrorHandler
} from '@/types/error';

interface ErrorContextType {
  handleAPIError: ErrorHandler;
  handleNetworkError: (error: NetworkError | Error, context?: ErrorContextType_Import) => void;
  handleAuthError: (error: AuthError | Error, context?: ErrorContextType_Import) => void;
  showRetryableError: (message: string, retryFn: () => void) => void;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  const handleAPIError = useCallback<ErrorHandler>((error, context = 'user_action') => {
    console.error('API Error:', error);

    // Parse standardized error format
    let errorData: APIError = {
      error: 'UNKNOWN_ERROR',
      code: 500,
      message: 'Une erreur inattendue s\'est produite'
    };

    // Type guard pour APIError
    if (error && typeof error === 'object' && 'error' in error && 'code' in error) {
      errorData = error as APIError;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorData.message = (error as Error).message;
      errorData.code = ('status' in error && typeof error.status === 'number') ? error.status : 500;
    } else if (error instanceof Error) {
      errorData.message = error.message;
    }

    // Map specific error codes to user-friendly messages
    const errorMessages: Record<string, ErrorMessageConfig> = {
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
      console.error('Critical API Error:', {
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

  const handleNetworkError = useCallback((error: NetworkError | Error, context: ErrorContextType_Import = 'network') => {
    console.error('Network Error:', error);

    const isOnline = navigator.onLine;
    let message = 'Erreur de réseau inconnue';
    
    if ('type' in error && error.type) {
      switch (error.type) {
        case 'offline':
          message = 'Aucune connexion internet détectée';
          break;
        case 'timeout':
          message = 'La requête a pris trop de temps';
          break;
        case 'cors':
          message = 'Erreur de politique de sécurité (CORS)';
          break;
        default:
          message = error.message || 'Erreur de réseau';
      }
    } else if (error instanceof Error) {
      message = error.message;
    }
    
    toast({
      title: isOnline ? 'Erreur de connexion' : 'Connexion perdue',
      description: isOnline ? 
        'Impossible de contacter le serveur. Vérifiez votre connexion.' :
        message,
      variant: 'destructive',
    });
  }, [toast]);

  const handleAuthError = useCallback((error: AuthError | Error, context: ErrorContextType_Import = 'authentication') => {
    console.error('Auth Error:', error);
    
    let title = '🔐 Erreur d\'authentification';
    let description = 'Votre session a expiré. Redirection vers la connexion...';
    let redirectDelay = 2000;
    
    if ('type' in error) {
      switch (error.type) {
        case 'expired':
          title = '⏰ Session expirée';
          description = 'Votre session a expiré. Veuillez vous reconnecter.';
          break;
        case 'invalid':
          title = '❌ Authentification invalide';
          description = 'Vos identifiants sont incorrects.';
          break;
        case 'forbidden':
          title = '🚫 Accès refusé';
          description = 'Vous n\'avez pas les permissions nécessaires.';
          redirectDelay = 0; // Pas de redirection automatique
          break;
        case 'missing':
          title = '🔑 Authentification requise';
          description = 'Veuillez vous connecter pour continuer.';
          break;
      }
    }
    
    toast({
      title,
      description,
      variant: 'destructive',
    });

    if (redirectDelay > 0) {
      setTimeout(() => {
        const redirectUrl = ('redirectUrl' in error && error.redirectUrl) 
          ? error.redirectUrl 
          : '/login';
        window.location.href = redirectUrl;
      }, redirectDelay);
    }
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