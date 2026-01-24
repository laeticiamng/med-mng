import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateSecureId,
  generateSessionId,
  generateQuizId,
  generateFilterId,
  generateRequestId,
  generateSyncId,
  generateLogId,
  generateAlertId,
  generateRecommendationId,
  resetSequentialCounter
} from '@/lib/idGenerator';

describe('idGenerator', () => {
  beforeEach(() => {
    resetSequentialCounter();
  });

  describe('generateSecureId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateSecureId();
      const id2 = generateSecureId();
      expect(id1).not.toBe(id2);
    });

    it('should include prefix when provided', () => {
      const id = generateSecureId('test');
      expect(id.startsWith('test_')).toBe(true);
    });

    it('should work without prefix', () => {
      const id = generateSecureId();
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('generateSessionId', () => {
    it('should generate session IDs with correct prefix', () => {
      const id = generateSessionId();
      expect(id.startsWith('session_')).toBe(true);
    });

    it('should generate unique session IDs', () => {
      const ids = new Set([
        generateSessionId(),
        generateSessionId(),
        generateSessionId()
      ]);
      expect(ids.size).toBe(3);
    });
  });

  describe('generateQuizId', () => {
    it('should generate quiz IDs with correct prefix', () => {
      const id = generateQuizId();
      expect(id.startsWith('quiz_')).toBe(true);
    });
  });

  describe('generateFilterId', () => {
    it('should generate filter IDs with correct prefix', () => {
      const id = generateFilterId();
      expect(id.startsWith('filter_')).toBe(true);
    });
  });

  describe('generateRequestId', () => {
    it('should generate request IDs with correct prefix', () => {
      const id = generateRequestId();
      expect(id.startsWith('gen_')).toBe(true);
    });
  });

  describe('generateSyncId', () => {
    it('should generate sync IDs with correct prefix', () => {
      const id = generateSyncId();
      expect(id.startsWith('sync_')).toBe(true);
    });
  });

  describe('generateLogId', () => {
    it('should generate log IDs with correct prefix', () => {
      const id = generateLogId();
      expect(id.startsWith('log_')).toBe(true);
    });
  });

  describe('generateAlertId', () => {
    it('should generate alert IDs with correct prefix', () => {
      const id = generateAlertId();
      expect(id.startsWith('alert_')).toBe(true);
    });
  });

  describe('generateRecommendationId', () => {
    it('should include category in prefix', () => {
      const id = generateRecommendationId('accessibility');
      expect(id.startsWith('rec_accessibility_')).toBe(true);
    });
  });

  describe('Sequential counter reset', () => {
    it('should reset counter correctly for testing', () => {
      generateSecureId('test');
      generateSecureId('test');
      resetSequentialCounter();
      const id = generateSecureId('test');
      // After reset, the counter should start fresh
      expect(id).toBeDefined();
    });
  });
});
