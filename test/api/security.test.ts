import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';

describe('API Security Tests', () => {
  let server: any;

  beforeAll(() => {
    // Démarrer le serveur de test sur un port différent
    server = app.listen(0);
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('Security Headers', () => {
    it('should include helmet security headers', async () => {
      const response = await request(app).get('/');

      // Vérifier les headers de sécurité de Helmet
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers['x-frame-options']).toBe('DENY');
      
      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers['x-xss-protection']).toBe('0');
      
      expect(response.headers).toHaveProperty('strict-transport-security');
      
      expect(response.headers).toHaveProperty('content-security-policy');
      expect(response.headers['content-security-policy']).toContain("default-src 'self'");
    });

    it('should include custom security headers', async () => {
      const response = await request(app).get('/');

      expect(response.headers).toHaveProperty('x-api-version');
      expect(response.headers['x-api-version']).toBe('1.0.0');
      
      expect(response.headers).toHaveProperty('x-request-id');
    });

    it('should handle CORS properly', async () => {
      const response = await request(app)
        .get('/')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should reject unauthorized CORS origins', async () => {
      const response = await request(app)
        .get('/')
        .set('Origin', 'https://malicious-site.com');

      // Le serveur devrait rejeter l'origine non autorisée
      expect(response.status).not.toBe(200);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting after multiple requests', async () => {
      // Envoyer plusieurs requêtes rapidement
      const requests = Array(105).fill(null).map(() => 
        request(app).get('/')
      );

      const responses = await Promise.all(requests);
      
      // Au moins une requête devrait être rate-limitée (status 429)
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should include rate limit headers', async () => {
      const response = await request(app).get('/');

      // Vérifier la présence des headers de rate limiting
      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
      expect(response.headers).toHaveProperty('ratelimit-reset');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app).get('/non-existent-endpoint');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Endpoint non trouvé');
    });

    it('should not expose sensitive error details in production', async () => {
      // Sauvegarder l'environnement actuel
      const originalEnv = process.env.NODE_ENV;
      
      // Simuler l'environnement de production
      process.env.NODE_ENV = 'production';

      const response = await request(app).get('/');

      // En production, les détails d'erreur ne devraient pas être exposés
      expect(response.body).not.toHaveProperty('stack');

      // Restaurer l'environnement
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Request Validation', () => {
    it('should detect suspicious request patterns', async () => {
      const suspiciousRequests = [
        '/api/../../../etc/passwd', // Path traversal
        '/api?q=<script>alert("xss")</script>', // XSS attempt
        '/api?q=UNION SELECT * FROM users--', // SQL injection
        '/api?redirect=javascript:alert(1)' // JavaScript protocol
      ];

      for (const suspiciousPath of suspiciousRequests) {
        const response = await request(app).get(suspiciousPath);
        
        // Les requêtes suspectes devraient être loggées mais ne pas planter l'app
        expect([404, 400, 403]).toContain(response.status);
      }
    });
  });

  describe('Health Checks', () => {
    it('should provide health check endpoint', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('healthy');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should provide main endpoint with API info', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Medical Training API is running');
      expect(response.body).toHaveProperty('version');
      expect(response.body.version).toBe('1.0.0');
    });
  });

  describe('JSON Parsing Security', () => {
    it('should reject oversized JSON payloads', async () => {
      // Créer un payload JSON très large (> 10MB)
      const largePayload = {
        data: 'x'.repeat(11 * 1024 * 1024) // 11MB de données
      };

      const response = await request(app)
        .post('/')
        .send(largePayload)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(413); // Payload Too Large
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/')
        .send('{"malformed": json}')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400); // Bad Request
    });
  });
});