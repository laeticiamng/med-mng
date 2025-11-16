import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import systemRouter from './routes/systemRoutes';
import { errorHandler } from '../middleware/errorHandler';
import { notFoundHandler } from '../middleware/enhancedErrorHandler';
import { generateRequestId } from '../utils/errorStandardization';
import { log } from '../../supabase/functions/med-mng-api/logger';

export function createServer() {
  const app = express();
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // 🔒 SÉCURITÉ: Configuration du CORS pour limiter l'accès de l'API
  // Les origines autorisées sont lues dans ALLOWED_ORIGINS (liste séparée par des virgules)
  // Par défaut : '*' (tous les domaines - NON RECOMMANDÉ EN PRODUCTION)
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) ?? ['*'];
  const corsOptions: cors.CorsOptions = {
    origin: allowedOrigins[0] === '*' ? '*' : allowedOrigins,
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

  const limiter = rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: 'RATE_LIMIT',
        code: 429,
        message: 'Too many requests',
        timestamp: new Date().toISOString(),
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

  app.on('error', (error) => {
    log('error', 'Express server error', { error });
  });

  return app;
}
