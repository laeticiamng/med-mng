/**
 * Types pour le système de sécurité
 */

export interface SecurityConfig {
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    strictMaxRequests: number;
  };
  cors: {
    allowedOrigins: string[];
    credentials: boolean;
  };
  headers: {
    enableCSP: boolean;
    enableHSTS: boolean;
  };
}

export interface MonitoringData {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  requestId?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  responseTime?: number;
  statusCode?: number;
}

export interface SecurityThreat {
  type: string;
  pattern: string;
  location: 'url' | 'query' | 'body' | 'headers';
  value: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  onLimitReached?: (req: any, res: any) => void;
}