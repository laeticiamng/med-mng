/**
 * Service API centralisé avec gestion d'erreurs et retry automatique
 */

import { logger } from '@/lib/logger';
import type { ApiResponse, PaginatedResponse } from '@/types';

export interface ApiServiceConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  retryAttempts?: number;
  skipAuth?: boolean;
}

class ApiService {
  private config: ApiServiceConfig;
  private authToken: string | null = null;

  constructor(config: Partial<ApiServiceConfig> = {}) {
    this.config = {
      baseUrl: import.meta.env.VITE_API_URL || '',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    attempts: number = this.config.retryAttempts
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempts > 1 && this.shouldRetry(error)) {
        logger.warn('Tentative de retry API', {
          component: 'ApiService',
          action: 'retry',
          metadata: { 
            attemptsLeft: attempts - 1,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
        
        await this.delay(this.config.retryDelay);
        return this.withRetry(operation, attempts - 1);
      }
      throw error;
    }
  }

  private shouldRetry(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    
    // Retry sur les erreurs réseau et 5xx
    const retryableErrors = ['NetworkError', 'TimeoutError'];
    return retryableErrors.some(type => error.message.includes(type)) ||
           (error as any).status >= 500;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async createRequest(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<Response> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const {
      timeout = this.config.timeout,
      skipAuth = false,
      ...fetchOptions
    } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string> || {})
    };

    if (!skipAuth && this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('TimeoutError: Request timed out');
        }
        if (!navigator.onLine) {
          throw new Error('NetworkError: No internet connection');
        }
      }
      
      throw error;
    }
  }

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.withRetry(async () => {
      logger.debug('API GET request', {
        component: 'ApiService',
        action: 'get',
        metadata: { endpoint }
      });

      const response = await this.createRequest(endpoint, {
        method: 'GET',
        ...options
      });

      const data = await response.json();
      
      logger.debug('API GET success', {
        component: 'ApiService',
        action: 'get_success',
        metadata: { endpoint, status: response.status }
      });

      return data;
    });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.withRetry(async () => {
      logger.debug('API POST request', {
        component: 'ApiService',
        action: 'post',
        metadata: { endpoint }
      });

      const response = await this.createRequest(endpoint, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
        ...options
      });

      const data = await response.json();
      
      logger.debug('API POST success', {
        component: 'ApiService',
        action: 'post_success',
        metadata: { endpoint, status: response.status }
      });

      return data;
    });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.withRetry(async () => {
      const response = await this.createRequest(endpoint, {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
        ...options
      });

      return response.json();
    });
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.withRetry(async () => {
      const response = await this.createRequest(endpoint, {
        method: 'DELETE',
        ...options
      });

      return response.json();
    });
  }

  // Méthode spécialisée pour les requêtes paginées
  async getPaginated<T>(
    endpoint: string,
    params: Record<string, string | number> = {},
    options: RequestOptions = {}
  ): Promise<PaginatedResponse<T>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });

    const url = `${endpoint}?${searchParams.toString()}`;
    return this.get<T[]>(url, options) as Promise<PaginatedResponse<T>>;
  }
}

// Instance singleton
export const apiService = new ApiService();