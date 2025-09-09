/**
 * Hook pour gérer le localStorage de manière type-safe
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logger.warn('Erreur lecture localStorage', {
        component: 'useLocalStorage',
        action: 'read',
        key,
        metadata: { error }
      });
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
      logger.debug('Valeur sauvegardée dans localStorage', {
        component: 'useLocalStorage',
        action: 'write',
        key
      });
    } catch (error) {
      logger.error('Erreur sauvegarde localStorage', {
        component: 'useLocalStorage',
        action: 'write',
        key,
        metadata: { error }
      });
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      
      logger.debug('Valeur supprimée du localStorage', {
        component: 'useLocalStorage',
        action: 'remove',
        key
      });
    } catch (error) {
      logger.error('Erreur suppression localStorage', {
        component: 'useLocalStorage',
        action: 'remove',
        key,
        metadata: { error }
      });
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}