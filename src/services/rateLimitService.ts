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
  keyGenerator?: (req: any) => string; // Custom key generator function
  skipCondition?: (req: any) => boolean; // Skip rate limiting for certain requests
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
   */
  async checkRateLimit(request: any): Promise<RateLimitResult> {
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
   */
  async getStatus(request: any): Promise<RateLimitResult> {
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
   */
  async reset(request: any): Promise<void> {
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
   */
  middleware() {
    return async (req: any, res: any, next: any) => {
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
        console.error('Rate limiting error:', error);
        // Allow request to continue if rate limiting fails
        next();
      }
    };
  }

  /**
   * Default identifier generator (uses IP address)
   */
  private getDefaultIdentifier(request: any): string {
    return request.ip || 
           request.connection?.remoteAddress || 
           request.socket?.remoteAddress ||
           request.headers['x-forwarded-for']?.split(',')[0] ||
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