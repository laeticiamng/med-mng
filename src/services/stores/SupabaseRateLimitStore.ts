import { supabase } from '@/integrations/supabase/client';
import { RateLimitStore, RateLimitResult } from '../rateLimitService';

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
        console.error('Supabase rate limit error:', error);
        throw new Error(`Rate limit check failed: ${error.message}`);
      }

      return this.mapSupabaseResult(data);
    } catch (error) {
      console.error('Rate limit check error:', error);
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
        console.error('Supabase rate limit status error:', error);
        throw new Error(`Rate limit status failed: ${error.message}`);
      }

      return this.mapSupabaseResult(data);
    } catch (error) {
      console.error('Rate limit status error:', error);
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
        console.error('Supabase cleanup error:', error);
        throw new Error(`Cleanup failed: ${error.message}`);
      }

      return data || 0;
    } catch (error) {
      console.error('Cleanup error:', error);
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
        console.error('Supabase reset error:', error);
        throw new Error(`Reset failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Reset error:', error);
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