import { Request, Response, NextFunction } from 'express';
import { log } from '../../supabase/functions/med-mng-api/logger';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  log('error', 'Express error', err);
  res.status(500).json({ error: 'Internal Server Error' });
}
