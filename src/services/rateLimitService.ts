interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

class RateLimitService {
  private limits: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if request should be rate limited
   */
  checkLimit(
    identifier: string, 
    config: RateLimitConfig
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = identifier;
    const existing = this.limits.get(key);

    // If no existing entry or window has expired, create new entry
    if (!existing || now > existing.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + config.windowMs,
        blocked: false
      };
      this.limits.set(key, newEntry);
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: newEntry.resetTime
      };
    }

    // Check if currently blocked
    if (existing.blocked && config.blockDurationMs) {
      const blockExpiry = existing.resetTime + config.blockDurationMs;
      if (now < blockExpiry) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: blockExpiry
        };
      } else {
        // Block period expired, reset
        existing.blocked = false;
        existing.count = 0;
        existing.resetTime = now + config.windowMs;
      }
    }

    // Increment count
    existing.count++;

    // Check if limit exceeded
    if (existing.count > config.maxRequests) {
      existing.blocked = true;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: existing.resetTime + (config.blockDurationMs || 0)
      };
    }

    return {
      allowed: true,
      remaining: config.maxRequests - existing.count,
      resetTime: existing.resetTime
    };
  }

  /**
   * Get rate limit status without incrementing
   */
  getStatus(identifier: string, config: RateLimitConfig) {
    const now = Date.now();
    const existing = this.limits.get(identifier);

    if (!existing || now > existing.resetTime) {
      return {
        count: 0,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
        blocked: false
      };
    }

    return {
      count: existing.count,
      remaining: Math.max(0, config.maxRequests - existing.count),
      resetTime: existing.resetTime,
      blocked: existing.blocked
    };
  }

  /**
   * Reset limits for identifier
   */
  reset(identifier: string): void {
    this.limits.delete(identifier);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime + (60 * 1000)) { // Extra minute buffer
        this.limits.delete(key);
      }
    }
  }

  /**
   * Destroy service and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.limits.clear();
  }
}

// Singleton instance
export const rateLimitService = new RateLimitService();

// Rate limit configurations for different endpoints
export const RATE_LIMITS = {
  auth: { maxRequests: 5, windowMs: 15 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 }, // 5 per 15min, block 30min
  extraction: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
  music: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 per minute
  api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute general API
  admin: { maxRequests: 50, windowMs: 60 * 1000 }, // 50 per minute for admin
} as const;

/**
 * Hook for React components to check rate limits
 */
export function useRateLimit(type: keyof typeof RATE_LIMITS, identifier?: string) {
  const checkLimit = (id?: string) => {
    const finalId = id || identifier || 'anonymous';
    return rateLimitService.checkLimit(finalId, RATE_LIMITS[type]);
  };

  const getStatus = (id?: string) => {
    const finalId = id || identifier || 'anonymous';
    return rateLimitService.getStatus(finalId, RATE_LIMITS[type]);
  };

  return { checkLimit, getStatus };
}