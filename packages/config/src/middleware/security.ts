import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { getEnvironment, isDevelopment, isProduction } from '../env';

/**
 * Typed security middleware with proper Express types
 * Replaces the problematic any usage in middleware functions
 */

// Interface for extended Request with custom properties
interface ExtendedRequest extends Request {
  requestId?: string;
  startTime?: number;
}

/**
 * Security headers middleware with proper typing
 * Adds security headers and detects suspicious requests
 */
export const securityHeadersMiddleware = (req: ExtendedRequest, res: Response, next: NextFunction): void => {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-Request-ID', req.requestId || generateRequestId());
  
  // Production-specific security headers
  if (isProduction()) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
  }
  
  // Detect suspicious request patterns
  detectSuspiciousActivity(req);
  
  next();
};

/**
 * Rate limiting middleware factory with proper typing
 */
export function createRateLimitMiddleware(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.maxRequests,
    message: {
      error: options.message || 'Too many requests, please try again later.',
      retryAfter: Math.ceil(options.windowMs / 1000 / 60) + ' minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    handler: (req: Request, res: Response): void => {
      console.warn('Rate limit exceeded:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
      });
      
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: options.message || 'Too many requests, please try again later.',
        retryAfter: Math.ceil(options.windowMs / 1000),
        timestamp: new Date().toISOString()
      });
    },
    keyGenerator: (req: Request): string => {
      // Use multiple fallbacks for IP detection
      return req.ip || 
             (req.connection as any)?.remoteAddress || 
             (req.socket as any)?.remoteAddress ||
             (Array.isArray(req.headers['x-forwarded-for']) 
               ? req.headers['x-forwarded-for'][0] 
               : req.headers['x-forwarded-for']?.split(',')[0]) ||
             'unknown';
    }
  });
}

/**
 * Global rate limiting middleware
 */
export const globalRateLimit = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests from this IP, please try again in 15 minutes.'
});

/**
 * Strict rate limiting for sensitive endpoints
 */
export const strictRateLimit = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Rate limit exceeded for sensitive API endpoint.',
  skipSuccessfulRequests: true
});

/**
 * Authentication middleware with proper typing
 */
export const requireAuthentication = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Valid authentication token is required'
    });
    return;
  }
  
  const token = authHeader.substring(7);
  
  if (!token || token.length < 10) {
    res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication token is invalid'
    });
    return;
  }
  
  // Token validation logic would go here
  // For now, just continue
  next();
};

/**
 * Request logging middleware with proper typing
 */
export const requestLoggingMiddleware = (req: ExtendedRequest, res: Response, next: NextFunction): void => {
  req.startTime = Date.now();
  req.requestId = generateRequestId();
  
  // Log request details
  console.info('Request:', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Log response when finished
  res.on('finish', () => {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    
    console.info('Response:', {
      requestId: req.requestId,
      statusCode: res.statusCode,
      duration: duration + 'ms',
      timestamp: new Date().toISOString()
    });
  });
  
  next();
};

/**
 * CORS configuration with proper typing
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void): void => {
    const env = getEnvironment();
    
    // Allow requests with no origin (mobile apps, curl requests, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    const allowedOrigins = getAllowedOrigins();
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('CORS: Origin not allowed:', { origin });
      callback(new Error('Not allowed by CORS policy'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Request-ID'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
};

/**
 * Input validation middleware
 */
export const validateContentType = (req: Request, res: Response, next: NextFunction): void => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    
    if (!contentType || !contentType.includes('application/json')) {
      res.status(400).json({
        error: 'Invalid Content-Type',
        message: 'Content-Type must be application/json'
      });
      return;
    }
  }
  
  next();
};

/**
 * Body size limiting middleware
 */
export const limitBodySize = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.get('Content-Length');
    
    if (contentLength) {
      const sizeInBytes = parseInt(contentLength, 10);
      const maxSizeInBytes = parseSize(maxSize);
      
      if (sizeInBytes > maxSizeInBytes) {
        res.status(413).json({
          error: 'Payload too large',
          message: `Request body too large. Maximum size is ${maxSize}`,
          maxSize
        });
        return;
      }
    }
    
    next();
  };
};

/**
 * Error handling middleware with proper typing
 */
export const errorHandlingMiddleware = (
  error: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  console.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    requestId: (req as ExtendedRequest).requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  if (res.headersSent) {
    next(error);
    return;
  }
  
  if (isDevelopment()) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      stack: error.stack,
      requestId: (req as ExtendedRequest).requestId
    });
  } else {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
      requestId: (req as ExtendedRequest).requestId
    });
  }
};

// Helper functions

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Detect suspicious activity in requests
 */
function detectSuspiciousActivity(req: ExtendedRequest): void {
  const suspiciousPatterns = [
    /\.\./g,                    // Path traversal
    /<script[^>]*>/gi,          // XSS attempts
    /union.*select/gi,          // SQL injection
    /javascript:/gi,            // JavaScript protocol
    /eval\s*\(/gi,              // Code injection
    /exec\s*\(/gi,              // Command injection
    /(drop|delete|truncate)\s+(table|database)/gi, // Destructive SQL
  ];
  
  const url = req.originalUrl.toLowerCase();
  const userAgent = req.get('User-Agent') || '';
  const referer = req.get('Referer') || '';
  
  const suspicious = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(userAgent) || pattern.test(referer)
  );
  
  if (suspicious) {
    console.warn('Suspicious request detected:', {
      ip: req.ip,
      userAgent,
      referer,
      endpoint: req.originalUrl,
      method: req.method,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
  
  // Check for common attack patterns in headers
  const suspiciousHeaders = ['X-Forwarded-For', 'X-Real-IP', 'User-Agent'];
  suspiciousHeaders.forEach(header => {
    const value = req.get(header);
    if (value && suspiciousPatterns.some(pattern => pattern.test(value))) {
      console.warn('Suspicious header detected:', {
        header,
        value,
        ip: req.ip,
        requestId: req.requestId
      });
    }
  });
}

/**
 * Get allowed origins based on environment
 */
function getAllowedOrigins(): string[] {
  const env = getEnvironment();
  
  const baseOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174'
  ];
  
  if (isProduction()) {
    return [
      ...baseOrigins,
      'https://med-music-platform.com',
      'https://app.med-music-platform.com',
      env.VITE_SUPABASE_URL
    ];
  }
  
  return [
    ...baseOrigins,
    'https://staging.med-music-platform.com',
    env.VITE_SUPABASE_URL
  ];
}

/**
 * Parse size string to bytes
 */
function parseSize(size: string): number {
  const units: { [key: string]: number } = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };
  
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([a-z]+)?$/);
  if (!match) return 1024 * 1024; // Default 1MB
  
  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';
  
  return Math.floor(value * (units[unit] || 1));
}