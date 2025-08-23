import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { logService, httpLoggerMiddleware } from './services/logService';
import { 
  globalRateLimit, 
  distributedRateLimitMiddleware,
  corsOptions, 
  securityHeadersMiddleware 
} from './middleware/security';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Configuration du proxy de confiance pour les load balancers
app.set('trust proxy', 1);

// Middleware de sécurité - à appliquer en premier
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: [
        "'self'",
        "https://yaincoxihiqdksxgrsrk.supabase.co",
        "https://*.supabase.co"
      ],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Éviter les problèmes avec les iframes
}));

// CORS avec configuration personnalisée
app.use(cors(corsOptions));

// Rate limiting global et distribué
app.use(globalRateLimit);
app.use(distributedRateLimitMiddleware);

// Parsing JSON et URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging HTTP
app.use(httpLoggerMiddleware);

// Headers de sécurité personnalisés
app.use(securityHeadersMiddleware);

// Routes principales
app.get('/', (_req, res) => {
  logService.info('Health check endpoint accessed');
  res.json({
    status: 'ok',
    message: 'Medical Training API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Route de santé pour les monitoring
app.get('/health', (_req, res) => {
  logService.debug('Health check endpoint accessed');
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Middleware de gestion des erreurs 404
app.use((_req, res) => {
  logService.warn('404 Not Found', {
    endpoint: _req.url,
    method: _req.method,
    ip: _req.ip
  });
  
  res.status(404).json({
    error: 'Endpoint non trouvé',
    message: 'La ressource demandée n\'existe pas'
  });
});

// Middleware de gestion des erreurs globales
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logService.error('Unhandled error', err, {
    endpoint: _req.url,
    method: _req.method,
    ip: _req.ip,
    userAgent: _req.get('User-Agent')
  });
  
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur s\'est produite'
  });
});

// Démarrage du serveur
app.listen(port, () => {
  logService.info('Server started successfully', {
    port,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
});

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', () => {
  logService.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logService.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
