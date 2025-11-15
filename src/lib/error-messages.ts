/**
 * Standardized Error Messages
 *
 * Centralized error messages for consistent UX across the application.
 * Messages are user-friendly and actionable.
 */

/**
 * Network and connectivity errors
 */
export const NETWORK_ERRORS = {
  OFFLINE: 'Vous êtes hors ligne. Vérifiez votre connexion internet.',
  TIMEOUT: 'La requête a expiré. Veuillez réessayer.',
  CONNECTION_FAILED: 'Impossible de se connecter au serveur. Vérifiez votre connexion.',
  SERVER_UNREACHABLE: 'Le serveur est temporairement indisponible.',
} as const

/**
 * Authentication and authorization errors
 */
export const AUTH_ERRORS = {
  NOT_AUTHENTICATED: 'Vous devez être connecté pour accéder à cette page.',
  SESSION_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect.',
  EMAIL_NOT_VERIFIED: 'Veuillez vérifier votre email avant de continuer.',
  PERMISSION_DENIED: "Vous n'avez pas la permission d'effectuer cette action.",
  ACCOUNT_LOCKED: 'Votre compte a été temporairement verrouillé.',
  ACCOUNT_DISABLED: 'Votre compte a été désactivé. Contactez le support.',
} as const

/**
 * Data validation errors
 */
export const VALIDATION_ERRORS = {
  REQUIRED_FIELD: 'Ce champ est requis.',
  INVALID_EMAIL: 'Adresse email invalide.',
  INVALID_FORMAT: 'Format invalide.',
  TOO_SHORT: 'Trop court. Minimum {min} caractères.',
  TOO_LONG: 'Trop long. Maximum {max} caractères.',
  INVALID_PHONE: 'Numéro de téléphone invalide.',
  PASSWORDS_DONT_MATCH: 'Les mots de passe ne correspondent pas.',
  WEAK_PASSWORD: 'Mot de passe trop faible. Utilisez au moins 8 caractères avec lettres et chiffres.',
  INVALID_DATE: 'Date invalide.',
  FUTURE_DATE_REQUIRED: 'La date doit être dans le futur.',
  PAST_DATE_REQUIRED: 'La date doit être dans le passé.',
} as const

/**
 * Resource errors (CRUD operations)
 */
export const RESOURCE_ERRORS = {
  NOT_FOUND: 'La ressource demandée n\'existe pas.',
  ALREADY_EXISTS: 'Cette ressource existe déjà.',
  CANNOT_DELETE: 'Impossible de supprimer cette ressource.',
  CANNOT_UPDATE: 'Impossible de mettre à jour cette ressource.',
  CREATION_FAILED: 'Échec de la création.',
  UPDATE_FAILED: 'Échec de la mise à jour.',
  DELETE_FAILED: 'Échec de la suppression.',
} as const

/**
 * Database and server errors
 */
export const SERVER_ERRORS = {
  INTERNAL_ERROR: 'Une erreur serveur s\'est produite. Veuillez réessayer plus tard.',
  DATABASE_ERROR: 'Erreur de base de données. Veuillez réessayer.',
  SERVICE_UNAVAILABLE: 'Service temporairement indisponible. Réessayez dans quelques instants.',
  MAINTENANCE: 'Maintenance en cours. Nous serons de retour bientôt.',
  RATE_LIMIT: 'Trop de requêtes. Veuillez patienter avant de réessayer.',
} as const

/**
 * File upload errors
 */
export const UPLOAD_ERRORS = {
  FILE_TOO_LARGE: 'Fichier trop volumineux. Taille maximale: {maxSize}.',
  INVALID_FILE_TYPE: 'Type de fichier non supporté. Types acceptés: {types}.',
  UPLOAD_FAILED: 'Échec de l\'upload. Veuillez réessayer.',
  NO_FILE_SELECTED: 'Aucun fichier sélectionné.',
} as const

/**
 * Payment and subscription errors
 */
export const PAYMENT_ERRORS = {
  PAYMENT_FAILED: 'Le paiement a échoué. Vérifiez vos informations bancaires.',
  CARD_DECLINED: 'Carte refusée. Contactez votre banque.',
  INSUFFICIENT_FUNDS: 'Fonds insuffisants.',
  SUBSCRIPTION_EXPIRED: 'Votre abonnement a expiré.',
  SUBSCRIPTION_REQUIRED: 'Cette fonctionnalité nécessite un abonnement premium.',
} as const

/**
 * Feature-specific errors
 */
export const FEATURE_ERRORS = {
  FAVORITES: {
    ADD_FAILED: 'Impossible d\'ajouter aux favoris.',
    REMOVE_FAILED: 'Impossible de retirer des favoris.',
    ALREADY_FAVORITED: 'Déjà dans vos favoris.',
  },
  SHARE: {
    SHARE_FAILED: 'Échec du partage.',
    INVALID_EMAIL: 'Adresse email de partage invalide.',
    CANNOT_SHARE_WITH_SELF: 'Vous ne pouvez pas partager avec vous-même.',
  },
  PLAYLIST: {
    CREATE_FAILED: 'Impossible de créer la playlist.',
    ADD_SONG_FAILED: 'Impossible d\'ajouter le morceau.',
    REMOVE_SONG_FAILED: 'Impossible de retirer le morceau.',
    DELETE_FAILED: 'Impossible de supprimer la playlist.',
  },
  CHAT: {
    MESSAGE_FAILED: 'Impossible d\'envoyer le message.',
    CHAT_UNAVAILABLE: 'Le chat est temporairement indisponible.',
    AI_ERROR: 'L\'IA n\'a pas pu générer de réponse. Réessayez.',
  },
  MUSIC: {
    GENERATION_FAILED: 'Impossible de générer la musique.',
    PLAYBACK_ERROR: 'Erreur de lecture. Vérifiez votre connexion.',
    QUOTA_EXCEEDED: 'Limite de génération atteinte. Réessayez demain.',
  },
} as const

/**
 * Success messages (for consistency)
 */
export const SUCCESS_MESSAGES = {
  SAVED: 'Enregistré avec succès.',
  CREATED: 'Créé avec succès.',
  UPDATED: 'Mis à jour avec succès.',
  DELETED: 'Supprimé avec succès.',
  SHARED: 'Partagé avec succès.',
  COPIED: 'Copié dans le presse-papier.',
  EMAIL_SENT: 'Email envoyé.',
  PASSWORD_RESET: 'Mot de passe réinitialisé.',
  PROFILE_UPDATED: 'Profil mis à jour.',
  PREFERENCES_SAVED: 'Préférences enregistrées.',
} as const

/**
 * Helper to format error messages with variables
 *
 * @example
 * formatErrorMessage(VALIDATION_ERRORS.TOO_SHORT, { min: 8 })
 * // Returns: "Trop court. Minimum 8 caractères."
 */
export function formatErrorMessage(
  message: string,
  variables?: Record<string, string | number>
): string {
  if (!variables) return message

  return Object.entries(variables).reduce(
    (msg, [key, value]) => msg.replace(`{${key}}`, String(value)),
    message
  )
}

/**
 * Maps HTTP status codes to user-friendly messages
 */
export function getErrorMessageFromStatus(status: number): string {
  switch (status) {
    case 400:
      return VALIDATION_ERRORS.INVALID_FORMAT
    case 401:
      return AUTH_ERRORS.NOT_AUTHENTICATED
    case 403:
      return AUTH_ERRORS.PERMISSION_DENIED
    case 404:
      return RESOURCE_ERRORS.NOT_FOUND
    case 409:
      return RESOURCE_ERRORS.ALREADY_EXISTS
    case 429:
      return SERVER_ERRORS.RATE_LIMIT
    case 500:
      return SERVER_ERRORS.INTERNAL_ERROR
    case 503:
      return SERVER_ERRORS.SERVICE_UNAVAILABLE
    default:
      return SERVER_ERRORS.INTERNAL_ERROR
  }
}

/**
 * Extracts a user-friendly error message from various error types
 */
export function extractErrorMessage(error: unknown): string {
  // Error object
  if (error instanceof Error) {
    return error.message
  }

  // Supabase error format
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  ) {
    return (error as any).message
  }

  // HTTP response
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as any).status === 'number'
  ) {
    return getErrorMessageFromStatus((error as any).status)
  }

  // Fallback
  return SERVER_ERRORS.INTERNAL_ERROR
}

/**
 * All error messages grouped
 */
export const ERROR_MESSAGES = {
  NETWORK: NETWORK_ERRORS,
  AUTH: AUTH_ERRORS,
  VALIDATION: VALIDATION_ERRORS,
  RESOURCE: RESOURCE_ERRORS,
  SERVER: SERVER_ERRORS,
  UPLOAD: UPLOAD_ERRORS,
  PAYMENT: PAYMENT_ERRORS,
  FEATURE: FEATURE_ERRORS,
} as const
