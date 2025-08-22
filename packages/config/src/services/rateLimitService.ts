import { Request, Response, NextFunction } from 'express';

/**
 * Properly typed rate limiting service
 * Replaces the problematic any usage with proper Express types
 */

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

export interface RateLimitConfig {
  windowMs: number; // Window duration in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator function - FIXED: Request instead of any
  skipCondition?: (req: Request) => boolean; // Skip rate limiting for certain requests - FIXED: Request instead of any
  onLimitReached?: (req: Request, res: Response) => void; // Custom handler when limit is reached
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
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
          'X-RateLimit-Window': this.config.windowMs.toString(),
          'X-RateLimit-Identifier': result.identifier
        });

        if (!result.allowed) {
          // Use custom handler if provided
          if (this.config.onLimitReached) {
            this.config.onLimitReached(req, res);
            return;
          }

          // Default rate limit response
          const retryAfterSeconds = Math.ceil((result.resetTime.getTime() - Date.now()) / 1000);
          
          res.status(429).json({
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Try again in ${retryAfterSeconds} seconds.`,
            retryAfter: retryAfterSeconds,
            limit: result.maxRequests,
            remaining: result.remainingRequests,
            resetTime: result.resetTime.toISOString(),
            identifier: result.identifier
          });
          return;
        }

        next();
      } catch (error) {
        console.error('Rate limiting error:', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          ip: req.ip,
          method: req.method,
          url: req.originalUrl,
          timestamp: new Date().toISOString()
        });
        
        // Allow request to continue if rate limiting fails (fail open)
        next();
      }
    };
  }

  /**
   * Default identifier generator (uses IP address)
   * FIXED: request parameter properly typed as Request instead of any
   */
  private getDefaultIdentifier(request: Request): string {
    // Try multiple sources for IP address in order of preference
    const potentialIPs = [
      request.ip,
      (request as any).connection?.remoteAddress,
      (request as any).socket?.remoteAddress,
      Array.isArray(request.headers['x-forwarded-for']) 
        ? request.headers['x-forwarded-for'][0]
        : request.headers['x-forwarded-for']?.split(',')[0]?.trim(),
      request.headers['x-real-ip'] as string,
      request.headers['cf-connecting-ip'] as string, // Cloudflare
      request.headers['x-client-ip'] as string
    ];

    // Return first valid IP
    for (const ip of potentialIPs) {
      if (ip && typeof ip === 'string' && ip !== 'unknown') {
        // Basic IP validation
        if (this.isValidIP(ip)) {
          return ip;
        }
      }
    }

    return 'unknown';
  }

  /**
   * Basic IP address validation
   */
  private isValidIP(ip: string): boolean {
    // IPv4 regex
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // IPv6 regex (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration (readonly copy)
   */
  getConfig(): Readonly<RateLimitConfig> {
    return Object.freeze({ ...this.config });
  }

  /**
   * Get statistics about rate limiting
   */
  async getStatistics(request: Request): Promise<{
    identifier: string;
    currentStatus: RateLimitResult;
    configuration: Readonly<RateLimitConfig>;
  }> {
    const status = await this.getStatus(request);
    
    return {
      identifier: status.identifier,
      currentStatus: status,
      configuration: this.getConfig()
    };
  }
}

// Factory functions for common rate limiting scenarios

/**
 * Create a basic rate limiter with IP-based identification
 */
export function createBasicRateLimiter(
  store: RateLimitStore,
  options: {
    windowMs: number;
    maxRequests: number;
    message?: string;
  }
): RateLimitService {
  return new RateLimitService(store, {
    windowMs: options.windowMs,
    maxRequests: options.maxRequests,
    keyGenerator: (req: Request) => req.ip || 'unknown',
    onLimitReached: (req: Request, res: Response) => {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: options.message || 'Too many requests, please try again later.'
      });
    }
  });
}

/**
 * Create a user-based rate limiter (requires authentication)
 */
export function createUserRateLimiter(
  store: RateLimitStore,
  options: {
    windowMs: number;
    maxRequests: number;
    getUserId: (req: Request) => string | null;
  }
): RateLimitService {
  return new RateLimitService(store, {
    windowMs: options.windowMs,
    maxRequests: options.maxRequests,
    keyGenerator: (req: Request) => {
      const userId = options.getUserId(req);
      return userId ? `user:${userId}` : `ip:${req.ip || 'unknown'}`;
    },
    skipCondition: (req: Request) => {
      // Skip rate limiting if user ID cannot be determined
      return options.getUserId(req) === null;
    }
  });
}

/**
 * Create an endpoint-specific rate limiter
 */
export function createEndpointRateLimiter(
  store: RateLimitStore,
  options: {
    windowMs: number;
    maxRequests: number;
    endpoint: string;
  }
): RateLimitService {
  return new RateLimitService(store, {
    windowMs: options.windowMs,
    maxRequests: options.maxRequests,
    keyGenerator: (req: Request) => {
      const ip = req.ip || 'unknown';
      return `${options.endpoint}:${ip}`;
    }
  });
}