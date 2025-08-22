/**
 * Example showing proper usage of typed security middleware
 * This demonstrates the BEFORE/AFTER comparison and best practices
 */

import express, { Request, Response, NextFunction } from 'express';
import { 
  securityHeadersMiddleware,
  globalRateLimit,
  strictRateLimit,
  requireAuthentication,
  requestLoggingMiddleware,
  validateContentType,
  limitBodySize,
  errorHandlingMiddleware,
  corsOptions
} from '@med-music/config/middleware/security';
import { 
  RateLimitService,
  createBasicRateLimiter,
  createUserRateLimiter,
  createEndpointRateLimiter
} from '@med-music/config/services/rateLimitService';
import cors from 'cors';

/**
 * BEFORE: Problematic middleware with 'any' types
 */
const oldBadMiddleware = (req: any, res: any, next: any) => {
  // ❌ No type safety - could access non-existent properties
  console.log(req.nonExistentProperty); // TypeScript won't catch this
  res.someInvalidMethod(); // TypeScript won't catch this
  
  // ❌ No intellisense or autocompletion
  req.ip; // No IDE support
  
  next();
};

/**
 * AFTER: Properly typed middleware
 */
const newGoodMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // ✅ Full type safety
  console.log(req.ip); // TypeScript knows this exists
  console.log(req.method); // IDE provides autocompletion
  
  // ✅ TypeScript will catch errors
  // req.nonExistentProperty; // TypeScript error!
  // res.someInvalidMethod(); // TypeScript error!
  
  // ✅ Proper return type
  res.status(200).json({ message: 'OK' });
  next();
};

/**
 * Example Express application with properly typed middleware
 */
function createTypedExpressApp() {
  const app = express();

  // ✅ CORS with proper typing
  app.use(cors(corsOptions));

  // ✅ Security headers with proper typing
  app.use(securityHeadersMiddleware);

  // ✅ Request logging with proper typing
  app.use(requestLoggingMiddleware);

  // ✅ Body parsing with size limits
  app.use(express.json({ limit: '10mb' }));
  app.use(limitBodySize('10mb'));

  // ✅ Content type validation
  app.use(validateContentType);

  // ✅ Global rate limiting
  app.use(globalRateLimit);

  // Example routes with typed handlers

  /**
   * Public endpoint with basic rate limiting
   */
  app.get('/api/public', (req: Request, res: Response): void => {
    res.json({
      message: 'Public endpoint',
      timestamp: new Date().toISOString(),
      ip: req.ip
    });
  });

  /**
   * Authenticated endpoint with strict rate limiting
   */
  app.post('/api/secure', 
    requireAuthentication,
    strictRateLimit,
    (req: Request, res: Response): void => {
      res.json({
        message: 'Secure endpoint accessed',
        user: req.headers.authorization, // We know this exists due to auth middleware
        timestamp: new Date().toISOString()
      });
    }
  );

  /**
   * Custom rate-limited endpoint
   */
  app.post('/api/upload',
    // Custom rate limiter for uploads
    createEndpointRateLimiter(
      /* store implementation */,
      {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 5,
        endpoint: 'upload'
      }
    ).middleware(),
    (req: Request, res: Response): void => {
      res.json({
        message: 'Upload endpoint',
        contentLength: req.get('Content-Length')
      });
    }
  );

  /**
   * User-specific rate limiting example
   */
  app.get('/api/user-data',
    requireAuthentication,
    createUserRateLimiter(
      /* store implementation */,
      {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        getUserId: (req: Request) => {
          // Extract user ID from JWT token or session
          const authHeader = req.headers.authorization;
          if (authHeader) {
            // In real implementation, decode JWT here
            return 'user-123'; // Placeholder
          }
          return null;
        }
      }
    ).middleware(),
    (req: Request, res: Response): void => {
      res.json({
        message: 'User-specific data',
        timestamp: new Date().toISOString()
      });
    }
  );

  // ✅ Typed error handling middleware (must be last)
  app.use(errorHandlingMiddleware);

  return app;
}

/**
 * Advanced middleware composition example
 */
function createAdvancedMiddleware() {
  // Compose multiple middleware with proper typing
  const securityStack = [
    securityHeadersMiddleware,
    requestLoggingMiddleware,
    globalRateLimit
  ];

  const authStack = [
    requireAuthentication,
    strictRateLimit
  ];

  // Type-safe middleware factory
  const createProtectedRoute = (handler: (req: Request, res: Response) => void) => {
    return [...securityStack, ...authStack, handler];
  };

  return { securityStack, authStack, createProtectedRoute };
}

/**
 * Type-safe request handler factory
 */
function createTypedHandler<T = any>(
  handler: (req: Request, res: Response, body: T) => void
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const body = req.body as T;
      handler(req, res, body);
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Example with request body validation
 */
interface CreateUserRequest {
  name: string;
  email: string;
  age: number;
}

const createUserHandler = createTypedHandler<CreateUserRequest>(
  (req: Request, res: Response, body: CreateUserRequest): void => {
    // ✅ Body is properly typed
    console.log(`Creating user: ${body.name} (${body.email})`);
    
    // ✅ Type checking ensures required properties exist
    if (!body.name || !body.email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    if (body.age < 0) {
      res.status(400).json({ error: 'Age must be positive' });
      return;
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        name: body.name,
        email: body.email,
        age: body.age
      }
    });
  }
);

/**
 * Error handling example with proper typing
 */
class CustomError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'CustomError';
  }
}

const typedErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  if (error instanceof CustomError) {
    res.status(error.statusCode).json({
      error: error.message,
      code: error.code
    });
    return;
  }

  // Default error response
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
};

/**
 * Usage example
 */
export function startTypedServer() {
  const app = createTypedExpressApp();
  const { createProtectedRoute } = createAdvancedMiddleware();

  // Add typed routes
  app.post('/api/users', ...createProtectedRoute(createUserHandler));

  // Add typed error handling
  app.use(typedErrorHandler);

  const port = process.env.PORT || 3000;
  
  app.listen(port, () => {
    console.log(`✅ Typed server running on port ${port}`);
    console.log('   - All middleware properly typed');
    console.log('   - No more any types');
    console.log('   - Full TypeScript safety enabled');
  });

  return app;
}

// Export for testing
export {
  createTypedExpressApp,
  createAdvancedMiddleware,
  createTypedHandler,
  CustomError,
  typedErrorHandler
};