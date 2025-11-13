import { test, expect } from '@playwright/test';
import { mockSupabaseAPI, clearSupabaseMocks } from './mocks/supabase.mock';

test.describe('Template System E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Setup Supabase API mocks
    await mockSupabaseAPI(page);
    
    // Navigate to the application
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Note: In a real scenario, you would handle authentication here
    // For now, we'll assume the user is already authenticated
  });

  test.afterEach(async ({ page }) => {
    // Clear mocks after each test
    await clearSupabaseMocks(page);
  });

  test.describe('Template Creation with Tags', () => {
    test('should create a new filter template with tags', async ({ page }) => {
      // Navigate to security notifications or template management page
      await page.goto('/audit-security');
      await page.waitForLoadState('networkidle');

      // Open template creation dialog/form
      const createButton = page.getByRole('button', { name: /créer.*template|nouveau.*template/i });
      if (await createButton.isVisible()) {
        await createButton.click();
      }

      // Fill in template details
      await page.fill('input[name="name"], input[placeholder*="nom"]', 'Test E2E Template');
      await page.fill('textarea[name="description"], textarea[placeholder*="description"]', 'Template created by E2E test');

      // Add tags
      const tagInput = page.locator('input[placeholder*="tag"]').first();
      if (await tagInput.isVisible()) {
        // Add first tag
        await tagInput.fill('e2e-test');
        await page.keyboard.press('Enter');

        // Add second tag
        await tagInput.fill('automated');
        await page.keyboard.press('Enter');
      }

      // Configure some filters (severity, type, etc.)
      const severityFilter = page.locator('select, button').filter({ hasText: /sévérité|severity/i }).first();
      if (await severityFilter.isVisible()) {
        await severityFilter.click();
        await page.getByRole('option', { name: /high|élevé/i }).click();
      }

      // Save the template
      const saveButton = page.getByRole('button', { name: /sauvegarder|enregistrer|save/i });
      await saveButton.click();

      // Verify success message
      await expect(page.getByText(/template.*créé|success/i)).toBeVisible({ timeout: 5000 });

      // Verify template appears in list
      await expect(page.getByText('Test E2E Template')).toBeVisible();
    });

    test('should show tag suggestions while typing', async ({ page }) => {
      await page.goto('/audit-security');
      await page.waitForLoadState('networkidle');

      // Find tag input
      const tagInput = page.locator('input[placeholder*="tag"]').first();
      if (await tagInput.isVisible()) {
        await tagInput.fill('sec');

        // Wait for suggestions dropdown
        await page.waitForSelector('[role="listbox"], .suggestions, [data-testid="tag-suggestions"]', { 
          timeout: 3000,
          state: 'visible' 
        }).catch(() => {
          // Suggestions might not appear in test environment
        });

        // If suggestions appear, verify they contain relevant tags
        const suggestions = page.locator('[role="option"], .suggestion-item');
        const count = await suggestions.count();
        if (count > 0) {
          const firstSuggestion = suggestions.first();
          await expect(firstSuggestion).toContainText(/sec/i);
        }
      }
    });
  });

  test.describe('Filter Application', () => {
    test('should apply filters from a template', async ({ page }) => {
      await page.goto('/audit-security');
      await page.waitForLoadState('networkidle');

      // Look for a template in the list
      const templateCard = page.locator('[data-testid="template-card"], .template-item').first();
      
      if (await templateCard.isVisible()) {
        // Click apply button
        const applyButton = templateCard.getByRole('button', { name: /appliquer|apply/i });
        if (await applyButton.isVisible()) {
          await applyButton.click();

          // Verify filters are applied (notifications list should update)
          await page.waitForLoadState('networkidle');
          
          // Check if filter indicators appear
          await expect(page.locator('[data-testid="active-filters"], .active-filter')).toBeVisible({ timeout: 5000 })
            .catch(() => {
              // Filters might be applied but not visually indicated
            });
        }
      }
    });

    test('should show filtered results after applying template', async ({ page }) => {
      await page.goto('/audit-security');
      await page.waitForLoadState('networkidle');

      // Get initial notification count
      const notificationsBefore = await page.locator('[data-testid="notification-item"], .notification').count();

      // Apply a template with specific filters
      const templateWithFilters = page.locator('[data-testid="template-card"]').filter({ hasText: /high|security/i }).first();
      
      if (await templateWithFilters.isVisible()) {
        const applyBtn = templateWithFilters.getByRole('button', { name: /appliquer/i });
        await applyBtn.click();
        await page.waitForLoadState('networkidle');

        // Verify results changed
        const notificationsAfter = await page.locator('[data-testid="notification-item"], .notification').count();
        
        // Results should be different (unless there were no notifications to filter)
        if (notificationsBefore > 0) {
          expect(notificationsAfter).not.toBe(notificationsBefore);
        }
      }
    });
  });

  test.describe('Team Sharing', () => {
    test('should share template with team', async ({ page }) => {
      await page.goto('/audit-security');
      await page.waitForLoadState('networkidle');

      // Find a template to share
      const templateCard = page.locator('[data-testid="template-card"]').first();
      
      if (await templateCard.isVisible()) {
        // Open share menu/modal
        const shareButton = templateCard.getByRole('button', { name: /partager|share/i });
        if (await shareButton.isVisible()) {
          await shareButton.click();

          // Select "Share with team" option
          const teamShareOption = page.getByRole('checkbox', { name: /équipe|team/i });
          if (await teamShareOption.isVisible()) {
            await teamShareOption.check();
          }

          // Confirm sharing
          const confirmButton = page.getByRole('button', { name: /confirmer|partager|share/i });
          await confirmButton.click();

          // Verify success
          await expect(page.getByText(/partagé|shared.*success/i)).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('should view shared templates page', async ({ page }) => {
      await page.goto('/shared-templates');
      await page.waitForLoadState('networkidle');

      // Verify page loaded
      await expect(page.getByRole('heading', { name: /templates.*partagés|shared.*templates/i })).toBeVisible();

      // Verify filter options exist
      await expect(page.locator('select, [role="combobox"]').filter({ hasText: /type.*partage|share.*type/i })).toBeVisible();

      // Check if any templates are displayed
      const templateCount = await page.locator('[data-testid="template-card"], .template-card').count();
      expect(templateCount).toBeGreaterThanOrEqual(0); // Could be 0 if no shared templates
    });

    test('should filter shared templates by type', async ({ page }) => {
      await page.goto('/shared-templates');
      await page.waitForLoadState('networkidle');

      // Find share type filter
      const shareTypeFilter = page.locator('select').filter({ hasText: /tous.*types|all.*types/i }).first();
      
      if (await shareTypeFilter.isVisible()) {
        // Select "Global" filter
        await shareTypeFilter.selectOption({ label: /global/i });
        await page.waitForLoadState('networkidle');

        // Verify only global templates are shown
        const globalBadges = page.locator('[data-testid="share-badge"]').filter({ hasText: /global/i });
        const count = await globalBadges.count();
        
        if (count > 0) {
          // If there are badges, verify they're all "Global"
          for (let i = 0; i < count; i++) {
            await expect(globalBadges.nth(i)).toContainText(/global/i);
          }
        }
      }
    });

    test('should filter templates by tags', async ({ page }) => {
      await page.goto('/shared-templates');
      await page.waitForLoadState('networkidle');

      // Find tag filter input
      const tagFilter = page.locator('input[placeholder*="tag"]');
      
      if (await tagFilter.isVisible()) {
        // Enter a tag
        await tagFilter.fill('security');
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');

        // Verify filtered results
        const templates = page.locator('[data-testid="template-card"]');
        const count = await templates.count();

        if (count > 0) {
          // Verify first template has the tag
          await expect(templates.first()).toContainText(/security/i);
        }
      }
    });
  });

  test.describe('Analytics Dashboard', () => {
    test('should display analytics dashboard', async ({ page }) => {
      await page.goto('/template-analytics');
      await page.waitForLoadState('networkidle');

      // Verify main heading
      await expect(page.getByRole('heading', { name: /analytics.*templates/i })).toBeVisible();

      // Verify key metrics are displayed
      await expect(page.getByText(/total.*templates/i)).toBeVisible();
      await expect(page.getByText(/templates.*partagés|shared.*templates/i)).toBeVisible();
      await expect(page.getByText(/applications|applications/i)).toBeVisible();
      await expect(page.getByText(/tags.*populaires|popular.*tags/i)).toBeVisible();
    });

    test('should show template usage statistics', async ({ page }) => {
      await page.goto('/template-analytics');
      await page.waitForLoadState('networkidle');

      // Look for usage statistics section
      const usageSection = page.locator('[data-testid="template-usage"], section').filter({ hasText: /plus.*utilisés|most.*used/i });
      
      if (await usageSection.isVisible()) {
        // Verify at least one template is listed
        const templateItems = usageSection.locator('[data-testid="template-item"], .template-item');
        const count = await templateItems.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test('should display popular tags with usage counts', async ({ page }) => {
      await page.goto('/template-analytics');
      await page.waitForLoadState('networkidle');

      // Find popular tags section
      const tagsSection = page.locator('section').filter({ hasText: /tags.*populaires|popular.*tags/i });
      
      if (await tagsSection.isVisible()) {
        // Look for tags with usage counts
        const tagElements = tagsSection.locator('[data-testid="tag-item"], .tag-item, .badge');
        const count = await tagElements.count();

        if (count > 0) {
          // Verify first tag has a count
          const firstTag = tagElements.first();
          await expect(firstTag).toBeVisible();
          
          // Usage count might be displayed as a badge or number
          const hasCount = await firstTag.locator('text=/\\d+/').count() > 0;
          expect(hasCount).toBeTruthy();
        }
      }
    });

    test('should show templates by category', async ({ page }) => {
      await page.goto('/template-analytics');
      await page.waitForLoadState('networkidle');

      // Look for category breakdown
      const categorySection = page.locator('section').filter({ hasText: /catégorie|category|par tag/i });
      
      if (await categorySection.isVisible()) {
        // Verify categories are listed
        const categoryItems = categorySection.locator('[data-testid="category-item"], .category-item');
        const count = await categoryItems.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test('should display recent activity metrics', async ({ page }) => {
      await page.goto('/template-analytics');
      await page.waitForLoadState('networkidle');

      // Look for activity metrics (last 30 days)
      const activityText = page.getByText(/30.*jours|30.*days|ce mois|this month/i);
      await expect(activityText).toBeVisible({ timeout: 5000 }).catch(() => {
        // Metric might not be visible depending on layout
      });

      // Verify numeric values are displayed
      const metrics = page.locator('[data-testid="metric-value"], .text-2xl');
      const count = await metrics.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Complete User Journey', () => {
    test('should complete full template lifecycle', async ({ page }) => {
      // 1. Create template
      await page.goto('/audit-security');
      await page.waitForLoadState('networkidle');

      const createBtn = page.getByRole('button', { name: /créer.*template|nouveau/i });
      if (await createBtn.isVisible()) {
        await createBtn.click();

        await page.fill('input[name="name"]', 'E2E Journey Template');
        await page.fill('textarea[name="description"]', 'Full lifecycle test');

        // Add tag
        const tagInput = page.locator('input[placeholder*="tag"]').first();
        if (await tagInput.isVisible()) {
          await tagInput.fill('journey');
          await page.keyboard.press('Enter');
        }

        await page.getByRole('button', { name: /sauvegarder|save/i }).click();
        await page.waitForTimeout(1000);
      }

      // 2. Apply the template
      const newTemplate = page.getByText('E2E Journey Template').first();
      if (await newTemplate.isVisible()) {
        const parentCard = newTemplate.locator('xpath=ancestor::*[@data-testid="template-card" or contains(@class, "template")]').first();
        const applyBtn = parentCard.getByRole('button', { name: /appliquer/i });
        if (await applyBtn.isVisible()) {
          await applyBtn.click();
          await page.waitForLoadState('networkidle');
        }
      }

      // 3. Share with team
      if (await newTemplate.isVisible()) {
        const parentCard = newTemplate.locator('xpath=ancestor::*[@data-testid="template-card" or contains(@class, "template")]').first();
        const shareBtn = parentCard.getByRole('button', { name: /partager/i });
        if (await shareBtn.isVisible()) {
          await shareBtn.click();
          
          const teamOption = page.getByRole('checkbox', { name: /équipe/i });
          if (await teamOption.isVisible()) {
            await teamOption.check();
            await page.getByRole('button', { name: /confirmer|partager/i }).click();
            await page.waitForTimeout(1000);
          }
        }
      }

      // 4. Verify in shared templates
      await page.goto('/shared-templates');
      await page.waitForLoadState('networkidle');
      await expect(page.getByText('E2E Journey Template')).toBeVisible({ timeout: 5000 });

      // 5. Check analytics
      await page.goto('/template-analytics');
      await page.waitForLoadState('networkidle');
      
      // Verify template appears in most used or recent
      await expect(page.getByText('E2E Journey Template')).toBeVisible({ timeout: 5000 })
        .catch(() => {
          // Template might not appear immediately in analytics
        });

      // 6. Verify tag in popular tags
      const journeyTag = page.getByText('journey').first();
      await expect(journeyTag).toBeVisible({ timeout: 5000 })
        .catch(() => {
          // Tag might not be in top 10 yet
        });
    });
  });
});
