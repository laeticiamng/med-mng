/**
 * Tests complets pour qcmService
 *
 * Critique pour l'integrite des quiz medicaux.
 * Les erreurs ici peuvent affecter l'apprentissage des etudiants.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { qcmService, QcmSession, QcmResponse } from '@/services/qcmService';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('qcmService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateQcm', () => {
    it('should call qcm-generator function with correct params', async () => {
      const mockQuestions = [
        { id: 'q1', question: 'Question 1?', options: ['A', 'B', 'C', 'D'], correct_answer: 'A' },
      ];

      (supabase.functions.invoke as any).mockResolvedValue({
        data: { success: true, questions: mockQuestions },
        error: null,
      });

      const result = await qcmService.generateQcm('IC-001', 'rang_a', 10);

      expect(supabase.functions.invoke).toHaveBeenCalledWith('qcm-generator', {
        body: {
          item_code: 'IC-001',
          session_type: 'rang_a',
          question_count: 10,
        },
      });
      expect(result.success).toBe(true);
      expect(result.questions).toEqual(mockQuestions);
    });

    it('should use default question count of 10', async () => {
      (supabase.functions.invoke as any).mockResolvedValue({
        data: { success: true, questions: [] },
        error: null,
      });

      await qcmService.generateQcm('IC-001', 'rang_b');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('qcm-generator', {
        body: expect.objectContaining({
          question_count: 10,
        }),
      });
    });

    it('should throw error on API failure', async () => {
      (supabase.functions.invoke as any).mockResolvedValue({
        data: null,
        error: { message: 'API Error' },
      });

      await expect(qcmService.generateQcm('IC-001', 'rang_a'))
        .rejects.toThrow('Erreur lors de la génération du QCM');
    });

    it('should handle different session types', async () => {
      (supabase.functions.invoke as any).mockResolvedValue({
        data: { success: true, questions: [] },
        error: null,
      });

      const sessionTypes = ['rang_a', 'rang_b', 'mixed'] as const;

      for (const type of sessionTypes) {
        await qcmService.generateQcm('IC-001', type);
        expect(supabase.functions.invoke).toHaveBeenCalledWith('qcm-generator', {
          body: expect.objectContaining({
            session_type: type,
          }),
        });
      }
    });
  });

  describe('calculateSessionStats', () => {
    it('should return null for empty sessions', () => {
      const result = qcmService.calculateSessionStats([]);
      expect(result).toBeNull();
    });

    it('should calculate correct average score', () => {
      const sessions: QcmSession[] = [
        createMockSession({ score: 80, completed_at: '2024-01-01' }),
        createMockSession({ score: 90, completed_at: '2024-01-02' }),
        createMockSession({ score: 70, completed_at: '2024-01-03' }),
      ];

      const result = qcmService.calculateSessionStats(sessions);

      expect(result?.average_score).toBe(80);
    });

    it('should find best score', () => {
      const sessions: QcmSession[] = [
        createMockSession({ score: 60, completed_at: '2024-01-01' }),
        createMockSession({ score: 95, completed_at: '2024-01-02' }),
        createMockSession({ score: 75, completed_at: '2024-01-03' }),
      ];

      const result = qcmService.calculateSessionStats(sessions);

      expect(result?.best_score).toBe(95);
    });

    it('should count sessions by type', () => {
      const sessions: QcmSession[] = [
        createMockSession({ session_type: 'rang_a', completed_at: '2024-01-01' }),
        createMockSession({ session_type: 'rang_a', completed_at: '2024-01-02' }),
        createMockSession({ session_type: 'rang_b', completed_at: '2024-01-03' }),
        createMockSession({ session_type: 'mixed', completed_at: '2024-01-04' }),
      ];

      const result = qcmService.calculateSessionStats(sessions);

      expect(result?.sessions_by_type).toEqual({
        rang_a: 2,
        rang_b: 1,
        mixed: 1,
      });
    });

    it('should only count completed sessions for average', () => {
      const sessions: QcmSession[] = [
        createMockSession({ score: 100, completed_at: '2024-01-01' }),
        createMockSession({ score: 50, completed_at: undefined }), // Not completed
        createMockSession({ score: 80, completed_at: '2024-01-03' }),
      ];

      const result = qcmService.calculateSessionStats(sessions);

      expect(result?.completed_sessions).toBe(2);
      expect(result?.average_score).toBe(90); // (100 + 80) / 2
    });

    it('should sum total questions answered', () => {
      const sessions: QcmSession[] = [
        createMockSession({ total_questions: 10, completed_at: '2024-01-01' }),
        createMockSession({ total_questions: 20, completed_at: '2024-01-02' }),
        createMockSession({ total_questions: 15, completed_at: '2024-01-03' }),
      ];

      const result = qcmService.calculateSessionStats(sessions);

      expect(result?.total_questions_answered).toBe(45);
    });
  });

  describe('getScoreColor', () => {
    it('should return success color for score >= 80', () => {
      expect(qcmService.getScoreColor(80)).toBe('text-success bg-success/10');
      expect(qcmService.getScoreColor(100)).toBe('text-success bg-success/10');
    });

    it('should return warning color for score >= 60 and < 80', () => {
      expect(qcmService.getScoreColor(60)).toBe('text-warning bg-warning/10');
      expect(qcmService.getScoreColor(79)).toBe('text-warning bg-warning/10');
    });

    it('should return destructive color for score < 60', () => {
      expect(qcmService.getScoreColor(59)).toBe('text-destructive bg-destructive/10');
      expect(qcmService.getScoreColor(0)).toBe('text-destructive bg-destructive/10');
    });
  });

  describe('getScoreBadgeVariant', () => {
    it('should return correct badge variants', () => {
      expect(qcmService.getScoreBadgeVariant(80)).toBe('default');
      expect(qcmService.getScoreBadgeVariant(70)).toBe('secondary');
      expect(qcmService.getScoreBadgeVariant(50)).toBe('destructive');
    });
  });

  describe('formatSessionDuration', () => {
    it('should format duration correctly', () => {
      expect(qcmService.formatSessionDuration(0)).toBe('0:00');
      expect(qcmService.formatSessionDuration(30)).toBe('0:30');
      expect(qcmService.formatSessionDuration(60)).toBe('1:00');
      expect(qcmService.formatSessionDuration(90)).toBe('1:30');
      expect(qcmService.formatSessionDuration(125)).toBe('2:05');
      expect(qcmService.formatSessionDuration(3600)).toBe('60:00');
    });

    it('should pad seconds with leading zero', () => {
      expect(qcmService.formatSessionDuration(65)).toBe('1:05');
      expect(qcmService.formatSessionDuration(601)).toBe('10:01');
    });
  });

  describe('getPerformanceMessage', () => {
    it('should return correct messages for different scores', () => {
      expect(qcmService.getPerformanceMessage(95)).toContain('Excellent');
      expect(qcmService.getPerformanceMessage(85)).toContain('Tres bien');
      expect(qcmService.getPerformanceMessage(75)).toContain('Bien');
      expect(qcmService.getPerformanceMessage(65)).toContain('Moyen');
      expect(qcmService.getPerformanceMessage(50)).toContain('revoir');
    });
  });

  describe('analyzeRecurringErrors', () => {
    it('should analyze errors by concept', () => {
      const sessions: QcmSession[] = [];
      const responses: QcmResponse[] = [
        createMockResponse({ medical_concept: 'Cardiologie', is_correct: false }),
        createMockResponse({ medical_concept: 'Cardiologie', is_correct: false }),
        createMockResponse({ medical_concept: 'Cardiologie', is_correct: true }),
        createMockResponse({ medical_concept: 'Neurologie', is_correct: false }),
        createMockResponse({ medical_concept: 'Neurologie', is_correct: true }),
      ];

      const result = qcmService.analyzeRecurringErrors(sessions, responses);

      expect(result[0].concept).toBe('Cardiologie');
      expect(result[0].errorCount).toBe(2);
      expect(result[0].percentage).toBe(67); // 2/3 rounded
    });

    it('should sort by error count descending', () => {
      const responses: QcmResponse[] = [
        createMockResponse({ medical_concept: 'A', is_correct: false }),
        createMockResponse({ medical_concept: 'B', is_correct: false }),
        createMockResponse({ medical_concept: 'B', is_correct: false }),
        createMockResponse({ medical_concept: 'C', is_correct: false }),
        createMockResponse({ medical_concept: 'C', is_correct: false }),
        createMockResponse({ medical_concept: 'C', is_correct: false }),
      ];

      const result = qcmService.analyzeRecurringErrors([], responses);

      expect(result[0].concept).toBe('C');
      expect(result[1].concept).toBe('B');
      expect(result[2].concept).toBe('A');
    });

    it('should handle missing medical_concept', () => {
      const responses: QcmResponse[] = [
        createMockResponse({ medical_concept: undefined, is_correct: false }),
      ];

      const result = qcmService.analyzeRecurringErrors([], responses);

      expect(result[0].concept).toBe('Non classifié');
    });
  });

  describe('getRevisionRecommendations', () => {
    it('should prioritize high error concepts', () => {
      const errors = [
        { concept: 'Critical', errorCount: 10, percentage: 80 },
        { concept: 'Medium', errorCount: 5, percentage: 55 },
        { concept: 'Low', errorCount: 2, percentage: 35 },
      ];

      const recommendations = qcmService.getRevisionRecommendations(errors);

      expect(recommendations[0]).toContain('Priorite haute');
      expect(recommendations[0]).toContain('Critical');
      expect(recommendations[1]).toContain('Priorite moyenne');
      expect(recommendations[2]).toContain('Priorite basse');
    });

    it('should return positive message when no significant errors', () => {
      const errors = [
        { concept: 'A', errorCount: 1, percentage: 10 },
      ];

      const recommendations = qcmService.getRevisionRecommendations(errors);

      expect(recommendations[0]).toContain('Excellent');
    });

    it('should limit to 5 recommendations', () => {
      const errors = Array.from({ length: 10 }, (_, i) => ({
        concept: `Concept ${i}`,
        errorCount: 10 - i,
        percentage: 80 - i * 5,
      }));

      const recommendations = qcmService.getRevisionRecommendations(errors);

      // Max 5 error recommendations (percentage >= 30 for first 5)
      expect(recommendations.length).toBeLessThanOrEqual(5);
    });
  });

  describe('calculateProgressOverTime', () => {
    it('should group scores by date', () => {
      const sessions: QcmSession[] = [
        createMockSession({ score: 70, completed_at: '2024-01-15T10:00:00Z' }),
        createMockSession({ score: 80, completed_at: '2024-01-15T14:00:00Z' }),
        createMockSession({ score: 90, completed_at: '2024-01-16T10:00:00Z' }),
      ];

      const result = qcmService.calculateProgressOverTime(sessions);

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-01-15');
      expect(result[0].averageScore).toBe(75); // (70 + 80) / 2
      expect(result[0].sessionsCount).toBe(2);
      expect(result[1].date).toBe('2024-01-16');
      expect(result[1].averageScore).toBe(90);
    });

    it('should sort by date ascending', () => {
      const sessions: QcmSession[] = [
        createMockSession({ score: 80, completed_at: '2024-01-20T10:00:00Z' }),
        createMockSession({ score: 70, completed_at: '2024-01-10T10:00:00Z' }),
        createMockSession({ score: 90, completed_at: '2024-01-15T10:00:00Z' }),
      ];

      const result = qcmService.calculateProgressOverTime(sessions);

      expect(result[0].date).toBe('2024-01-10');
      expect(result[1].date).toBe('2024-01-15');
      expect(result[2].date).toBe('2024-01-20');
    });

    it('should skip incomplete sessions', () => {
      const sessions: QcmSession[] = [
        createMockSession({ score: 80, completed_at: '2024-01-15T10:00:00Z' }),
        createMockSession({ score: 50, completed_at: undefined }),
      ];

      const result = qcmService.calculateProgressOverTime(sessions);

      expect(result).toHaveLength(1);
    });
  });

  describe('predictScore', () => {
    it('should return 70 with less than 3 sessions', () => {
      const sessions: QcmSession[] = [
        createMockSession({ score: 100, completed_at: '2024-01-15' }),
        createMockSession({ score: 100, completed_at: '2024-01-16' }),
      ];

      expect(qcmService.predictScore(sessions)).toBe(70);
    });

    it('should weight recent sessions more heavily', () => {
      const sessions: QcmSession[] = [
        createMockSession({ score: 60, completed_at: '2024-01-10' }),
        createMockSession({ score: 60, completed_at: '2024-01-11' }),
        createMockSession({ score: 60, completed_at: '2024-01-12' }),
        createMockSession({ score: 90, completed_at: '2024-01-13' }),
        createMockSession({ score: 90, completed_at: '2024-01-14' }),
      ];

      const prediction = qcmService.predictScore(sessions);

      // Recent high scores should pull average up
      expect(prediction).toBeGreaterThan(70);
    });

    it('should use only last 5 sessions', () => {
      const sessions: QcmSession[] = [
        createMockSession({ score: 100, completed_at: '2024-01-01' }),
        createMockSession({ score: 100, completed_at: '2024-01-02' }),
        createMockSession({ score: 100, completed_at: '2024-01-03' }),
        createMockSession({ score: 50, completed_at: '2024-01-10' }),
        createMockSession({ score: 50, completed_at: '2024-01-11' }),
        createMockSession({ score: 50, completed_at: '2024-01-12' }),
        createMockSession({ score: 50, completed_at: '2024-01-13' }),
        createMockSession({ score: 50, completed_at: '2024-01-14' }),
      ];

      const prediction = qcmService.predictScore(sessions);

      // Only last 5 (all 50) should be considered
      expect(prediction).toBe(50);
    });
  });

  describe('generateRevisionPlan', () => {
    it('should create plan based on errors', () => {
      const errors = [
        { concept: 'Cardiologie', errorCount: 10, percentage: 70 },
        { concept: 'Neurologie', errorCount: 5, percentage: 40 },
      ];

      const plan = qcmService.generateRevisionPlan([], errors);

      expect(plan).toHaveLength(2);
      expect(plan[0].day).toBe(1);
      expect(plan[0].focus).toBe('Cardiologie');
      expect(plan[0].duration).toBe(60); // >= 50% error rate
      expect(plan[1].duration).toBe(30); // < 50% error rate
    });

    it('should include specific activities', () => {
      const errors = [{ concept: 'Test', errorCount: 5, percentage: 50 }];

      const plan = qcmService.generateRevisionPlan([], errors);

      expect(plan[0].activities).toContain(expect.stringContaining('Relire le cours'));
      expect(plan[0].activities).toContain(expect.stringContaining('QCM'));
    });

    it('should limit to 7 days', () => {
      const errors = Array.from({ length: 10 }, (_, i) => ({
        concept: `Concept ${i}`,
        errorCount: 10 - i,
        percentage: 80,
      }));

      const plan = qcmService.generateRevisionPlan([], errors);

      expect(plan.length).toBeLessThanOrEqual(7);
    });
  });

  describe('exportStats', () => {
    it('should export valid JSON', () => {
      const sessions: QcmSession[] = [
        createMockSession({ score: 80, completed_at: '2024-01-15' }),
      ];

      const exported = qcmService.exportStats(sessions);
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveProperty('total_sessions');
      expect(parsed).toHaveProperty('exportDate');
      expect(parsed).toHaveProperty('version', '1.0');
    });

    it('should return empty JSON for empty sessions', () => {
      expect(qcmService.exportStats([])).toBe('{}');
    });
  });

  describe('calculateStreak', () => {
    it('should return 0 for no sessions', () => {
      expect(qcmService.calculateStreak([])).toBe(0);
    });

    it('should calculate consecutive days', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15'));

      const sessions: QcmSession[] = [
        createMockSession({ completed_at: '2024-01-13T10:00:00Z' }),
        createMockSession({ completed_at: '2024-01-14T10:00:00Z' }),
        createMockSession({ completed_at: '2024-01-15T10:00:00Z' }),
      ];

      const streak = qcmService.calculateStreak(sessions);

      expect(streak).toBe(3);

      vi.useRealTimers();
    });

    it('should break streak on missed day', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15'));

      const sessions: QcmSession[] = [
        createMockSession({ completed_at: '2024-01-12T10:00:00Z' }),
        // Jan 13 missing
        createMockSession({ completed_at: '2024-01-14T10:00:00Z' }),
        createMockSession({ completed_at: '2024-01-15T10:00:00Z' }),
      ];

      const streak = qcmService.calculateStreak(sessions);

      expect(streak).toBe(2); // Only Jan 14-15

      vi.useRealTimers();
    });

    it('should handle incomplete sessions', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15'));

      const sessions: QcmSession[] = [
        createMockSession({ completed_at: '2024-01-15T10:00:00Z' }),
        createMockSession({ completed_at: undefined }), // Not completed
      ];

      const streak = qcmService.calculateStreak(sessions);

      expect(streak).toBe(1);

      vi.useRealTimers();
    });
  });

  describe('getUserQuotas', () => {
    it('should return null if user is not authenticated', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await qcmService.getUserQuotas();

      expect(result).toBeNull();
    });

    it('should fetch quotas for authenticated user', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockQuota = {
        id: 'quota-1',
        user_id: 'user-123',
        subscription_type: 'standard',
        monthly_qcm_quota: 50,
        monthly_qcm_used: 10,
      };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: mockQuota, error: null }),
          }),
        }),
      });

      const result = await qcmService.getUserQuotas();

      expect(result).toEqual(mockQuota);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very high scores (>100)', () => {
      // This shouldn't happen, but be defensive
      expect(qcmService.getScoreColor(150)).toBe('text-success bg-success/10');
    });

    it('should handle negative scores', () => {
      expect(qcmService.getScoreColor(-10)).toBe('text-destructive bg-destructive/10');
    });

    it('should handle very long session durations', () => {
      expect(qcmService.formatSessionDuration(36000)).toBe('600:00');
    });

    it('should handle empty responses array in error analysis', () => {
      const result = qcmService.analyzeRecurringErrors([], []);
      expect(result).toEqual([]);
    });
  });
});

// Helper functions to create mock data
function createMockSession(overrides: Partial<QcmSession>): QcmSession {
  return {
    id: 'session-' + Math.random().toString(36).substr(2, 9),
    user_id: 'user-123',
    item_code: 'IC-001',
    session_type: 'rang_a',
    score: 75,
    total_questions: 10,
    correct_answers: 7,
    incorrect_answers: 3,
    time_spent_seconds: 600,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

function createMockResponse(overrides: Partial<QcmResponse>): QcmResponse {
  return {
    id: 'response-' + Math.random().toString(36).substr(2, 9),
    session_id: 'session-123',
    question_id: 'question-123',
    question_text: 'Test question?',
    user_answer: 'A',
    correct_answer: 'A',
    is_correct: true,
    response_time_seconds: 30,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}
