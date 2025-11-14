import { test, expect } from '@playwright/test'

test.describe('Favorites Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/')
    await page.goto('/med-mng/login')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/dashboard')
  })

  test('should add a post to favorites', async ({ page }) => {
    // Navigate to posts feed
    await page.goto('/posts')

    // Wait for posts to load
    await page.waitForSelector('[data-testid="post-card"]')

    // Get first post
    const firstPost = page.locator('[data-testid="post-card"]').first()

    // Click favorite button
    const favoriteButton = firstPost.locator('[data-testid="favorite-button"]')
    await favoriteButton.click()

    // Verify heart icon is filled
    const heartIcon = favoriteButton.locator('svg')
    await expect(heartIcon).toHaveClass(/fill-current/)
  })

  test('should remove a post from favorites', async ({ page }) => {
    await page.goto('/posts')
    await page.waitForSelector('[data-testid="post-card"]')

    // Add to favorites
    const firstPost = page.locator('[data-testid="post-card"]').first()
    const favoriteButton = firstPost.locator('[data-testid="favorite-button"]')
    await favoriteButton.click()

    // Remove from favorites
    await favoriteButton.click()

    // Verify heart icon is not filled
    const heartIcon = favoriteButton.locator('svg')
    await expect(heartIcon).not.toHaveClass(/fill-current/)
  })

  test('should view favorites page', async ({ page }) => {
    // Navigate to favorites
    await page.goto('/favorites')

    // Verify page loaded
    await expect(page.locator('h1')).toContainText('Mes Favoris')

    // Verify filter buttons exist
    await expect(page.locator('[data-testid="filter-all"]')).toBeVisible()
    await expect(page.locator('[data-testid="filter-posts"]')).toBeVisible()
    await expect(page.locator('[data-testid="filter-fiches"]')).toBeVisible()
  })

  test('should filter favorites by type', async ({ page }) => {
    await page.goto('/favorites')

    // Wait for favorites to load
    await page.waitForSelector('[data-testid="favorite-item"]', { timeout: 5000 }).catch(() => null)

    // Click post filter
    await page.click('[data-testid="filter-posts"]')

    // Verify only posts are shown
    const items = page.locator('[data-testid="favorite-item"]')
    for (let i = 0; i < await items.count(); i++) {
      const item = items.nth(i)
      const badge = item.locator('[data-testid="item-type-badge"]')
      await expect(badge).toContainText('post', { ignoreCase: true })
    }
  })

  test('should search favorites', async ({ page }) => {
    await page.goto('/favorites')
    await page.waitForSelector('[data-testid="search-input"]', { timeout: 5000 })

    // Search for keyword
    await page.fill('[data-testid="search-input"]', 'React')

    // Wait for search results
    await page.waitForTimeout(300)

    // Verify results contain search term
    const items = page.locator('[data-testid="favorite-item-title"]')
    const count = await items.count()

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const title = await items.nth(i).textContent()
        expect(title?.toLowerCase()).toContain('react')
      }
    }
  })

  test('should remove favorite from list', async ({ page }) => {
    await page.goto('/favorites')
    await page.waitForSelector('[data-testid="favorite-item"]', { timeout: 5000 }).catch(() => null)

    const items = page.locator('[data-testid="favorite-item"]')
    const initialCount = await items.count()

    if (initialCount > 0) {
      // Click delete button on first item
      const deleteButton = items.first().locator('[data-testid="delete-button"]')
      await deleteButton.click()

      // Wait for deletion
      await page.waitForTimeout(500)

      // Verify count decreased
      const newCount = await page.locator('[data-testid="favorite-item"]').count()
      expect(newCount).toBeLessThan(initialCount)
    }
  })
})
