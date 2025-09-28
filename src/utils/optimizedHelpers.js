// Utilitaires optimisés pour performance maximale

// Debounce optimisé avec annulation
export const createOptimizedDebounce = (fn, delay, options = {}) => {
  const { immediate = false, maxWait = null } = options;
  let timeoutId;
  let lastCallTime;
  let lastInvokeTime = 0;
  let maxTimeoutId;
  let result;

  const invokeFunc = (time) => {
    const args = lastArgs;
    const thisArg = lastThis;
    
    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = fn.apply(thisArg, args);
    return result;
  };

  const startTimer = (pendingFunc, wait) => {
    return setTimeout(pendingFunc, wait);
  };

  const cancelTimer = (id) => {
    clearTimeout(id);
  };

  const leadingEdge = (time) => {
    lastInvokeTime = time;
    timeoutId = startTimer(timerExpired, delay);
    return immediate ? invokeFunc(time) : result;
  };

  const remainingWait = (time) => {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = delay - timeSinceLastCall;
    
    return maxWait !== null
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  };

  const shouldInvoke = (time) => {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    
    return (lastCallTime === undefined || (timeSinceLastCall >= delay) ||
            (timeSinceLastCall < 0) || (maxWait !== null && timeSinceLastInvoke >= maxWait));
  };

  const timerExpired = () => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutId = startTimer(timerExpired, remainingWait(time));
  };

  const trailingEdge = (time) => {
    timeoutId = undefined;
    
    if (lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  };

  let lastArgs, lastThis;

  const debounced = function(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    
    lastArgs = args;
    lastThis = this;
    lastCallTime = time;
    
    if (isInvoking) {
      if (timeoutId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxWait !== null) {
        timeoutId = startTimer(timerExpired, delay);
        return invokeFunc(lastCallTime);
      }
    }
    if (timeoutId === undefined) {
      timeoutId = startTimer(timerExpired, delay);
    }
    return result;
  };

  debounced.cancel = () => {
    if (timeoutId !== undefined) {
      cancelTimer(timeoutId);
    }
    if (maxTimeoutId !== undefined) {
      cancelTimer(maxTimeoutId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timeoutId = maxTimeoutId = undefined;
  };

  debounced.flush = () => {
    return timeoutId === undefined ? result : trailingEdge(Date.now());
  };

  debounced.pending = () => {
    return timeoutId !== undefined;
  };

  return debounced;
};

// Throttle optimisé avec options avancées
export const createOptimizedThrottle = (fn, wait, options = {}) => {
  const { leading = true, trailing = true } = options;
  return createOptimizedDebounce(fn, wait, {
    maxWait: wait,
    immediate: leading
  });
};

// Memoization avec gestion automatique du cache
export const createMemoizedFunction = (fn, options = {}) => {
  const { 
    maxSize = 100, 
    ttl = 5 * 60 * 1000, // 5 minutes
    keyGenerator = (...args) => JSON.stringify(args)
  } = options;
  
  const cache = new Map();
  const timestamps = new Map();
  
  const cleanup = () => {
    const now = Date.now();
    const keysToDelete = [];
    
    for (const [key, timestamp] of timestamps) {
      if (now - timestamp > ttl) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      cache.delete(key);
      timestamps.delete(key);
    });
  };

  const memoized = (...args) => {
    const key = keyGenerator(...args);
    
    // Cleanup périodique
    if (Math.random() < 0.01) { // 1% de chance à chaque appel
      cleanup();
    }
    
    // Vérifier le cache
    if (cache.has(key)) {
      const timestamp = timestamps.get(key);
      if (Date.now() - timestamp <= ttl) {
        return cache.get(key);
      } else {
        cache.delete(key);
        timestamps.delete(key);
      }
    }
    
    // Gestion de la taille du cache
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
      timestamps.delete(firstKey);
    }
    
    // Calculer et mettre en cache
    const result = fn(...args);
    cache.set(key, result);
    timestamps.set(key, Date.now());
    
    return result;
  };
  
  memoized.clear = () => {
    cache.clear();
    timestamps.clear();
  };
  
  memoized.delete = (...args) => {
    const key = keyGenerator(...args);
    cache.delete(key);
    timestamps.delete(key);
  };
  
  memoized.has = (...args) => {
    const key = keyGenerator(...args);
    return cache.has(key);
  };
  
  return memoized;
};

// Gestionnaire d'événements optimisé
export const createEventManager = () => {
  const listeners = new Map();
  
  const on = (event, callback, options = {}) => {
    const { once = false, priority = 0 } = options;
    
    if (!listeners.has(event)) {
      listeners.set(event, []);
    }
    
    const listener = { callback, once, priority, id: Math.random() };
    const eventListeners = listeners.get(event);
    
    // Insérer selon la priorité (plus haute priorité en premier)
    let inserted = false;
    for (let i = 0; i < eventListeners.length; i++) {
      if (priority > eventListeners[i].priority) {
        eventListeners.splice(i, 0, listener);
        inserted = true;
        break;
      }
    }
    
    if (!inserted) {
      eventListeners.push(listener);
    }
    
    return () => off(event, listener.id);
  };
  
  const off = (event, listenerId) => {
    if (!listeners.has(event)) return;
    
    const eventListeners = listeners.get(event);
    const index = eventListeners.findIndex(l => l.id === listenerId);
    
    if (index !== -1) {
      eventListeners.splice(index, 1);
      
      if (eventListeners.length === 0) {
        listeners.delete(event);
      }
    }
  };
  
  const emit = (event, ...args) => {
    if (!listeners.has(event)) return [];
    
    const eventListeners = [...listeners.get(event)]; // Copie pour éviter les modifications concurrentes
    const results = [];
    
    for (const listener of eventListeners) {
      try {
        const result = listener.callback(...args);
        results.push(result);
        
        if (listener.once) {
          off(event, listener.id);
        }
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    }
    
    return results;
  };
  
  const clear = (event) => {
    if (event) {
      listeners.delete(event);
    } else {
      listeners.clear();
    }
  };
  
  return { on, off, emit, clear };
};

// Pool d'objets pour éviter les allocations fréquentes
export const createObjectPool = (createFn, resetFn, maxSize = 50) => {
  const pool = [];
  let created = 0;
  
  const get = () => {
    if (pool.length > 0) {
      return pool.pop();
    }
    
    if (created < maxSize) {
      created++;
      return createFn();
    }
    
    // Si le pool est plein, créer un nouvel objet (sera GC plus tard)
    return createFn();
  };
  
  const release = (obj) => {
    if (pool.length < maxSize) {
      if (resetFn) {
        resetFn(obj);
      }
      pool.push(obj);
    }
  };
  
  const clear = () => {
    pool.length = 0;
    created = 0;
  };
  
  return { get, release, clear };
};

// Utilitaires de performance
export const performanceUtils = {
  // Mesure le temps d'exécution d'une fonction
  measure: (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name}: ${end - start}ms`);
    return result;
  },
  
  // Mesure le temps d'exécution asynchrone
  measureAsync: async (name, fn) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`${name}: ${end - start}ms`);
    return result;
  },
  
  // Batch plusieurs opérations pour éviter les layouts répétés
  batchDOMUpdates: (updates) => {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  },
  
  // Idle callback pour les tâches non critiques
  scheduleIdleTask: (task, options = {}) => {
    const { timeout = 5000 } = options;
    
    if ('requestIdleCallback' in window) {
      return requestIdleCallback(task, { timeout });
    } else {
      // Fallback pour les navigateurs non supportés
      return setTimeout(task, 0);
    }
  }
};

// Utilitaires de validation optimisés
export const validationUtils = {
  isEmail: createMemoizedFunction((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }),
  
  isUrl: createMemoizedFunction((url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }),
  
  isJson: createMemoizedFunction((str) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  })
};

// Utilitaires de formatage optimisés
export const formatUtils = {
  formatBytes: createMemoizedFunction((bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }),
  
  formatDuration: createMemoizedFunction((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }),
  
  formatNumber: createMemoizedFunction((num, locale = 'fr-FR') => {
    return new Intl.NumberFormat(locale).format(num);
  })
};