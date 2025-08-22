import { LucideIcon } from 'lucide-react';

/**
 * Structure des instructions CAS pour l'utilisateur
 */
export interface CASInstructions {
  message: string;
  next_steps?: string[];
  manual_login?: string;
  username_field?: string;
  password_field?: string;
  submit_button?: string;
}

/**
 * Structure d'un exemple de page OIC
 */
export interface CASExample {
  title: string;
  pageid: number;
  url?: string;
}

/**
 * Résultat d'un test d'accès OIC
 */
export interface OICAccessResult {
  accessible: boolean;
  count: number;
  error?: string;
  examples?: CASExample[];
}

/**
 * Résultat complet d'un test CAS avec comparaison
 */
export interface CASTestResult {
  success: boolean;
  withoutAuth: OICAccessResult;
  withAuth: OICAccessResult & { cookies?: string };
  improvement: number;
  error?: string;
  nextSteps?: string[];
}

/**
 * Résultat d'authentification CAS
 */
export interface CASAuthResult {
  success: boolean;
  error?: string;
  cas_url?: string;
  instructions?: CASInstructions;
  pages_found?: number;
  valid?: boolean;
  pages_accessible?: number | string;
  examples?: CASExample[];
  improvement?: number;
  needsManualAuth?: boolean;
  casUrl?: string;
}

/**
 * Résultat d'obtention de cookies CAS
 */
export interface CASCookiesResult {
  success: boolean;
  cookies?: string;
  error?: string;
  needsManualAuth?: boolean;
  casUrl?: string;
  instructions?: CASInstructions;
}

/**
 * Résultat d'extraction OIC avec cookies
 */
export interface OICExtractionResult {
  success: boolean;
  pages: CASExample[];
  totalFound: number;
  error?: string;
}

/**
 * Configuration d'erreur CAS pour l'UI
 */
export interface CASErrorConfig {
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
 * Types de contexte pour les erreurs CAS
 */
export type CASErrorContext = 
  | 'authentication'
  | 'cookie_validation'
  | 'api_access'
  | 'network'
  | 'parsing';

/**
 * Handler spécifique pour les erreurs CAS
 */
export interface CASErrorHandler {
  (error: unknown, context?: CASErrorContext): void;
}