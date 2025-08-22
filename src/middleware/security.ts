import rateLimit from 'express-rate-limit';
import { logService } from '../services/logService';
import { RateLimitService } from '../services/rateLimitService';
import { createSupabaseRateLimitStore } from '../services/stores/SupabaseRateLimitStore';

// Create distributed rate limit service using Supabase
const distributedRateLimit = new RateLimitService(
  createSupabaseRateLimitStore(),
  {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    keyGenerator: (req) => req.ip || 'unknown'
  }
);

// Configuration du rate limiting global avec fallback au rate limiting en mémoire
export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum 100 requêtes par IP par fenêtre
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer dans 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Retourner les infos de rate limit dans les headers `RateLimit-*`
  legacyHeaders: false, // Désactiver les headers `X-RateLimit-*`
  handler: (req: Request, res: Response): void => {
    logService.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.url,
      method: req.method
    });
    
    res.status(429).json({
      error: 'Trop de requêtes depuis cette IP, veuillez réessayer dans 15 minutes.',
      retryAfter: '15 minutes'
    });
  }
});

// Distributed rate limiting middleware
export const distributedRateLimitMiddleware = distributedRateLimit.middleware();

// Rate limiting spécifique pour les APIs sensibles
export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 requêtes par IP par fenêtre
  message: {
    error: 'Limite de requêtes dépassée pour cette API sensible.',
    retryAfter: '15 minutes'
  },
  handler: (req: Request, res: Response): void => {
    logService.warn('Strict rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.url,
      method: req.method
    });
    
    res.status(429).json({
      error: 'Limite de requêtes dépassée pour cette API sensible.',
      retryAfter: '15 minutes'
    });
  }
});

// Distributed strict rate limiting
const distributedStrictRateLimit = new RateLimitService(
  createSupabaseRateLimitStore(),
  {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyGenerator: (req) => req.ip || 'unknown'
  }
);

export const distributedStrictRateLimitMiddleware = distributedStrictRateLimit.middleware();

// Configuration CORS personnalisée
export const corsOptions = {
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    // Liste des domaines autorisés
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://yaincoxihiqdksxgrsrk.supabase.co',
      // Ajouter les domaines de production ici
    ];
    
    // Permettre les requêtes sans origin (ex: applications mobiles, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logService.warn('CORS: Origin not allowed', { origin });
      callback(new Error('Non autorisé par la politique CORS'), false);
    }
  },
  credentials: true, // Permettre les cookies/credentials
  optionsSuccessStatus: 200, // Support pour les anciens navigateurs
};

// Middleware de sécurité personnalisé
import { Request, Response, NextFunction } from 'express';

// Extend Request interface for custom properties
interface ExtendedRequest extends Request {
  requestId?: string;
}

export const securityHeadersMiddleware = (req: ExtendedRequest, res: Response, next: NextFunction): void => {
  // Headers de sécurité supplémentaires
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-Request-ID', req.requestId || 'unknown');
  
  // Logging des tentatives d'accès suspicieuses
  const suspiciousPatterns = [
    /\.\./g, // Path traversal
    /<script/gi, // XSS attempts
    /union.*select/gi, // SQL injection
    /javascript:/gi, // JavaScript protocol
  ];
  
  const url = req.url.toLowerCase();
  const suspicious = suspiciousPatterns.some(pattern => pattern.test(url));
  
  if (suspicious) {
    logService.warn('Suspicious request detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.url,
      method: req.method,
      requestId: req.requestId
    });
  }
  
  next();
};