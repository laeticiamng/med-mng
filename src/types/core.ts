/**
 * 🎯 TYPES CORE - MED-MNG v3.0
 * Types fondamentaux réutilisables
 */

// ==========================================
// TYPES DE BASE RÉUTILISABLES
// ==========================================

export type ID = string;
export type Timestamp = string;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

// Status générique
export type Status = 'pending' | 'loading' | 'success' | 'error' | 'idle';
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

// Réponses API standardisées
export interface ApiResponse<T = JSONObject> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T = JSONObject> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ==========================================
// TYPES HOOKS & STATE MANAGEMENT
// ==========================================

export interface AsyncState<T = JSONObject> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch?: Timestamp;
}

export interface CacheEntry<T = JSONValue> {
  data: T;
  timestamp: Timestamp;
  ttl: number;
  key: string;
}

export interface HookConfig {
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  retry?: boolean | number;
  retryDelay?: number;
  staleTime?: number;
  cacheTime?: number;
}

// ==========================================
// UTILITAIRES DE TYPES
// ==========================================

// Type pour les handlers d'événements
export type EventHandler<T = Element> = (event: Event & { target: T }) => void;

// Type pour les refs React
export type RefObject<T> = { current: T | null };

// Type pour les composants React
export type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;