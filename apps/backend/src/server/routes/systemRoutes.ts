import { Router } from 'express';
import { healthCheck, liveCheck, metricsSummary, readinessCheck } from '../../controllers/healthController';

const systemRouter = Router();

systemRouter.get('/health', healthCheck);
systemRouter.get('/health/live', liveCheck);
systemRouter.get('/health/ready', readinessCheck);
systemRouter.get('/health/metrics', metricsSummary);

export default systemRouter;
