import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cacheService } from '@/services/core/CacheService';

describe('CacheService', () => {
  beforeEach(() => {
    cacheService.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cacheService.clear();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('stores and retrieves values in memory cache', () => {
    cacheService.set('music:queue', { total: 5 });

    expect(cacheService.get<{ total: number }>('music:queue')).toEqual({ total: 5 });
    expect(cacheService.has('music:queue')).toBe(true);
  });

  it('expires values once ttl elapses', () => {
    cacheService.set('edn:plan', { id: 'plan-1' }, { ttl: 1_000 });

    expect(cacheService.get('edn:plan')).toEqual({ id: 'plan-1' });
    vi.advanceTimersByTime(1_200);
    expect(cacheService.get('edn:plan')).toBeNull();
  });

  it('persists values to localStorage with compression', () => {
    cacheService.set('analytics:snapshot', { frictions: 3 }, { storage: 'localStorage', compress: true });

    const raw = localStorage.getItem('cache_analytics:snapshot');
    expect(raw).toBeTruthy();
    expect(raw?.startsWith('_compressed_')).toBe(true);

    const value = cacheService.get<{ frictions: number }>('analytics:snapshot', 'localStorage');
    expect(value).toEqual({ frictions: 3 });
  });

  it('falls back to memory cache when storage layer throws', () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = () => {
      throw new Error('storage full');
    };

    cacheService.set('ratelimit:quota', { remaining: 0 }, { storage: 'localStorage' });
    expect(cacheService.get('ratelimit:quota')).toEqual({ remaining: 0 });

    localStorage.setItem = originalSetItem;
  });

  it('computes deterministic query keys', () => {
    const keyA = cacheService.getQueryKey('music_jobs', { status: 'running', page: 1 });
    const keyB = cacheService.getQueryKey('music_jobs', { page: 1, status: 'running' });

    expect(keyA).toBe(keyB);
  });
});
