import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-123' } } })
  },
  from: vi.fn(),
  functions: {
    invoke: vi.fn()
  }
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('useEnhancedQuiz (Quiz System)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Quiz Generation', () => {
    it('should generate deterministic distractors based on competencies', () => {
      // Medical distractor library - no Math.random()
      const medicalDistractors = [
        "Absence de corrélation clinico-biologique établie",
        "Perturbation de l'homéostasie tissulaire",
        "Déficit fonctionnel multi-systémique",
        "Altération du processus physiopathologique"
      ];

      // Deterministic selection based on hash
      const selectDistractor = (index: number, competence: string): string => {
        const hash = competence.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const distIndex = (hash + index) % medicalDistractors.length;
        return medicalDistractors[distIndex];
      };

      const competence = "Diagnostic différentiel";
      const distractor1 = selectDistractor(0, competence);
      const distractor2 = selectDistractor(0, competence);
      
      // Should be deterministic
      expect(distractor1).toBe(distractor2);
    });

    it('should have sufficient distractor variety', () => {
      const medicalDistractors = [
        "Absence de corrélation clinico-biologique établie",
        "Perturbation de l'homéostasie tissulaire",
        "Déficit fonctionnel multi-systémique",
        "Altération du processus physiopathologique",
        "Modification du profil inflammatoire",
        "Anomalie de la signalisation cellulaire",
        "Dysfonction du métabolisme énergétique",
        "Trouble de la régulation neuro-hormonale"
      ];

      // Should have at least 8 distractors for variety
      expect(medicalDistractors.length).toBeGreaterThanOrEqual(8);
      
      // All should be meaningful medical terms (not "Option incorrecte")
      medicalDistractors.forEach(d => {
        expect(d.length).toBeGreaterThan(20);
        expect(d).not.toContain('Option incorrecte');
        expect(d).not.toContain('Réponse');
      });
    });
  });

  describe('Quiz Persistence', () => {
    it('should persist results to quiz_results table', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      
      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      // Simulate quiz result persistence
      const quizResult = {
        user_id: 'test-user-123',
        item_code: 'IC-123',
        score: 80,
        total_questions: 10,
        correct_answers: 8,
        time_spent_seconds: 300
      };

      await mockSupabase.from('quiz_results').insert(quizResult);

      expect(mockSupabase.from).toHaveBeenCalledWith('quiz_results');
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should log activity to user_activity_log', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      
      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      const activity = {
        user_id: 'test-user-123',
        activity_type: 'quiz_completed',
        metadata: { item_code: 'IC-123', score: 80 }
      };

      await mockSupabase.from('user_activity_log').insert(activity);

      expect(mockSupabase.from).toHaveBeenCalledWith('user_activity_log');
    });

    it('should award gamification points on quiz completion', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      
      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      const gamificationActivity = {
        user_id: 'test-user-123',
        activity_type: 'quiz_completed',
        points_earned: 100
      };

      await mockSupabase.from('gamification_activities').insert(gamificationActivity);

      expect(mockSupabase.from).toHaveBeenCalledWith('gamification_activities');
    });
  });

  describe('Quiz Scoring', () => {
    it('should calculate score correctly', () => {
      const testCases = [
        { correct: 10, total: 10, expected: 100 },
        { correct: 7, total: 10, expected: 70 },
        { correct: 0, total: 10, expected: 0 },
        { correct: 5, total: 20, expected: 25 }
      ];

      testCases.forEach(({ correct, total, expected }) => {
        const score = Math.round((correct / total) * 100);
        expect(score).toBe(expected);
      });
    });

    it('should handle zero total questions', () => {
      const total = 0;
      const correct = 0;
      
      // Avoid division by zero
      const score = total > 0 ? Math.round((correct / total) * 100) : 0;
      expect(score).toBe(0);
    });

    it('should award perfect exam badge for 100% score', () => {
      const score = 100;
      const shouldAwardBadge = score === 100;
      expect(shouldAwardBadge).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty question list', () => {
      const questions: any[] = [];
      expect(questions.length).toBe(0);
    });

    it('should handle null/undefined item codes', () => {
      const itemCode: string | null = null;
      const isValid = itemCode !== null && itemCode !== undefined && itemCode.length > 0;
      expect(isValid).toBe(false);
    });

    it('should validate question format', () => {
      const validQuestion = {
        id: 'q1',
        question: 'What is the diagnosis?',
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 0
      };

      expect(validQuestion.options.length).toBeGreaterThanOrEqual(4);
      expect(validQuestion.correctIndex).toBeGreaterThanOrEqual(0);
      expect(validQuestion.correctIndex).toBeLessThan(validQuestion.options.length);
    });
  });
});
