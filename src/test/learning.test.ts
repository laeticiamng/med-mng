/**
 * 📚 LEARNING MODULE TESTS
 * Tests for SRS, flashcards, exam mode, and clinical cases
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ────────────────────────────────────────────
// 🎓 SRS (Spaced Repetition System) TESTS
// ────────────────────────────────────────────

describe('Learning - SRS Algorithm', () => {
  interface SRSCard {
    id: string;
    easeFactor: number;
    interval: number;
    repetitions: number;
    nextReview: Date;
  }

  const calculateNextReview = (
    card: SRSCard,
    quality: number // 0-5, where 5 is perfect recall
  ): SRSCard => {
    let { easeFactor, interval, repetitions } = card;

    if (quality < 3) {
      // Failed recall - reset
      repetitions = 0;
      interval = 1;
    } else {
      // Successful recall
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    }

    // Update ease factor (SM-2 algorithm)
    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    return {
      ...card,
      easeFactor,
      interval,
      repetitions,
      nextReview,
    };
  };

  it('should reset card on failed recall (quality < 3)', () => {
    const card: SRSCard = {
      id: '1',
      easeFactor: 2.5,
      interval: 10,
      repetitions: 3,
      nextReview: new Date(),
    };

    const updated = calculateNextReview(card, 2);
    
    expect(updated.repetitions).toBe(0);
    expect(updated.interval).toBe(1);
  });

  it('should increase interval on successful recall', () => {
    const card: SRSCard = {
      id: '1',
      easeFactor: 2.5,
      interval: 1,
      repetitions: 1,
      nextReview: new Date(),
    };

    const updated = calculateNextReview(card, 5);
    
    expect(updated.interval).toBe(6);
    expect(updated.repetitions).toBe(2);
  });

  it('should apply ease factor multiplier after initial reviews', () => {
    const card: SRSCard = {
      id: '1',
      easeFactor: 2.5,
      interval: 6,
      repetitions: 2,
      nextReview: new Date(),
    };

    const updated = calculateNextReview(card, 5);
    
    expect(updated.interval).toBe(15); // 6 * 2.5 = 15
  });

  it('should never let ease factor go below 1.3', () => {
    const card: SRSCard = {
      id: '1',
      easeFactor: 1.4,
      interval: 1,
      repetitions: 0,
      nextReview: new Date(),
    };

    const updated = calculateNextReview(card, 0);
    
    expect(updated.easeFactor).toBeGreaterThanOrEqual(1.3);
  });
});

// ────────────────────────────────────────────
// 📝 FLASHCARDS TESTS
// ────────────────────────────────────────────

describe('Learning - Flashcards', () => {
  interface Flashcard {
    id: string;
    front: string;
    back: string;
    deckId: string;
    tags: string[];
  }

  interface Deck {
    id: string;
    name: string;
    cardCount: number;
  }

  const filterByTags = (cards: Flashcard[], tags: string[]): Flashcard[] => {
    if (tags.length === 0) return cards;
    return cards.filter((card) => 
      tags.some((tag) => card.tags.includes(tag))
    );
  };

  const shuffleCards = (cards: Flashcard[]): Flashcard[] => {
    return [...cards].sort(() => Math.random() - 0.5);
  };

  it('should filter cards by tags', () => {
    const cards: Flashcard[] = [
      { id: '1', front: 'Q1', back: 'A1', deckId: 'd1', tags: ['cardio'] },
      { id: '2', front: 'Q2', back: 'A2', deckId: 'd1', tags: ['neuro'] },
      { id: '3', front: 'Q3', back: 'A3', deckId: 'd1', tags: ['cardio', 'urgences'] },
    ];

    const filtered = filterByTags(cards, ['cardio']);
    
    expect(filtered).toHaveLength(2);
    expect(filtered.every((c) => c.tags.includes('cardio'))).toBe(true);
  });

  it('should return all cards when no tags specified', () => {
    const cards: Flashcard[] = [
      { id: '1', front: 'Q1', back: 'A1', deckId: 'd1', tags: ['cardio'] },
      { id: '2', front: 'Q2', back: 'A2', deckId: 'd1', tags: ['neuro'] },
    ];

    const filtered = filterByTags(cards, []);
    
    expect(filtered).toHaveLength(2);
  });

  it('should shuffle cards randomly', () => {
    const cards: Flashcard[] = [
      { id: '1', front: 'Q1', back: 'A1', deckId: 'd1', tags: [] },
      { id: '2', front: 'Q2', back: 'A2', deckId: 'd1', tags: [] },
      { id: '3', front: 'Q3', back: 'A3', deckId: 'd1', tags: [] },
    ];

    const shuffled = shuffleCards(cards);
    
    expect(shuffled).toHaveLength(3);
    // Note: Can't test randomness deterministically
  });

  it('should maintain card integrity after shuffle', () => {
    const cards: Flashcard[] = [
      { id: '1', front: 'Q1', back: 'A1', deckId: 'd1', tags: [] },
    ];

    const shuffled = shuffleCards(cards);
    
    expect(shuffled[0].id).toBe('1');
    expect(shuffled[0].front).toBe('Q1');
  });
});

// ────────────────────────────────────────────
// 📋 EXAM MODE TESTS
// ────────────────────────────────────────────

describe('Learning - Exam Mode', () => {
  interface Question {
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
    points: number;
  }

  interface ExamResult {
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    passed: boolean;
  }

  const calculateScore = (
    questions: Question[],
    answers: Record<string, number>
  ): ExamResult => {
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach((q) => {
      totalPoints += q.points;
      if (answers[q.id] === q.correctIndex) {
        correctAnswers++;
        earnedPoints += q.points;
      }
    });

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    return {
      totalQuestions: questions.length,
      correctAnswers,
      score: Math.round(score),
      passed: score >= 60,
    };
  };

  it('should calculate perfect score', () => {
    const questions: Question[] = [
      { id: '1', text: 'Q1', options: ['A', 'B'], correctIndex: 0, points: 1 },
      { id: '2', text: 'Q2', options: ['A', 'B'], correctIndex: 1, points: 1 },
    ];

    const answers = { '1': 0, '2': 1 };
    const result = calculateScore(questions, answers);

    expect(result.score).toBe(100);
    expect(result.correctAnswers).toBe(2);
    expect(result.passed).toBe(true);
  });

  it('should calculate partial score', () => {
    const questions: Question[] = [
      { id: '1', text: 'Q1', options: ['A', 'B'], correctIndex: 0, points: 1 },
      { id: '2', text: 'Q2', options: ['A', 'B'], correctIndex: 1, points: 1 },
    ];

    const answers = { '1': 0, '2': 0 }; // Second answer wrong
    const result = calculateScore(questions, answers);

    expect(result.score).toBe(50);
    expect(result.correctAnswers).toBe(1);
    expect(result.passed).toBe(false);
  });

  it('should handle weighted questions', () => {
    const questions: Question[] = [
      { id: '1', text: 'Q1', options: ['A', 'B'], correctIndex: 0, points: 3 },
      { id: '2', text: 'Q2', options: ['A', 'B'], correctIndex: 1, points: 1 },
    ];

    const answers = { '1': 0, '2': 0 }; // Only first correct (worth 3 points)
    const result = calculateScore(questions, answers);

    expect(result.score).toBe(75); // 3/4 = 75%
  });

  it('should determine pass/fail correctly', () => {
    const questions: Question[] = [
      { id: '1', text: 'Q1', options: ['A', 'B'], correctIndex: 0, points: 1 },
      { id: '2', text: 'Q2', options: ['A', 'B'], correctIndex: 1, points: 1 },
      { id: '3', text: 'Q3', options: ['A', 'B'], correctIndex: 0, points: 1 },
    ];

    const pass = { '1': 0, '2': 1, '3': 0 }; // 100%
    const fail = { '1': 1, '2': 0, '3': 1 }; // 0%

    expect(calculateScore(questions, pass).passed).toBe(true);
    expect(calculateScore(questions, fail).passed).toBe(false);
  });
});

// ────────────────────────────────────────────
// 🏥 CLINICAL CASES TESTS
// ────────────────────────────────────────────

describe('Learning - Clinical Cases', () => {
  interface ClinicalCase {
    id: string;
    title: string;
    specialty: string;
    difficulty: 'easy' | 'medium' | 'hard';
    steps: CaseStep[];
  }

  interface CaseStep {
    id: string;
    description: string;
    options: string[];
    correctOption: number;
    explanation: string;
  }

  const filterCasesByDifficulty = (
    cases: ClinicalCase[],
    difficulty: 'easy' | 'medium' | 'hard'
  ): ClinicalCase[] => {
    return cases.filter((c) => c.difficulty === difficulty);
  };

  const filterCasesBySpecialty = (
    cases: ClinicalCase[],
    specialty: string
  ): ClinicalCase[] => {
    return cases.filter((c) => c.specialty === specialty);
  };

  it('should filter cases by difficulty', () => {
    const cases: ClinicalCase[] = [
      { id: '1', title: 'Case 1', specialty: 'cardio', difficulty: 'easy', steps: [] },
      { id: '2', title: 'Case 2', specialty: 'neuro', difficulty: 'hard', steps: [] },
    ];

    const easy = filterCasesByDifficulty(cases, 'easy');
    expect(easy).toHaveLength(1);
    expect(easy[0].id).toBe('1');
  });

  it('should filter cases by specialty', () => {
    const cases: ClinicalCase[] = [
      { id: '1', title: 'Case 1', specialty: 'cardio', difficulty: 'easy', steps: [] },
      { id: '2', title: 'Case 2', specialty: 'neuro', difficulty: 'hard', steps: [] },
    ];

    const cardio = filterCasesBySpecialty(cases, 'cardio');
    expect(cardio).toHaveLength(1);
    expect(cardio[0].specialty).toBe('cardio');
  });

  it('should handle empty results', () => {
    const cases: ClinicalCase[] = [
      { id: '1', title: 'Case 1', specialty: 'cardio', difficulty: 'easy', steps: [] },
    ];

    const result = filterCasesBySpecialty(cases, 'dermatology');
    expect(result).toHaveLength(0);
  });
});
