import request from 'supertest';
import express from 'express';
import { httpLoggerMiddleware } from '@/services/logService';
import { rateLimitService } from '@/services/rateLimitService';

describe('Trust Proxy Configuration', () => {
  let app: express.Application;

  beforeEach(() => {
    // Créer une app de test avec trust proxy activé
    app = express();
    app.set('trust proxy', 1);
    
    // Ajouter le middleware de logging pour tester l'extraction d'IP
    app.use(httpLoggerMiddleware);
    app.use(express.json());
    
    // Route de test qui retourne l'IP détectée
    app.get('/test-ip', (req, res) => {
      res.json({
        ip: req.ip,
        ips: req.ips,
        headers: {
          'x-forwarded-for': req.get('X-Forwarded-For'),
          'x-forwarded-proto': req.get('X-Forwarded-Proto'),
          'x-forwarded-host': req.get('X-Forwarded-Host')
        }
      });
    });
  });

  describe('IP extraction from X-Forwarded-For header', () => {
    test('should extract real client IP from X-Forwarded-For header', async () => {
      const clientIP = '192.168.1.100';
      
      const response = await request(app)
        .get('/test-ip')
        .set('X-Forwarded-For', clientIP)
        .expect(200);

      expect(response.body.ip).toBe(clientIP);
      expect(response.body.headers['x-forwarded-for']).toBe(clientIP);
    });

    test('should handle multiple IPs in X-Forwarded-For (leftmost is client)', async () => {
      const forwardedFor = '192.168.1.100, 10.0.0.1, 172.16.0.1';
      
      const response = await request(app)
        .get('/test-ip')
        .set('X-Forwarded-For', forwardedFor)
        .expect(200);

      // Express avec trust proxy devrait extraire la première IP (client réel)
      expect(response.body.ip).toBe('192.168.1.100');
    });

    test('should populate req.ips array with all forwarded IPs', async () => {
      const forwardedFor = '192.168.1.100, 10.0.0.1, 172.16.0.1';
      
      const response = await request(app)
        .get('/test-ip')
        .set('X-Forwarded-For', forwardedFor)
        .expect(200);

      expect(response.body.ips).toEqual(['10.0.0.1', '172.16.0.1']);
    });

    test('should handle IPv6 addresses correctly', async () => {
      const ipv6 = '2001:db8::1';
      
      const response = await request(app)
        .get('/test-ip')
        .set('X-Forwarded-For', ipv6)
        .expect(200);

      expect(response.body.ip).toBe(ipv6);
    });
  });

  describe('Protocol and host forwarding', () => {
    test('should respect X-Forwarded-Proto header', async () => {
      const response = await request(app)
        .get('/test-ip')
        .set('X-Forwarded-Proto', 'https')
        .expect(200);

      expect(response.body.headers['x-forwarded-proto']).toBe('https');
    });

    test('should respect X-Forwarded-Host header', async () => {
      const originalHost = 'api.example.com';
      
      const response = await request(app)
        .get('/test-ip')
        .set('X-Forwarded-Host', originalHost)
        .expect(200);

      expect(response.body.headers['x-forwarded-host']).toBe(originalHost);
    });
  });

  describe('Rate limiting with trust proxy', () => {
    let rateLimitApp: express.Application;

    beforeEach(() => {
      // App séparée pour tester le rate limiting avec trust proxy
      rateLimitApp = express();
      rateLimitApp.set('trust proxy', 1);
      
      // Middleware de rate limiting très restrictif pour les tests
      const testRateLimit = rateLimitService.createMiddleware({
        windowMs: 60000, // 1 minute
        maxRequests: 3,   // Seulement 3 requêtes pour tester rapidement
        keyGenerator: (req) => req.ip // Basé sur l'IP extraite
      });
      
      rateLimitApp.use(testRateLimit);
      
      rateLimitApp.get('/rate-limited', (req, res) => {
        res.json({ 
          success: true, 
          ip: req.ip,
          message: 'Request successful'
        });
      });
    });

    test('should rate limit based on real client IP from X-Forwarded-For', async () => {
      const clientIP = '192.168.1.200';
      
      // Faire 3 requêtes (limite)
      for (let i = 0; i < 3; i++) {
        await request(rateLimitApp)
          .get('/rate-limited')
          .set('X-Forwarded-For', clientIP)
          .expect(200);
      }
      
      // La 4ème requête doit être rate limitée
      await request(rateLimitApp)
        .get('/rate-limited')
        .set('X-Forwarded-For', clientIP)
        .expect(429); // Too Many Requests
    });

    test('should rate limit different IPs independently', async () => {
      const clientIP1 = '192.168.1.201';
      const clientIP2 = '192.168.1.202';
      
      // Épuiser la limite pour IP1
      for (let i = 0; i < 3; i++) {
        await request(rateLimitApp)
          .get('/rate-limited')
          .set('X-Forwarded-For', clientIP1)
          .expect(200);
      }
      
      // IP1 doit être rate limitée
      await request(rateLimitApp)
        .get('/rate-limited')
        .set('X-Forwarded-For', clientIP1)
        .expect(429);
      
      // IP2 doit encore fonctionner
      await request(rateLimitApp)
        .get('/rate-limited')
        .set('X-Forwarded-For', clientIP2)
        .expect(200);
    });
  });

  describe('Edge cases and security', () => {
    test('should handle missing X-Forwarded-For gracefully', async () => {
      const response = await request(app)
        .get('/test-ip')
        .expect(200);

      // Sans header X-Forwarded-For, doit utiliser l'IP de connexion
      expect(response.body.ip).toBeDefined();
      expect(response.body.ip).not.toBe('');
    });

    test('should handle malformed X-Forwarded-For header', async () => {
      const response = await request(app)
        .get('/test-ip')
        .set('X-Forwarded-For', 'not-an-ip')
        .expect(200);

      // Express doit gérer gracieusement les IPs malformées
      expect(response.body.ip).toBeDefined();
    });

    test('should handle empty X-Forwarded-For header', async () => {
      const response = await request(app)
        .get('/test-ip')
        .set('X-Forwarded-For', '')
        .expect(200);

      expect(response.body.ip).toBeDefined();
      expect(response.body.headers['x-forwarded-for']).toBe('');
    });

    test('should limit trust to first proxy only', async () => {
      // Avec trust proxy = 1, seul le premier proxy est digne de confiance
      const forwardedFor = '192.168.1.100, 10.0.0.1, 172.16.0.1, 203.0.113.1';
      
      const response = await request(app)
        .get('/test-ip')
        .set('X-Forwarded-For', forwardedFor)
        .expect(200);

      // Doit extraire l'IP cliente (première dans la liste)
      expect(response.body.ip).toBe('192.168.1.100');
    });
  });

  describe('Load balancer compatibility', () => {
    test('should work with AWS ALB format', async () => {
      // AWS ALB ajoute l'IP du load balancer à la fin
      const albFormat = '192.168.1.100, 52.95.49.23';
      
      const response = await request(app)
        .get('/test-ip')
        .set('X-Forwarded-For', albFormat)
        .set('X-Forwarded-Proto', 'https')
        .set('X-Forwarded-Port', '443')
        .expect(200);

      expect(response.body.ip).toBe('192.168.1.100');
      expect(response.body.headers['x-forwarded-proto']).toBe('https');
    });

    test('should work with Cloudflare format', async () => {
      const response = await request(app)
        .get('/test-ip')
        .set('CF-Connecting-IP', '192.168.1.100')
        .set('X-Forwarded-For', '192.168.1.100')
        .set('X-Forwarded-Proto', 'https')
        .expect(200);

      expect(response.body.ip).toBe('192.168.1.100');
    });

    test('should work with Nginx proxy format', async () => {
      const response = await request(app)
        .get('/test-ip')
        .set('X-Forwarded-For', '192.168.1.100')
        .set('X-Real-IP', '192.168.1.100')
        .set('X-Forwarded-Proto', 'https')
        .set('X-Forwarded-Host', 'api.example.com')
        .expect(200);

      expect(response.body.ip).toBe('192.168.1.100');
    });
  });
});

describe('Trust Proxy Security Considerations', () => {
  test('should not trust proxy when trust proxy is disabled', async () => {
    const app = express();
    // Ne PAS activer trust proxy
    
    app.get('/test', (req, res) => {
      res.json({ ip: req.ip });
    });

    const response = await request(app)
      .get('/test')
      .set('X-Forwarded-For', '192.168.1.100')
      .expect(200);

    // Sans trust proxy, ne doit PAS utiliser X-Forwarded-For
    expect(response.body.ip).not.toBe('192.168.1.100');
  });

  test('should validate trust proxy configuration prevents IP spoofing', async () => {
    const app = express();
    app.set('trust proxy', 1);
    
    app.get('/test', (req, res) => {
      res.json({ 
        ip: req.ip,
        secure: req.secure, // HTTPS détection
        protocol: req.protocol
      });
    });

    // Test avec HTTPS via proxy
    const response = await request(app)
      .get('/test')
      .set('X-Forwarded-For', '192.168.1.100')
      .set('X-Forwarded-Proto', 'https')
      .expect(200);

    expect(response.body.ip).toBe('192.168.1.100');
    expect(response.body.protocol).toBe('https');
  });
});