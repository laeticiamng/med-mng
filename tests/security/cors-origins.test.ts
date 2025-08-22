import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getAllowedOrigins } from '../../src/middleware/security';

describe('CORS Origins Configuration', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.CORS_ALLOWED_ORIGINS;
  });

  afterEach(() => {
    if (originalEnv) {
      process.env.CORS_ALLOWED_ORIGINS = originalEnv;
    } else {
      delete process.env.CORS_ALLOWED_ORIGINS;
    }
  });

  describe('getAllowedOrigins', () => {
    it('should return default origins when CORS_ALLOWED_ORIGINS is not set', () => {
      delete process.env.CORS_ALLOWED_ORIGINS;
      
      const origins = getAllowedOrigins();
      
      expect(origins).toEqual([
        'http://localhost:3000',
        'http://localhost:5173',
        'https://yaincoxihiqdksxgrsrk.supabase.co'
      ]);
    });

    it('should parse comma-separated origins from environment variable', () => {
      process.env.CORS_ALLOWED_ORIGINS = 'https://example.com,https://app.example.com,http://localhost:3000';
      
      const origins = getAllowedOrigins();
      
      expect(origins).toEqual([
        'https://example.com',
        'https://app.example.com',
        'http://localhost:3000'
      ]);
    });

    it('should trim whitespace from origins', () => {
      process.env.CORS_ALLOWED_ORIGINS = ' https://example.com , https://app.example.com , http://localhost:3000 ';
      
      const origins = getAllowedOrigins();
      
      expect(origins).toEqual([
        'https://example.com',
        'https://app.example.com',
        'http://localhost:3000'
      ]);
    });

    it('should handle single origin', () => {
      process.env.CORS_ALLOWED_ORIGINS = 'https://production.example.com';
      
      const origins = getAllowedOrigins();
      
      expect(origins).toEqual(['https://production.example.com']);
    });

    it('should handle empty string as no origins', () => {
      process.env.CORS_ALLOWED_ORIGINS = '';
      
      const origins = getAllowedOrigins();
      
      expect(origins).toEqual(['']);
    });
  });

  describe('CORS Origin Validation', () => {
    it('should accept allowed origins', () => {
      process.env.CORS_ALLOWED_ORIGINS = 'https://example.com,https://app.example.com';
      
      const { corsOptions } = require('../../src/middleware/security');
      
      // Test allowed origin
      corsOptions.origin('https://example.com', (error: Error | null, allow?: boolean) => {
        expect(error).toBeNull();
        expect(allow).toBe(true);
      });
    });

    it('should reject disallowed origins', () => {
      process.env.CORS_ALLOWED_ORIGINS = 'https://example.com,https://app.example.com';
      
      const { corsOptions } = require('../../src/middleware/security');
      
      // Test disallowed origin
      corsOptions.origin('https://malicious.com', (error: Error | null, allow?: boolean) => {
        expect(error).toBeInstanceOf(Error);
        expect(error?.message).toContain('Non autorisé par la politique CORS');
        expect(allow).toBe(false);
      });
    });

    it('should allow requests without origin', () => {
      process.env.CORS_ALLOWED_ORIGINS = 'https://example.com';
      
      const { corsOptions } = require('../../src/middleware/security');
      
      // Test no origin (mobile apps, Postman, etc.)
      corsOptions.origin(undefined, (error: Error | null, allow?: boolean) => {
        expect(error).toBeNull();
        expect(allow).toBe(true);
      });
    });
  });

  describe('Environment-based Origin Configuration', () => {
    it('should work with production origins', () => {
      process.env.CORS_ALLOWED_ORIGINS = 'https://med-music-platform.com,https://app.med-music-platform.com';
      
      const origins = getAllowedOrigins();
      
      expect(origins).toContain('https://med-music-platform.com');
      expect(origins).toContain('https://app.med-music-platform.com');
      expect(origins).not.toContain('http://localhost:3000');
    });

    it('should work with staging origins', () => {
      process.env.CORS_ALLOWED_ORIGINS = 'https://staging.med-music-platform.com,http://localhost:3000';
      
      const origins = getAllowedOrigins();
      
      expect(origins).toContain('https://staging.med-music-platform.com');
      expect(origins).toContain('http://localhost:3000');
    });

    it('should work with development origins', () => {
      process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:3000,http://localhost:5173,http://localhost:8080';
      
      const origins = getAllowedOrigins();
      
      expect(origins).toEqual([
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8080'
      ]);
    });
  });
});