/**
 * 🔒 Rate Limiting Middleware for Supabase Edge Functions
 *
 * Protection contre l'abus des API coûteuses (OpenAI, Suno, DALL-E)
 *
 * Usage:
 * ```typescript
 * import { checkRateLimit } from '../_shared/rate-limit.ts';
 *
 * const { allowed, remaining, resetAt } = await checkRateLimit(
 *   supabase,
 *   userId,
 *   'openai-chat',  // endpoint identifier
 *   { limit: 10, windowMs: 3600000 }  // 10 requests per hour
 * );
 *
 * if (!allowed) {
 *   return new Response(
 *     JSON.stringify({
 *       error: 'Rate limit exceeded',
 *       remaining,
 *       resetAt
 *     }),
 *     { status: 429 }
 *   );
 * }
 * ```
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  limit: number;

  /**
   * Time window in milliseconds (default: 1 hour = 3600000ms)
   */
  windowMs?: number;

  /**
   * Optional custom identifier (default: uses userId)
   */
  identifier?: string;
}

export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  allowed: boolean;

  /**
   * Number of requests remaining in current window
   */
  remaining: number;

  /**
   * Timestamp when the rate limit resets (ISO string)
   */
  resetAt: string;

  /**
   * Total requests made in current window
   */
  current: number;

  /**
   * Maximum allowed requests
   */
  limit: number;
}

/**
 * Recommended rate limits for different API types
 */
export const RATE_LIMITS = {
  // AI Chat APIs (OpenAI GPT-4, GPT-4 Turbo)
  AI_CHAT: { limit: 20, windowMs: 3600000 },        // 20 requests/hour
  AI_CHAT_PREMIUM: { limit: 100, windowMs: 3600000 }, // 100 requests/hour (premium users)

  // Image Generation (DALL-E 3, Stable Diffusion)
  IMAGE_GEN: { limit: 10, windowMs: 3600000 },      // 10 images/hour
  IMAGE_GEN_PREMIUM: { limit: 50, windowMs: 3600000 }, // 50 images/hour

  // Music Generation (Suno API)
  MUSIC_GEN: { limit: 5, windowMs: 3600000 },       // 5 songs/hour
  MUSIC_GEN_PREMIUM: { limit: 20, windowMs: 3600000 }, // 20 songs/hour

  // Code Analysis (GPT-4)
  CODE_ANALYSIS: { limit: 15, windowMs: 3600000 },  // 15 analyses/hour

  // Email Sending
  EMAIL_SEND: { limit: 50, windowMs: 3600000 },     // 50 emails/hour

  // Data Exports
  DATA_EXPORT: { limit: 5, windowMs: 3600000 },     // 5 exports/hour

  // External Scraping (UNESS)
  EXTERNAL_SCRAPE: { limit: 10, windowMs: 86400000 }, // 10 scrapes/day

  // Admin Operations
  ADMIN_BULK: { limit: 3, windowMs: 3600000 },      // 3 bulk ops/hour
} as const;

/**
 * Check rate limit for a user/endpoint combination
 *
 * Uses Supabase database for persistence across Edge Function instances
 *
 * @param supabase - Supabase client
 * @param userId - User ID to rate limit
 * @param endpoint - Endpoint identifier (e.g., 'openai-chat', 'suno-music')
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  endpoint: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { limit, windowMs = 3600000, identifier } = config;
  const key = identifier || `${userId}:${endpoint}`;

  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  try {
    // Get or create rate limit record
    const { data: existing, error: fetchError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('key', key)
      .gte('window_start', windowStart.toISOString())
      .order('window_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Rate limit fetch error:', fetchError);
      // Fail open: allow request if DB error
      return {
        allowed: true,
        remaining: limit - 1,
        resetAt: new Date(now.getTime() + windowMs).toISOString(),
        current: 1,
        limit,
      };
    }

    // If no existing record or window expired, create new window
    if (!existing || new Date(existing.window_start) < windowStart) {
      const { error: insertError } = await supabase
        .from('rate_limits')
        .insert({
          key,
          user_id: userId,
          endpoint,
          count: 1,
          window_start: now.toISOString(),
          window_end: new Date(now.getTime() + windowMs).toISOString(),
          limit,
        });

      if (insertError) {
        console.error('Rate limit insert error:', insertError);
        // Fail open
        return {
          allowed: true,
          remaining: limit - 1,
          resetAt: new Date(now.getTime() + windowMs).toISOString(),
          current: 1,
          limit,
        };
      }

      return {
        allowed: true,
        remaining: limit - 1,
        resetAt: new Date(now.getTime() + windowMs).toISOString(),
        current: 1,
        limit,
      };
    }

    // Existing window - check if limit exceeded
    const current = existing.count + 1;
    const allowed = current <= limit;

    if (allowed) {
      // Increment counter
      const { error: updateError } = await supabase
        .from('rate_limits')
        .update({ count: current, updated_at: now.toISOString() })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Rate limit update error:', updateError);
      }
    }

    return {
      allowed,
      remaining: Math.max(0, limit - current),
      resetAt: existing.window_end,
      current,
      limit,
    };

  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open: allow request if unexpected error
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: new Date(now.getTime() + windowMs).toISOString(),
      current: 1,
      limit,
    };
  }
}

/**
 * Check if user has premium access (higher rate limits)
 *
 * @param supabase - Supabase client
 * @param userId - User ID
 * @returns Whether user has premium access
 */
export async function isPremiumUser(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('status, plan_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (error || !data) {
      return false;
    }

    // Check if plan is premium (customize based on your plan IDs)
    const premiumPlanIds = ['premium', 'pro', 'enterprise'];
    return premiumPlanIds.includes(data.plan_id);

  } catch (error) {
    console.error('Premium check error:', error);
    return false;
  }
}

/**
 * Get appropriate rate limit config based on user tier
 *
 * @param supabase - Supabase client
 * @param userId - User ID
 * @param endpoint - Endpoint type
 * @returns Rate limit configuration
 */
export async function getRateLimitConfig(
  supabase: SupabaseClient,
  userId: string,
  endpoint: keyof typeof RATE_LIMITS
): Promise<RateLimitConfig> {
  const isPremium = await isPremiumUser(supabase, userId);

  // Map endpoints to their premium variants
  const premiumMap: Record<string, keyof typeof RATE_LIMITS> = {
    'AI_CHAT': 'AI_CHAT_PREMIUM',
    'IMAGE_GEN': 'IMAGE_GEN_PREMIUM',
    'MUSIC_GEN': 'MUSIC_GEN_PREMIUM',
  };

  const configKey = isPremium && premiumMap[endpoint]
    ? premiumMap[endpoint]
    : endpoint;

  return RATE_LIMITS[configKey];
}

/**
 * Clean up old rate limit records (run periodically via cron)
 *
 * @param supabase - Supabase client
 * @param olderThanHours - Delete records older than this many hours (default: 24)
 * @returns Number of deleted records
 */
export async function cleanupOldRateLimits(
  supabase: SupabaseClient,
  olderThanHours: number = 24
): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanHours * 3600000);

  try {
    const { data, error } = await supabase
      .from('rate_limits')
      .delete()
      .lt('window_end', cutoff.toISOString())
      .select('id');

    if (error) {
      console.error('Cleanup error:', error);
      return 0;
    }

    const deletedCount = data?.length || 0;
    console.log(`✅ Cleaned up ${deletedCount} old rate limit records`);

    return deletedCount;

  } catch (error) {
    console.error('Cleanup error:', error);
    return 0;
  }
}
