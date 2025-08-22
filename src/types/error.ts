import { LucideIcon } from 'lucide-react';

/**
 * Structure standardisée des erreurs API
 */
export interface APIError {
  error: string;
  code: number;
  message: string;
  details?: APIErrorDetails;
}

/**
 * Détails supplémentaires d'une erreur API
 */
export interface APIErrorDetails {
  field?: string;
  validation?: ValidationError[];
  stack?: string;
  timestamp?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
}

/**
 * Erreur de validation spécifique
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

/**
 * Structure d'une erreur réseau
 */
export interface NetworkError {
  type: 'network' | 'timeout' | 'offline' | 'cors';
  message: string;
  status?: number;
  url?: string;
  timestamp: string;
}

/**
 * Structure d'une erreur d'authentification
 */
export interface AuthError {
  type: 'expired' | 'invalid' | 'missing' | 'forbidden';
  message: string;
  code?: string;
  redirectUrl?: string;
  timestamp: string;
}

/**
 * Erreur de serveur générique
 */
export interface ServerError {
  message: string;
  status: number;
  statusText?: string;
  url?: string;
  timestamp: string;
  stack?: string;
}

/**
 * Union type pour tous les types d'erreurs possibles
 */
export type AppError = APIError | NetworkError | AuthError | ServerError | Error;

/**
 * Configuration d'un message d'erreur pour l'utilisateur
 */
export interface ErrorMessageConfig {
  title: string;
  description: string;
  icon: LucideIcon;
  variant?: 'default' | 'destructive';
  action?: {
    label: string;
    callback: () => void;
  };
}

/**
 * Types de contexte pour les erreurs
 */
export type ErrorContext = 
  | 'api_call'
  | 'authentication' 
  | 'network'
  | 'validation'
  | 'file_upload'
  | 'user_action'
  | 'system';

/**
 * Handler générique d'erreur
 */
export interface ErrorHandler {
  <T extends AppError>(error: T, context?: ErrorContext): void;
}

/**
 * Configuration pour les handlers d'erreur
 */
export interface ErrorHandlerConfig {
  showToast?: boolean;
  logToConsole?: boolean;
  reportToService?: boolean;
  retryable?: boolean;
  retryCallback?: () => void;
}