import request from 'supertest';
import express from 'express';
import { healthCheck } from '../src/controllers/healthController';
import { errorHandler } from '../src/middleware/errorHandler';

const app = express();
app.get('/health', healthCheck);
app.use(errorHandler);

test('GET /health returns ok', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('ok');
});
