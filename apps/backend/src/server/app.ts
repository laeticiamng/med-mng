import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import systemRouter from './routes/systemRoutes';
import { errorHandler } from '../middleware/errorHandler';
import { notFoundHandler } from '../middleware/enhancedErrorHandler';
import { generateRequestId } from '@med-mng/shared';
import { log } from '@med-mng/shared';

export function createServer() {
  const app = express();
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // 🔒 SÉCURITÉ: Configuration stricte du CORS
  // ALLOWED_ORIGINS est OBLIGATOIRE en production (liste séparée par des virgules)
  // En développement, utilise localhost par défaut
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const defaultOrigins = isDevelopment
    ? ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173']
    : [];

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ?.split(',')
    .map((o) => o.trim())
    .filter(Boolean) ?? defaultOrigins;

  // ⚠️ VALIDATION: En production, ALLOWED_ORIGINS doit être défini
  if (!isDevelopment && allowedOrigins.length === 0) {
    log('error', 'ALLOWED_ORIGINS environment variable must be set in production');
    throw new Error('ALLOWED_ORIGINS is required in production mode');
  }

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origin (comme Postman, curl)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        log('warn', 'CORS blocked request', { origin, allowedOrigins });
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    maxAge: 86400, // Cache preflight requests for 24 hours
  };
  app.use(cors(corsOptions));

  app.use((req, res, next) => {
    const requestId = (req.headers['x-request-id'] as string) || generateRequestId();
    (req as unknown as { requestId?: string }).requestId = requestId;
    res.locals.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });

  // 🔒 SÉCURITÉ: Rate limiting plus strict
  const limiter = rateLimit({
    windowMs: 60_000, // 1 minute
    limit: isDevelopment ? 120 : 60, // 60 req/min en production, 120 en dev
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => {
      log('warn', 'Rate limit exceeded', {
        ip: req.ip,
        url: req.originalUrl
      });
      res.status(429).json({
        error: 'RATE_LIMIT',
        code: 429,
        message: 'Too many requests. Please try again later.',
        timestamp: new Date().toISOString(),
        retryAfter: 60,
      });
    },
  });

  app.use(limiter);

  app.get('/', (_req, res) => {
    res.json({
      status: 'ok',
      message: 'Med-MNG backend ready',
      timestamp: new Date().toISOString(),
    });
  });

  app.use(systemRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
