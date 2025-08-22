import { ReactNode } from 'react';

/**
 * Types de notifications disponibles
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'generation';

/**
 * Actions disponibles sur une notification
 */
export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive';
  icon?: ReactNode;
}

/**
 * Structure de base d'une notification
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  persistent?: boolean;
  actions?: NotificationAction[];
  progress?: number;
  icon?: ReactNode;
  category?: NotificationCategory;
  priority?: NotificationPriority;
}

/**
 * Catégories de notifications
 */
export type NotificationCategory = 
  | 'system'
  | 'user_action' 
  | 'generation'
  | 'streaming'
  | 'quota'
  | 'playlist'
  | 'quiz'
  | 'auth';

/**
 * Priorités de notifications
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Données pour les notifications de génération
 */
export interface GenerationNotificationData {
  type: 'music' | 'quiz' | 'content';
  itemId?: string;
  itemTitle?: string;
  progress?: number;
  estimatedTime?: number;
  message?: string;
  onView?: () => void;
  onCancel?: () => void;
  error?: {
    code: string;
    message: string;
    retry?: () => void;
  };
}

/**
 * Données pour les notifications de playlist
 */
export interface PlaylistNotificationData {
  playlistId?: string;
  playlistName?: string;
  trackId?: string;
  trackTitle?: string;
  trackCount?: number;
  onView?: () => void;
  onUndo?: () => void;
}

/**
 * Données pour les notifications de streaming
 */
export interface StreamingNotificationData {
  trackId?: string;
  trackTitle?: string;
  trackUrl?: string;
  duration?: number;
  currentTime?: number;
  quality?: 'low' | 'medium' | 'high';
  error?: {
    code: AudioErrorCode;
    message: string;
    retry?: () => void;
  };
}

/**
 * Codes d'erreur audio
 */
export type AudioErrorCode = 
  | 'NETWORK_ERROR'
  | 'DECODE_ERROR' 
  | 'SRC_NOT_SUPPORTED'
  | 'PLAYBACK_ABORTED'
  | 'UNKNOWN_ERROR';

/**
 * Données pour les notifications de quota
 */
export interface QuotaNotificationData {
  remaining: number;
  total: number;
  resetDate?: Date;
  planType?: string;
  upgradeUrl?: string;
}

/**
 * Données pour les notifications de quiz
 */
export interface QuizNotificationData {
  quizId?: string;
  itemCode?: string;
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  completionTime?: number;
  rank?: 'A' | 'B' | 'mix';
  onReview?: () => void;
  onRetry?: () => void;
}

/**
 * Données pour les notifications d'authentification
 */
export interface AuthNotificationData {
  action: 'login' | 'logout' | 'signup' | 'password_reset' | 'session_expired';
  redirectUrl?: string;
  sessionDuration?: number;
  expiryTime?: Date;
}

/**
 * Union type pour toutes les données de notification possibles
 */
export type NotificationData = 
  | GenerationNotificationData
  | PlaylistNotificationData  
  | StreamingNotificationData
  | QuotaNotificationData
  | QuizNotificationData
  | AuthNotificationData
  | Record<string, unknown>;

/**
 * Configuration pour l'affichage des notifications
 */
export interface NotificationDisplayConfig {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  showProgress?: boolean;
  showTimestamp?: boolean;
  groupSimilar?: boolean;
  maxVisible?: number;
  animation?: 'slide' | 'fade' | 'bounce';
}

/**
 * Filtre pour les notifications
 */
export interface NotificationFilter {
  type?: NotificationType[];
  category?: NotificationCategory[];
  priority?: NotificationPriority[];
  persistent?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}

/**
 * Statistiques des notifications
 */
export interface NotificationStats {
  total: number;
  byType: Record<NotificationType, number>;
  byCategory: Record<NotificationCategory, number>;
  byPriority: Record<NotificationPriority, number>;
  unread: number;
  persistent: number;
  withActions: number;
  averageDisplayTime: number;
  mostCommonType: NotificationType;
  mostCommonCategory: NotificationCategory;
}

/**
 * Événement de notification
 */
export interface NotificationEvent {
  type: 'created' | 'updated' | 'removed' | 'action_triggered' | 'expired';
  notification: Notification;
  timestamp: Date;
  actionId?: string;
}

/**
 * Gestionnaire d'événements de notification
 */
export type NotificationEventHandler = (event: NotificationEvent) => void;