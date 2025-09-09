/**
 * Service centralisé de gestion d'erreurs
 * Messages standardisés, logging, retry automatique
 */

import { toast } from '@/hooks/use-toast';
import type { AppError, ErrorContext, ErrorMessageConfig } from '@/types/error';

export interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  context?: ErrorContext;
  userId?: string;
  url?: string;
  userAgent?: string;
  stack?: string;
  metadata?: Record<string, unknown>;
}

class ErrorService {
  private static instance: ErrorService;
  private errorLogs: ErrorLog[] = [];
  private maxLogs = 100;

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  private setupGlobalErrorHandlers() {
    // Erreurs JavaScript non catchées
    window.addEventListener('error', (event) => {
      this.logError({
        level: 'error',
        message: `Script error: ${event.message}`,
        context: 'system',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        stack: event.error?.stack,
      });
    });

    // Promesses rejetées non catchées
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        level: 'error',
        message: `Unhandled promise rejection: ${event.reason}`,
        context: 'system',
        metadata: { reason: event.reason },
      });
    });
  }

  private logError(errorData: Omit<ErrorLog, 'id' | 'timestamp' | 'url' | 'userAgent'>) {
    const log: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...errorData,
    };

    // Ajouter au cache local
    this.errorLogs.push(log);
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs = this.errorLogs.slice(-this.maxLogs);
    }

    // Log console en développement
    if (import.meta.env.DEV) {
      console.error('🚨 ErrorService:', log);
    }

    // Feature: Monitoring service integration
    // Tracked in TODO-TASKS.json as TODO-2
    // this.sendToMonitoring(log);
  }

  handleError(
    error: AppError,
    context: ErrorContext = 'user_action',
    showToast = true
  ): void {
    const errorMessage = this.getReadableErrorMessage(error, context);
    
    this.logError({
      level: 'error',
      message: errorMessage.description,
      context,
      stack: error instanceof Error ? error.stack : undefined,
      metadata: { originalError: error },
    });

    if (showToast) {
      toast({
        variant: "destructive",
        title: errorMessage.title,
        description: errorMessage.description,
      });
    }
  }

  handleWarning(
    message: string,
    context: ErrorContext = 'system',
    metadata?: Record<string, unknown>
  ): void {
    this.logError({
      level: 'warn',
      message,
      context,
      metadata,
    });

    if (import.meta.env.DEV) {
      console.warn('⚠️ Warning:', message, metadata);
    }
  }

  handleInfo(
    message: string,
    context: ErrorContext = 'system',
    metadata?: Record<string, unknown>
  ): void {
    this.logError({
      level: 'info',
      message,
      context,
      metadata,
    });
  }

  private getReadableErrorMessage(error: AppError, context: ErrorContext): ErrorMessageConfig {
    // Erreurs réseau
    if (this.isNetworkError(error)) {
      return {
        title: 'Problème de connexion',
        description: 'Vérifiez votre connexion internet et réessayez',
        icon: 'WifiOff' as any,
      };
    }

    // Erreurs d'authentification
    if (this.isAuthError(error)) {
      return {
        title: 'Problème d\'authentification',
        description: 'Votre session a expiré. Veuillez vous reconnecter',
        icon: 'Lock' as any,
      };
    }

    // Erreurs de validation
    if (this.isValidationError(error)) {
      return {
        title: 'Données invalides',
        description: 'Veuillez vérifier les informations saisies',
        icon: 'AlertTriangle' as any,
      };
    }

    // Erreurs API spécifiques
    if (this.isAPIError(error)) {
      const apiError = error as any;
      return {
        title: 'Erreur du serveur',
        description: apiError.message || 'Une erreur s\'est produite lors du traitement',
        icon: 'Server' as any,
      };
    }

    // Erreur générique
    return {
      title: 'Erreur inattendue',
      description: 'Une erreur s\'est produite. Nos équipes ont été notifiées',
      icon: 'AlertCircle' as any,
    };
  }

  private isNetworkError(error: AppError): boolean {
    return (
      error instanceof TypeError && error.message.includes('fetch') ||
      (error as any)?.type === 'network' ||
      (error as any)?.code === 'NETWORK_ERROR'
    );
  }

  private isAuthError(error: AppError): boolean {
    return (
      (error as any)?.status === 401 ||
      (error as any)?.type === 'auth' ||
      (error as any)?.message?.includes('authentication')
    );
  }

  private isValidationError(error: AppError): boolean {
    return (
      (error as any)?.status === 400 ||
      (error as any)?.type === 'validation' ||
      (error as any)?.validation
    );
  }

  private isAPIError(error: AppError): boolean {
    return (
      (error as any)?.error &&
      (error as any)?.code &&
      (error as any)?.message
    );
  }

  // Retry automatique avec backoff exponentiel
  async withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts = 3,
    baseDelay = 1000,
    context: ErrorContext = 'api_call'
  ): Promise<T> {
    let lastError: AppError | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as AppError;
        
        this.handleWarning(
          `Attempt ${attempt}/${maxAttempts} failed`,
          context,
          { attempt, error: error instanceof Error ? error.message : error }
        );

        if (attempt === maxAttempts) {
          break;
        }

        // Attendre avant le prochain essai (backoff exponentiel)
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  // Récupérer les logs pour le debugging
  getLogs(level?: 'error' | 'warn' | 'info', limit = 50): ErrorLog[] {
    let filtered = level 
      ? this.errorLogs.filter(log => log.level === level)
      : this.errorLogs;
    
    return filtered
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Nettoyer les logs
  clearLogs(): void {
    this.errorLogs = [];
  }

  // Exporter les logs pour debugging
  exportLogs(): string {
    return JSON.stringify(this.errorLogs, null, 2);
  }

  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Créer des messages d'erreur structurés
  createErrorMessage(
    title: string, 
    description: string, 
    action?: { label: string; callback: () => void }
  ) {
    return { title, description, action };
  }

  // Notification d'erreur personnalisée
  notifyError(
    title: string,
    description: string,
    duration = 5000
  ): void {
    // Créer notification personnalisée sans dépendre de React
    if (typeof window !== 'undefined') {
      console.error(`❌ ${title}: ${description}`);
      
      // Feature: Toast system integration 
      // Tracked in TODO-TASKS.json as TODO-3
      if (import.meta.env.DEV) {
        alert(`Erreur: ${title}\n${description}`);
      }
    }
  }
}

export const errorService = ErrorService.getInstance();
export default errorService;