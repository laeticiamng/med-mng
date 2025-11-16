import type { Request, Response } from 'express';
import { buildHealthPayload, getHealthMessage, getSystemMetrics, HealthSnapshot, HealthStatus } from '../services/healthService';
import { log } from '../../supabase/functions/med-mng-api/logger';

function statusToHttpCode(status: HealthStatus): number {
  return status === 'down' ? 503 : 200;
}

function respondWithPayload(res: Response, payload: HealthSnapshot) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Health-Status', payload.status);
  if (payload.requestId) {
    res.setHeader('X-Request-Id', payload.requestId);
  }
  return res.status(statusToHttpCode(payload.status)).json(payload);
}

export function healthCheck(req: Request, res: Response) {
  const requestId = (res.locals?.requestId || (req as unknown as { requestId?: string })?.requestId) as string | undefined;
  const payload = buildHealthPayload({ requestId });

  log('info', 'Health check requested', {
    path: req.originalUrl,
    status: payload.status,
    environment: payload.environment,
  });

  return respondWithPayload(res, payload);
}

export function readinessCheck(req: Request, res: Response) {
  const requestId = (res.locals?.requestId || (req as unknown as { requestId?: string })?.requestId) as string | undefined;
  const payload = buildHealthPayload({ includeMetrics: false, requestId });

  log('info', 'Readiness probe', { path: req.originalUrl, status: payload.status });

  return respondWithPayload(res, payload);
}

export function liveCheck(req: Request, res: Response) {
  const timestamp = new Date().toISOString();
  const payload: HealthSnapshot = {
    status: 'ok',
    message: getHealthMessage(),
    version: process.env.MED_MNG_VERSION || process.env.npm_package_version || 'dev',
    environment: process.env.NODE_ENV || 'development',
    timestamp,
    uptimeSeconds: Math.round(process.uptime()),
    requestId: res.locals?.requestId,
    metrics: getSystemMetrics(),
    checks: { services: [], dependencies: [], security: [] },
  };

  return respondWithPayload(res, payload);
}

export function metricsSummary(_req: Request, res: Response) {
  const metrics = getSystemMetrics();
  return res.status(200).json({
    status: 'ok',
    metrics,
    timestamp: new Date().toISOString(),
    message: 'Runtime metrics snapshot',
  });
}
