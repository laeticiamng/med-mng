import { test, expect } from '@playwright/test';

test.describe('Platform status page', () => {
  test('renders status overview and tabs', async ({ page }) => {
    await page.goto('/platform-status');

    await expect(page.getByRole('heading', { name: 'État de la Plateforme' })).toBeVisible();
    await expect(page.getByText('Tous les systèmes sont')).toBeVisible();

    await expect(page.getByRole('tab', { name: "Vue d'ensemble" })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Services' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Historique' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Détails' })).toBeVisible();
  });
});
