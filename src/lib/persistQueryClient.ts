/**
 * Plugin React Query pour persistence avec IndexedDB
 * Permet de garder le cache en mémoire entre les sessions
 */

import { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
import { getCacheItem, setCacheItem, deleteCacheItem } from './indexedDB';

const PERSIST_KEY = 'react-query-cache';

/**
 * Crée un persister IndexedDB pour React Query
 */
export function createIDBPersister(): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      try {
        await setCacheItem(PERSIST_KEY, client);
        console.log('[React Query] Cache persisted to IndexedDB');
      } catch (error) {
        console.error('[React Query] Failed to persist cache:', error);
      }
    },
    restoreClient: async () => {
      try {
        const cached = await getCacheItem<PersistedClient>(PERSIST_KEY);
        if (cached) {
          console.log('[React Query] Cache restored from IndexedDB');
        }
        return cached;
      } catch (error) {
        console.error('[React Query] Failed to restore cache:', error);
        return undefined;
      }
    },
    removeClient: async () => {
      try {
        await deleteCacheItem(PERSIST_KEY);
        console.log('[React Query] Cache removed from IndexedDB');
      } catch (error) {
        console.error('[React Query] Failed to remove cache:', error);
      }
    },
  };
}
