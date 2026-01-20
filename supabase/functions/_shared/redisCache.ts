/**
 * Service de cache Redis pour les alertes unifiées
 * Optimise les performances et réduit les coûts API
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

interface CacheEntry<T> {
  data: T;
  cached_at: string;
  expires_at: string;
}

interface CacheStats {
  hit_count: number;
  miss_count: number;
  hit_rate: number;
}

export class RedisCache {
  private supabase: any;
  private readonly TABLE_NAME = "cache_config";
  private readonly METRICS_TABLE = "cache_metrics";

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Récupère une valeur du cache
   */
  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();
    
    try {
      // Récupérer la configuration TTL
      const { data: config } = await this.supabase
        .from(this.TABLE_NAME)
        .select("ttl_seconds")
        .eq("cache_key", key)
        .single();

      if (!config) {
        await this.recordMetric(key, "miss", Date.now() - startTime);
        return null;
      }

      // Chercher dans la table cache_entries dédiée
      const cacheKey = `cache:${key}`;
      const { data: cached } = await this.supabase
        .from("cache_entries")
        .select("data, expires_at")
        .eq("cache_key", cacheKey)
        .single();

      if (!cached?.data) {
        await this.recordMetric(key, "miss", Date.now() - startTime);
        await this.incrementCounter(key, "miss");
        return null;
      }

      const entry: CacheEntry<T> = cached.data;
      const expiresAt = new Date(entry.expires_at);

      // Vérifier expiration
      if (expiresAt < new Date()) {
        await this.recordMetric(key, "miss", Date.now() - startTime);
        await this.incrementCounter(key, "miss");
        return null;
      }

      await this.recordMetric(key, "hit", Date.now() - startTime);
      await this.incrementCounter(key, "hit");
      console.log(`[RedisCache] Cache HIT for key: ${key}`);
      return entry.data;
    } catch (error) {
      console.error(`[RedisCache] Error getting cache for ${key}:`, error);
      return null;
    }
  }

  /**
   * Stocke une valeur dans le cache
   */
  async set<T>(key: string, value: T): Promise<void> {
    const startTime = Date.now();

    try {
      // Récupérer la configuration TTL
      const { data: config } = await this.supabase
        .from(this.TABLE_NAME)
        .select("ttl_seconds")
        .eq("cache_key", key)
        .single();

      if (!config) {
        console.warn(`[RedisCache] No config found for key: ${key}`);
        return;
      }

      const cachedAt = new Date();
      const expiresAt = new Date(cachedAt.getTime() + config.ttl_seconds * 1000);

      const entry: CacheEntry<T> = {
        data: value,
        cached_at: cachedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      };

      const cacheKey = `cache:${key}`;

      // Sauvegarder dans la table cache_entries dédiée
      await this.supabase
        .from("cache_entries")
        .upsert({
          cache_key: cacheKey,
          data: entry,
          expires_at: expiresAt.toISOString(),
          created_at: cachedAt.toISOString(),
        }, { onConflict: "cache_key" });

      await this.recordMetric(key, "set", Date.now() - startTime);
      console.log(`[RedisCache] Cache SET for key: ${key}, TTL: ${config.ttl_seconds}s`);
    } catch (error) {
      console.error(`[RedisCache] Error setting cache for ${key}:`, error);
    }
  }

  /**
   * Invalide une clé de cache
   */
  async invalidate(key: string): Promise<void> {
    const startTime = Date.now();

    try {
      const cacheKey = `cache:${key}`;
      await this.supabase
        .from("cache_entries")
        .delete()
        .eq("cache_key", cacheKey);

      await this.supabase
        .from(this.TABLE_NAME)
        .update({ last_invalidated_at: new Date().toISOString() })
        .eq("cache_key", key);

      await this.recordMetric(key, "invalidate", Date.now() - startTime);
      console.log(`[RedisCache] Cache INVALIDATED for key: ${key}`);
    } catch (error) {
      console.error(`[RedisCache] Error invalidating cache for ${key}:`, error);
    }
  }

  /**
   * Récupère les statistiques de cache
   */
  async getStats(key: string): Promise<CacheStats> {
    try {
      const { data } = await this.supabase
        .from(this.TABLE_NAME)
        .select("hit_count, miss_count")
        .eq("cache_key", key)
        .single();

      if (!data) {
        return { hit_count: 0, miss_count: 0, hit_rate: 0 };
      }

      const total = data.hit_count + data.miss_count;
      const hit_rate = total > 0 ? (data.hit_count / total) * 100 : 0;

      return {
        hit_count: data.hit_count,
        miss_count: data.miss_count,
        hit_rate,
      };
    } catch (error) {
      console.error(`[RedisCache] Error getting stats for ${key}:`, error);
      return { hit_count: 0, miss_count: 0, hit_rate: 0 };
    }
  }

  /**
   * Enregistre une métrique de cache
   */
  private async recordMetric(
    key: string,
    operation: "hit" | "miss" | "set" | "invalidate",
    responseTimeMs: number
  ): Promise<void> {
    try {
      await this.supabase.from(this.METRICS_TABLE).insert({
        cache_key: key,
        operation,
        response_time_ms: responseTimeMs,
      });
    } catch (error) {
      // Silent fail pour les métriques
      console.debug(`[RedisCache] Failed to record metric:`, error);
    }
  }

  /**
   * Incrémente un compteur (hit ou miss)
   */
  private async incrementCounter(key: string, type: "hit" | "miss"): Promise<void> {
    try {
      const column = type === "hit" ? "hit_count" : "miss_count";
      const { data: current } = await this.supabase
        .from(this.TABLE_NAME)
        .select(column)
        .eq("cache_key", key)
        .single();

      if (current) {
        await this.supabase
          .from(this.TABLE_NAME)
          .update({ [column]: current[column] + 1 })
          .eq("cache_key", key);
      }
    } catch (error) {
      console.debug(`[RedisCache] Failed to increment counter:`, error);
    }
  }
}
