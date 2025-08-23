export interface RateLimitResult {
  allowed: boolean;
  identifier: string;
  currentCount: number;
  maxRequests: number;
  remainingRequests: number;
  resetTime: Date;
  windowStart: Date;
  windowEnd: Date;
}

import { Request, Response, NextFunction } from 'express';
import { logService } from './logService';

export interface RateLimitConfig {
  windowMs: number; // Window duration in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator function - FIXED: Request instead of any
  skipCondition?: (req: Request) => boolean; // Skip rate limiting for certain requests - FIXED: Request instead of any
}

/**
 * Abstract interface for rate limit storage backends
 * Allows different implementations (Redis, Supabase, etc.)
 */
export interface RateLimitStore {
  /**
   * Check if a request should be rate limited and increment counter
   */
  checkAndIncrement(
    identifier: string,
    windowDurationSeconds: number,
    maxRequests: number
  ): Promise<RateLimitResult>;

  /**
   * Get current rate limit status without incrementing
   */
  getStatus(
    identifier: string,
    windowDurationSeconds: number,
    maxRequests: number
  ): Promise<RateLimitResult>;

  /**
   * Clean up expired counters (optional implementation)
   */
  cleanup?(): Promise<number>;

  /**
   * Reset counter for a specific identifier (useful for testing)
   */
  reset?(identifier: string): Promise<void>;
}

/**
 * Rate limiting service with pluggable storage backends
 * Supports distributed rate limiting across multiple instances
 */
export class RateLimitService {
  private store: RateLimitStore;
  private config: RateLimitConfig;

  constructor(store: RateLimitStore, config: RateLimitConfig) {
    this.store = store;
    this.config = config;
  }

  /**
   * Check if a request should be rate limited
   * FIXED: request parameter properly typed as Request instead of any
   */
  async checkRateLimit(request: Request): Promise<RateLimitResult> {
    // Skip rate limiting if condition is met
    if (this.config.skipCondition && this.config.skipCondition(request)) {
      return {
        allowed: true,
        identifier: 'skipped',
        currentCount: 0,
        maxRequests: this.config.maxRequests,
        remainingRequests: this.config.maxRequests,
        resetTime: new Date(Date.now() + this.config.windowMs),
        windowStart: new Date(),
        windowEnd: new Date(Date.now() + this.config.windowMs)
      };
    }

    // Generate identifier for this request
    const identifier = this.config.keyGenerator 
      ? this.config.keyGenerator(request)
      : this.getDefaultIdentifier(request);

    // Check rate limit
    const windowDurationSeconds = Math.floor(this.config.windowMs / 1000);
    const result = await this.store.checkAndIncrement(
      identifier,
      windowDurationSeconds,
      this.config.maxRequests
    );

    return result;
  }

  /**
   * Get current rate limit status without incrementing counter
   * FIXED: request parameter properly typed as Request instead of any
   */
  async getStatus(request: Request): Promise<RateLimitResult> {
    const identifier = this.config.keyGenerator 
      ? this.config.keyGenerator(request)
      : this.getDefaultIdentifier(request);

    const windowDurationSeconds = Math.floor(this.config.windowMs / 1000);
    return await this.store.getStatus(
      identifier,
      windowDurationSeconds,
      this.config.maxRequests
    );
  }

  /**
   * Reset rate limit for a specific request (useful for testing)
   * FIXED: request parameter properly typed as Request instead of any
   */
  async reset(request: Request): Promise<void> {
    if (this.store.reset) {
      const identifier = this.config.keyGenerator 
        ? this.config.keyGenerator(request)
        : this.getDefaultIdentifier(request);
      
      await this.store.reset(identifier);
    }
  }

  /**
   * Clean up expired counters
   */
  async cleanup(): Promise<number> {
    if (this.store.cleanup) {
      return await this.store.cleanup();
    }
    return 0;
  }

  /**
   * Create Express middleware for rate limiting
   * FIXED: All middleware parameters properly typed instead of any
   */
  middleware() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const result = await this.checkRateLimit(req);
        
        // Add rate limit headers
        res.set({
          'X-RateLimit-Limit': result.maxRequests.toString(),
          'X-RateLimit-Remaining': result.remainingRequests.toString(),
          'X-RateLimit-Reset': Math.ceil(result.resetTime.getTime() / 1000).toString(),
          'X-RateLimit-Window': this.config.windowMs.toString()
        });

        if (!result.allowed) {
          // Rate limit exceeded
          res.status(429).json({
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Try again in ${Math.ceil((result.resetTime.getTime() - Date.now()) / 1000)} seconds.`,
            retryAfter: Math.ceil((result.resetTime.getTime() - Date.now()) / 1000)
          });
          return;
        }

        next();
      } catch (error) {
        logService.error('Rate limiting middleware failed', error instanceof Error ? error : undefined, {
          identifier: this.getDefaultIdentifier(req),
          windowMs: this.config.windowMs,
          maxRequests: this.config.maxRequests,
          endpoint: req.url,
          method: req.method
        });
        // Allow request to continue if rate limiting fails
        next();
      }
    };
  }

  /**
   * Default identifier generator (uses IP address)
   * FIXED: request parameter properly typed as Request instead of any
   */
  private getDefaultIdentifier(request: Request): string {
    // Handle x-forwarded-for header properly (can be string or string[])
    const forwardedFor = request.headers['x-forwarded-for'];
    const forwardedIP = Array.isArray(forwardedFor) 
      ? forwardedFor[0] 
      : typeof forwardedFor === 'string' ? forwardedFor.split(',')[0] : undefined;
    
    return request.ip || 
           (request as any).connection?.remoteAddress || 
           (request as any).socket?.remoteAddress ||
           forwardedIP ||
           'unknown';
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): RateLimitConfig {
    return { ...this.config };
  }
}