/**
 * API Client with OpenAPI Integration
 * Type-safe API client generated from OpenAPI specification
 */

import { supabase } from '@/integrations/supabase/client';

export interface APIClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  validateRequest?: boolean;
  validateResponse?: boolean;
}

export interface APIResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
  success: boolean;
}

export interface APIError {
  error: string;
  code: number;
  message: string;
  timestamp: string;
  requestId?: string;
  details?: any;
}

export class APIClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private validateRequest: boolean;
  private validateResponse: boolean;

  constructor(config: APIClientConfig = {}) {
    this.baseURL = config.baseURL || 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1';
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;
    this.validateRequest = config.validateRequest || false;
    this.validateResponse = config.validateResponse || false;
  }

  /**
   * Make authenticated request using Supabase Edge Functions
   */
  private async makeRequest<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: any;
      headers?: Record<string, string>;
      validateSchema?: any;
    } = {}
  ): Promise<APIResponse<T>> {
    const { method = 'GET', body, headers = {}, validateSchema } = options;

    try {
      // Get authentication token
      const { _data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      // Validate request body if schema provided
      if (validateSchema && body && this.validateRequest) {
        try {
          validateSchema.parse(body);
        } catch (validationError) {
          throw new Error(`Request validation failed: ${validationError.message}`);
        }
      }

      const requestOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      };

      let lastError: Error;
      let attempt = 0;

      while (attempt < this.retries) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.timeout);

          const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...requestOptions,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          const responseData = await response.json();

          if (!response.ok) {
            const apiError: APIError = {
              error: responseData.error || 'UNKNOWN_ERROR',
              code: response.status,
              message: responseData.message || 'An error occurred',
              timestamp: responseData.timestamp || new Date().toISOString(),
              requestId: responseData.requestId,
              details: responseData.details,
            };
            throw new APIErrorException(apiError);
          }

          // Validate response if schema provided
          if (validateSchema && this.validateResponse) {
            try {
              validateSchema.parse(responseData);
            } catch (validationError) {
              console.warn('Response validation failed:', validationError.message);
            }
          }

          return {
            data: responseData,
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            success: true,
          };

        } catch (error) {
          lastError = error as Error;
          attempt++;

          // Don't retry on client errors (4xx) or validation errors
          if (error instanceof APIErrorException && error.apiError.code < 500) {
            throw error;
          }

          if (attempt < this.retries) {
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }

      throw lastError!;

    } catch (error) {
      if (error instanceof APIErrorException) {
        throw error;
      }

      throw new APIErrorException({
        error: 'NETWORK_ERROR',
        code: 0,
        message: error.message || 'Network request failed',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Medical Music Management API
  async getSubscriptions(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<APIResponse<{ success: boolean; data: any[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.offset) queryParams.set('offset', params.offset.toString());

    return this.makeRequest(`/med-mng-api/subscriptions?${queryParams}`);
  }

  async createSubscription(data: {
    type: 'basic' | 'premium' | 'professional';
    paymentMethodId?: string;
    promoCode?: string;
  }): Promise<APIResponse<{ success: boolean; data: any }>> {
    return this.makeRequest('/med-mng-api/subscriptions', {
      method: 'POST',
      body: data,
    });
  }

  async getSongs(params: {
    genre?: string;
    category?: string;
    limit?: number;
    search?: string;
  } = {}): Promise<APIResponse<{ success: boolean; data: any[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.set(key, value.toString());
    });

    return this.makeRequest(`/med-mng-api/songs?${queryParams}`);
  }

  async createSong(data: {
    itemCode: string;
    genre: string;
    customPrompt?: string;
    targetDuration?: number;
  }): Promise<APIResponse<{ success: boolean; data: any }>> {
    return this.makeRequest('/med-mng-api/songs', {
      method: 'POST',
      body: data,
    });
  }

  async addToLibrary(songId: string): Promise<APIResponse<{ success: boolean }>> {
    return this.makeRequest(`/med-mng-api/library/${songId}`, {
      method: 'POST',
    });
  }

  async removeFromLibrary(songId: string): Promise<APIResponse<{ success: boolean }>> {
    return this.makeRequest(`/med-mng-api/library/${songId}`, {
      method: 'DELETE',
    });
  }

  // Error Handling Service
  async logError(errorData: {
    error: {
      message: string;
      stack?: string;
      name?: string;
      category: string;
      severity: string;
      code: number;
      retryable?: boolean;
      requestId?: string;
    };
    context: {
      userId?: string;
      userAgent?: string;
      url?: string;
      component?: string;
      action?: string;
      metadata?: any;
    };
    timestamp: string;
  }): Promise<APIResponse<{ success: boolean; errorId: string; patternAnalysis: any }>> {
    return this.makeRequest('/error-handling-service', {
      method: 'POST',
      body: errorData,
    });
  }

  async getErrorPatterns(params: {
    timeframe?: string;
    category?: string;
    severity?: string;
  } = {}): Promise<APIResponse<{ patterns: any[]; timeframe: string }>> {
    const queryParams = new URLSearchParams({ action: 'patterns', ...params });
    return this.makeRequest(`/error-handling-service?${queryParams}`);
  }

  async getErrorStats(params: {
    timeframe?: string;
  } = {}): Promise<APIResponse<{ stats: any; timeframe: string }>> {
    const queryParams = new URLSearchParams({ action: 'stats', ...params });
    return this.makeRequest(`/error-handling-service?${queryParams}`);
  }

  // Content Extraction
  async startExtraction(data: {
    startItem?: number;
    endItem?: number;
    forceRefresh?: boolean;
  } = {}): Promise<APIResponse<{ success: boolean; extractionId: string; status: string; progress: any }>> {
    return this.makeRequest('/extract-edn-uness-complete', {
      method: 'POST',
      body: data,
    });
  }

  // Payments
  async createCheckoutSession(data: {
    subscriptionType: string;
    successUrl?: string;
    cancelUrl?: string;
    customerEmail?: string;
  }): Promise<APIResponse<{ sessionId: string; url: string }>> {
    return this.makeRequest('/create-subscription-checkout', {
      method: 'POST',
      body: data,
    });
  }

  // System
  async healthCheck(): Promise<APIResponse<{ status: string; timestamp: string; version: string }>> {
    return this.makeRequest('/health');
  }

  async getCsrfToken(): Promise<APIResponse<{ token: string; expiresAt: string }>> {
    return this.makeRequest('/csrf-token');
  }
}

export class APIErrorException extends Error {
  public readonly apiError: APIError;

  constructor(apiError: APIError) {
    super(apiError.message);
    this.name = 'APIErrorException';
    this.apiError = apiError;
  }

  get isRetryable(): boolean {
    return this.apiError.code >= 500 || 
           this.apiError.code === 429 ||
           this.apiError.error.includes('NETWORK') ||
           this.apiError.error.includes('TIMEOUT');
  }

  get isClientError(): boolean {
    return this.apiError.code >= 400 && this.apiError.code < 500;
  }

  get isServerError(): boolean {
    return this.apiError.code >= 500;
  }
}

// Create default client instance
export const apiClient = new APIClient({
  validateRequest: true,
  validateResponse: false, // Enable when schemas are ready
  retries: 3,
  timeout: 30000,
});

// Utility function for handling API calls with error boundaries
export async function withAPIErrorHandling<T>(
  apiCall: () => Promise<APIResponse<T>>,
  errorContext?: string
): Promise<T> {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    if (error instanceof APIErrorException) {
      // Log to our error handling service
      try {
        await apiClient.logError({
          error: {
            message: error.message,
            name: error.name,
            category: 'external_api',
            severity: error.isServerError ? 'high' : 'medium',
            code: error.apiError.code,
            retryable: error.isRetryable,
            requestId: error.apiError.requestId,
          },
          context: {
            component: errorContext || 'api-client',
            url: window.location.href,
            userAgent: navigator.userAgent,
            metadata: { originalError: error.apiError },
          },
          timestamp: new Date().toISOString(),
        });
      } catch (loggingError) {
        console.error('Failed to log API error:', loggingError);
      }

      throw error;
    }

    // Handle non-API errors
    throw new APIErrorException({
      error: 'CLIENT_ERROR',
      code: 0,
      message: error.message || 'Unknown client error',
      timestamp: new Date().toISOString(),
    });
  }
}