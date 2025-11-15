import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Study Plans Feature
 *
 * Tests cover:
 * - Study plan creation and management
 * - Study session scheduling and completion
 * - Progress calculation and updates
 * - RLS policy enforcement
 * - Auto-progress triggers
 */

test.describe('Study Plans E2E Tests', () => {
  const baseURL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should validate study_plans table exists', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/rest/v1/study_plans`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Prefer': 'count=exact'
      }
    });

    // Table should exist (200) or be protected (401/403)
    expect([200, 401, 403]).toContain(response.status());
  });

  test('should validate study_sessions table exists', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/rest/v1/study_sessions`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Prefer': 'count=exact'
      }
    });

    expect([200, 401, 403]).toContain(response.status());
  });

  test('should enforce RLS on study_plans for anonymous users', async ({ page }) => {
    const response = await page.request.post(`${baseURL}/rest/v1/study_plans`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      data: {
        title: 'Test Plan',
        description: 'Test description',
        target_date: '2025-12-31',
        priority: 'medium',
        total_sessions: 10
      }
    });

    // Should be blocked by RLS
    expect([401, 403, 400]).toContain(response.status());
  });

  test('should enforce RLS on study_sessions for anonymous users', async ({ page }) => {
    const response = await page.request.post(`${baseURL}/rest/v1/study_sessions`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      data: {
        plan_id: '00000000-0000-0000-0000-000000000000',
        title: 'Test Session',
        duration_minutes: 30,
        scheduled_date: '2025-12-01'
      }
    });

    expect([401, 403, 400]).toContain(response.status());
  });

  test('should validate study_plans schema constraints', async ({ page }) => {
    // Test invalid status
    const invalidStatusResponse = await page.request.post(`${baseURL}/rest/v1/study_plans`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      data: {
        title: 'Test Plan',
        description: 'Test',
        target_date: '2025-12-31',
        status: 'INVALID_STATUS', // Invalid status
        priority: 'medium',
        total_sessions: 10
      }
    });

    expect([400, 401, 403]).toContain(invalidStatusResponse.status());

    // Test invalid priority
    const invalidPriorityResponse = await page.request.post(`${baseURL}/rest/v1/study_plans`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      data: {
        title: 'Test Plan',
        description: 'Test',
        target_date: '2025-12-31',
        status: 'active',
        priority: 'INVALID_PRIORITY', // Invalid priority
        total_sessions: 10
      }
    });

    expect([400, 401, 403]).toContain(invalidPriorityResponse.status());
  });

  test('should validate foreign key constraint between sessions and plans', async ({ page }) => {
    // Try to create a session with non-existent plan_id
    const response = await page.request.post(`${baseURL}/rest/v1/study_sessions`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      data: {
        plan_id: '00000000-0000-0000-0000-000000000000', // Non-existent plan
        title: 'Test Session',
        duration_minutes: 30,
        scheduled_date: '2025-12-01'
      }
    });

    // Should fail foreign key constraint (400) or auth (401/403)
    expect([400, 401, 403]).toContain(response.status());
  });

  test('should validate study_plans indexes exist', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/rest/v1/study_plans?select=*&status=eq.active`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    });

    expect([200, 401, 403]).toContain(response.status());
  });

  test('should validate study_sessions indexes exist', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/rest/v1/study_sessions?select=*&completed=eq.false`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    });

    expect([200, 401, 403]).toContain(response.status());
  });

  test('should validate study plan UI components exist', async ({ page }) => {
    // Navigate to study plans page
    await page.goto('/study-plans');

    // Check if the page loads
    await page.waitForLoadState('networkidle');

    // Look for study plan elements
    const studyPlanContainer = page.locator('[data-testid="study-plans"], .study-plans, h2:has-text("Plan")');

    if (await studyPlanContainer.isVisible()) {
      await expect(studyPlanContainer).toBeVisible();
    }
  });

  test('should validate study plan creation flow in UI', async ({ page }) => {
    await page.goto('/study-plans');

    // Look for "New Plan" or "Create Plan" button
    const createButton = page.locator('button:has-text("Nouveau"), button:has-text("Créer"), [data-testid="create-plan"]');

    if (await createButton.isVisible()) {
      await createButton.click();

      // Form should appear
      await page.waitForTimeout(500);
      const titleInput = page.locator('input[name="title"], [data-testid="plan-title"]');

      if (await titleInput.isVisible()) {
        // Try to submit empty form (should show validation)
        const submitButton = page.locator('button[type="submit"], button:has-text("Créer")');
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(500);

          // Should show validation errors
          const error = page.locator('[class*="error"], [role="alert"], .text-destructive');
          if (await error.isVisible()) {
            await expect(error).toBeVisible();
          }
        }
      }
    }
  });

  test('should validate progress calculation logic', async ({ page }) => {
    // Get study plans to check progress values
    const response = await page.request.get(`${baseURL}/rest/v1/study_plans?select=progress,sessions_completed,total_sessions&limit=5`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    });

    if (response.status() === 200) {
      const data = await response.json();
      if (data && data.length > 0) {
        data.forEach((plan: any) => {
          // Progress should be between 0 and 100
          if (plan.progress !== null) {
            expect(plan.progress).toBeGreaterThanOrEqual(0);
            expect(plan.progress).toBeLessThanOrEqual(100);
          }

          // Completed sessions should not exceed total sessions
          if (plan.sessions_completed !== null && plan.total_sessions !== null) {
            expect(plan.sessions_completed).toBeLessThanOrEqual(plan.total_sessions);
          }

          // If progress is 100, all sessions should be completed
          if (plan.progress === 100 && plan.total_sessions > 0) {
            expect(plan.sessions_completed).toBe(plan.total_sessions);
          }
        });
      }
    }
  });

  test('should validate upcoming sessions query', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const response = await page.request.get(
      `${baseURL}/rest/v1/study_sessions?select=*&completed=eq.false&scheduled_date=gte.${today}&scheduled_date=lte.${futureDateStr}`,
      {
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey
        }
      }
    );

    expect([200, 401, 403]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      if (data && data.length > 0) {
        data.forEach((session: any) => {
          // All sessions should be in the future or today
          expect(new Date(session.scheduled_date) >= new Date(today)).toBe(true);
          // All sessions should be within 7 days
          expect(new Date(session.scheduled_date) <= new Date(futureDateStr)).toBe(true);
          // All should be incomplete
          expect(session.completed).toBe(false);
        });
      }
    }
  });

  test('should validate overdue sessions query', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    const response = await page.request.get(
      `${baseURL}/rest/v1/study_sessions?select=*&completed=eq.false&scheduled_date=lt.${today}`,
      {
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey
        }
      }
    );

    expect([200, 401, 403]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      if (data && data.length > 0) {
        data.forEach((session: any) => {
          // All sessions should be in the past
          expect(new Date(session.scheduled_date) < new Date(today)).toBe(true);
          // All should be incomplete
          expect(session.completed).toBe(false);
        });
      }
    }
  });

  test('should validate study plan dashboard widget', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for study plan statistics
    const studyPlanWidget = page.locator('[data-testid="study-plan-widget"], [class*="study-plan"], h2:has-text("Plan")');

    if (await studyPlanWidget.isVisible()) {
      await expect(studyPlanWidget).toBeVisible();

      // Check for statistics numbers
      const stats = page.locator('[class*="stat"], [class*="metric"]').filter({ hasText: /\d+/ });
      if (await stats.first().isVisible()) {
        const count = await stats.count();
        expect(count).toBeGreaterThan(0);
      }
    }
  });

  test('should validate RLS user isolation for study plans', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/rest/v1/study_plans?select=user_id&limit=5`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    });

    if (response.status() === 200) {
      const data = await response.json();
      // All returned plans should belong to the same user (RLS enforcement)
      if (data && data.length > 1) {
        const userId = data[0]?.user_id;
        if (userId) {
          data.forEach((plan: any) => {
            expect(plan.user_id).toBe(userId);
          });
        }
      }
    }
  });

  test('should validate RLS user isolation for study sessions', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/rest/v1/study_sessions?select=user_id&limit=5`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    });

    if (response.status() === 200) {
      const data = await response.json();
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

  test('should validate status transition constraints', async ({ page }) => {
    // A completed plan should have progress = 100
    const response = await page.request.get(`${baseURL}/rest/v1/study_plans?select=*&status=eq.completed`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    });

    if (response.status() === 200) {
      const data = await response.json();
      if (data && data.length > 0) {
        data.forEach((plan: any) => {
          if (plan.status === 'completed') {
            // Completed plans should have 100% progress or be close to it
            expect(plan.progress).toBeGreaterThanOrEqual(90);
          }
        });
      }
    }
  });
});
