import { test, expect } from '@playwright/test';

test.describe('Music Generation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: '123', email: 'test@med-mng.fr' }
      }));
    });
    
    await page.goto('/med-mng/create');
  });

  test('should display music creation interface', async ({ page }) => {
    await expect(page).toHaveTitle(/MED-MNG.*Create/);
    await expect(page.getByRole('heading', { name: /génération musicale/i })).toBeVisible();
    await expect(page.getByPlaceholder(/style musical/i)).toBeVisible();
  });

  test('should validate music generation form', async ({ page }) => {
    // Try to submit empty form
    await page.click('button:has-text("Générer")');
    
    await expect(page.getByText(/veuillez sélectionner un item/i)).toBeVisible();
  });

  test('should handle successful music generation', async ({ page }) => {
    // Mock successful generation
    await page.route('**/functions/v1/med-mng-api', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            jobId: 'mock-job-123',
            status: 'queued'
          })
        });
      }
    });

    // Fill form
    await page.selectOption('[data-testid="item-select"]', 'IC-1');
    await page.fill('[data-testid="style-input"]', 'Jazz');
    await page.selectOption('[data-testid="mode-select"]', 'A');
    
    await page.click('button:has-text("Générer")');
    
    await expect(page.getByText(/génération en cours/i)).toBeVisible();
    await expect(page.getByTestId('progress-indicator')).toBeVisible();
  });

  test('should handle generation errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/functions/v1/med-mng-api', async route => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Rate limit exceeded'
        })
      });
    });

    await page.selectOption('[data-testid="item-select"]', 'IC-1');
    await page.fill('[data-testid="style-input"]', 'Pop');
    await page.click('button:has-text("Générer")');
    
    await expect(page.getByText(/limite de génération atteinte/i)).toBeVisible();
  });

  test('should display generation history', async ({ page }) => {
    // Mock history data
    await page.route('**/rest/v1/generated_music_tracks*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            title: 'IC-1 Jazz',
            status: 'completed',
            created_at: new Date().toISOString(),
            audio_url: 'mock-url.mp3'
          }
        ])
      });
    });

    await page.click('text=Historique');
    
    await expect(page.getByText('IC-1 Jazz')).toBeVisible();
    await expect(page.getByText('Terminé')).toBeVisible();
  });

  test('should play generated music', async ({ page }) => {
    await page.goto('/med-mng/library');
    
    // Mock music library
    await page.route('**/rest/v1/generated_music_tracks*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            title: 'Test Song',
            audio_url: 'https://example.com/test.mp3',
            status: 'completed'
          }
        ])
      });
    });

    await page.reload();
    
    const playButton = page.getByTestId('play-button').first();
    await expect(playButton).toBeVisible();
    
    await playButton.click();
    
    // Check that audio controls appear
    await expect(page.getByTestId('audio-player')).toBeVisible();
  });
});