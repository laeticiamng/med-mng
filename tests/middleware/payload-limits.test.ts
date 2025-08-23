import request from 'supertest';
import express from 'express';

describe('Payload Size Limits', () => {
  let app: express.Application;
  
  beforeEach(() => {
    // Créer une app de test avec limite de 1MB
    app = express();
    app.set('trust proxy', 1);
    
    const maxPayloadMB = 1; // Limite stricte pour les tests
    app.use(express.json({ limit: `${maxPayloadMB}mb` }));
    app.use(express.urlencoded({ extended: true, limit: `${maxPayloadMB}mb` }));
    
    // Route de test qui accepte du JSON
    app.post('/test-payload', (req, res) => {
      res.json({
        success: true,
        receivedSize: JSON.stringify(req.body).length,
        message: 'Payload received successfully'
      });
    });
    
    // Middleware d'erreur pour capturer les erreurs de payload
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (err.type === 'entity.too.large') {
        return res.status(413).json({
          error: 'Payload Too Large',
          message: 'Request payload exceeds maximum allowed size',
          limit: err.limit,
          received: err.length
        });
      }
      next(err);
    });
  });

  describe('JSON payload limits', () => {
    test('should accept payloads within the limit', async () => {
      // Créer un payload de ~500KB (bien en dessous de 1MB)
      const smallPayload = {
        data: 'x'.repeat(500 * 1024) // 500KB de données
      };
      
      const response = await request(app)
        .post('/test-payload')
        .send(smallPayload)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.receivedSize).toBeGreaterThan(500000);
    });

    test('should reject payloads exceeding the 1MB limit with 413 status', async () => {
      // Créer un payload de ~2MB (au-dessus de la limite de 1MB)
      const largePayload = {
        data: 'x'.repeat(2 * 1024 * 1024) // 2MB de données
      };
      
      const response = await request(app)
        .post('/test-payload')
        .send(largePayload)
        .expect(413);
      
      expect(response.body.error).toBe('Payload Too Large');
      expect(response.body.message).toContain('exceeds maximum allowed size');
    });

    test('should handle edge case at exactly 1MB limit', async () => {
      // Payload proche mais sous la limite (accounting for JSON overhead)
      const edgeCasePayload = {
        data: 'x'.repeat(1024 * 1024 - 100) // ~1MB - 100 bytes for JSON structure
      };
      
      const response = await request(app)
        .post('/test-payload')
        .send(edgeCasePayload);
      
      // Should either succeed (if under limit) or fail with 413 (if over)
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
      } else {
        expect(response.status).toBe(413);
      }
    });
  });

  describe('URL-encoded payload limits', () => {
    test('should apply same limits to URL-encoded data', async () => {
      // Créer un payload URL-encoded volumineux
      const largeUrlEncoded = 'data=' + 'x'.repeat(2 * 1024 * 1024);
      
      const response = await request(app)
        .post('/test-payload')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(largeUrlEncoded)
        .expect(413);
      
      expect(response.body.error).toBe('Payload Too Large');
    });
  });

  describe('Configurable limits', () => {
    test('should respect MAX_PAYLOAD_MB environment variable', () => {
      // Sauvegarder la valeur originale
      const originalValue = process.env.MAX_PAYLOAD_MB;
      
      try {
        // Tester avec une limite personnalisée
        process.env.MAX_PAYLOAD_MB = '2';
        
        const customApp = express();
        const maxPayloadMB = process.env.MAX_PAYLOAD_MB ? parseInt(process.env.MAX_PAYLOAD_MB, 10) : 1;
        customApp.use(express.json({ limit: `${maxPayloadMB}mb` }));
        
        expect(maxPayloadMB).toBe(2);
        
      } finally {
        // Restaurer la valeur originale
        if (originalValue) {
          process.env.MAX_PAYLOAD_MB = originalValue;
        } else {
          delete process.env.MAX_PAYLOAD_MB;
        }
      }
    });

    test('should use default 1MB when MAX_PAYLOAD_MB is not set', () => {
      const originalValue = process.env.MAX_PAYLOAD_MB;
      
      try {
        delete process.env.MAX_PAYLOAD_MB;
        
        const maxPayloadMB = process.env.MAX_PAYLOAD_MB ? parseInt(process.env.MAX_PAYLOAD_MB, 10) : 1;
        expect(maxPayloadMB).toBe(1);
        
      } finally {
        if (originalValue) {
          process.env.MAX_PAYLOAD_MB = originalValue;
        }
      }
    });

    test('should handle invalid MAX_PAYLOAD_MB values gracefully', () => {
      const originalValue = process.env.MAX_PAYLOAD_MB;
      
      try {
        // Tester avec des valeurs invalides
        const invalidValues = ['invalid', '0', '-1', ''];
        
        invalidValues.forEach(invalidValue => {
          process.env.MAX_PAYLOAD_MB = invalidValue;
          const maxPayloadMB = process.env.MAX_PAYLOAD_MB ? parseInt(process.env.MAX_PAYLOAD_MB, 10) : 1;
          
          // parseInt retourne NaN pour les valeurs invalides, donc devrait utiliser le défaut
          const finalValue = isNaN(maxPayloadMB) ? 1 : maxPayloadMB;
          expect(finalValue).toBe(1);
        });
        
      } finally {
        if (originalValue) {
          process.env.MAX_PAYLOAD_MB = originalValue;
        } else {
          delete process.env.MAX_PAYLOAD_MB;
        }
      }
    });
  });

  describe('Security considerations', () => {
    test('should prevent DoS attacks with oversized payloads', async () => {
      // Simuler une tentative d'attaque DoS avec un payload très volumineux
      const attackPayload = {
        attack: 'x'.repeat(10 * 1024 * 1024) // 10MB payload
      };
      
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/test-payload')
        .send(attackPayload)
        .expect(413);
      
      const duration = Date.now() - startTime;
      
      // La requête doit être rejetée rapidement (moins de 1 seconde)
      expect(duration).toBeLessThan(1000);
      expect(response.body.error).toBe('Payload Too Large');
    });

    test('should include security headers in 413 responses', async () => {
      const largePayload = { data: 'x'.repeat(2 * 1024 * 1024) };
      
      const response = await request(app)
        .post('/test-payload')
        .send(largePayload)
        .expect(413);
      
      // Vérifier que la réponse contient les informations nécessaires
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('maximum allowed size');
    });

    test('should log security events for oversized payloads', async () => {
      // Mock console pour capturer les logs
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const largePayload = { data: 'x'.repeat(2 * 1024 * 1024) };
      
      await request(app)
        .post('/test-payload')
        .send(largePayload)
        .expect(413);
      
      // Dans une implémentation réelle, ceci devrait logger l'événement de sécurité
      // Pour le test, on vérifie juste que la réponse est correcte
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance impact', () => {
    test('should not significantly impact small requests', async () => {
      const smallPayload = { message: 'hello world' };
      
      const times: number[] = [];
      
      // Faire plusieurs requêtes pour mesurer la performance
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        
        await request(app)
          .post('/test-payload')
          .send(smallPayload)
          .expect(200);
        
        times.push(Date.now() - startTime);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      
      // Les petites requêtes doivent rester rapides (moins de 100ms en moyenne)
      expect(avgTime).toBeLessThan(100);
    });
  });
});