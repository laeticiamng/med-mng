import { RateLimitStore, RateLimitResult } from '../rateLimitService';

interface MemoryCounter {
  count: number;
  windowStart: Date;
  windowEnd: Date;
  maxRequests: number;
}

/**
 * In-memory implementation of RateLimitStore
 * ⚠️ WARNING: This implementation is NOT suitable for distributed deployments
 * Use only for development, testing, or single-instance applications
 */
export class MemoryRateLimitStore implements RateLimitStore {
  private counters = new Map<string, MemoryCounter>();
  private cleanupInterval?: NodeJS.Timeout;

  constructor(cleanupIntervalMs: number = 60000) {
    // Periodically clean up expired counters
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, cleanupIntervalMs);
  }

  /**
   * Check rate limit and increment counter
   */
  async checkAndIncrement(
    identifier: string,
    windowDurationSeconds: number,
    maxRequests: number
  ): Promise<RateLimitResult> {
    const now = new Date();
    const windowDurationMs = windowDurationSeconds * 1000;
    
    // Calculate current window
    const windowStart = new Date(Math.floor(now.getTime() / windowDurationMs) * windowDurationMs);
    const windowEnd = new Date(windowStart.getTime() + windowDurationMs);
    
    const key = `${identifier}:${windowStart.getTime()}`;
    let counter = this.counters.get(key);
    
    if (!counter) {
      // Create new counter
      counter = {
        count: 1,
        windowStart,
        windowEnd,
        maxRequests
      };
      this.counters.set(key, counter);
    } else {
      // Increment existing counter
      counter.count++;
    }
    
    const remainingRequests = Math.max(0, maxRequests - counter.count);
    const rateLimited = counter.count > maxRequests;
    
    return {
      allowed: !rateLimited,
      identifier,
      currentCount: counter.count,
      maxRequests,
      remainingRequests,
      resetTime: windowEnd,
      windowStart,
      windowEnd
    };
  }

  /**
   * Get current rate limit status without incrementing
   */
  async getStatus(
    identifier: string,
    windowDurationSeconds: number,
    maxRequests: number
  ): Promise<RateLimitResult> {
    const now = new Date();
    const windowDurationMs = windowDurationSeconds * 1000;
    
    // Calculate current window
    const windowStart = new Date(Math.floor(now.getTime() / windowDurationMs) * windowDurationMs);
    const windowEnd = new Date(windowStart.getTime() + windowDurationMs);
    
    const key = `${identifier}:${windowStart.getTime()}`;
    const counter = this.counters.get(key);
    
    const currentCount = counter ? counter.count : 0;
    const remainingRequests = Math.max(0, maxRequests - currentCount);
    const rateLimited = currentCount >= maxRequests;
    
    return {
      allowed: !rateLimited,
      identifier,
      currentCount,
      maxRequests,
      remainingRequests,
      resetTime: windowEnd,
      windowStart,
      windowEnd
    };
  }

  /**
   * Clean up expired counters
   */
  async cleanup(): Promise<number> {
    const now = new Date();
    let deletedCount = 0;
    
    for (const [key, counter] of this.counters.entries()) {
      if (counter.windowEnd < now) {
        this.counters.delete(key);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  /**
   * Reset counter for a specific identifier
   */
  async reset(identifier: string): Promise<void> {
    // Remove all counters for this identifier
    for (const key of this.counters.keys()) {
      if (key.startsWith(`${identifier}:`)) {
        this.counters.delete(key);
      }
    }
  }

  /**
   * Get current memory usage statistics
   */
  getStats(): { totalCounters: number; activeCounters: number } {
    const now = new Date();
    let activeCounters = 0;
    
    for (const counter of this.counters.values()) {
      if (counter.windowEnd >= now) {
        activeCounters++;
      }
    }
    
    return {
      totalCounters: this.counters.size,
      activeCounters
    };
  }

  /**
   * Clear all counters (useful for testing)
   */
  clear(): void {
    this.counters.clear();
  }

  /**
   * Destroy the store and clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    this.counters.clear();
  }
}

/**
 * Factory function to create a memory rate limit store
 */
export function createMemoryRateLimitStore(cleanupIntervalMs?: number): MemoryRateLimitStore {
  return new MemoryRateLimitStore(cleanupIntervalMs);
}