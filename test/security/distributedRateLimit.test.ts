import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { RateLimitService } from '@/services/rateLimitService';
import { MemoryRateLimitStore } from '@/services/stores/MemoryRateLimitStore';

// Create test Express app
function createTestApp(services: RateLimitService[]) {
  const app = express();
  
  // Add rate limiting middleware from all services (simulating multiple instances)
  services.forEach((service, index) => {
    app.use((req, res, next) => {
      // Add instance identifier for testing
      req.instanceId = index;
      next();
    });
    
    app.use(service.middleware());
  });
  
  app.get('/test', (req, res) => {
    res.json({ 
      message: 'Success', 
      instanceId: req.instanceId,
      timestamp: Date.now() 
    });
  });
  
  return app;
}

describe('Distributed Rate Limiting Integration', () => {
  let store: MemoryRateLimitStore;
  let services: RateLimitService[];
  let app: express.Application;

  beforeEach(() => {
    // Create shared store (simulating distributed storage)
    store = new MemoryRateLimitStore();
    
    // Create multiple service instances (simulating different server instances)
    services = [
      new RateLimitService(store, {
        windowMs: 60000, // 1 minute
        maxRequests: 3
      }),
      new RateLimitService(store, {
        windowMs: 60000, // 1 minute
        maxRequests: 3
      }),
      new RateLimitService(store, {
        windowMs: 60000, // 1 minute
        maxRequests: 3
      })
    ];
    
    app = createTestApp(services);
  });

  afterEach(() => {
    store.destroy();
  });

  describe('Cross-Instance Rate Limiting', () => {
    it('should maintain consistent rate limits across simulated instances', async () => {
      const clientIp = '192.168.1.100';
      
      // Make requests that would hit different instances
      const response1 = await request(app)
        .get('/test')
        .set('X-Forwarded-For', clientIp)
        .expect(200);
      
      expect(response1.headers['x-ratelimit-remaining']).toBe('2');
      
      const response2 = await request(app)
        .get('/test')
        .set('X-Forwarded-For', clientIp)
        .expect(200);
      
      expect(response2.headers['x-ratelimit-remaining']).toBe('1');
      
      const response3 = await request(app)
        .get('/test')
        .set('X-Forwarded-For', clientIp)
        .expect(200);
      
      expect(response3.headers['x-ratelimit-remaining']).toBe('0');
      
      // Fourth request should be rate limited
      await request(app)
        .get('/test')
        .set('X-Forwarded-For', clientIp)
        .expect(429);
    });

    it('should isolate different client IPs across instances', async () => {
      const clientIp1 = '192.168.1.101';
      const clientIp2 = '192.168.1.102';
      
      // Exhaust rate limit for first client
      await request(app).get('/test').set('X-Forwarded-For', clientIp1).expect(200);
      await request(app).get('/test').set('X-Forwarded-For', clientIp1).expect(200);
      await request(app).get('/test').set('X-Forwarded-For', clientIp1).expect(200);
      await request(app).get('/test').set('X-Forwarded-For', clientIp1).expect(429);
      
      // Second client should still be able to make requests
      const response = await request(app)
        .get('/test')
        .set('X-Forwarded-For', clientIp2)
        .expect(200);
      
      expect(response.headers['x-ratelimit-remaining']).toBe('2');
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle concurrent requests correctly', async () => {
      const clientIp = '192.168.1.103';
      
      // Make 5 concurrent requests (should only allow 3)
      const requests = Array(5).fill(null).map(() =>
        request(app)
          .get('/test')
          .set('X-Forwarded-For', clientIp)
      );
      
      const responses = await Promise.all(requests);
      
      // Count successful and rate-limited responses
      const successfulResponses = responses.filter(r => r.status === 200);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      expect(successfulResponses.length).toBe(3);
      expect(rateLimitedResponses.length).toBe(2);
    });

    it('should handle burst requests from multiple clients', async () => {
      const clients = ['192.168.1.104', '192.168.1.105', '192.168.1.106'];
      
      // Each client makes 4 requests concurrently
      const allRequests = clients.flatMap(clientIp =>
        Array(4).fill(null).map(() =>
          request(app)
            .get('/test')
            .set('X-Forwarded-For', clientIp)
        )
      );
      
      const responses = await Promise.all(allRequests);
      
      // Group responses by client IP
      const responsesByClient = {};
      responses.forEach((response, index) => {
        const clientIndex = Math.floor(index / 4);
        const clientIp = clients[clientIndex];
        
        if (!responsesByClient[clientIp]) {
          responsesByClient[clientIp] = [];
        }
        responsesByClient[clientIp].push(response);
      });
      
      // Each client should have exactly 3 successful requests and 1 rate-limited
      clients.forEach(clientIp => {
        const clientResponses = responsesByClient[clientIp];
        const successful = clientResponses.filter(r => r.status === 200).length;
        const rateLimited = clientResponses.filter(r => r.status === 429).length;
        
        expect(successful).toBe(3);
        expect(rateLimited).toBe(1);
      });
    });
  });

  describe('Rate Limit Headers', () => {
    it('should provide correct rate limit headers', async () => {
      const clientIp = '192.168.1.107';
      
      const response1 = await request(app)
        .get('/test')
        .set('X-Forwarded-For', clientIp)
        .expect(200);
      
      expect(response1.headers['x-ratelimit-limit']).toBe('3');
      expect(response1.headers['x-ratelimit-remaining']).toBe('2');
      expect(response1.headers['x-ratelimit-window']).toBe('60000');
      expect(response1.headers['x-ratelimit-reset']).toBeDefined();
      
      const response2 = await request(app)
        .get('/test')
        .set('X-Forwarded-For', clientIp)
        .expect(200);
      
      expect(response2.headers['x-ratelimit-remaining']).toBe('1');
    });

    it('should provide correct headers on rate limited responses', async () => {
      const clientIp = '192.168.1.108';
      
      // Exhaust rate limit
      await request(app).get('/test').set('X-Forwarded-For', clientIp);
      await request(app).get('/test').set('X-Forwarded-For', clientIp);
      await request(app).get('/test').set('X-Forwarded-For', clientIp);
      
      // Rate limited response
      const response = await request(app)
        .get('/test')
        .set('X-Forwarded-For', clientIp)
        .expect(429);
      
      expect(response.headers['x-ratelimit-limit']).toBe('3');
      expect(response.headers['x-ratelimit-remaining']).toBe('0');
      expect(response.body.error).toBe('Too Many Requests');
      expect(response.body.retryAfter).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should allow requests to continue if rate limiting fails', async () => {
      // Create service with a failing store
      const failingStore = {
        checkAndIncrement: vi.fn().mockRejectedValue(new Error('Store failure')),
        getStatus: vi.fn().mockRejectedValue(new Error('Store failure'))
      };
      
      const failingService = new RateLimitService(failingStore as any, {
        windowMs: 60000,
        maxRequests: 3
      });
      
      const failingApp = express();
      failingApp.use(failingService.middleware());
      failingApp.get('/test', (req, res) => {
        res.json({ message: 'Success despite rate limiting failure' });
      });
      
      // Request should succeed despite rate limiting failure
      const response = await request(failingApp)
        .get('/test')
        .expect(200);
      
      expect(response.body.message).toBe('Success despite rate limiting failure');
    });
  });

  describe('Custom Key Generation', () => {
    it('should support user-based rate limiting across instances', async () => {
      const userBasedServices = services.map(service => {
        service.updateConfig({
          keyGenerator: (req) => `user:${req.headers['x-user-id'] || 'anonymous'}`
        });
        return service;
      });
      
      const userApp = createTestApp(userBasedServices);
      
      // Same user making requests
      await request(userApp).get('/test').set('X-User-ID', 'user123').expect(200);
      await request(userApp).get('/test').set('X-User-ID', 'user123').expect(200);
      await request(userApp).get('/test').set('X-User-ID', 'user123').expect(200);
      await request(userApp).get('/test').set('X-User-ID', 'user123').expect(429);
      
      // Different user should not be affected
      await request(userApp).get('/test').set('X-User-ID', 'user456').expect(200);
    });
  });

  describe('Window Reset Behavior', () => {
    it('should reset counters after window expires', async () => {
      // Create service with very short window for testing
      const shortWindowServices = services.map(service => {
        service.updateConfig({ windowMs: 100 }); // 100ms window
        return service;
      });
      
      const shortWindowApp = createTestApp(shortWindowServices);
      const clientIp = '192.168.1.109';
      
      // Exhaust rate limit
      await request(shortWindowApp).get('/test').set('X-Forwarded-For', clientIp).expect(200);
      await request(shortWindowApp).get('/test').set('X-Forwarded-For', clientIp).expect(200);
      await request(shortWindowApp).get('/test').set('X-Forwarded-For', clientIp).expect(200);
      await request(shortWindowApp).get('/test').set('X-Forwarded-For', clientIp).expect(429);
      
      // Wait for window to reset
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should be able to make requests again
      const response = await request(shortWindowApp)
        .get('/test')
        .set('X-Forwarded-For', clientIp)
        .expect(200);
      
      expect(response.headers['x-ratelimit-remaining']).toBe('2');
    });
  });
});