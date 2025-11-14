import { test, expect } from '@playwright/test'

test.describe('Collections Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/med-mng/login')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/dashboard')
  })

  test('should create a new collection', async ({ page }) => {
    await page.goto('/collections')

    // Click create button
    await page.click('[data-testid="create-collection-button"]')

    // Wait for dialog
    await expect(page.locator('[data-testid="create-dialog"]')).toBeVisible()

    // Fill form
    await page.fill('[data-testid="collection-name"]', 'My Test Collection')
    await page.fill('[data-testid="collection-description"]', 'This is a test collection')

    // Select color
    await page.click('[data-testid="color-blue"]')

    // Submit
    await page.click('[data-testid="create-submit"]')

    // Verify collection was created
    await expect(page.locator('text=My Test Collection')).toBeVisible()
  })

  test('should display collections list', async ({ page }) => {
    await page.goto('/collections')

    // Verify page loaded
    await expect(page.locator('h1')).toContainText('Mes Collections')

    // Verify search input
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible()
  })

  test('should search collections', async ({ page }) => {
    await page.goto('/collections')

    // Search
    await page.fill('[data-testid="search-input"]', 'cardiology')

    // Wait for search
    await page.waitForTimeout(300)

    // Verify filtered results
    const collections = page.locator('[data-testid="collection-card"]')
    const count = await collections.count()

    if (count > 0) {
      const title = await collections.first().locator('[data-testid="collection-title"]').textContent()
      expect(title?.toLowerCase()).toContain('cardiology')
    }
  })

  test('should delete a collection', async ({ page }) => {
    await page.goto('/collections')
    await page.waitForSelector('[data-testid="collection-card"]', { timeout: 5000 }).catch(() => null)

    const collections = page.locator('[data-testid="collection-card"]')
    const initialCount = await collections.count()

    if (initialCount > 0) {
      // Click delete on first collection
      const deleteButton = collections.first().locator('[data-testid="delete-button"]')
      await deleteButton.click()

      // Confirm deletion
      await page.click('[data-testid="confirm-delete"]')

      // Wait for deletion
      await page.waitForTimeout(500)

      // Verify count decreased
      const newCount = await page.locator('[data-testid="collection-card"]').count()
      expect(newCount).toBeLessThan(initialCount)
    }
  })

  test('should open collection details', async ({ page }) => {
    await page.goto('/collections')
    await page.waitForSelector('[data-testid="collection-card"]', { timeout: 5000 }).catch(() => null)

    const collections = page.locator('[data-testid="collection-card"]')
    const count = await collections.count()

    if (count > 0) {
      // Click on first collection
      await collections.first().click()

      // Verify navigation to collection detail
      await page.waitForURL(/\/collections\/[a-z0-9-]+/)
    }
  })

  test('should show empty state when no collections', async ({ page }) => {
    // Clear collections if any exist (this is a test scenario)
    await page.goto('/collections')

    // If collections exist, delete them
    let collections = page.locator('[data-testid="collection-card"]')
    while ((await collections.count()) > 0) {
      const deleteButton = collections.first().locator('[data-testid="delete-button"]')
      if (await deleteButton.isVisible()) {
        await deleteButton.click()
        await page.click('[data-testid="confirm-delete"]').catch(() => null)
        await page.waitForTimeout(300)
      } else {
        break
      }
    }

    // Verify empty state message
    await expect(page.locator('text=Aucune collection')).toBeVisible()
  })
})
