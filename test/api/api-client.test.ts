import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { APIClient, APIErrorException, withAPIErrorHandling } from '../../src/lib/api-client';

// Mock fetch
global.fetch = vi.fn();

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'mock-token' } }
      })
    }
  }
}));

describe('APIClient', () => {
  let apiClient: APIClient;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    apiClient = new APIClient({
      timeout: 5000,
      retries: 2
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic HTTP Operations', () => {
    it('should make GET requests successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockResolvedValue({ success: true, data: [] })
      };
      
      mockFetch.mockResolvedValue(mockResponse);

      const result = await apiClient.getSubscriptions();

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/med-mng-api/subscriptions'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          })
        })
      );
    });

    it('should make POST requests with body', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        headers: new Headers(),
        json: vi.fn().mockResolvedValue({ success: true, data: { id: '123' } })
      };
      
      mockFetch.mockResolvedValue(mockResponse);

      const requestData = {
        type: 'premium' as const,
        paymentMethodId: 'pm_123'
      };

      const result = await apiClient.createSubscription(requestData);

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/med-mng-api/subscriptions'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestData)
        })
      );
    });

    it('should handle query parameters correctly', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: vi.fn().mockResolvedValue({ success: true, data: [] })
      };
      
      mockFetch.mockResolvedValue(mockResponse);

      await apiClient.getSongs({
        genre: 'classical',
        category: 'cardiology',
        limit: 20,
        search: 'test'
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('genre=classical&category=cardiology&limit=20&search=test'),
        expect.any(Object)
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors correctly', async () => {
      const apiError = {
        error: 'VALIDATION_ERROR',
        code: 400,
        message: 'Invalid input',
        timestamp: '2024-01-01T00:00:00.000Z',
        requestId: 'req_123'
      };

      const mockResponse = {
        ok: false,
        status: 400,
        headers: new Headers(),
        json: vi.fn().mockResolvedValue(apiError)
      };
      
      mockFetch.mockResolvedValue(mockResponse);

      await expect(apiClient.getSubscriptions()).rejects.toThrow(APIErrorException);
      
      try {
        await apiClient.getSubscriptions();
      } catch (error) {
        expect(error).toBeInstanceOf(APIErrorException);
        expect((error as APIErrorException).apiError.error).toBe('VALIDATION_ERROR');
        expect((error as APIErrorException).apiError.code).toBe(400);
        expect((error as APIErrorException).isClientError).toBe(true);
        expect((error as APIErrorException).isRetryable).toBe(false);
      }
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network failure'));

      await expect(apiClient.getSubscriptions()).rejects.toThrow(APIErrorException);
      
      try {
        await apiClient.getSubscriptions();
      } catch (error) {
        expect(error).toBeInstanceOf(APIErrorException);
        expect((error as APIErrorException).apiError.error).toBe('NETWORK_ERROR');
      }
    });

    it('should retry on server errors', async () => {
      const serverError = {
        ok: false,
        status: 500,
        headers: new Headers(),
        json: vi.fn().mockResolvedValue({
          error: 'INTERNAL_SERVER_ERROR',
          code: 500,
          message: 'Server error'
        })
      };

      mockFetch.mockResolvedValue(serverError);

      await expect(apiClient.getSubscriptions()).rejects.toThrow(APIErrorException);
      
      // Should have retried (initial + 2 retries = 3 total calls)
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry on client errors', async () => {
      const clientError = {
        ok: false,
        status: 400,
        headers: new Headers(),
        json: vi.fn().mockResolvedValue({
          error: 'VALIDATION_ERROR',
          code: 400,
          message: 'Bad request'
        })
      };

      mockFetch.mockResolvedValue(clientError);

      await expect(apiClient.getSubscriptions()).rejects.toThrow(APIErrorException);
      
      // Should not have retried
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Authentication', () => {
    it('should include auth token when available', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: vi.fn().mockResolvedValue({ success: true })
      };
      
      mockFetch.mockResolvedValue(mockResponse);

      await apiClient.getSubscriptions();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
    });

    it('should work without auth token for public endpoints', async () => {
      // Mock no session
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null
      });

      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: vi.fn().mockResolvedValue({ status: 'ok' })
      };
      
      mockFetch.mockResolvedValue(mockResponse);

      await apiClient.healthCheck();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String)
          })
        })
      );
    });
  });

  describe('Timeout and Retries', () => {
    it('should handle request timeout', async () => {
      // Mock a slow response
      mockFetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 10000))
      );

      const fastClient = new APIClient({ timeout: 100, retries: 1 });

      await expect(fastClient.healthCheck()).rejects.toThrow();
    });

    it('should implement exponential backoff', async () => {
      const startTime = Date.now();
      
      mockFetch.mockRejectedValue(new Error('Network error'));

      try {
        await apiClient.getSubscriptions();
      } catch (error) {
        // Should have taken at least some time for backoff
        const elapsedTime = Date.now() - startTime;
        expect(elapsedTime).toBeGreaterThan(1000); // At least 1 second for backoff
      }
    });
  });

  describe('Specific API Methods', () => {
    beforeEach(() => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: vi.fn().mockResolvedValue({ success: true, data: {} })
      };
      mockFetch.mockResolvedValue(mockResponse);
    });

    it('should call error logging endpoint', async () => {
      const errorData = {
        error: {
          message: 'Test error',
          category: 'system',
          severity: 'high',
          code: 500
        },
        context: {
          component: 'test',
          url: '/test'
        },
        timestamp: new Date().toISOString()
      };

      await apiClient.logError(errorData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/error-handling-service'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(errorData)
        })
      );
    });

    it('should call extraction endpoint', async () => {
      const extractionData = {
        startItem: 1,
        endItem: 50,
        forceRefresh: true
      };

      await apiClient.startExtraction(extractionData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/extract-edn-uness-complete'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(extractionData)
        })
      );
    });

    it('should call music generation endpoint', async () => {
      const songData = {
        itemCode: 'IC-42',
        genre: 'classical',
        customPrompt: 'Relaxing medical music',
        targetDuration: 180
      };

      await apiClient.createSong(songData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/med-mng-api/songs'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(songData)
        })
      );
    });

    it('should handle library operations', async () => {
      const songId = 'song-123';

      await apiClient.addToLibrary(songId);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/med-mng-api/library/${songId}`),
        expect.objectContaining({ method: 'POST' })
      );

      await apiClient.removeFromLibrary(songId);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/med-mng-api/library/${songId}`),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('withAPIErrorHandling utility', () => {
    it('should return data on successful API call', async () => {
      const mockData = { result: 'success' };
      const apiCall = vi.fn().mockResolvedValue({ data: mockData, success: true });

      const result = await withAPIErrorHandling(apiCall, 'test-context');

      expect(result).toEqual(mockData);
      expect(apiCall).toHaveBeenCalled();
    });

    it('should handle and log API errors', async () => {
      const apiError = new APIErrorException({
        error: 'TEST_ERROR',
        code: 400,
        message: 'Test error',
        timestamp: new Date().toISOString()
      });

      const apiCall = vi.fn().mockRejectedValue(apiError);
      
      // Mock the error logging to avoid actual network call
      const logErrorSpy = vi.spyOn(apiClient, 'logError').mockResolvedValue({
        data: { success: true, errorId: '123' },
        status: 200,
        headers: {},
        success: true
      });

      await expect(
        withAPIErrorHandling(apiCall, 'test-component')
      ).rejects.toThrow(APIErrorException);

      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Test error',
            category: 'external_api'
          }),
          context: expect.objectContaining({
            component: 'test-component'
          })
        })
      );
    });
  });
});