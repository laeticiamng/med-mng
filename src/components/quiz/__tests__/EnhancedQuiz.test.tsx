import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedQuiz } from '../EnhancedQuiz';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        error: null
      })
    })
  }
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const mockQuestions = [
  {
    id: 1,
    question: "Quelle est la principale cause de l'hypertension artérielle ?",
    options: [
      "Stress chronique",
      "Alimentation riche en sodium", 
      "Facteurs génétiques",
      "Manque d'exercice"
    ],
    correct: 1,
    explanation: "Une alimentation riche en sodium est la principale cause modifiable d'hypertension.",
    rang: 'A' as const,
    difficulty: 'medium' as const
  },
  {
    id: 2,
    question: "Quel est le traitement de première ligne de l'hypertension ?",
    options: [
      "Inhibiteurs calciques",
      "Diurétiques thiazidiques",
      "IEC/ARA2",
      "Bêta-bloquants"
    ],
    correct: 1,
    explanation: "Les diurétiques thiazidiques sont recommandés en première intention.",
    rang: 'A' as const,
    difficulty: 'easy' as const
  }
];

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00.000Z',
  phone: null,
  phone_confirmed_at: null,
  email_confirmed_at: '2023-01-01T00:00:00.000Z',
  confirmed_at: '2023-01-01T00:00:00.000Z',
  last_sign_in_at: '2023-01-01T00:00:00.000Z',
  role: 'authenticated',
  updated_at: '2023-01-01T00:00:00.000Z'
};

describe('EnhancedQuiz - Session Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup successful auth
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should save quiz session correctly when completed', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const onComplete = vi.fn();

    render(
      <EnhancedQuiz
        itemCode="IC-1"
        itemTitle="Hypertension Artérielle"
        questions={mockQuestions}
        rang="A"
        onComplete={onComplete}
      />
    );

    // Répondre à la première question
    const firstOption = screen.getByText("Stress chronique");
    fireEvent.click(firstOption);

    // Passer à la question suivante
    const nextButton = screen.getByText("Suivant");
    fireEvent.click(nextButton);

    // Répondre à la deuxième question
    const secondOption = screen.getByText("Diurétiques thiazidiques");
    fireEvent.click(secondOption);

    // Terminer le quiz
    const finishButton = screen.getByText("Terminer");
    fireEvent.click(finishButton);

    // Attendre que la sauvegarde soit appelée
    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('quiz_sessions');
    });

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          item_code: 'IC-1',
          rang: 'A',
          score: 50, // 1 bonne réponse sur 2
          questions_count: 2,
          correct_answers: 1,
          completed: true,
          time_spent_seconds: expect.any(Number),
          session_data: expect.objectContaining({
            sessionId: expect.any(String),
            itemCode: 'IC-1',
            rang: 'A',
            questions: mockQuestions,
            answers: expect.arrayContaining([
              expect.objectContaining({
                questionId: 1,
                selectedOption: 0,
                isCorrect: false
              }),
              expect.objectContaining({
                questionId: 2,
                selectedOption: 1,
                isCorrect: true
              })
            ]),
            startTime: expect.any(String),
            endTime: expect.any(String),
            completed: true
          })
        })
      );
    });

    // Vérifier que onComplete a été appelé
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        itemCode: 'IC-1',
        rang: 'A',
        score: 50,
        completed: true
      })
    );
  });

  it('should handle save error gracefully', async () => {
    const mockError = new Error('Database error');
    const mockInsert = vi.fn().mockResolvedValue({ error: mockError });
    const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const { toast } = await import('sonner');

    render(
      <EnhancedQuiz
        itemCode="IC-1"
        itemTitle="Test Quiz"
        questions={mockQuestions}
        rang="A"
      />
    );

    // Compléter le quiz rapidement
    fireEvent.click(screen.getByText("Stress chronique"));
    fireEvent.click(screen.getByText("Suivant"));
    fireEvent.click(screen.getByText("Diurétiques thiazidiques"));
    fireEvent.click(screen.getByText("Terminer"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erreur lors de la sauvegarde de la session de quiz');
    });
  });

  it('should not save when user is not authenticated', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: null
    });

    const mockInsert = vi.fn();
    const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    render(
      <EnhancedQuiz
        itemCode="IC-1"
        itemTitle="Test Quiz"
        questions={mockQuestions}
        rang="A"
      />
    );

    // Compléter le quiz
    fireEvent.click(screen.getByText("Stress chronique"));
    fireEvent.click(screen.getByText("Suivant"));
    fireEvent.click(screen.getByText("Diurétiques thiazidiques"));
    fireEvent.click(screen.getByText("Terminer"));

    await waitFor(() => {
      expect(mockInsert).not.toHaveBeenCalled();
    });
  });

  it('should calculate time spent correctly', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    // Mock performance.now pour contrôler le temps
    const originalNow = Date.now;
    let mockTime = 1000;
    vi.spyOn(Date, 'now').mockImplementation(() => mockTime);

    render(
      <EnhancedQuiz
        itemCode="IC-1"
        itemTitle="Test Quiz"
        questions={mockQuestions.slice(0, 1)} // Une seule question
        rang="A"
      />
    );

    // Simuler l'écoulement du temps (5 secondes)
    mockTime += 5000;

    fireEvent.click(screen.getByText("Stress chronique"));
    fireEvent.click(screen.getByText("Terminer"));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          time_spent_seconds: 5 // 5 secondes écoulées
        })
      );
    });

    // Restaurer Date.now
    Date.now = originalNow;
  });

  it('should serialize session data correctly for storage', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    render(
      <EnhancedQuiz
        itemCode="IC-1"
        itemTitle="Test Quiz"
        questions={mockQuestions.slice(0, 1)}
        rang="A"
      />
    );

    fireEvent.click(screen.getByText("Stress chronique"));
    fireEvent.click(screen.getByText("Terminer"));

    await waitFor(() => {
      const insertCall = mockInsert.mock.calls[0][0];
      const sessionData = insertCall.session_data;
      
      // Vérifier que les dates sont sérialisées en strings ISO
      expect(typeof sessionData.startTime).toBe('string');
      expect(typeof sessionData.endTime).toBe('string');
      expect(() => new Date(sessionData.startTime)).not.toThrow();
      expect(() => new Date(sessionData.endTime)).not.toThrow();
    });
  });
});