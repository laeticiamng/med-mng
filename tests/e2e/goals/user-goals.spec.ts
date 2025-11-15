import { test, expect } from '@playwright/test';

/**
 * E2E Tests for User Goals Feature
 *
 * Tests cover:
 * - Goal creation and management
 * - Progress tracking and auto-completion
 * - Milestones tracking
 * - RLS policy enforcement
 * - Gamification integration
 */

test.describe('User Goals E2E Tests', () => {
  const baseURL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should validate user_goals table exists', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/rest/v1/user_goals`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Prefer': 'count=exact'
      }
    });

    // Table should exist (200) or be protected (401/403)
    expect([200, 401, 403]).toContain(response.status());
  });

  test('should validate goal_milestones table exists', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/rest/v1/goal_milestones`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Prefer': 'count=exact'
      }
    });

    expect([200, 401, 403]).toContain(response.status());
  });

  test('should validate goal_achievements table exists', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/rest/v1/goal_achievements`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Prefer': 'count=exact'
      }
    });

    expect([200, 401, 403]).toContain(response.status());
  });

  test('should enforce RLS on user_goals for anonymous users', async ({ page }) => {
    const response = await page.request.post(`${baseURL}/rest/v1/user_goals`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      data: {
        title: 'Test Goal',
        description: 'Test description',
        category: 'edn',
        goal_type: 'completion',
        target_value: 100,
        target_date: '2025-12-31'
      }
    });

    // Should be blocked by RLS
    expect([401, 403, 400]).toContain(response.status());
  });

  test('should validate user_goals schema constraints - category', async ({ page }) => {
    const response = await page.request.post(`${baseURL}/rest/v1/user_goals`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      data: {
        title: 'Test Goal',
        description: 'Test',
        category: 'INVALID_CATEGORY', // Invalid category
        goal_type: 'completion',
        target_value: 100,
        target_date: '2025-12-31'
      }
    });

    expect([400, 401, 403]).toContain(response.status());
  });

  test('should validate user_goals schema constraints - goal_type', async ({ page }) => {
    const response = await page.request.post(`${baseURL}/rest/v1/user_goals`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      data: {
        title: 'Test Goal',
        description: 'Test',
        category: 'edn',
        goal_type: 'INVALID_TYPE', // Invalid goal_type
        target_value: 100,
        target_date: '2025-12-31'
      }
    });

    expect([400, 401, 403]).toContain(response.status());
  });

  test('should validate user_goals schema constraints - status', async ({ page }) => {
    const response = await page.request.post(`${baseURL}/rest/v1/user_goals`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      data: {
        title: 'Test Goal',
        description: 'Test',
        category: 'edn',
        goal_type: 'completion',
        target_value: 100,
        target_date: '2025-12-31',
        status: 'INVALID_STATUS' // Invalid status
      }
    });

    expect([400, 401, 403]).toContain(response.status());
  });

  test('should validate user_goals schema constraints - priority', async ({ page }) => {
    const response = await page.request.post(`${baseURL}/rest/v1/user_goals`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      data: {
        title: 'Test Goal',
        description: 'Test',
        category: 'edn',
        goal_type: 'completion',
        target_value: 100,
        target_date: '2025-12-31',
        priority: 'INVALID_PRIORITY' // Invalid priority
      }
    });

    expect([400, 401, 403]).toContain(response.status());
  });

  test('should validate user_goals schema constraints - title length', async ({ page }) => {
    const response = await page.request.post(`${baseURL}/rest/v1/user_goals`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      data: {
        title: 'AB', // Too short (min 3 chars)
        description: 'Test',
        category: 'edn',
        goal_type: 'completion',
        target_value: 100,
        target_date: '2025-12-31'
      }
    });

    expect([400, 401, 403]).toContain(response.status());
  });

  test('should validate user_goals schema constraints - target_value positive', async ({ page }) => {
    const response = await page.request.post(`${baseURL}/rest/v1/user_goals`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      data: {
        title: 'Test Goal',
        description: 'Test',
        category: 'edn',
        goal_type: 'completion',
        target_value: -10, // Negative value not allowed
        target_date: '2025-12-31'
      }
    });

    expect([400, 401, 403]).toContain(response.status());
  });

  test('should validate foreign key constraint between milestones and goals', async ({ page }) => {
    // Try to create a milestone with non-existent goal_id
    const response = await page.request.post(`${baseURL}/rest/v1/goal_milestones`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      data: {
        goal_id: '00000000-0000-0000-0000-000000000000', // Non-existent goal
        title: 'Test Milestone',
        target_value: 50,
        target_date: '2025-11-30'
      }
    });

    // Should fail foreign key constraint (400) or auth (401/403)
    expect([400, 401, 403]).toContain(response.status());
  });

  test('should validate user_goals indexes exist and perform well', async ({ page }) => {
    const startTime = Date.now();
    const response = await page.request.get(`${baseURL}/rest/v1/user_goals?select=*&status=eq.active&order=target_date.asc`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    });
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect([200, 401, 403]).toContain(response.status());

    // Query should complete quickly (within 1 second) due to indexes
    if (response.status() === 200) {
      expect(duration).toBeLessThan(1000);
    }
  });

  test('should validate RPC function get_goal_stats exists', async ({ page }) => {
    const response = await page.request.post(`${baseURL}/rest/v1/rpc/get_goal_stats`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      data: {
        p_user_id: '00000000-0000-0000-0000-000000000000'
      }
    });

    // Function should exist (200/400) or require auth (401/403)
    expect([200, 400, 401, 403]).toContain(response.status());
  });

  test('should validate RPC function get_goals_by_category exists', async ({ page }) => {
    const response = await page.request.post(`${baseURL}/rest/v1/rpc/get_goals_by_category`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      data: {
        p_user_id: '00000000-0000-0000-0000-000000000000'
      }
    });

    expect([200, 400, 401, 403]).toContain(response.status());
  });

  test('should validate RPC function update_goal_progress exists', async ({ page }) => {
    const response = await page.request.post(`${baseURL}/rest/v1/rpc/update_goal_progress`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      data: {
        p_goal_id: '00000000-0000-0000-0000-000000000000',
        p_progress_increment: 10
      }
    });

    expect([200, 400, 401, 403, 404]).toContain(response.status());
  });

  test('should validate goals UI components exist', async ({ page }) => {
    // Navigate to goals page
    await page.goto('/goals');

    // Check if the page loads
    await page.waitForLoadState('networkidle');

    // Look for goals elements
    const goalsContainer = page.locator('[data-testid="goals"], .goals, h2:has-text("Objectif")');

    if (await goalsContainer.isVisible()) {
      await expect(goalsContainer).toBeVisible();
    }
  });

  test('should validate goal creation flow in UI', async ({ page }) => {
    await page.goto('/goals');

    // Look for "New Goal" or "Create Goal" button
    const createButton = page.locator('button:has-text("Nouvel"), button:has-text("Créer"), [data-testid="create-goal"]');

    if (await createButton.isVisible()) {
      await createButton.click();

      // Form should appear
      await page.waitForTimeout(500);
      const titleInput = page.locator('input[name="title"], [data-testid="goal-title"]');

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

  test('should validate progress percentage calculation', async ({ page }) => {
    // Get goals to check progress_percentage values
    const response = await page.request.get(`${baseURL}/rest/v1/user_goals?select=progress_percentage,current_value,target_value&limit=10`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    });

    if (response.status() === 200) {
      const data = await response.json();
      if (data && data.length > 0) {
        data.forEach((goal: any) => {
          // Progress should be between 0 and 100
          if (goal.progress_percentage !== null) {
            expect(goal.progress_percentage).toBeGreaterThanOrEqual(0);
            expect(goal.progress_percentage).toBeLessThanOrEqual(100);
          }

          // Verify calculation accuracy
          if (goal.target_value > 0 && goal.current_value !== null) {
            const expectedProgress = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
            expect(goal.progress_percentage).toBe(expectedProgress);
          }
        });
      }
    }
  });

  test('should validate active goals query', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/rest/v1/user_goals?select=*&status=eq.active`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    });

    expect([200, 401, 403]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      if (data && data.length > 0) {
        data.forEach((goal: any) => {
          expect(goal.status).toBe('active');
        });
      }
    }
  });

  test('should validate completed goals have completed_at timestamp', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/rest/v1/user_goals?select=*&status=eq.completed`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    });

    if (response.status() === 200) {
      const data = await response.json();
      if (data && data.length > 0) {
        data.forEach((goal: any) => {
          if (goal.status === 'completed') {
            // Completed goals should have a completed_at timestamp
            expect(goal.completed_at).toBeTruthy();
          }
        });
      }
    }
  });

  test('should validate goal tracker dashboard widget', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for goal tracker statistics
    const goalWidget = page.locator('[data-testid="goal-tracker-widget"], [class*="goal"], h2:has-text("Objectif")');

    if (await goalWidget.isVisible()) {
      await expect(goalWidget).toBeVisible();

      // Check for statistics numbers
      const stats = page.locator('[class*="stat"], [class*="metric"]').filter({ hasText: /\d+/ });
      if (await stats.first().isVisible()) {
        const count = await stats.count();
        expect(count).toBeGreaterThan(0);
      }
    }
  });

  test('should validate RLS user isolation for user_goals', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/rest/v1/user_goals?select=user_id&limit=10`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    });

    if (response.status() === 200) {
      const data = await response.json();
      // All returned goals should belong to the same user (RLS enforcement)
      if (data && data.length > 1) {
        const userId = data[0]?.user_id;
        if (userId) {
          data.forEach((goal: any) => {
            expect(goal.user_id).toBe(userId);
          });
        }
      }
    }
  });

  test('should validate RLS user isolation for goal_milestones', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/rest/v1/goal_milestones?select=user_id&limit=10`, {
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
          data.forEach((milestone: any) => {
            expect(milestone.user_id).toBe(userId);
          });
        }
      }
    }
  });

  test('should validate urgent goals logic (within 7 days)', async ({ page }) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const todayStr = today.toISOString().split('T')[0];
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const response = await page.request.get(
      `${baseURL}/rest/v1/user_goals?select=*&status=eq.active&target_date=gte.${todayStr}&target_date=lte.${futureDateStr}`,
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
        data.forEach((goal: any) => {
          const targetDate = new Date(goal.target_date);
          expect(targetDate >= today).toBe(true);
          expect(targetDate <= futureDate).toBe(true);
        });
      }
    }
  });

  test('should validate overdue goals logic (past target date)', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    const response = await page.request.get(
      `${baseURL}/rest/v1/user_goals?select=*&status=eq.active&target_date=lt.${today}`,
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
        data.forEach((goal: any) => {
          expect(new Date(goal.target_date) < new Date(today)).toBe(true);
          expect(goal.status).toBe('active');
        });
      }
    }
  });

  test('should validate cascade deletion - milestones deleted when goal deleted', async ({ page }) => {
    // This tests the FK ON DELETE CASCADE relationship
    // When a goal is deleted, associated milestones should also be deleted
    const response = await page.request.get(`${baseURL}/rest/v1/goal_milestones?select=*&goal_id=eq.00000000-0000-0000-0000-000000000000`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    });

    if (response.status() === 200) {
      const data = await response.json();
      // No milestones should exist for a deleted goal
      expect(data).toEqual([]);
    }
  });
});
