import { log } from '../logger.ts';

import { getErrorMessage } from '../../../_shared/error-utils.ts';
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  exponentialBackoff: true
};

export class RetryService {
  static async withRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    operationName: string = 'operation'
  ): Promise<T> {
    const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    let lastError: Error;

    for (let attempt = 1; attempt <= finalConfig.maxRetries + 1; attempt++) {
      try {
        const result = await operation();
        if (attempt > 1) {
          log('info', `${operationName} succeeded on attempt ${attempt}`);
        }
        return result;
      } catch (error: unknown) {
        lastError = error as Error;
        
        if (attempt <= finalConfig.maxRetries) {
          const delay = this.calculateDelay(attempt, finalConfig);
          log('warn', `${operationName} failed on attempt ${attempt}, retrying in ${delay}ms`, {
            error: lastError.message,
            attempt,
            maxRetries: finalConfig.maxRetries
          });
          
          await this.sleep(delay);
        }
      }
    }

    log('error', `${operationName} failed after ${finalConfig.maxRetries + 1} attempts`, {
      error: lastError!.message
    });
    throw lastError!;
  }

  private static calculateDelay(attempt: number, config: RetryConfig): number {
    if (!config.exponentialBackoff) {
      return config.baseDelay;
    }

    const delay = config.baseDelay * Math.pow(2, attempt - 1);
    return Math.min(delay, config.maxDelay);
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static isRetryableError(error: Error): boolean {
    const retryableMessages = [
      'network',
      'timeout',
      'connection',
      'temporary',
      'service unavailable',
      'rate limit'
    ];

    const errorMessage = getErrorMessage(error).toLowerCase();
    return retryableMessages.some(msg => errorMessage.includes(msg));
  }
}