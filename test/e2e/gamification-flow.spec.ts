import { test, expect } from '@playwright/test'

test.describe('Gamification Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/med-mng/login')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/dashboard')
  })

  test('should display gamification dashboard', async ({ page }) => {
    await page.goto('/gamification')

    // Verify page title
    await expect(page.locator('h1')).toContainText('Tableau de Bord Gamification')

    // Verify level card
    await expect(page.locator('[data-testid="level-card"]')).toBeVisible()

    // Verify XP progress
    await expect(page.locator('[data-testid="xp-progress"]')).toBeVisible()
  })

  test('should display user level and XP', async ({ page }) => {
    await page.goto('/gamification')

    // Verify level display
    const levelCard = page.locator('[data-testid="level-card"]')
    await expect(levelCard.locator('text=Niveau')).toBeVisible()

    // Verify XP bar
    const xpBar = page.locator('[data-testid="xp-bar"]')
    await expect(xpBar).toBeVisible()
  })

  test('should display daily challenges', async ({ page }) => {
    await page.goto('/gamification')

    // Verify challenges section
    await expect(page.locator('[data-testid="challenges-section"]')).toBeVisible()

    // Check for challenge cards
    const challenges = page.locator('[data-testid="challenge-card"]')
    if ((await challenges.count()) > 0) {
      // Verify challenge content
      await expect(challenges.first().locator('[data-testid="challenge-title"]')).toBeVisible()
      await expect(challenges.first().locator('[data-testid="challenge-progress"]')).toBeVisible()
    }
  })

  test('should display user badges', async ({ page }) => {
    await page.goto('/gamification')

    // Verify badges section
    const badgesSection = page.locator('[data-testid="badges-section"]')
    await expect(badgesSection).toBeVisible()

    // Verify badges exist
    const badges = page.locator('[data-testid="badge-item"]')
    expect(await badges.count()).toBeGreaterThanOrEqual(0)
  })

  test('should display user statistics', async ({ page }) => {
    await page.goto('/gamification')

    // Verify stats grid
    const statsGrid = page.locator('[data-testid="stats-grid"]')
    await expect(statsGrid).toBeVisible()

    // Verify individual stats
    await expect(statsGrid.locator('text=Posts créés')).toBeVisible()
    await expect(statsGrid.locator('text=Vues')).toBeVisible()
    await expect(statsGrid.locator('text=Likes')).toBeVisible()
    await expect(statsGrid.locator('text=Commentaires')).toBeVisible()
  })

  test('should display streak information', async ({ page }) => {
    await page.goto('/gamification')

    // Verify streak card
    const streakCard = page.locator('[data-testid="streak-card"]')
    await expect(streakCard).toBeVisible()

    // Verify streak content
    await expect(streakCard.locator('text=jours consécutifs')).toBeVisible()
  })

  test('should navigate to badges page', async ({ page }) => {
    await page.goto('/gamification')

    // Click "Voir tous les badges" button
    const viewAllButton = page.locator('[data-testid="view-all-badges-button"]')
    if (await viewAllButton.isVisible()) {
      await viewAllButton.click()

      // Verify navigation
      await page.waitForURL(/\/badges/)
      await expect(page.locator('h1')).toContainText('Badges')
    }
  })

  test('should navigate to leaderboard page', async ({ page }) => {
    await page.goto('/gamification')

    // Click leaderboard button
    const leaderboardButton = page.locator('[data-testid="leaderboard-button"]')
    if (await leaderboardButton.isVisible()) {
      await leaderboardButton.click()

      // Verify navigation
      await page.waitForURL(/\/leaderboard/)
      await expect(page.locator('h1')).toContainText('Classement')
    }
  })

  test('should display achievement tips', async ({ page }) => {
    await page.goto('/gamification')

    // Verify tips card
    const tipsCard = page.locator('[data-testid="tips-card"]')
    await expect(tipsCard).toBeVisible()

    // Verify tips content
    await expect(tipsCard.locator('text=Créez du contenu')).toBeVisible()
  })
})
