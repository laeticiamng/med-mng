/**
 * Types TypeScript stricts pour Express
 */
import { Request, Response, NextFunction } from 'express';

// Interface étendue pour les requêtes avec contexte
export interface ExtendedRequest extends Request {
  requestId?: string;
  user?: {
    id: string;
    email: string;
    role?: string;
  };
  rateLimitInfo?: {
    limit: number;
    remaining: number;
    resetTime: Date;
  };
}

// Types pour les middlewares
export type ExpressMiddleware = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type ErrorMiddleware = (
  err: Error,
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

// Types pour les handlers de routes
export type RouteHandler = (
  req: ExtendedRequest,
  res: Response
) => void | Promise<void>;

// Interface pour les réponses API standardisées
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    version?: string;
  };
}

export interface PaginatedResponse<T = any> extends APIResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}