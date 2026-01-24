/**
 * Tests complets pour quizStore
 *
 * Verifie la gestion de l'etat des quiz medicaux.
 * Critique pour l'integrite des resultats d'apprentissage.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useQuizStore } from '@/stores/quizStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('quizStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    act(() => {
      useQuizStore.getState().reset();
    });
    localStorageMock.clear();
  });

  describe('Etat initial', () => {
    it('should have null currentQuiz initially', () => {
      const { result } = renderHook(() => useQuizStore());
      expect(result.current.currentQuiz).toBeNull();
    });

    it('should have empty results initially', () => {
      const { result } = renderHook(() => useQuizStore());
      expect(result.current.results).toEqual([]);
    });

    it('should have zeroed stats initially', () => {
      const { result } = renderHook(() => useQuizStore());
      expect(result.current.stats).toEqual({
        totalQuizzes: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        averageScore: 0,
        bestScore: 0,
      });
    });
  });

  describe('startQuiz', () => {
    const mockQuestions = [
      { id: 'q1', question: 'Question 1?', options: ['A', 'B', 'C', 'D'], correctIndex: 0 },
      { id: 'q2', question: 'Question 2?', options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
      { id: 'q3', question: 'Question 3?', options: ['A', 'B', 'C', 'D'], correctIndex: 2 },
    ];

    it('should start a quiz with the given questions', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.startQuiz('item-123', mockQuestions);
      });

      expect(result.current.currentQuiz).not.toBeNull();
      expect(result.current.currentQuiz?.itemId).toBe('item-123');
      expect(result.current.currentQuiz?.questions).toEqual(mockQuestions);
    });

    it('should set currentIndex to 0', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.startQuiz('item-123', mockQuestions);
      });

      expect(result.current.currentQuiz?.currentIndex).toBe(0);
    });

    it('should have empty answers initially', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.startQuiz('item-123', mockQuestions);
      });

      expect(result.current.currentQuiz?.answers).toEqual([]);
    });

    it('should set startTime', () => {
      const { result } = renderHook(() => useQuizStore());
      const beforeStart = new Date().toISOString();

      act(() => {
        result.current.startQuiz('item-123', mockQuestions);
      });

      const afterStart = new Date().toISOString();
      expect(result.current.currentQuiz?.startTime).toBeDefined();
      expect(result.current.currentQuiz!.startTime >= beforeStart).toBe(true);
      expect(result.current.currentQuiz!.startTime <= afterStart).toBe(true);
    });
  });

  describe('answerQuestion', () => {
    const mockQuestions = [
      { id: 'q1', question: 'Question 1?', options: ['A', 'B', 'C', 'D'], correctIndex: 0 },
      { id: 'q2', question: 'Question 2?', options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
    ];

    it('should record answer for current question', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.startQuiz('item-123', mockQuestions);
        result.current.answerQuestion(2);
      });

      expect(result.current.currentQuiz?.answers).toEqual([
        { questionId: 'q1', selectedIndex: 2 }
      ]);
    });

    it('should do nothing if no quiz is active', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.answerQuestion(0);
      });

      expect(result.current.currentQuiz).toBeNull();
    });

    it('should record multiple answers in sequence', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.startQuiz('item-123', mockQuestions);
        result.current.answerQuestion(0);
        result.current.nextQuestion();
        result.current.answerQuestion(1);
      });

      expect(result.current.currentQuiz?.answers).toHaveLength(2);
    });
  });

  describe('nextQuestion', () => {
    const mockQuestions = [
      { id: 'q1', question: 'Question 1?', options: ['A', 'B', 'C', 'D'], correctIndex: 0 },
      { id: 'q2', question: 'Question 2?', options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
    ];

    it('should increment currentIndex', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.startQuiz('item-123', mockQuestions);
        result.current.nextQuestion();
      });

      expect(result.current.currentQuiz?.currentIndex).toBe(1);
    });

    it('should do nothing if no quiz is active', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.nextQuestion();
      });

      expect(result.current.currentQuiz).toBeNull();
    });
  });

  describe('finishQuiz', () => {
    const mockQuestions = [
      { id: 'q1', question: 'Question 1?', options: ['A', 'B', 'C', 'D'], correctIndex: 0 },
      { id: 'q2', question: 'Question 2?', options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
      { id: 'q3', question: 'Question 3?', options: ['A', 'B', 'C', 'D'], correctIndex: 2 },
    ];

    it('should return null if no quiz is active', () => {
      const { result } = renderHook(() => useQuizStore());

      let quizResult;
      act(() => {
        quizResult = result.current.finishQuiz();
      });

      expect(quizResult).toBeNull();
    });

    it('should calculate score correctly (100%)', () => {
      const { result } = renderHook(() => useQuizStore());

      let quizResult;
      act(() => {
        result.current.startQuiz('item-123', mockQuestions);
        result.current.answerQuestion(0); // Correct
        result.current.nextQuestion();
        result.current.answerQuestion(1); // Correct
        result.current.nextQuestion();
        result.current.answerQuestion(2); // Correct
        quizResult = result.current.finishQuiz();
      });

      expect(quizResult?.score).toBe(100);
      expect(quizResult?.correctAnswers).toBe(3);
      expect(quizResult?.totalQuestions).toBe(3);
    });

    it('should calculate score correctly (partial)', () => {
      const { result } = renderHook(() => useQuizStore());

      let quizResult;
      act(() => {
        result.current.startQuiz('item-123', mockQuestions);
        result.current.answerQuestion(0); // Correct
        result.current.nextQuestion();
        result.current.answerQuestion(0); // Wrong (should be 1)
        result.current.nextQuestion();
        result.current.answerQuestion(2); // Correct
        quizResult = result.current.finishQuiz();
      });

      expect(quizResult?.score).toBe(67); // 2/3 = 66.67% rounded
      expect(quizResult?.correctAnswers).toBe(2);
    });

    it('should calculate score correctly (0%)', () => {
      const { result } = renderHook(() => useQuizStore());

      let quizResult;
      act(() => {
        result.current.startQuiz('item-123', mockQuestions);
        result.current.answerQuestion(3); // Wrong
        result.current.nextQuestion();
        result.current.answerQuestion(3); // Wrong
        result.current.nextQuestion();
        result.current.answerQuestion(3); // Wrong
        quizResult = result.current.finishQuiz();
      });

      expect(quizResult?.score).toBe(0);
      expect(quizResult?.correctAnswers).toBe(0);
    });

    it('should clear currentQuiz after finishing', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.startQuiz('item-123', mockQuestions);
        result.current.answerQuestion(0);
        result.current.finishQuiz();
      });

      expect(result.current.currentQuiz).toBeNull();
    });

    it('should add result to results array', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.startQuiz('item-123', mockQuestions);
        result.current.answerQuestion(0);
        result.current.finishQuiz();
      });

      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].itemId).toBe('item-123');
    });

    it('should update stats correctly', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.startQuiz('item-123', mockQuestions);
        result.current.answerQuestion(0);
        result.current.nextQuestion();
        result.current.answerQuestion(1);
        result.current.nextQuestion();
        result.current.answerQuestion(2);
        result.current.finishQuiz();
      });

      expect(result.current.stats.totalQuizzes).toBe(1);
      expect(result.current.stats.totalQuestions).toBe(3);
      expect(result.current.stats.correctAnswers).toBe(3);
      expect(result.current.stats.averageScore).toBe(100);
      expect(result.current.stats.bestScore).toBe(100);
    });

    it('should update bestScore only when score is higher', () => {
      const { result } = renderHook(() => useQuizStore());

      // First quiz: 100%
      act(() => {
        result.current.startQuiz('item-1', mockQuestions);
        result.current.answerQuestion(0);
        result.current.nextQuestion();
        result.current.answerQuestion(1);
        result.current.nextQuestion();
        result.current.answerQuestion(2);
        result.current.finishQuiz();
      });

      expect(result.current.stats.bestScore).toBe(100);

      // Second quiz: 67%
      act(() => {
        result.current.startQuiz('item-2', mockQuestions);
        result.current.answerQuestion(0);
        result.current.nextQuestion();
        result.current.answerQuestion(0); // Wrong
        result.current.nextQuestion();
        result.current.answerQuestion(2);
        result.current.finishQuiz();
      });

      expect(result.current.stats.bestScore).toBe(100); // Still 100
    });

    it('should include time spent in result', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.startQuiz('item-123', mockQuestions);
      });

      // Advance time by 30 seconds
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      let quizResult;
      act(() => {
        result.current.answerQuestion(0);
        quizResult = result.current.finishQuiz();
      });

      expect(quizResult?.timeSpent).toBeGreaterThanOrEqual(30);

      vi.useRealTimers();
    });
  });

  describe('getResultsByItem', () => {
    const mockQuestions = [
      { id: 'q1', question: 'Q?', options: ['A', 'B', 'C', 'D'], correctIndex: 0 },
    ];

    it('should return empty array if no results for item', () => {
      const { result } = renderHook(() => useQuizStore());

      const results = result.current.getResultsByItem('unknown-item');
      expect(results).toEqual([]);
    });

    it('should return only results for specified item', () => {
      const { result } = renderHook(() => useQuizStore());

      // Quiz for item-1
      act(() => {
        result.current.startQuiz('item-1', mockQuestions);
        result.current.answerQuestion(0);
        result.current.finishQuiz();
      });

      // Quiz for item-2
      act(() => {
        result.current.startQuiz('item-2', mockQuestions);
        result.current.answerQuestion(0);
        result.current.finishQuiz();
      });

      // Another quiz for item-1
      act(() => {
        result.current.startQuiz('item-1', mockQuestions);
        result.current.answerQuestion(0);
        result.current.finishQuiz();
      });

      const item1Results = result.current.getResultsByItem('item-1');
      const item2Results = result.current.getResultsByItem('item-2');

      expect(item1Results).toHaveLength(2);
      expect(item2Results).toHaveLength(1);
    });
  });

  describe('reset', () => {
    const mockQuestions = [
      { id: 'q1', question: 'Q?', options: ['A', 'B', 'C', 'D'], correctIndex: 0 },
    ];

    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useQuizStore());

      // Do some operations
      act(() => {
        result.current.startQuiz('item-1', mockQuestions);
        result.current.answerQuestion(0);
        result.current.finishQuiz();
      });

      expect(result.current.results).toHaveLength(1);
      expect(result.current.stats.totalQuizzes).toBe(1);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.currentQuiz).toBeNull();
      expect(result.current.results).toEqual([]);
      expect(result.current.stats).toEqual({
        totalQuizzes: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        averageScore: 0,
        bestScore: 0,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle quiz with single question', () => {
      const { result } = renderHook(() => useQuizStore());
      const singleQuestion = [
        { id: 'q1', question: 'Q?', options: ['A', 'B'], correctIndex: 0 },
      ];

      let quizResult;
      act(() => {
        result.current.startQuiz('item-1', singleQuestion);
        result.current.answerQuestion(0);
        quizResult = result.current.finishQuiz();
      });

      expect(quizResult?.score).toBe(100);
      expect(quizResult?.totalQuestions).toBe(1);
    });

    it('should handle quiz with many questions', () => {
      const { result } = renderHook(() => useQuizStore());
      const manyQuestions = Array.from({ length: 100 }, (_, i) => ({
        id: `q${i}`,
        question: `Question ${i}?`,
        options: ['A', 'B', 'C', 'D'],
        correctIndex: i % 4,
      }));

      act(() => {
        result.current.startQuiz('item-1', manyQuestions);
        // Answer all correctly
        manyQuestions.forEach((q, i) => {
          result.current.answerQuestion(i % 4);
          if (i < manyQuestions.length - 1) {
            result.current.nextQuestion();
          }
        });
      });

      let quizResult;
      act(() => {
        quizResult = result.current.finishQuiz();
      });

      expect(quizResult?.score).toBe(100);
      expect(quizResult?.totalQuestions).toBe(100);
    });

    it('should handle unanswered questions as wrong', () => {
      const { result } = renderHook(() => useQuizStore());
      const questions = [
        { id: 'q1', question: 'Q1?', options: ['A', 'B', 'C', 'D'], correctIndex: 0 },
        { id: 'q2', question: 'Q2?', options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
      ];

      let quizResult;
      act(() => {
        result.current.startQuiz('item-1', questions);
        result.current.answerQuestion(0); // Only answer first question
        quizResult = result.current.finishQuiz();
      });

      // Only 1 out of 2 answered (correctly)
      expect(quizResult?.correctAnswers).toBe(1);
      expect(quizResult?.answers).toHaveLength(1);
    });
  });

  describe('Persistence', () => {
    it('should persist results to localStorage', () => {
      const { result } = renderHook(() => useQuizStore());
      const mockQuestions = [
        { id: 'q1', question: 'Q?', options: ['A', 'B', 'C', 'D'], correctIndex: 0 },
      ];

      act(() => {
        result.current.startQuiz('item-1', mockQuestions);
        result.current.answerQuestion(0);
        result.current.finishQuiz();
      });

      const stored = localStorageMock.getItem('medmng-quiz');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.results).toHaveLength(1);
    });
  });
});
