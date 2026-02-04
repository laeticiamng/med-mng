/**
 * ⚡ PERFORMANCE MODULE TESTS
 * Tests for caching, optimization, and performance patterns
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ────────────────────────────────────────────
// 🗃️ CACHE TESTS
// ────────────────────────────────────────────

describe('Performance - Caching', () => {
  interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
  }

  class SimpleCache<T> {
    private cache = new Map<string, CacheEntry<T>>();

    set(key: string, data: T, ttl: number = 300000): void {
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
      });
    }

    get(key: string): T | null {
      const entry = this.cache.get(key);
      if (!entry) return null;

      if (Date.now() - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        return null;
      }

      return entry.data;
    }

    has(key: string): boolean {
      return this.get(key) !== null;
    }

    clear(): void {
      this.cache.clear();
    }

    size(): number {
      return this.cache.size;
    }
  }

  it('should store and retrieve cached data', () => {
    const cache = new SimpleCache<string>();
    cache.set('key1', 'value1');

    expect(cache.get('key1')).toBe('value1');
  });

  it('should return null for missing keys', () => {
    const cache = new SimpleCache<string>();
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('should respect TTL expiration', async () => {
    const cache = new SimpleCache<string>();
    cache.set('key1', 'value1', 1); // 1ms expiration

    await new Promise((r) => setTimeout(r, 10)); // Wait for expiration
    expect(cache.get('key1')).toBeNull();
  });

  it('should clear all cache entries', () => {
    const cache = new SimpleCache<string>();
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();

    expect(cache.size()).toBe(0);
  });
});

// ────────────────────────────────────────────
// 🔄 DEBOUNCE & THROTTLE TESTS
// ────────────────────────────────────────────

describe('Performance - Debounce & Throttle', () => {
  const createDebounce = <T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  };

  it('should debounce rapid calls', async () => {
    let callCount = 0;
    const fn = () => callCount++;
    const debounced = createDebounce(fn, 100);

    debounced();
    debounced();
    debounced();

    // Immediate count should be 0
    expect(callCount).toBe(0);

    // After delay, should be 1
    await new Promise((r) => setTimeout(r, 150));
    expect(callCount).toBe(1);
  });

  it('should only execute last call', async () => {
    let lastValue = '';
    const fn = (value: string) => { lastValue = value; };
    const debounced = createDebounce(fn, 50);

    debounced('first');
    debounced('second');
    debounced('third');

    await new Promise((r) => setTimeout(r, 100));
    expect(lastValue).toBe('third');
  });
});

// ────────────────────────────────────────────
// 📊 PAGINATION TESTS
// ────────────────────────────────────────────

describe('Performance - Pagination', () => {
  interface PaginationConfig {
    page: number;
    pageSize: number;
    totalItems: number;
  }

  const calculatePagination = (config: PaginationConfig) => {
    const { page, pageSize, totalItems } = config;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    return {
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      itemsOnPage: endIndex - startIndex,
    };
  };

  const paginateArray = <T>(
    items: T[],
    page: number,
    pageSize: number
  ): T[] => {
    const startIndex = (page - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  };

  it('should calculate pagination correctly', () => {
    const config: PaginationConfig = {
      page: 1,
      pageSize: 10,
      totalItems: 95,
    };

    const result = calculatePagination(config);

    expect(result.totalPages).toBe(10);
    expect(result.startIndex).toBe(0);
    expect(result.endIndex).toBe(10);
    expect(result.hasNextPage).toBe(true);
    expect(result.hasPrevPage).toBe(false);
  });

  it('should handle last page correctly', () => {
    const config: PaginationConfig = {
      page: 10,
      pageSize: 10,
      totalItems: 95,
    };

    const result = calculatePagination(config);

    expect(result.itemsOnPage).toBe(5);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPrevPage).toBe(true);
  });

  it('should paginate arrays correctly', () => {
    const items = Array.from({ length: 25 }, (_, i) => i + 1);

    const page1 = paginateArray(items, 1, 10);
    expect(page1).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    const page3 = paginateArray(items, 3, 10);
    expect(page3).toEqual([21, 22, 23, 24, 25]);
  });

  it('should handle empty pages', () => {
    const items = [1, 2, 3];
    const outOfRange = paginateArray(items, 5, 10);
    expect(outOfRange).toEqual([]);
  });
});

// ────────────────────────────────────────────
// 🔍 LAZY LOADING TESTS
// ────────────────────────────────────────────

describe('Performance - Lazy Loading', () => {
  interface LazyLoadConfig {
    threshold: number;
    rootMargin: string;
    enabled: boolean;
  }

  const shouldLoadMore = (
    scrollPosition: number,
    containerHeight: number,
    contentHeight: number,
    threshold: number
  ): boolean => {
    const distanceFromBottom = contentHeight - scrollPosition - containerHeight;
    return distanceFromBottom < threshold;
  };

  const calculateVisibleRange = (
    scrollPosition: number,
    itemHeight: number,
    containerHeight: number,
    overscan: number = 2
  ) => {
    const startIndex = Math.max(0, Math.floor(scrollPosition / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = startIndex + visibleCount + overscan * 2;

    return { startIndex, endIndex };
  };

  it('should trigger load more near bottom', () => {
    expect(shouldLoadMore(900, 500, 1000, 200)).toBe(true);
    expect(shouldLoadMore(100, 500, 1000, 200)).toBe(false);
  });

  it('should calculate visible range for virtual list', () => {
    const result = calculateVisibleRange(100, 50, 500, 2);

    expect(result.startIndex).toBe(0);
    expect(result.endIndex).toBe(14); // startIndex + visibleCount + overscan*2 = 0 + 10 + 4
  });

  it('should handle scroll at top', () => {
    const result = calculateVisibleRange(0, 50, 500, 2);
    expect(result.startIndex).toBe(0);
  });
});

// ────────────────────────────────────────────
// ⚙️ MEMOIZATION TESTS
// ────────────────────────────────────────────

describe('Performance - Memoization', () => {
  const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
    const cache = new Map<string, ReturnType<T>>();

    return ((...args: Parameters<T>): ReturnType<T> => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key)!;
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  };

  it('should cache function results', () => {
    let callCount = 0;
    const expensive = (n: number) => {
      callCount++;
      return n * 2;
    };

    const memoized = memoize(expensive);

    expect(memoized(5)).toBe(10);
    expect(memoized(5)).toBe(10);
    expect(memoized(5)).toBe(10);

    expect(callCount).toBe(1);
  });

  it('should cache different arguments separately', () => {
    let callCount = 0;
    const expensive = (n: number) => {
      callCount++;
      return n * 2;
    };

    const memoized = memoize(expensive);

    expect(memoized(5)).toBe(10);
    expect(memoized(10)).toBe(20);
    expect(memoized(5)).toBe(10);

    expect(callCount).toBe(2);
  });

  it('should handle multiple arguments', () => {
    const add = memoize((a: number, b: number) => a + b);

    expect(add(1, 2)).toBe(3);
    expect(add(1, 2)).toBe(3);
    expect(add(2, 3)).toBe(5);
  });
});

// ────────────────────────────────────────────
// 📈 METRICS COLLECTION TESTS
// ────────────────────────────────────────────

describe('Performance - Metrics', () => {
  interface PerformanceMetric {
    name: string;
    value: number;
    unit: 'ms' | 'bytes' | 'count';
    timestamp: number;
  }

  class MetricsCollector {
    private metrics: PerformanceMetric[] = [];

    record(name: string, value: number, unit: 'ms' | 'bytes' | 'count'): void {
      this.metrics.push({
        name,
        value,
        unit,
        timestamp: Date.now(),
      });
    }

    getAverage(name: string): number {
      const relevant = this.metrics.filter((m) => m.name === name);
      if (relevant.length === 0) return 0;
      return relevant.reduce((sum, m) => sum + m.value, 0) / relevant.length;
    }

    getMax(name: string): number {
      const relevant = this.metrics.filter((m) => m.name === name);
      if (relevant.length === 0) return 0;
      return Math.max(...relevant.map((m) => m.value));
    }

    clear(): void {
      this.metrics = [];
    }
  }

  it('should record metrics', () => {
    const collector = new MetricsCollector();
    collector.record('loadTime', 150, 'ms');
    collector.record('loadTime', 200, 'ms');

    expect(collector.getAverage('loadTime')).toBe(175);
  });

  it('should get max value', () => {
    const collector = new MetricsCollector();
    collector.record('loadTime', 100, 'ms');
    collector.record('loadTime', 300, 'ms');
    collector.record('loadTime', 150, 'ms');

    expect(collector.getMax('loadTime')).toBe(300);
  });

  it('should handle empty metrics', () => {
    const collector = new MetricsCollector();
    expect(collector.getAverage('nonexistent')).toBe(0);
    expect(collector.getMax('nonexistent')).toBe(0);
  });
});

// ────────────────────────────────────────────
// 🌐 NETWORK OPTIMIZATION TESTS
// ────────────────────────────────────────────

describe('Performance - Network Optimization', () => {
  interface RetryConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
  }

  const calculateBackoff = (
    attempt: number,
    config: RetryConfig
  ): number => {
    const delay = Math.min(
      config.baseDelay * Math.pow(2, attempt),
      config.maxDelay
    );
    // Add jitter
    return delay + Math.random() * delay * 0.1;
  };

  const shouldRetry = (
    attempt: number,
    maxRetries: number,
    statusCode: number
  ): boolean => {
    if (attempt >= maxRetries) return false;
    // Retry on 5xx errors and network failures (0)
    return statusCode === 0 || (statusCode >= 500 && statusCode < 600);
  };

  it('should calculate exponential backoff', () => {
    const config: RetryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
    };

    const delay0 = calculateBackoff(0, config);
    const delay1 = calculateBackoff(1, config);
    const delay2 = calculateBackoff(2, config);

    expect(delay0).toBeGreaterThanOrEqual(1000);
    expect(delay1).toBeGreaterThanOrEqual(2000);
    expect(delay2).toBeGreaterThanOrEqual(4000);
  });

  it('should respect max delay', () => {
    const config: RetryConfig = {
      maxRetries: 10,
      baseDelay: 1000,
      maxDelay: 5000,
    };

    const delay = calculateBackoff(10, config);
    expect(delay).toBeLessThanOrEqual(5500); // 5000 + 10% jitter
  });

  it('should determine retry eligibility', () => {
    expect(shouldRetry(0, 3, 500)).toBe(true);
    expect(shouldRetry(0, 3, 503)).toBe(true);
    expect(shouldRetry(0, 3, 400)).toBe(false);
    expect(shouldRetry(0, 3, 401)).toBe(false);
    expect(shouldRetry(3, 3, 500)).toBe(false);
  });
});
