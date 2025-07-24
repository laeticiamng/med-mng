import express from 'express';
import * as Sentry from '@sentry/node';
import { healthCheck } from './controllers/healthController';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const port = import.meta.env.PORT || 3000;

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
