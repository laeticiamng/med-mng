import { useCallback, useRef, useMemo, useEffect } from 'react';

// Hook pour la déduplication des requêtes
export const useRequestDeduplication = () => {
  const activeRequests = useRef(new Map());
  
  const dedupedRequest = useCallback(async (key, requestFn) => {
    // Si une requête identique est en cours, la retourner
    if (activeRequests.current.has(key)) {
      return activeRequests.current.get(key);
    }
    
    // Créer et stocker la nouvelle requête
    const request = requestFn().finally(() => {
      activeRequests.current.delete(key);
    });
    
    activeRequests.current.set(key, request);
    return request;
  }, []);
  
  const clearCache = useCallback(() => {
    activeRequests.current.clear();
  }, []);
  
  return { dedupedRequest, clearCache };
};

// Hook pour le debouncing optimisé
export const useOptimizedDebounce = (callback, delay, deps = []) => {
  const timeoutRef = useRef();
  const callbackRef = useRef(callback);
  
  // Maintenir la référence du callback à jour
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedCallback;
};

// Hook pour la mise en cache intelligente
export const useSmartCache = (key, fetchFn, options = {}) => {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes par défaut
    staleWhileRevalidate = true,
    maxSize = 50
  } = options;
  
  const cache = useRef(new Map());
  
  const getCachedData = useCallback((cacheKey) => {
    const cached = cache.current.get(cacheKey);
    if (!cached) return null;
    
    const now = Date.now();
    const isExpired = now - cached.timestamp > ttl;
    
    if (isExpired && !staleWhileRevalidate) {
      cache.current.delete(cacheKey);
      return null;
    }
    
    return {
      data: cached.data,
      isStale: isExpired
    };
  }, [ttl, staleWhileRevalidate]);
  
  const setCachedData = useCallback((cacheKey, data) => {
    // Gestion de la taille maximale du cache
    if (cache.current.size >= maxSize) {
      const firstKey = cache.current.keys().next().value;
      cache.current.delete(firstKey);
    }
    
    cache.current.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }, [maxSize]);
  
  const fetchData = useCallback(async (fetchKey = key) => {
    const cached = getCachedData(fetchKey);
    
    if (cached && !cached.isStale) {
      return cached.data;
    }
    
    try {
      const freshData = await fetchFn(fetchKey);
      setCachedData(fetchKey, freshData);
      return freshData;
    } catch (error) {
      // En cas d'erreur, retourner les données stale si disponibles
      if (cached?.data) {
        console.warn('Fetch failed, returning stale data:', error);
        return cached.data;
      }
      throw error;
    }
  }, [key, fetchFn, getCachedData, setCachedData]);
  
  const clearCache = useCallback((cacheKey) => {
    if (cacheKey) {
      cache.current.delete(cacheKey);
    } else {
      cache.current.clear();
    }
  }, []);
  
  return { fetchData, clearCache, getCachedData };
};

// Hook pour l'optimisation des rendus
export const useRenderOptimization = (deps = []) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  
  useEffect(() => {
    renderCount.current += 1;
    lastRenderTime.current = Date.now();
  });
  
  const memoizedValue = useMemo(() => {
    const now = Date.now();
    return {
      renderCount: renderCount.current,
      timeSinceLastRender: now - lastRenderTime.current,
      shouldOptimize: renderCount.current > 5 && (now - lastRenderTime.current) < 100
    };
  }, deps);
  
  return memoizedValue;
};

// Hook pour la gestion des observateurs d'intersection
export const useIntersectionObserver = (options = {}) => {
  const elementRef = useRef();
  const observerRef = useRef();
  const callbackRef = useRef();
  
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = false
  } = options;
  
  const observe = useCallback((callback) => {
    callbackRef.current = callback;
    
    if (!elementRef.current) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callbackRef.current?.(entry);
            
            if (triggerOnce) {
              observerRef.current.disconnect();
            }
          }
        });
      },
      { threshold, rootMargin }
    );
    
    observerRef.current.observe(elementRef.current);
  }, [threshold, rootMargin, triggerOnce]);
  
  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);
  
  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);
  
  return { elementRef, observe, disconnect };
};

// Hook pour la gestion des Web Workers
export const useWebWorker = (workerFn) => {
  const workerRef = useRef();
  const messageHandlers = useRef(new Map());
  
  const createWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    
    const blob = new Blob([`(${workerFn.toString()})()`], {
      type: 'application/javascript'
    });
    
    workerRef.current = new Worker(URL.createObjectURL(blob));
    
    workerRef.current.onmessage = (event) => {
      const { id, result, error } = event.data;
      const handler = messageHandlers.current.get(id);
      
      if (handler) {
        if (error) {
          handler.reject(new Error(error));
        } else {
          handler.resolve(result);
        }
        messageHandlers.current.delete(id);
      }
    };
  }, [workerFn]);
  
  const postMessage = useCallback((data) => {
    return new Promise((resolve, reject) => {
      const id = Date.now() + Math.random();
      
      messageHandlers.current.set(id, { resolve, reject });
      
      if (!workerRef.current) {
        createWorker();
      }
      
      workerRef.current.postMessage({ id, data });
    });
  }, [createWorker]);
  
  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    messageHandlers.current.clear();
  }, []);
  
  useEffect(() => {
    return () => terminate();
  }, [terminate]);
  
  return { postMessage, terminate, createWorker };
};

// Hook pour les métriques de performance
export const usePerformanceMetrics = () => {
  const metricsRef = useRef({
    renders: 0,
    avgRenderTime: 0,
    lastRenderStart: 0
  });
  
  const startMeasure = useCallback((name = 'render') => {
    metricsRef.current.lastRenderStart = performance.now();
    performance.mark(`${name}-start`);
  }, []);
  
  const endMeasure = useCallback((name = 'render') => {
    const endTime = performance.now();
    performance.mark(`${name}-end`);
    
    try {
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const renderTime = endTime - metricsRef.current.lastRenderStart;
      metricsRef.current.renders += 1;
      metricsRef.current.avgRenderTime = 
        (metricsRef.current.avgRenderTime * (metricsRef.current.renders - 1) + renderTime) / 
        metricsRef.current.renders;
      
    } catch (error) {
      console.warn('Performance measurement failed:', error);
    }
  }, []);
  
  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);
  
  const clearMetrics = useCallback(() => {
    metricsRef.current = {
      renders: 0,
      avgRenderTime: 0,
      lastRenderStart: 0
    };
    
    try {
      performance.clearMarks();
      performance.clearMeasures();
    } catch (error) {
      console.warn('Could not clear performance metrics:', error);
    }
  }, []);
  
  return {
    startMeasure,
    endMeasure,
    getMetrics,
    clearMetrics
  };
};