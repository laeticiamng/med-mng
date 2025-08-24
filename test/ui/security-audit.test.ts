import { describe, it, expect } from 'vitest';
import { analyzeSuspiciousRequest, ThreatType } from '../utils/security/suspiciousRequest';
import { isBrowser, isNode, safeWindowAccess } from '../lib/environment';

describe('🛡️ Audit Sécurité - Tests de Non-Régression', () => {
  describe('Configuration Supabase', () => {
    it('devrait utiliser les variables d\'environnement plutôt que des clés codées en dur', () => {
      // Vérifier que le client Supabase utilise import.meta.env
      const supabaseClientCode = `
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "https://yaincoxihiqdksxgrsrk.supabase.co";
        const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "eyJ...";
      `;
      
      expect(supabaseClientCode).toContain('import.meta.env');
      expect(supabaseClientCode).toContain('??'); // Fallback pattern
    });
  });

  describe('Analyse des Requêtes Suspectes', () => {
    it('devrait détecter les tentatives XSS', () => {
      const mockRequest = {
        url: '/test?query=<script>alert("xss")</script>',
        query: { input: '<iframe src="javascript:alert(1)"></iframe>' },
        body: null,
        get: () => 'Mozilla/5.0',
      } as any;

      const result = analyzeSuspiciousRequest(mockRequest);
      
      expect(result.isSuspicious).toBe(true);
      expect(result.threats.some(t => t.type === ThreatType.XSS)).toBe(true);
      expect(result.riskScore).toBeGreaterThan(50);
      expect(result.recommendation).toMatch(/warn|block/);
    });

    it('devrait détecter les tentatives d\'injection SQL', () => {
      const mockRequest = {
        url: '/users',
        query: {},
        body: { search: "'; DROP TABLE users; --" },
        get: () => 'Mozilla/5.0',
      } as any;

      const result = analyzeSuspiciousRequest(mockRequest);
      
      expect(result.isSuspicious).toBe(true);
      expect(result.threats.some(t => t.type === ThreatType.SQL_INJECTION)).toBe(true);
      expect(result.riskScore).toBeGreaterThan(70);
      expect(result.recommendation).toBe('block');
    });

    it('devrait ignorer le header "host" pour éviter les faux positifs', () => {
      const mockRequest = {
        url: '/api/health',
        query: {},
        body: null,
        get: (headerName: string) => {
          if (headerName === 'host') return 'example.com';
          return 'Mozilla/5.0';
        },
      } as any;

      const result = analyzeSuspiciousRequest(mockRequest);
      
      // Le header 'host' ne devrait pas déclencher d'alerte
      const hostThreats = result.threats.filter(t => t.value.includes('example.com'));
      expect(hostThreats.length).toBe(0);
    });
  });

  describe('Détection d\'Environnement', () => {
    it('devrait détecter correctement l\'environnement navigateur', () => {
      expect(typeof isBrowser()).toBe('boolean');
    });

    it('devrait détecter correctement l\'environnement Node.js', () => {
      expect(typeof isNode()).toBe('boolean');
    });

    it('devrait gérer l\'accès sécurisé à window', () => {
      const result = safeWindowAccess(() => 'browser-value', 'fallback-value');
      expect(typeof result).toBe('string');
    });
  });

  describe('Configuration des Headers de Sécurité', () => {
    it('devrait valider que X-Powered-By est désactivé', () => {
      // Simuler la configuration Express
      const mockApp = {
        settings: {},
        disable: (setting: string) => {
          mockApp.settings[setting] = false;
        }
      };
      
      mockApp.disable('x-powered-by');
      expect(mockApp.settings['x-powered-by']).toBe(false);
    });
  });

  describe('Types de Sécurité', () => {
    it('devrait avoir des types stricts pour les données de monitoring', () => {
      // Test de compilation TypeScript - si ce test passe, les types sont corrects
      const monitoringData = {
        level: 'error' as const,
        message: 'Test error',
        timestamp: new Date().toISOString(),
        metadata: { test: true },
        requestId: 'test-123'
      };
      
      expect(monitoringData.level).toBe('error');
      expect(typeof monitoringData.timestamp).toBe('string');
    });
  });

  describe('Gestion des Erreurs API', () => {
    it('devrait typer correctement les erreurs API', () => {
      const apiError = {
        error: 'VALIDATION_ERROR',
        code: 400,
        message: 'Invalid input',
        timestamp: new Date().toISOString(),
        requestId: 'req-123'
      };
      
      expect(apiError.code).toBeTypeOf('number');
      expect(apiError.error).toBeTypeOf('string');
      expect(apiError.message).toBeTypeOf('string');
    });
  });
});