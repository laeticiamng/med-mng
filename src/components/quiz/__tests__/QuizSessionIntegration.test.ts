import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Test d'intégration pour vérifier la persistance des sessions de quiz
describe('Quiz Sessions Integration Tests', () => {
  let testUserId: string | null = null;
  let testSessionId: string | null = null;

  beforeAll(async () => {
    // Vérifier que nous pouvons nous connecter à Supabase
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.log('No authenticated user for integration tests');
      return;
    }
    testUserId = data.user?.id || null;
  });

  afterAll(async () => {
    // Nettoyer les données de test
    if (testSessionId) {
      await supabase
        .from('quiz_sessions')
        .delete()
        .eq('id', testSessionId);
    }
  });

  it('should create the quiz_sessions table with correct structure', async () => {
    // Vérifier que la table existe et a la bonne structure
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should respect RLS policies - users can only see their own sessions', async () => {
    if (!testUserId) {
      console.log('Skipping RLS test - no authenticated user');
      return;
    }

    // Tenter de lire toutes les sessions (ne devrait montrer que celles de l'utilisateur)
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('*');

    expect(error).toBeNull();
    
    // Si il y a des données, vérifier qu'elles appartiennent toutes à l'utilisateur connecté
    if (data && data.length > 0) {
      data.forEach(session => {
        expect(session.user_id).toBe(testUserId);
      });
    }
  });

  it('should insert a quiz session correctly', async () => {
    if (!testUserId) {
      console.log('Skipping insert test - no authenticated user');
      return;
    }

    const testSession = {
      user_id: testUserId,
      item_code: 'IC-TEST',
      rang: 'A',
      score: 75.5,
      questions_count: 4,
      correct_answers: 3,
      time_spent_seconds: 120,
      session_data: {
        sessionId: 'test-session-123',
        itemCode: 'IC-TEST',
        rang: 'A',
        questions: [
          {
            id: 1,
            question: 'Test question',
            options: ['A', 'B', 'C', 'D'],
            correct: 0,
            explanation: 'Test explanation'
          }
        ],
        answers: [
          {
            questionId: 1,
            selectedOption: 0,
            isCorrect: true,
            timeSpent: 30
          }
        ],
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        score: 75.5,
        completed: true
      },
      completed: true
    };

    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert(testSession)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    if (data) {
      testSessionId = data.id;
      expect(data.user_id).toBe(testUserId);
      expect(data.item_code).toBe('IC-TEST');
      expect(data.rang).toBe('A');
      expect(data.score).toBe(75.5);
      expect(data.questions_count).toBe(4);
      expect(data.correct_answers).toBe(3);
      expect(data.time_spent_seconds).toBe(120);
      expect(data.completed).toBe(true);
      expect(data.session_data).toBeDefined();
    }
  });

  it('should validate rang constraint', async () => {
    if (!testUserId) {
      console.log('Skipping constraint test - no authenticated user');
      return;
    }

    const invalidSession = {
      user_id: testUserId,
      item_code: 'IC-TEST-INVALID',
      rang: 'INVALID', // Valeur non autorisée
      score: 50,
      questions_count: 2,
      correct_answers: 1,
      session_data: {},
      completed: true
    };

    const { error } = await supabase
      .from('quiz_sessions')
      .insert(invalidSession);

    // Devrait échouer à cause du constraint CHECK
    expect(error).toBeDefined();
    expect(error?.message).toContain('violates check constraint');
  });

  it('should auto-populate timestamps', async () => {
    if (!testUserId) {
      console.log('Skipping timestamp test - no authenticated user');
      return;
    }

    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: testUserId,
        item_code: 'IC-TIMESTAMP-TEST',
        rang: 'B',
        score: 100,
        questions_count: 1,
        correct_answers: 1,
        session_data: { test: true },
        completed: true
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    if (data) {
      expect(data.created_at).toBeDefined();
      expect(data.updated_at).toBeDefined();
      expect(new Date(data.created_at).getTime()).toBeGreaterThan(Date.now() - 10000); // Moins de 10 secondes
      
      // Nettoyer
      await supabase
        .from('quiz_sessions')
        .delete()
        .eq('id', data.id);
    }
  });

  it('should update updated_at on modification', async () => {
    if (!testUserId) {
      console.log('Skipping update test - no authenticated user');
      return;
    }

    // Créer une session
    const { data: insertData, error: insertError } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: testUserId,
        item_code: 'IC-UPDATE-TEST',
        rang: 'A',
        score: 50,
        questions_count: 2,
        correct_answers: 1,
        session_data: { test: 'initial' },
        completed: false
      })
      .select()
      .single();

    expect(insertError).toBeNull();
    expect(insertData).toBeDefined();

    if (insertData) {
      const originalUpdatedAt = insertData.updated_at;
      
      // Attendre un peu pour voir la différence
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mettre à jour la session
      const { data: updateData, error: updateError } = await supabase
        .from('quiz_sessions')
        .update({ 
          completed: true, 
          score: 75,
          session_data: { test: 'updated' }
        })
        .eq('id', insertData.id)
        .select()
        .single();

      expect(updateError).toBeNull();
      expect(updateData).toBeDefined();
      
      if (updateData) {
        expect(updateData.completed).toBe(true);
        expect(updateData.score).toBe(75);
        expect(new Date(updateData.updated_at).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
      }
      
      // Nettoyer
      await supabase
        .from('quiz_sessions')
        .delete()
        .eq('id', insertData.id);
    }
  });

  it('should handle JSONB session_data correctly', async () => {
    if (!testUserId) {
      console.log('Skipping JSONB test - no authenticated user');
      return;
    }

    const complexSessionData = {
      sessionId: 'complex-test',
      itemCode: 'IC-COMPLEX',
      rang: 'B',
      questions: [
        {
          id: 1,
          question: 'Complex question',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correct: 2,
          explanation: 'Detailed explanation',
          difficulty: 'hard',
          tags: ['cardiology', 'emergency']
        }
      ],
      answers: [
        {
          questionId: 1,
          selectedOption: 2,
          isCorrect: true,
          timeSpent: 45,
          hesitations: 2
        }
      ],
      metadata: {
        browser: 'Chrome',
        device: 'desktop',
        version: '1.0.0'
      },
      startTime: '2023-01-01T10:00:00.000Z',
      endTime: '2023-01-01T10:05:00.000Z',
      score: 100,
      completed: true
    };

    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: testUserId,
        item_code: 'IC-COMPLEX',
        rang: 'B',
        score: 100,
        questions_count: 1,
        correct_answers: 1,
        time_spent_seconds: 300,
        session_data: complexSessionData,
        completed: true
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    if (data) {
      const retrievedSessionData = data.session_data as any;
      expect(retrievedSessionData.sessionId).toBe('complex-test');
      expect(retrievedSessionData.questions).toHaveLength(1);
      expect(retrievedSessionData.questions[0].tags).toEqual(['cardiology', 'emergency']);
      expect(retrievedSessionData.metadata.browser).toBe('Chrome');
      
      // Nettoyer
      await supabase
        .from('quiz_sessions')
        .delete()
        .eq('id', data.id);
    }
  });
});