import { useState, useCallback, useRef, useEffect } from 'react';

// Pure JS state management hook - plus simple que Redux ou Zustand
export function useSimpleState(initialState = {}) {
  const [state, setState] = useState(initialState);
  const listeners = useRef(new Set());

  // Update function similaire à Zustand mais plus simple
  const updateState = useCallback((updater) => {
    setState(currentState => {
      const newState = typeof updater === 'function' 
        ? updater(currentState) 
        : { ...currentState, ...updater };
      
      // Notify listeners
      listeners.current.forEach(listener => listener(newState, currentState));
      return newState;
    });
  }, []);

  // Subscribe to state changes
  const subscribe = useCallback((listener) => {
    listeners.current.add(listener);
    return () => listeners.current.delete(listener);
  }, []);

  // Get specific value from state
  const getValue = useCallback((key) => {
    return key ? state[key] : state;
  }, [state]);

  // Set specific value in state
  const setValue = useCallback((key, value) => {
    updateState(currentState => ({
      ...currentState,
      [key]: typeof value === 'function' ? value(currentState[key]) : value
    }));
  }, [updateState]);

  // Reset state to initial
  const resetState = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  return {
    state,
    updateState,
    subscribe,
    getValue,
    setValue,
    resetState
  };
}

// Pure JS global state manager - alternative simple à Zustand
const globalStores = new Map();

export function createGlobalStore(name, initialState = {}) {
  if (globalStores.has(name)) {
    return globalStores.get(name);
  }

  let state = initialState;
  const listeners = new Set();

  const store = {
    getState: () => state,
    setState: (updater) => {
      const newState = typeof updater === 'function' 
        ? updater(state) 
        : { ...state, ...updater };
      
      const oldState = state;
      state = newState;
      
      listeners.forEach(listener => listener(newState, oldState));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };

  globalStores.set(name, store);
  return store;
}

// Hook pour utiliser un store global
export function useGlobalStore(name, selector) {
  const store = globalStores.get(name);
  
  if (!store) {
    throw new Error(`Store "${name}" not found. Create it first with createGlobalStore.`);
  }

  const [state, setState] = useState(() => 
    selector ? selector(store.getState()) : store.getState()
  );

  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      const selectedState = selector ? selector(newState) : newState;
      setState(selectedState);
    });

    return unsubscribe;
  }, [store, selector]);

  return [state, store.setState];
}

// Utilitaires pour la gestion d'état locale
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  
  return [value, { toggle, setTrue, setFalse, setValue }];
}

export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  const set = useCallback((value) => setCount(value), []);
  
  return [count, { increment, decrement, reset, set }];
}

// Hook pour la gestion des formulaires simple
export function useForm(initialValues = {}, validationRules = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const setTouched = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    
    Object.entries(validationRules).forEach(([field, rules]) => {
      const value = values[field];
      
      if (rules.required && (!value || value.toString().trim() === '')) {
        newErrors[field] = `${field} est requis`;
        return;
      }
      
      if (rules.minLength && value && value.length < rules.minLength) {
        newErrors[field] = `${field} doit contenir au moins ${rules.minLength} caractères`;
        return;
      }
      
      if (rules.email && value && !/\S+@\S+\.\S+/.test(value)) {
        newErrors[field] = `${field} doit être un email valide`;
        return;
      }
      
      if (rules.custom && typeof rules.custom === 'function') {
        const customError = rules.custom(value, values);
        if (customError) {
          newErrors[field] = customError;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);

  const handleSubmit = useCallback((onSubmit) => (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(values);
    }
  }, [values, validate]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    setValue,
    setTouched,
    validate,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0
  };
}