/**
 * Production-safe logger utility.
 * All log methods are no-ops in production builds.
 * Usage: import { logger } from '@/utils/logger';
 *        logger.log('message');   // only in DEV
 *        logger.warn('message');  // only in DEV
 *        logger.error('message'); // only in DEV
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (isDev) console.error(...args);
  },
  group: (...args: unknown[]) => {
    if (isDev) console.group(...args);
  },
  groupEnd: () => {
    if (isDev) console.groupEnd();
  },
  table: (...args: unknown[]) => {
    if (isDev) (console as any).table(...args);
  },
};
