import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { healthCheck } from './controllers/healthController';
import { errorHandler } from './middleware/errorHandler';

const app = express();

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
const port = import.meta.env.PORT || 3000;

app.get('/health', healthCheck);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
