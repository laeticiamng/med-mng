import winston from 'winston';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import type { ExtendedRequest, ExpressMiddleware } from '../types/express';
import type { Request, Response, NextFunction } from 'express';

/**
 * Assure que le répertoire de logs existe
 */
function ensureLogDir(): void {
  const logDir = path.join(process.env.LOG_DIR || process.cwd(), 'logs');
  
  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create logs directory:', error);
      throw new Error(`Cannot create logs directory: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// S'assurer que le répertoire de logs existe avant la configuration
ensureLogDir();

// Configuration du logger centralisé
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'medical-training-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Fichier pour les erreurs
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Fichier pour tous les logs
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
});

// En développement, ajouter la sortie console avec format coloré
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Types stricts pour une meilleure sécurité de typage
export interface LogContext {
  userId?: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
  metadata?: Record<string, unknown>;
  // Propriétés extensibles pour compatibilité
  port?: number;
  environment?: string;
  nodeVersion?: string;
  origin?: string;
  identifier?: string;
  operation?: string;
  [key: string]: unknown;
}

// Interface du service de logging
export interface LogService {
  info(message: string, meta?: LogContext): void;
  warn(message: string, meta?: LogContext): void;
  error(message: string, error?: Error, meta?: LogContext): void;
  debug(message: string, meta?: LogContext): void;
  http(message: string, meta?: LogContext): void;
}

// Implémentation du service
export const logService: LogService = {
  info(message: string, meta?: LogContext): void {
    logger.info(message, meta);
  },

  warn(message: string, meta?: LogContext): void {
    logger.warn(message, meta);
  },

  error(message: string, error?: Error, meta?: LogContext): void {
    const errorMeta = {
      ...meta,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    };
    logger.error(message, errorMeta);
  },

  debug(message: string, meta?: LogContext): void {
    logger.debug(message, meta);
  },

  http(message: string, meta?: LogContext): void {
    logger.http(message, meta);
  }
};

// Import des types Express
// Middleware typé pour le logging des requêtes HTTP
export const httpLoggerMiddleware: ExpressMiddleware = (
  req: ExtendedRequest, 
  res: Response, 
  next: NextFunction
) => {
  const startTime = Date.now();
  const requestId = randomUUID();
  
  // Ajouter l'ID de requête au contexte
  req.requestId = requestId;
  
  // Logger le début de la requête
  logService.http('HTTP Request Started', {
    requestId,
    method: req.method,
    endpoint: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
  });

  // Intercepter la fin de la réponse avec typage correct
  const originalSend = res.send;
  res.send = function(data: unknown) {
    const responseTime = Date.now() - startTime;
    
    logService.http('HTTP Request Completed', {
      requestId,
      method: req.method,
      endpoint: req.url,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip || req.connection.remoteAddress,
    });
    
    // Appel correct avec typage approprié
    return originalSend.call(this, data);
  };

  next();
};

export default logService;