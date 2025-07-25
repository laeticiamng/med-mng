import express from 'express';
import * as Sentry from '@sentry/node';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { healthCheck } from './controllers/healthController';
import { errorHandler } from './middleware/errorHandler';
import { loadEnv } from './config/loadEnv';

loadEnv();

const app = express();
const port = 3000;

// Security headers
app.use(helmet());

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: `med-mng@${process.env.VERSION ?? 'dev'}`,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());

app.get('/health', healthCheck);

app.use(Sentry.Handlers.errorHandler());

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});