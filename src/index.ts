import express from 'express';
import { healthCheck } from './controllers/healthController';
import { errorHandler } from './middleware/errorHandler';
import { loadEnv } from './config/loadEnv';

loadEnv();

const app = express();
const port = process.env.PORT || import.meta.env.PORT || 3000;

app.get('/health', healthCheck);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
