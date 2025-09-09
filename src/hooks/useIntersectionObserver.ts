/**
 * Hook pour l'Intersection Observer API
 * Utile pour le lazy loading et les animations au scroll
 */

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersectionObserver<T extends Element = Element>(
  options: UseIntersectionObserverOptions = {}
) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<T>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    triggerOnce = false
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Créer l'observer
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        setIsIntersecting(entry.isIntersecting);

        // Si triggerOnce est true, on disconnect après la première intersection
        if (triggerOnce && entry.isIntersecting && observerRef.current) {
          observerRef.current.disconnect();
        }
      },
      {
        threshold,
        root,
        rootMargin
      }
    );

    // Observer l'élément
    observerRef.current.observe(element);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, root, rootMargin, triggerOnce]);

  return {
    ref: elementRef,
    entry,
    isIntersecting,
    isVisible: isIntersecting
  };
}

// Hook spécialisé pour le lazy loading
export function useLazyLoad<T extends Element = Element>(
  options: Omit<UseIntersectionObserverOptions, 'triggerOnce'> = {}
) {
  return useIntersectionObserver<T>({
    ...options,
    triggerOnce: true,
    rootMargin: '50px' // Charger un peu avant que l'élément soit visible
  });
}

// Hook pour les animations au scroll
export function useScrollAnimation<T extends Element = Element>(
  options: UseIntersectionObserverOptions = {}
) {
  const result = useIntersectionObserver<T>({
    threshold: 0.1,
    ...options
  });

  return {
    ...result,
    shouldAnimate: result.isIntersecting
  };
}