# Tests E2E avec Playwright - Guide Complet

## 📋 Vue d'ensemble

Ce guide détaille l'utilisation des tests End-to-End (E2E) avec Playwright pour valider les workflows critiques du dashboard et de l'application.

## 🚀 Installation et Configuration

### Prérequis
- Node.js 18+ installé
- Projet configuré avec Playwright (déjà installé dans ce projet)

### Vérification de l'installation
```bash
npm list @playwright/test
```

## 📝 Structure des Tests

### Organisation des fichiers
```
test/
├── e2e/
│   ├── dashboard.spec.ts        # Tests du dashboard
│   ├── auth.spec.ts             # Tests d'authentification (à créer)
│   ├── global-setup.ts          # Configuration globale
│   └── global-teardown.ts       # Nettoyage global
└── test-results/                # Résultats et captures
```

## 🧪 Tests Disponibles

### Dashboard Tests (`dashboard.spec.ts`)

#### Navigation
- ✅ Chargement du dashboard avec toutes les sections
- ✅ Navigation entre les différentes sections
- ✅ Toggle du sidebar sur mobile
- ✅ Responsive design sur différents viewports

#### Filtres et Tri
- ✅ Filtrage par terme de recherche
- ✅ Tri des colonnes
- ✅ Filtrage par plage de dates
- ✅ Filtrage par statut

#### Export de Données
- ✅ Export complet en CSV/XLSX
- ✅ Export des lignes sélectionnées
- ✅ Export avec filtres appliqués

#### Pagination
- ✅ Navigation entre les pages
- ✅ Changement de taille de page

#### Performance
- ✅ Temps de chargement du dashboard
- ✅ Gestion des changements rapides de filtres

#### Gestion d'Erreurs
- ✅ Affichage des erreurs de chargement
- ✅ Gestion des données vides

## 🎯 Commandes Principales

### Exécuter tous les tests
```bash
npm run test:e2e
```

### Exécuter un fichier de test spécifique
```bash
npx playwright test test/e2e/dashboard.spec.ts
```

### Exécuter un test spécifique
```bash
npx playwright test -g "should load dashboard"
```

### Mode UI interactif (recommandé pour le développement)
```bash
npx playwright test --ui
```

### Mode debug
```bash
npx playwright test --debug
```

### Exécuter sur un navigateur spécifique
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Voir le rapport HTML
```bash
npx playwright show-report
```

## 📊 Rapports et Résultats

### Formats de rapport
Les tests génèrent automatiquement :
- **HTML Report** : Rapport visuel détaillé
- **JSON Report** : `test-results/e2e-results.json`
- **JUnit XML** : `test-results/e2e-results.xml`

### Captures d'écran
Les captures d'écran sont automatiquement prises en cas d'échec :
- Stockées dans `test-results/`
- Disponibles dans le rapport HTML

### Vidéos
Les vidéos sont enregistrées en cas d'échec :
- Stockées dans `test-results/`
- Configurées dans `playwright.config.ts`

## 🔍 Sélecteurs et Best Practices

### Sélecteurs recommandés (par ordre de priorité)
```typescript
// 1. Par rôle (meilleur pour l'accessibilité)
page.getByRole('button', { name: /submit/i })

// 2. Par label
page.getByLabel('Email')

// 3. Par placeholder
page.getByPlaceholder('Search...')

// 4. Par texte
page.getByText('Welcome')

// 5. Par test ID (en dernier recours)
page.getByTestId('submit-button')
```

### Ajout de test IDs dans les composants
```tsx
// Dans vos composants React
<div data-testid="metric-card">
  <h3>Total Users</h3>
  <p>1,234</p>
</div>
```

## 🎭 Patterns de Test Courants

### Test de navigation
```typescript
test('should navigate to settings', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByRole('link', { name: /settings/i }).click();
  await expect(page).toHaveURL(/settings/);
});
```

### Test de formulaire
```typescript
test('should submit form', async ({ page }) => {
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page.getByText('Success')).toBeVisible();
});
```

### Test de filtrage
```typescript
test('should filter data', async ({ page }) => {
  const searchInput = page.getByPlaceholder(/search/i);
  await searchInput.fill('test');
  await page.waitForTimeout(500); // Attendre le debounce
  const results = page.locator('table tbody tr');
  expect(await results.count()).toBeGreaterThan(0);
});
```

### Test de téléchargement
```typescript
test('should download file', async ({ page }) => {
  const downloadPromise = page.waitForEvent('download');
  await page.click('button:has-text("Export")');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('data.csv');
});
```

### Test responsive
```typescript
test('should work on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/dashboard');
  await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
});
```

## 🔧 Configuration Avancée

### Modifier les timeouts
```typescript
// Dans playwright.config.ts
export default defineConfig({
  timeout: 60000,          // Timeout global par test
  expect: {
    timeout: 10000,        // Timeout pour les assertions
  },
});
```

### Ajouter des fixtures
```typescript
// test/e2e/fixtures.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Se connecter avant chaque test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await use(page);
  },
});
```

### Intercepter les requêtes réseau
```typescript
test('should handle API errors', async ({ page }) => {
  // Intercepter et faire échouer les requêtes
  await page.route('**/api/**', route => route.abort());
  
  await page.goto('/dashboard');
  await expect(page.getByText(/error/i)).toBeVisible();
});
```

## 🚀 Intégration CI/CD

### GitHub Actions
```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📈 Métriques et Performance

### Mesurer les Web Vitals
```typescript
test('should have good performance', async ({ page }) => {
  await page.goto('/dashboard');
  
  const metrics = await page.evaluate(() => {
    return {
      LCP: performance.getEntriesByType('largest-contentful-paint')[0],
      FID: performance.getEntriesByType('first-input')[0],
      CLS: performance.getEntriesByType('layout-shift'),
    };
  });
  
  // Assertions sur les métriques
  expect(metrics.LCP).toBeLessThan(2500);
});
```

## 🐛 Debugging

### Mode trace
```bash
npx playwright test --trace on
```

### Ouvrir le trace viewer
```bash
npx playwright show-trace trace.zip
```

### Pause dans le test
```typescript
test('debug test', async ({ page }) => {
  await page.goto('/dashboard');
  await page.pause(); // Ouvre l'inspector Playwright
});
```

## 📚 Ressources

### Documentation
- [Playwright Official Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

### Outils
- [Playwright Inspector](https://playwright.dev/docs/inspector)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [VS Code Extension](https://playwright.dev/docs/getting-started-vscode)

## 🎯 Checklist pour Nouveaux Tests

Avant d'écrire un nouveau test :
- [ ] Identifier le workflow critique à tester
- [ ] Définir les assertions importantes
- [ ] Utiliser des sélecteurs sémantiques (rôle, label)
- [ ] Ajouter des `data-testid` si nécessaire
- [ ] Gérer les états de chargement
- [ ] Tester les cas d'erreur
- [ ] Vérifier la responsiveness si applicable
- [ ] Documenter le test avec des commentaires

## 🔒 Tests d'Authentification (à implémenter)

Pour ajouter des tests d'authentification, créez `test/e2e/auth.spec.ts` :

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/invalid/i)).toBeVisible();
  });
});
```

## 📝 Notes Importantes

- Les tests utilisent le serveur de développement (`npm run dev`)
- Les tests s'exécutent sur tous les navigateurs configurés (Chromium, Firefox, WebKit)
- Les captures et vidéos ne sont prises qu'en cas d'échec
- Le mode headless est activé par défaut en CI

## 🆘 Dépannage

### Les tests échouent localement
1. Vérifier que le serveur dev tourne : `npm run dev`
2. Vérifier les navigateurs installés : `npx playwright install`
3. Nettoyer le cache : `rm -rf test-results`

### Timeouts fréquents
1. Augmenter les timeouts dans `playwright.config.ts`
2. Ajouter des `waitForLoadState('networkidle')`
3. Vérifier la performance de l'application

### Sélecteurs qui ne fonctionnent pas
1. Utiliser le Playwright Inspector : `npx playwright test --debug`
2. Générer des sélecteurs : `npx playwright codegen http://localhost:5173`
