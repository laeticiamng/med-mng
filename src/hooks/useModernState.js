import { useCallback, useRef, useMemo, useReducer, useEffect } from 'react';
import { createEventManager } from '@/utils/optimizedHelpers';

// Hook de state moderne avec immer-like updates
export const useModernState = (initialState) => {
  const stateRef = useRef(initialState);
  const listenersRef = useRef(new Set());
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const setState = useCallback((updater) => {
    const currentState = stateRef.current;
    const newState = typeof updater === 'function' 
      ? updater(currentState) 
      : updater;

    // Shallow comparison pour éviter les re-renders inutiles
    if (newState !== currentState && !shallowEqual(newState, currentState)) {
      stateRef.current = newState;
      
      // Notifier tous les listeners
      listenersRef.current.forEach(listener => {
        try {
          listener(newState, currentState);
        } catch (error) {
          console.error('State listener error:', error);
        }
      });
      
      forceUpdate();
    }
  }, []);

  const subscribe = useCallback((listener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const getState = useCallback(() => stateRef.current, []);

  return [stateRef.current, setState, { subscribe, getState }];
};

// Hook pour state avec historique
export const useStateWithHistory = (initialState, maxHistory = 10) => {
  const [state, setState] = useModernState(initialState);
  const historyRef = useRef([initialState]);
  const currentIndexRef = useRef(0);

  const updateState = useCallback((updater) => {
    setState(updater);
    
    const newState = typeof updater === 'function' ? updater(state) : updater;
    
    // Ajouter à l'historique
    const newHistory = [...historyRef.current.slice(0, currentIndexRef.current + 1), newState];
    
    // Limiter la taille de l'historique
    if (newHistory.length > maxHistory) {
      newHistory.shift();
    } else {
      currentIndexRef.current++;
    }
    
    historyRef.current = newHistory;
  }, [state, setState, maxHistory]);

  const undo = useCallback(() => {
    if (currentIndexRef.current > 0) {
      currentIndexRef.current--;
      setState(historyRef.current[currentIndexRef.current]);
    }
  }, [setState]);

  const redo = useCallback(() => {
    if (currentIndexRef.current < historyRef.current.length - 1) {
      currentIndexRef.current++;
      setState(historyRef.current[currentIndexRef.current]);
    }
  }, [setState]);

  const canUndo = currentIndexRef.current > 0;
  const canRedo = currentIndexRef.current < historyRef.current.length - 1;

  return [
    state, 
    updateState, 
    { 
      undo, 
      redo, 
      canUndo, 
      canRedo, 
      history: historyRef.current,
      currentIndex: currentIndexRef.current 
    }
  ];
};

// Hook pour state asynchrone avec suspense
export const useAsyncState = (asyncFn, deps = []) => {
  const [state, setState] = useModernState({
    data: null,
    loading: true,
    error: null
  });

  const executeAsync = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await asyncFn();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error }));
    }
  }, deps);

  useEffect(() => {
    executeAsync();
  }, [executeAsync]);

  const refetch = useCallback(() => {
    executeAsync();
  }, [executeAsync]);

  return [state, { refetch, execute: executeAsync }];
};

// Hook pour state avec validation
export const useValidatedState = (initialState, validators = {}) => {
  const [state, setState] = useModernState(initialState);
  const [errors, setErrors] = useModernState({});

  const validateField = useCallback((field, value) => {
    const validator = validators[field];
    if (!validator) return null;

    try {
      const result = validator(value, state);
      return result === true ? null : result;
    } catch (error) {
      return error.message || 'Validation error';
    }
  }, [validators, state]);

  const updateField = useCallback((field, value) => {
    // Mettre à jour la valeur
    setState(prev => ({ ...prev, [field]: value }));
    
    // Valider le champ
    const error = validateField(field, value);
    setErrors(prev => ({ 
      ...prev, 
      [field]: error 
    }));
  }, [setState, setErrors, validateField]);

  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validators).forEach(field => {
      const error = validateField(field, state[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validators, state, validateField, setErrors]);

  const isValid = useMemo(() => {
    return Object.values(errors).every(error => !error);
  }, [errors]);

  return [
    state,
    { 
      updateField, 
      setState, 
      validateAll, 
      isValid, 
      errors 
    }
  ];
};

// Hook pour state avec synchronisation
export const useSyncedState = (key, initialState, storage = localStorage) => {
  const [state, setState] = useModernState(() => {
    try {
      const stored = storage.getItem(key);
      return stored ? JSON.parse(stored) : initialState;
    } catch {
      return initialState;
    }
  });

  const updateState = useCallback((updater) => {
    setState(updater);
    
    const newState = typeof updater === 'function' ? updater(state) : updater;
    
    try {
      storage.setItem(key, JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to sync state to storage:', error);
    }
  }, [key, state, setState, storage]);

  // Écouter les changements depuis d'autres onglets
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          setState(newState);
        } catch (error) {
          console.error('Failed to parse synced state:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, setState]);

  return [state, updateState];
};

// Hook pour state avec middlewares
export const useStateWithMiddleware = (initialState, middlewares = []) => {
  const [state, setState] = useModernState(initialState);
  const eventManager = useRef(createEventManager());

  const enhancedSetState = useCallback((updater) => {
    const currentState = state;
    const newState = typeof updater === 'function' ? updater(currentState) : updater;
    
    let processedState = newState;
    
    // Appliquer les middlewares
    for (const middleware of middlewares) {
      try {
        processedState = middleware(processedState, currentState, {
          getState: () => state,
          emit: eventManager.current.emit
        }) ?? processedState;
      } catch (error) {
        console.error('Middleware error:', error);
      }
    }
    
    setState(processedState);
    
    // Émettre les événements
    eventManager.current.emit('stateChange', processedState, currentState);
  }, [state, setState, middlewares]);

  return [
    state, 
    enhancedSetState, 
    { 
      on: eventManager.current.on,
      off: eventManager.current.off,
      emit: eventManager.current.emit
    }
  ];
};

// Utilitaire pour shallow comparison
function shallowEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return false;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key) || obj1[key] !== obj2[key]) {
      return false;
    }
  }
  
  return true;
}

// Middlewares prédéfinis
export const stateMiddlewares = {
  // Logger middleware
  logger: (newState, oldState, { emit }) => {
    console.group('State Update');
    console.log('Previous:', oldState);
    console.log('Next:', newState);
    console.groupEnd();
    return newState;
  },
  
  // Persistence middleware
  persistence: (key, storage = localStorage) => (newState, oldState) => {
    try {
      storage.setItem(key, JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
    return newState;
  },
  
  // Validation middleware
  validation: (schema) => (newState, oldState) => {
    try {
      if (schema.validate) {
        const result = schema.validate(newState);
        if (!result.valid) {
          console.warn('State validation failed:', result.errors);
          return oldState; // Revenir à l'état précédent si invalide
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
      return oldState;
    }
    return newState;
  }
};