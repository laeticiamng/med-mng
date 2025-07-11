import { Request, Response } from 'express';
import { getHealthMessage } from '../services/healthService';

export const healthCheck = (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: getHealthMessage() });
};
