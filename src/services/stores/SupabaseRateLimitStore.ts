import { supabase } from '@/integrations/supabase/client';
import { RateLimitStore, RateLimitResult } from '../rateLimitService';
import { logService } from '../logService';

/**
 * Supabase implementation of RateLimitStore
 * Uses Supabase database functions for distributed rate limiting
 */
export class SupabaseRateLimitStore implements RateLimitStore {
  /**
   * Check rate limit and increment counter atomically
   */
  async checkAndIncrement(
    identifier: string,
    windowDurationSeconds: number,
    maxRequests: number
  ): Promise<RateLimitResult> {
    try {
      const { data, error } = await supabase.rpc('increment_rate_limit_counter', {
        p_identifier: identifier,
        p_window_duration_seconds: windowDurationSeconds,
        p_max_requests: maxRequests
      });

      if (error) {
        logService.error('Supabase rate limit check failed', error instanceof Error ? error : undefined, {
          identifier,
          windowDurationSeconds,
          maxRequests,
          operation: 'checkAndIncrement'
        });
        throw new Error(`Rate limit check failed: ${error.message}`);
      }

      return this.mapSupabaseResult(data);
    } catch (error) {
      logService.error('Rate limit check operation failed', error instanceof Error ? error : undefined, {
        identifier,
        windowDurationSeconds,
        maxRequests,
        operation: 'checkAndIncrement'
      });
      throw error;
    }
  }

  /**
   * Get current rate limit status without incrementing
   */
  async getStatus(
    identifier: string,
    windowDurationSeconds: number,
    maxRequests: number
  ): Promise<RateLimitResult> {
    try {
      const { data, error } = await supabase.rpc('get_rate_limit_status', {
        p_identifier: identifier,
        p_window_duration_seconds: windowDurationSeconds,
        p_max_requests: maxRequests
      });

      if (error) {
        logService.error('Supabase rate limit status check failed', error instanceof Error ? error : undefined, {
          identifier,
          windowDurationSeconds,
          maxRequests,
          operation: 'getStatus'
        });
        throw new Error(`Rate limit status failed: ${error.message}`);
      }

      return this.mapSupabaseResult(data);
    } catch (error) {
      logService.error('Rate limit status operation failed', error instanceof Error ? error : undefined, {
        identifier,
        windowDurationSeconds,
        maxRequests,
        operation: 'getStatus'
      });
      throw error;
    }
  }

  /**
   * Clean up expired rate limit counters
   */
  async cleanup(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_expired_rate_limit_counters');

      if (error) {
        logService.error('Supabase rate limit cleanup failed', error instanceof Error ? error : undefined, {
          operation: 'cleanup'
        });
        throw new Error(`Cleanup failed: ${error.message}`);
      }

      return data || 0;
    } catch (error) {
      logService.error('Rate limit cleanup operation failed', error instanceof Error ? error : undefined, {
        operation: 'cleanup'
      });
      return 0; // Return 0 if cleanup fails
    }
  }

  /**
   * Reset counter for a specific identifier
   */
  async reset(identifier: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('rate_limit_counters')
        .delete()
        .eq('identifier', identifier);

      if (error) {
        logService.error('Supabase rate limit reset failed', error instanceof Error ? error : undefined, {
          identifier,
          operation: 'reset'
        });
        throw new Error(`Reset failed: ${error.message}`);
      }
    } catch (error) {
      logService.error('Rate limit reset operation failed', error instanceof Error ? error : undefined, {
        identifier,
        operation: 'reset'
      });
      throw error;
    }
  }

  /**
   * Map Supabase function result to RateLimitResult
   */
  private mapSupabaseResult(data: any): RateLimitResult {
    return {
      allowed: !data.rate_limited,
      identifier: data.identifier,
      currentCount: data.current_count,
      maxRequests: data.max_requests,
      remainingRequests: data.remaining_requests,
      resetTime: new Date(data.reset_time),
      windowStart: new Date(data.window_start),
      windowEnd: new Date(data.window_end)
    };
  }
}

/**
 * Factory function to create a Supabase rate limit store
 */
export function createSupabaseRateLimitStore(): SupabaseRateLimitStore {
  return new SupabaseRateLimitStore();
}