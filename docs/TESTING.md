# 🧪 Guide des Tests - MedMng Platform

## 📋 Vue d'ensemble

Le projet utilise deux frameworks de test complémentaires :
- **Vitest** : Tests unitaires et d'intégration
- **Playwright** : Tests end-to-end (E2E)

## 🚀 Commandes Rapides

```bash
# Tests unitaires
npm run test              # Exécuter tous les tests
npm run test:watch        # Mode watch
npm run test -- --coverage # Avec coverage

# Tests E2E
npm run test:e2e          # Exécuter les tests E2E
npm run test:e2e:ui       # Mode UI interactif
npm run test:e2e -- --debug # Mode debug

# Lint
npm run lint              # Vérifier le code
npm run lint:fix          # Corriger automatiquement
```

## 🧪 Tests Unitaires (Vitest)

### Structure des tests
```
src/tests/
├── setup.ts                           # Configuration globale
└── hooks/
    ├── useFilterTemplates.test.tsx    # Tests du hook de templates
    ├── useTemplateTags.test.tsx       # Tests des tags
    ├── useTemplateComments.test.tsx   # Tests des commentaires
    ├── useTemplateFavorites.test.tsx  # Tests des favoris
    └── useTemplateHistory.test.tsx    # Tests de l'historique
```

### Configuration Vitest

Le fichier `vitest.config.ts` est configuré pour :
- ✅ Support JSX/TSX avec React
- ✅ Environment jsdom pour simuler le DOM
- ✅ Coverage avec v8
- ✅ Aliases de chemins (@/)
- ✅ Setup automatique avec jest-dom matchers

### Écrire un test

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useYourHook } from '@/hooks/useYourHook';

describe('useYourHook', () => {
  it('should do something', async () => {
    const { result } = renderHook(() => useYourHook(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={new QueryClient()}>
          {children}
        </QueryClientProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

### Mocking

```typescript
// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ data: [], error: null })),
      insert: vi.fn(() => ({ data: {}, error: null })),
      // ... autres méthodes
    })),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
```

## 🎭 Tests E2E (Playwright)

### Structure des tests
```
test/e2e/
├── global-setup.ts           # Setup global
├── global-teardown.ts        # Cleanup global
└── template-system.spec.ts   # Tests du système de templates
```

### Configuration Playwright

Le fichier `playwright.config.ts` configure :
- ✅ Tests sur Chrome, Firefox, Safari
- ✅ Tests sur mobile (Pixel 5, iPhone 13)
- ✅ Tests sur tablette (iPad Pro)
- ✅ Screenshots et videos en cas d'échec
- ✅ Traces pour debugging
- ✅ Rapports HTML, JSON, JUnit

### Écrire un test E2E

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup authentification si nécessaire
    await page.goto('/');
  });

  test('should perform user action', async ({ page }) => {
    // Interagir avec la page
    await page.click('button[aria-label="Action"]');
    
    // Vérifier le résultat
    await expect(page.locator('.result')).toBeVisible();
    await expect(page.locator('.result')).toHaveText('Expected text');
  });
});
```

### Sélecteurs recommandés

```typescript
// ✅ Bon : Utiliser des sélecteurs sémantiques
page.getByRole('button', { name: 'Submit' })
page.getByLabel('Email')
page.getByText('Welcome')
page.getByTestId('custom-element')

// ❌ Éviter : Sélecteurs CSS fragiles
page.locator('.btn-primary')
page.locator('#email-input')
```

## 🔄 CI/CD avec GitHub Actions

### Workflow automatique

Le workflow `.github/workflows/tests.yml` s'exécute :
- ✅ À chaque push sur `main` ou `develop`
- ✅ À chaque pull request
- ✅ Manuellement via workflow_dispatch

### Jobs du workflow

1. **unit-tests** : Exécute les tests Vitest avec coverage
2. **e2e-tests** : Exécute les tests Playwright sur tous les navigateurs
3. **lint** : Vérifie le code avec ESLint et TypeScript
4. **test-summary** : Génère un résumé des résultats

### Configuration des secrets

Dans GitHub Settings → Secrets → Actions, ajouter :

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Artifacts conservés

- Coverage reports (30 jours)
- Playwright reports avec screenshots et videos (30 jours)
- Test results JSON/XML pour analyse

## 📊 Coverage

### Générer le rapport de coverage

```bash
npm run test -- --coverage
```

Le rapport est généré dans `coverage/` :
- `coverage/index.html` : Rapport HTML interactif
- `coverage/coverage-final.json` : Données JSON
- `coverage/lcov.info` : Format LCOV pour Codecov

### Objectifs de coverage

- **Statements** : > 80%
- **Branches** : > 75%
- **Functions** : > 80%
- **Lines** : > 80%

## 🐛 Debugging

### Tests unitaires qui échouent

```bash
# Mode verbose
npm run test -- --reporter=verbose

# Isoler un test spécifique
npm run test -- -t "should create template"

# Mode watch pour développement
npm run test:watch
```

### Tests E2E qui échouent

```bash
# Mode UI pour voir les tests
npm run test:e2e:ui

# Mode headed (voir le navigateur)
npm run test:e2e -- --headed

# Mode debug avec breakpoints
npm run test:e2e -- --debug

# Ralentir l'exécution
npm run test:e2e -- --slow-mo=1000

# Générer des traces
npm run test:e2e -- --trace on
```

### Analyser les traces Playwright

```bash
# Ouvrir le trace viewer
npx playwright show-trace trace.zip
```

## 📝 Best Practices

### Tests unitaires

1. **Un test = une fonctionnalité** : Tester un seul comportement par test
2. **AAA Pattern** : Arrange, Act, Assert
3. **Mock minimal** : Ne mocker que ce qui est nécessaire
4. **Nettoyer** : Utiliser `afterEach` pour cleanup
5. **Async/Await** : Toujours utiliser `waitFor` pour les opérations async

### Tests E2E

1. **Isoler les tests** : Chaque test doit être indépendant
2. **Données de test** : Créer/nettoyer les données dans beforeEach/afterEach
3. **Attendre les états** : Utiliser `waitFor`, `toBeVisible()` avant d'interagir
4. **Screenshots** : Capturer en cas d'échec pour debugging
5. **Timeouts généreux** : Les E2E peuvent être lents

### CI/CD

1. **Tests rapides d'abord** : Lint → Unit → E2E
2. **Parallélisation** : Exécuter les tests indépendants en parallèle
3. **Retry sur échec** : Configurer des retries pour les tests E2E flaky
4. **Cache** : Utiliser le cache npm pour accélérer les builds
5. **Artifacts** : Conserver les logs et rapports pour investigation

## 🔗 Ressources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🆘 Support

En cas de problème :
1. Vérifier les logs des tests
2. Consulter les artifacts dans GitHub Actions
3. Exécuter les tests en local avec mode debug
4. Vérifier la documentation des outils
