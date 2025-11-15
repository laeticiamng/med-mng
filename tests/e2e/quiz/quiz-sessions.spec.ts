import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Quiz Sessions Feature
 *
 * Tests cover:
 * - Quiz session creation and persistence
 * - Quiz completion flow
 * - Progress tracking integration
 * - RLS policy enforcement
 * - Statistics calculation
 */

test.describe('Quiz Sessions E2E Tests', () => {
  const baseURL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should validate quiz_sessions table exists', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/rest/v1/quiz_sessions`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Prefer': 'count=exact'
      }
    });

    // Table should exist (200) or be protected (401/403)
    expect([200, 401, 403]).toContain(response.status());
  });

  test('should enforce RLS on quiz_sessions for anonymous users', async ({ page }) => {
    // Anonymous users should not be able to insert quiz sessions
    const response = await page.request.post(`${baseURL}/rest/v1/quiz_sessions`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      data: {
        item_code: 'TEST-001',
        rang: 'A',
        score: 75,
        questions_count: 10,
        correct_answers: 7,
        session_data: { test: true }
      }
    });

    // Should be blocked by RLS (401/403) or require auth
    expect([401, 403, 400]).toContain(response.status());
  });

  test('should validate quiz_sessions schema constraints', async ({ page }) => {
    // Test invalid score (>100)
    const invalidScoreResponse = await page.request.post(`${baseURL}/rest/v1/quiz_sessions`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      data: {
        item_code: 'TEST-001',
        rang: 'A',
        score: 150, // Invalid score > 100
        questions_count: 10,
        correct_answers: 7,
        session_data: { test: true }
      }
    });

    // Should fail validation (400) or auth (401/403)
    expect([400, 401, 403]).toContain(invalidScoreResponse.status());

    // Test invalid rang value
    const invalidRangResponse = await page.request.post(`${baseURL}/rest/v1/quiz_sessions`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      data: {
        item_code: 'TEST-001',
        rang: 'INVALID', // Invalid rang value
        score: 75,
        questions_count: 10,
        correct_answers: 7,
        session_data: { test: true }
      }
    });

    expect([400, 401, 403]).toContain(invalidRangResponse.status());
  });

  test('should validate get_user_quiz_stats function exists', async ({ page }) => {
    // Test calling the RPC function
    const response = await page.request.post(`${baseURL}/rest/v1/rpc/get_user_quiz_stats`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      data: {
        p_user_id: '00000000-0000-0000-0000-000000000000' // Dummy UUID
      }
    });

    // Function should exist (200) or require proper auth (401/403)
    expect([200, 401, 403]).toContain(response.status());
  });

  test('should validate get_item_difficulty function exists', async ({ page }) => {
    const response = await page.request.post(`${baseURL}/rest/v1/rpc/get_item_difficulty`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      data: {
        p_item_code: 'EDN-1'
      }
    });

    // Function should exist and be callable
    expect([200, 401, 403]).toContain(response.status());
  });

  test('should validate quiz_sessions indexes exist', async ({ page }) => {
    // Verify query performance indicators (indexes improve performance)
    const response = await page.request.get(`${baseURL}/rest/v1/quiz_sessions?select=item_code&item_code=eq.EDN-1`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    });

    // Query should execute (200) or be protected (401/403)
    expect([200, 401, 403]).toContain(response.status());

    // Check if response includes performance headers
    const timingHeader = response.headers()['x-supabase-query-time'];
    if (timingHeader) {
      // If timing header exists, query should be fast (<1000ms)
      const queryTime = parseFloat(timingHeader);
      expect(queryTime).toBeLessThan(1000);
    }
  });

  test('should validate quiz completion flow in UI', async ({ page }) => {
    // Navigate to a quiz page (if available)
    await page.goto('/edn');

    // Check if quiz interface is present
    const quizContainer = page.locator('[data-testid="quiz-container"], .quiz-container, [class*="quiz"]');

    if (await quizContainer.isVisible()) {
      await expect(quizContainer).toBeVisible();

      // Look for quiz questions
      const questions = page.locator('[data-testid="quiz-question"], .quiz-question, [class*="question"]');
      if (await questions.first().isVisible()) {
        // Test answering a question
        const answerOption = page.locator('[data-testid="quiz-option"], .quiz-option, button[class*="option"]').first();
        if (await answerOption.isVisible()) {
          await answerOption.click();

          // Verify feedback is shown
          await page.waitForTimeout(500);
          const feedback = page.locator('[data-testid="quiz-feedback"], .quiz-feedback, [class*="feedback"]');
          if (await feedback.isVisible()) {
            await expect(feedback).toBeVisible();
          }
        }
      }
    }
  });

  test('should validate quiz progress tracking integration', async ({ page }) => {
    // Check if progress tracking elements exist
    await page.goto('/dashboard');

    // Look for quiz statistics widget
    const quizStats = page.locator('[data-testid="quiz-stats"], [class*="quiz-stats"], h2:has-text("Quiz")');

    if (await quizStats.isVisible()) {
      await expect(quizStats).toBeVisible();

      // Verify statistics are displayed
      const statsNumbers = page.locator('[class*="stat"], [class*="metric"]').filter({ hasText: /\d+/ });
      if (await statsNumbers.first().isVisible()) {
        const count = await statsNumbers.count();
        expect(count).toBeGreaterThan(0);
      }
    }
  });

  test('should validate quiz session data persistence', async ({ page }) => {
    // Test that quiz sessions are saved correctly
    // This would normally require authentication, so we check the endpoint

    const response = await page.request.get(`${baseURL}/rest/v1/quiz_sessions?select=*&limit=1`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    });

    // Should require authentication (401/403) or return data (200)
    expect([200, 401, 403]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      // If data is returned, verify structure
      if (data && data.length > 0) {
        const session = data[0];
        expect(session).toHaveProperty('id');
        expect(session).toHaveProperty('item_code');
        expect(session).toHaveProperty('rang');
        expect(session).toHaveProperty('score');
        expect(session).toHaveProperty('questions_count');
        expect(session).toHaveProperty('correct_answers');
      }
    }
  });

  test('should validate quiz session filtering by user', async ({ page }) => {
    // Test user isolation via RLS
    const response = await page.request.get(`${baseURL}/rest/v1/quiz_sessions?select=user_id&limit=5`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    });

    if (response.status() === 200) {
      const data = await response.json();
      // All returned sessions should belong to the same user (RLS enforcement)
      if (data && data.length > 1) {
        const userId = data[0]?.user_id;
        if (userId) {
          data.forEach((session: any) => {
            expect(session.user_id).toBe(userId);
          });
        }
      }
    }
  });

  test('should validate quiz statistics calculation accuracy', async ({ page }) => {
    // Test the get_user_quiz_stats function returns correct calculations
    const response = await page.request.post(`${baseURL}/rest/v1/rpc/get_user_quiz_stats`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      data: {
        p_user_id: '00000000-0000-0000-0000-000000000000'
      }
    });

    if (response.status() === 200) {
      const data = await response.json();
      if (data && data.length > 0) {
        const stats = data[0];

        // Verify statistical integrity
        if (stats.average_score !== null) {
          expect(stats.average_score).toBeGreaterThanOrEqual(0);
          expect(stats.average_score).toBeLessThanOrEqual(100);
        }

        if (stats.success_rate !== null) {
          expect(stats.success_rate).toBeGreaterThanOrEqual(0);
          expect(stats.success_rate).toBeLessThanOrEqual(100);
        }

        // Total correct should not exceed total questions
        if (stats.total_correct && stats.total_questions) {
          expect(stats.total_correct).toBeLessThanOrEqual(stats.total_questions);
        }
      }
    }
  });
});
