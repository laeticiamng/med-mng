
export interface CreateSongRequest {
  title: string;
  suno_audio_id: string;
  meta?: any;
}

export interface CreateSubscriptionRequest {
  plan_id: string;
  gateway: string;
  subscription_id: string;
}

export interface AddToLibraryRequest {
  song_id: string;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// ✅ STANDARD API ERROR CODES - Pour i18n frontend
export enum ApiErrorCode {
  // Authentication & Authorization
  NOT_AUTH = 'NOT_AUTH',
  INVALID_AUTH = 'INVALID_AUTH',
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  
  // Validation & Request
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  MISSING_FIELD = 'MISSING_FIELD',
  INVALID_SONG_ID = 'INVALID_SONG_ID',
  
  // Business Logic
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  SONG_NOT_FOUND = 'SONG_NOT_FOUND',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SUBSCRIPTION_REQUIRED = 'SUBSCRIPTION_REQUIRED',
  
  // System & External
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  UPSTREAM_ERROR = 'UPSTREAM_ERROR',
  STREAM_TIMEOUT = 'STREAM_TIMEOUT',
  LYRICS_FETCH_ERROR = 'LYRICS_FETCH_ERROR',
  
  // Configuration & Environment
  ENV_CONFIG_ERROR = 'ENV_CONFIG_ERROR',
  AUTH_VALIDATION_ERROR = 'AUTH_VALIDATION_ERROR',
  
  // Rate Limiting & Security
  RATE_LIMIT = 'RATE_LIMIT',
  CSRF_TOKEN_MISSING = 'CSRF_TOKEN_MISSING',
  CSRF_TOKEN_INVALID = 'CSRF_TOKEN_INVALID',
  
  // Generic
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

// ✅ PAGINATION & SEARCH INTERFACES
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SearchParams extends PaginationParams {
  search?: string;
  sort?: 'created_at' | 'title' | 'updated_at';
  order?: 'asc' | 'desc';
}

// ✅ RESPONSE INTERFACES  
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
  message?: string;
  timestamp?: string;
  path?: string;
  details?: any;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ✅ HEALTH & MONITORING
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  metrics: any;
  security: any;
  alerts: any;
}
