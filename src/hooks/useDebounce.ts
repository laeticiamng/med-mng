/**
 * Hook de debounce pour les valeurs et callbacks
 * ✅ Enrichi: Ajout de useDebouncedCallback et useThrottle
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Debounce une valeur réactive
 * @param value - La valeur à debounce
 * @param delay - Le délai en ms (défaut: 300ms)
 */
export const useDebounce = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Debounce un callback
 * @param callback - La fonction à debounce
 * @param delay - Le délai en ms (défaut: 300ms)
 */
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Mettre à jour la référence du callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
};

/**
 * Throttle un callback (exécute au plus une fois par intervalle)
 * @param callback - La fonction à throttle
 * @param limit - L'intervalle minimum en ms
 */
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  limit: number = 300
): ((...args: Parameters<T>) => void) => {
  const lastRanRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = limit - (now - lastRanRef.current);
    
    if (remaining <= 0) {
      lastRanRef.current = now;
      callbackRef.current(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        lastRanRef.current = Date.now();
        callbackRef.current(...args);
      }, remaining);
    }
  }, [limit]);
};

/**
 * Debounce avec valeur immédiate (leading edge)
 * @param value - La valeur à debounce
 * @param delay - Le délai en ms
 */
export const useDebounceLeading = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const isFirstRef = useRef(true);

  useEffect(() => {
    if (isFirstRef.current) {
      isFirstRef.current = false;
      setDebouncedValue(value);
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
