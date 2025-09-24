import { test, expect, Page } from '@playwright/test';

const smokeScenarios: Array<{
  name: string;
  path: string;
  verify: (page: Page) => Promise<void>;
}> = [
  {
    name: 'homepage',
    path: '/',
    verify: async (page: Page) => {
      await expect(page.getByRole('heading', { name: /MED-MNG/i })).toBeVisible();
      await expect(page.locator("text=L'IA au Service de l'Excellence Médicale")).toBeVisible();
    },
  },
  {
    name: 'items catalog',
    path: '/items',
    verify: async (page: Page) => {
      await expect(page.getByRole('heading', { name: /Items EDN MED MNG/i })).toBeVisible();
      await expect(page.getByText('Progression Globale EDN', { exact: false })).toBeVisible();
    },
  },
  {
    name: 'item detail IC-001',
    path: '/item/001',
    verify: async (page: Page) => {
      await expect(page.getByRole('link', { name: /Retour aux items EDN/i })).toBeVisible();
      await expect(page.getByText('Mode Immersif', { exact: false })).toBeVisible();
    },
  },
];

test.describe('🚨 Post-deployment smoke', () => {
  for (const scenario of smokeScenarios) {
    test(`should keep ${scenario.name} available (${scenario.path})`, async ({ page }) => {
      const response = await page.goto(scenario.path, {
        waitUntil: 'networkidle',
      });

      expect(response, `Aucune réponse pour ${scenario.path}`).toBeTruthy();
      expect(response?.status(), `HTTP inattendu sur ${scenario.path}`).toBe(200);

      await expect(page.locator('#app-root')).toBeVisible();
      await scenario.verify(page);
    });
  }
});
