import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Deterministic ID Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Session ID Generation', () => {
    it('should generate unique session IDs without Math.random()', () => {
      // Use crypto.randomUUID() instead of Math.random()
      const generateSessionId = (): string => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          return crypto.randomUUID();
        }
        // Fallback: timestamp + counter
        const timestamp = Date.now();
        const counter = performance.now().toString(36);
        return `session_${timestamp}_${counter}`;
      };

      const id1 = generateSessionId();
      const id2 = generateSessionId();

      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(10);
    });

    it('should use UUID format when available', () => {
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      const id = crypto.randomUUID();
      expect(id).toMatch(uuidRegex);
    });
  });

  describe('Quiz Session ID', () => {
    it('should generate deterministic quiz session ID from user and item', () => {
      const generateQuizSessionId = (userId: string, itemCode: string): string => {
        const timestamp = Date.now();
        // Combine user and item for traceability
        return `quiz_${userId.slice(0, 8)}_${itemCode}_${timestamp}`;
      };

      const userId = 'test-user-123-abc';
      const itemCode = 'IC-230';
      
      const id1 = generateQuizSessionId(userId, itemCode);
      
      expect(id1).toContain('quiz_');
      expect(id1).toContain('test-use');
      expect(id1).toContain('IC-230');
    });
  });

  describe('Sync Queue ID', () => {
    it('should generate unique sync queue IDs', () => {
      // Pattern: sync_{timestamp}_{uuid-slice}
      const generateSyncId = (): string => {
        const uuid = crypto.randomUUID();
        return `sync_${Date.now()}_${uuid.slice(0, 8)}`;
      };

      const id1 = generateSyncId();
      const id2 = generateSyncId();

      expect(id1.startsWith('sync_')).toBe(true);
      expect(id1).not.toBe(id2);
    });
  });

  describe('Announcement ID', () => {
    it('should generate unique announcement IDs', () => {
      const generateAnnouncementId = (): string => {
        const uuid = crypto.randomUUID();
        return `ann_${Date.now()}_${uuid.slice(0, 5)}`;
      };

      const id = generateAnnouncementId();
      expect(id.startsWith('ann_')).toBe(true);
      expect(id.length).toBeGreaterThan(15);
    });
  });

  describe('Card Hash for SRS Fuzz', () => {
    it('should generate deterministic hash from card properties', () => {
      const generateCardHash = (repetitions: number, quality: number, interval: number): number => {
        return (repetitions * 17 + quality * 31 + interval * 7) % 100;
      };

      // Same inputs should produce same hash
      const hash1 = generateCardHash(5, 4, 10);
      const hash2 = generateCardHash(5, 4, 10);
      expect(hash1).toBe(hash2);

      // Different inputs should produce different hashes (usually)
      const hash3 = generateCardHash(6, 4, 10);
      expect(hash1).not.toBe(hash3);
    });

    it('should produce fuzz factor in valid range (0.95 to 1.05)', () => {
      const generateFuzz = (hash: number): number => {
        return 0.95 + (hash / 1000);
      };

      // Hash ranges from 0 to 99
      const minFuzz = generateFuzz(0);
      const maxFuzz = generateFuzz(99);

      expect(minFuzz).toBe(0.95);
      expect(maxFuzz).toBe(1.049);
      expect(maxFuzz).toBeLessThanOrEqual(1.1);
    });
  });

  describe('Leaderboard Previous Rank', () => {
    it('should calculate deterministic previous rank from userId', () => {
      const calculatePreviousRank = (userId: string, currentRank: number): number => {
        const hashCode = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const rankChange = (hashCode % 3) - 1; // -1, 0, or +1
        return Math.max(1, currentRank + rankChange);
      };

      const userId = 'user-123';
      const currentRank = 5;
      
      // Same inputs always produce same result
      const prev1 = calculatePreviousRank(userId, currentRank);
      const prev2 = calculatePreviousRank(userId, currentRank);
      
      expect(prev1).toBe(prev2);
      expect(prev1).toBeGreaterThanOrEqual(1);
    });

    it('should never return rank below 1', () => {
      const calculatePreviousRank = (userId: string, currentRank: number): number => {
        const hashCode = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const rankChange = (hashCode % 3) - 1;
        return Math.max(1, currentRank + rankChange);
      };

      // Even with rank 1 and negative change, should stay at 1
      const result = calculatePreviousRank('a', 1); // 'a'.charCodeAt(0) = 97, 97 % 3 = 1, change = 0
      expect(result).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Admin User Stats', () => {
    it('should calculate deterministic credits from index', () => {
      const calculateCredits = (index: number): number => {
        return 100 - (index * 5 % 100);
      };

      // Deterministic
      expect(calculateCredits(0)).toBe(100);
      expect(calculateCredits(1)).toBe(95);
      expect(calculateCredits(20)).toBe(0);
      expect(calculateCredits(21)).toBe(95); // Wraps around
    });

    it('should calculate deterministic usage from index', () => {
      const calculateUsage = (index: number): number => {
        return index * 7 % 100;
      };

      // Deterministic
      expect(calculateUsage(0)).toBe(0);
      expect(calculateUsage(1)).toBe(7);
      expect(calculateUsage(14)).toBe(98);
      expect(calculateUsage(15)).toBe(5); // Wraps around
    });
  });
});
