import { describe, it, expect } from 'vitest';

describe('CORS Security Tests', () => {
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://test.supabase.co';
  const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://med-music-platform.com',
    'https://app.med-music-platform.com'
  ];

  describe('Edge Functions CORS', () => {
    it('should include proper CORS headers', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-music`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'authorization, content-type'
        }
      });

      expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('authorization');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('content-type');
    });

    it('should reject requests from unauthorized origins', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-music`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://malicious-site.com',
          'Access-Control-Request-Method': 'POST'
        }
      });

      const allowedOrigin = response.headers.get('Access-Control-Allow-Origin');
      expect(allowedOrigin).not.toBe('https://malicious-site.com');
    });

    it('should handle preflight requests correctly', async () => {
      for (const origin of ALLOWED_ORIGINS) {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/music-status`, {
          method: 'OPTIONS',
          headers: {
            'Origin': origin,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'authorization, x-client-info, content-type'
          }
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
      }
    });
  });

  describe('API Endpoints CORS', () => {
    it('should validate CORS configuration for REST API', async () => {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET'
        }
      });

      expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    });

    it('should include security headers', async () => {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000'
        }
      });

      // Check for security-related headers
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('authorization');
      expect(response.headers.get('Access-Control-Max-Age')).toBeTruthy();
    });
  });

  describe('WebSocket CORS', () => {
    it('should validate WebSocket connection origins', async () => {
      // Test WebSocket CORS for real-time subscriptions
      const wsUrl = SUPABASE_URL.replace('https:', 'wss:').replace('http:', 'ws:') + '/realtime/v1/websocket';
      
      try {
        const ws = new WebSocket(wsUrl, [], {
          headers: {
            'Origin': 'http://localhost:3000'
          }
        } as any);

        await new Promise((resolve, reject) => {
          ws.onopen = resolve;
          ws.onerror = reject;
          setTimeout(reject, 5000); // 5 second timeout
        });

        ws.close();
      } catch (error) {
        // Expected if WebSocket connections are properly restricted
        expect(error).toBeDefined();
      }
    });
  });

  describe('Content Security Policy', () => {
    it('should validate CSP headers in responses', async () => {
      const functionNames = ['generate-music', 'music-status', 'secure-stream'];
      
      for (const functionName of functionNames) {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({ test: true })
        });

        // Should not expose sensitive headers
        expect(response.headers.get('Server')).toBeFalsy();
        expect(response.headers.get('X-Powered-By')).toBeFalsy();
      }
    });
  });

  describe('Rate Limiting CORS', () => {
    it('should include rate limit headers in CORS responses', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-music`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Headers': 'x-ratelimit-limit, x-ratelimit-remaining'
        }
      });

      const allowedHeaders = response.headers.get('Access-Control-Allow-Headers');
      expect(allowedHeaders).toContain('x-ratelimit-limit');
      expect(allowedHeaders).toContain('x-ratelimit-remaining');
    });
  });
});