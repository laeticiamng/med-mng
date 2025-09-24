import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logService, httpLoggerMiddleware } from './services/logService';
import {
  globalRateLimit,
  distributedRateLimitMiddleware,
  corsOptions,
  securityHeadersMiddleware
} from './middleware/security';
import { validateSecurityConfig, getSecurityConfig } from './config/security';
import { createCSPMiddleware } from './utils/security/cspHelper';
import { registerOgItemRoute } from './routes/ogItemRoute';
import { getBuildInfo, getHealthStatus } from './services/healthService';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const securityConfig = getSecurityConfig();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDirectory = path.resolve(__dirname, '..', 'public');

const sendPublicAsset = (
  fileName: string,
  res: express.Response,
  next: express.NextFunction,
  contentType?: string
) => {
  if (contentType) {
    res.type(contentType);
  }

  res.setHeader('Cache-Control', 'public, max-age=3600');

  const filePath = path.join(publicDirectory, fileName);

  res.sendFile(filePath, (err) => {
    if (err) {
      const nodeError = err as NodeJS.ErrnoException;

      if (nodeError.code === 'ENOENT') {
        res.status(404).send('Asset not found');
        return;
      }

      next(err);
    }
  });
};

// Masquer la technologie du serveur
app.disable('x-powered-by');

// Configuration du proxy de confiance pour les load balancers
app.set('trust proxy', 1);

// Middleware Helmet avec configuration renforcée
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));
app.use(helmet.frameguard({ action: 'deny' }));

if (securityConfig.headers.enableHSTS) {
  app.use(helmet.hsts({ maxAge: 63_072_000, includeSubDomains: true, preload: true }));
}

const cspEnvironment = process.env.NODE_ENV === 'development' ? 'development' : 'production';
app.use(createCSPMiddleware(cspEnvironment));

// CORS avec configuration personnalisée
app.use(cors(corsOptions));

// Rate limiting global et distribué
app.use(globalRateLimit);
app.use(distributedRateLimitMiddleware);

// Parsing JSON et URL-encoded avec limite configurable
const maxPayloadMB = process.env.MAX_PAYLOAD_MB ? parseInt(process.env.MAX_PAYLOAD_MB, 10) : 1;
app.use(express.json({ limit: `${maxPayloadMB}mb` }));
app.use(express.urlencoded({ extended: true, limit: `${maxPayloadMB}mb` }));

// Middleware de logging HTTP
app.use(httpLoggerMiddleware);

// Headers de sécurité personnalisés
app.use(securityHeadersMiddleware);

app.get('/sitemap.xml', (_req, res, next) => {
  sendPublicAsset('sitemap.xml', res, next, 'application/xml');
});

app.get('/robots.txt', (_req, res, next) => {
  sendPublicAsset('robots.txt', res, next, 'text/plain; charset=utf-8');
});

// Routes principales
app.get('/', (_req, res) => {
  logService.info('Root endpoint accessed');
  const build = getBuildInfo();
  res.json({
    status: 'ok',
    message: 'Medical Training API is running',
    version: build.version,
    build,
    timestamp: new Date().toISOString()
  });
});

// Route de santé pour les monitoring
app.get('/health', (_req, res) => {
  logService.debug('Health check endpoint accessed');
  res.json(getHealthStatus());
});

registerOgItemRoute(app);

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

// Validation de la configuration sécurité au démarrage
validateSecurityConfig();

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
