import { Request, Response, NextFunction } from 'express';
import { log } from '../../supabase/functions/med-mng-api/logger';
import { notifyIncident } from '../services/alertService';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  log('error', 'Express error', err);
  void notifyIncident({
    type: 'BACKEND_ERROR',
    message: err instanceof Error ? err.message : 'Unknown error',
    details: err,
  });
  res.status(500).json({ error: 'Internal Server Error' });
}
