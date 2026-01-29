/**
 * 🛡️ Robustness Utilities
 * Utilities for retry logic, rate limiting, debounce, and error handling
 */

// ==========================================
// RETRY WITH EXPONENTIAL BACKOFF
// ==========================================

export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 10000,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
        onRetry?.(attempt + 1, lastError);
        await sleep(delay);
      }
    }
  }

  throw lastError!;
}

// ==========================================
// RATE LIMITING
// ==========================================

interface RateLimitState {
  tokens: number;
  lastRefill: number;
}

const rateLimitStates: Map<string, RateLimitState> = new Map();

export function checkRateLimit(
  key: string,
  maxTokens: number = 10,
  refillRateMs: number = 1000
): boolean {
  const now = Date.now();
  let state = rateLimitStates.get(key);

  if (!state) {
    state = { tokens: maxTokens, lastRefill: now };
    rateLimitStates.set(key, state);
  }

  // Refill tokens based on time elapsed
  const elapsed = now - state.lastRefill;
  const refillAmount = Math.floor(elapsed / refillRateMs);
  
  if (refillAmount > 0) {
    state.tokens = Math.min(maxTokens, state.tokens + refillAmount);
    state.lastRefill = now;
  }

  // Check if we have tokens
  if (state.tokens > 0) {
    state.tokens--;
    return true;
  }

  return false;
}

export function resetRateLimit(key: string): void {
  rateLimitStates.delete(key);
}

// ==========================================
// DEBOUNCE
// ==========================================

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  let timeoutId: ReturnType<typeof setTimeout>;
  let pendingPromise: Promise<Awaited<ReturnType<T>>> | null = null;

  return (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    clearTimeout(timeoutId);

    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delayMs);
    });
  };
}

// ==========================================
// TIMEOUT
// ==========================================

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

// ==========================================
// SLEEP
// ==========================================

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// SAFE JSON PARSE
// ==========================================

export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

// ==========================================
// NETWORK STATUS
// ==========================================

export function isOnline(): boolean {
  return navigator.onLine;
}

export function onNetworkChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// ==========================================
// ERROR FORMATTING
// ==========================================

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  return 'Une erreur inattendue est survenue';
}

// ==========================================
// PAGINATION
// ==========================================

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export function calculatePagination(
  page: number,
  pageSize: number
): { from: number; to: number } {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / pageSize);
  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
    hasMore: page < totalPages,
  };
}

// ==========================================
// DATE/TIMEZONE UTILITIES
// ==========================================

export function getUserTimezoneOffset(): number {
  return new Date().getTimezoneOffset();
}

export function toUserLocalDate(utcDate: string | Date): Date {
  const date = new Date(utcDate);
  return date;
}

export function toUTCDate(localDate: Date): Date {
  return new Date(localDate.toISOString());
}

export function startOfDayUTC(date: Date = new Date()): Date {
  const utc = new Date(date);
  utc.setUTCHours(0, 0, 0, 0);
  return utc;
}

export function startOfWeekUTC(date: Date = new Date()): Date {
  const utc = new Date(date);
  const day = utc.getUTCDay();
  utc.setUTCDate(utc.getUTCDate() - day);
  utc.setUTCHours(0, 0, 0, 0);
  return utc;
}

// ==========================================
// STRUCTURED LOGGING
// ==========================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
}

const logBuffer: LogEntry[] = [];
const MAX_LOG_BUFFER = 100;

export function structuredLog(
  level: LogLevel,
  message: string,
  context?: Record<string, any>
): void {
  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  // Add to buffer
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOG_BUFFER) {
    logBuffer.shift();
  }

  // Console output
  const consoleFn = level === 'error' ? console.error :
                    level === 'warn' ? console.warn :
                    level === 'debug' ? console.debug : console.log;

  consoleFn(`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`, context || '');
}

export function getRecentLogs(count: number = 20): LogEntry[] {
  return logBuffer.slice(-count);
}

export function clearLogs(): void {
  logBuffer.length = 0;
}

// Convenience functions
export const log = {
  debug: (msg: string, ctx?: Record<string, any>) => structuredLog('debug', msg, ctx),
  info: (msg: string, ctx?: Record<string, any>) => structuredLog('info', msg, ctx),
  warn: (msg: string, ctx?: Record<string, any>) => structuredLog('warn', msg, ctx),
  error: (msg: string, ctx?: Record<string, any>) => structuredLog('error', msg, ctx),
};
