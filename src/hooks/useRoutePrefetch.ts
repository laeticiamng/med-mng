import React, { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to prefetch routes on hover or navigation intent
 * Improves perceived performance by loading route data before user navigates
 */

interface PrefetchOptions {
  enabled?: boolean;
  delay?: number; // ms to wait before prefetching
  staleTime?: number; // How long prefetch data is considered fresh
}

/**
 * Prefetch route on mouse enter event
 * Useful for navigation links
 */
export const usePrefetchRoute = (
  prefetchFn: () => Promise<any>,
  options: PrefetchOptions = {}
) => {
  const { enabled = true, delay = 300 } = options;
  let timeoutId: NodeJS.Timeout | null = null;

  const handleMouseEnter = () => {
    if (!enabled) return;

    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      prefetchFn().catch(err => console.debug('Prefetch error:', err));
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave };
};

/**
 * Prefetch multiple queries for a route
 * Useful for dashboard pages with multiple data sources
 */
export const usePrefetchQueries = (
  queries: Array<{ queryKey: any[]; queryFn: () => Promise<any> }>,
  options: PrefetchOptions = {}
) => {
  const queryClient = useQueryClient();
  const { enabled = true } = options;

  const prefetch = async () => {
    if (!enabled) return;

    try {
      await Promise.all(
        queries.map(({ queryKey, queryFn }) =>
          queryClient.prefetchQuery({ queryKey, queryFn, staleTime: Infinity })
        )
      );
    } catch (error) {
      console.debug('Batch prefetch error:', error);
    }
  };

  return { prefetch };
};

/**
 * Prefetch on intersection (lazy prefetch when element becomes visible)
 * Useful for below-the-fold content
 */
export const useIntersectionPrefetch = (
  prefetchFn: () => Promise<any>,
  options: PrefetchOptions & { threshold?: number } = {}
) => {
  const { enabled = true, threshold = 0.1 } = options;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPrefetchedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Only prefetch once
    if (isPrefetchedRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isPrefetchedRef.current) {
          isPrefetchedRef.current = true;
          prefetchFn().catch(err => console.debug('Intersection prefetch error:', err));
        }
      },
      { threshold }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, prefetchFn, threshold]);

  return containerRef;
};

/**
 * Prefetch related pages based on current route
 * Used to anticipate user navigation patterns
 */
export const usePrefetchRelatedPages = (
  currentRoute: string,
  relatedRoutes: string[]
) => {
  const queryClient = useQueryClient();

  const prefetchRelated = async () => {
    // This would be implemented based on your specific needs
    // For example, if user is on challenges page, prefetch leaderboard
    relatedRoutes.forEach(route => {
      // Trigger any associated queries for the route
      console.debug(`Prefetching related route: ${route}`);
    });
  };

  return { prefetchRelated };
};
