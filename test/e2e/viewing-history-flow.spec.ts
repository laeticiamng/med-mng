import { test, expect } from '@playwright/test'

test.describe('Viewing History Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/med-mng/login')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/dashboard')
  })

  test('should track post views', async ({ page }) => {
    // Navigate to posts
    await page.goto('/posts')
    await page.waitForSelector('[data-testid="post-card"]')

    // Click on a post to view it
    const firstPost = page.locator('[data-testid="post-card"]').first()
    const postTitle = await firstPost.locator('h3').textContent()
    await firstPost.click()

    // Wait for post detail to load
    await page.waitForURL(/\/posts\/[a-z0-9-]+/)

    // Go to viewing history
    await page.goto('/viewing-history')

    // Verify the viewed post appears in history
    await expect(page.locator('text=' + postTitle!)).toBeVisible()
  })

  test('should display viewing history page', async ({ page }) => {
    await page.goto('/viewing-history')

    // Verify page loaded
    await expect(page.locator('h1')).toContainText('Historique')

    // Verify filter buttons
    await expect(page.locator('[data-testid="filter-all"]')).toBeVisible()
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible()
  })

  test('should filter history by item type', async ({ page }) => {
    await page.goto('/viewing-history')
    await page.waitForSelector('[data-testid="history-item"]', { timeout: 5000 }).catch(() => null)

    // Click post filter
    await page.click('[data-testid="filter-posts"]')

    // Wait for filtering
    await page.waitForTimeout(300)

    // Verify only posts are shown
    const items = page.locator('[data-testid="history-item"]')
    for (let i = 0; i < await items.count(); i++) {
      const badge = items.nth(i).locator('[data-testid="item-type-badge"]')
      const text = await badge.textContent()
      expect(text?.toLowerCase()).toContain('post')
    }
  })

  test('should search viewing history', async ({ page }) => {
    await page.goto('/viewing-history')

    // Search
    await page.fill('[data-testid="search-input"]', 'tutorial')

    // Wait for search
    await page.waitForTimeout(300)

    // Verify results
    const items = page.locator('[data-testid="history-item-title"]')
    const count = await items.count()

    if (count > 0) {
      const title = await items.first().textContent()
      expect(title?.toLowerCase()).toContain('tutorial')
    }
  })

  test('should clear viewing history', async ({ page }) => {
    await page.goto('/viewing-history')

    // Find and click clear button
    const clearButton = page.locator('[data-testid="clear-history-button"]')

    if (await clearButton.isVisible()) {
      await clearButton.click()

      // Confirm deletion
      await page.click('[data-testid="confirm-clear"]')

      // Wait for clearing
      await page.waitForTimeout(500)

      // Verify empty state
      await expect(page.locator('text=Aucun contenu')).toBeVisible()
    }
  })

  test('should display viewing statistics', async ({ page }) => {
    await page.goto('/viewing-history')

    // Verify stats card is visible
    const statsCard = page.locator('[data-testid="stats-card"]')
    await expect(statsCard).toBeVisible()

    // Verify stats content
    await expect(statsCard.locator('text=Total visionnages')).toBeVisible()
    await expect(statsCard.locator('text=Éléments uniques')).toBeVisible()
  })
})
