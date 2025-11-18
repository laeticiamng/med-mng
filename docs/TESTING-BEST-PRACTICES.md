# 🧪 Guide des Meilleures Pratiques de Test - MED-MNG

**Version**: 1.0
**Date**: 18 Novembre 2025
**Public**: Développeurs

Ce document complète `TESTING.md` avec des exemples pratiques et des recommandations avancées.

---

## 📋 Quick Reference

### Commandes Essentielles

```bash
# Tests unitaires
pnpm test                    # Tous les tests
pnpm test:watch              # Mode watch
pnpm test --coverage         # Avec coverage

# Tests E2E
pnpm test:e2e                # Playwright
pnpm test:e2e --ui           # Avec UI
pnpm test:e2e --debug        # Mode debug

# Linting & Type Check
pnpm lint                    # ESLint
pnpm tsc --noEmit            # TypeScript

# Build
pnpm build                   # Production build
pnpm build:dev               # Development build
```

---

## 🎯 TDD (Test-Driven Development)

### Cycle Red-Green-Refactor

```
1. 🔴 RED     → Écrire un test qui échoue
2. 🟢 GREEN   → Écrire le code minimum pour passer
3. 🔵 REFACTOR → Améliorer le code sans casser les tests
```

### Exemple Pratique

```typescript
// 1. 🔴 RED: Écrire le test en premier
import { describe, it, expect } from 'vitest';
import { calculateDiscount } from './discount';

describe('calculateDiscount', () => {
  it('should apply 10% discount for orders over 100€', () => {
    const result = calculateDiscount(150);
    expect(result).toBe(135); // 150 - 15 = 135
  });
});

// → Le test échoue car la fonction n'existe pas encore

// 2. 🟢 GREEN: Implémenter la fonction
export function calculateDiscount(amount: number): number {
  if (amount >= 100) {
    return amount * 0.9; // 10% discount
  }
  return amount;
}

// → Le test passe maintenant

// 3. 🔵 REFACTOR: Améliorer
export function calculateDiscount(amount: number): number {
  const DISCOUNT_THRESHOLD = 100;
  const DISCOUNT_RATE = 0.1;

  return amount >= DISCOUNT_THRESHOLD
    ? amount * (1 - DISCOUNT_RATE)
    : amount;
}

// → Le test passe toujours, code plus lisible
```

---

## 🧩 Patterns de Test

### 1. Test Fixtures (Données de Test)

```typescript
// tests/fixtures/users.ts
export const createMockUser = (overrides = {}) => ({
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  ...overrides,
});

// Usage dans les tests
test('should display user name', () => {
  const user = createMockUser({ name: 'Jane Doe' });
  render(<UserProfile user={user} />);
  expect(screen.getByText('Jane Doe')).toBeInTheDocument();
});
```

### 2. Test Helpers

```typescript
// tests/helpers/render.tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions
) {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>,
    options
  );
}

// Usage
test('should fetch and display users', async () => {
  renderWithProviders(<UserList />);
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### 3. Custom Matchers

```typescript
// tests/matchers/toBeValidEmail.ts
import { expect } from 'vitest';

expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid email`
          : `Expected ${received} to be a valid email`,
    };
  },
});

// Usage
test('should validate email', () => {
  expect('test@example.com').toBeValidEmail();
  expect('invalid-email').not.toBeValidEmail();
});
```

---

## 🎭 Tests de Composants Complexes

### Test de Formulaire

```typescript
// components/LoginForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('should submit form with valid data', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={handleSubmit} />);

    // Remplir le formulaire
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    // Soumettre
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Vérifier
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should show validation errors', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);

    // Soumettre sans remplir
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Vérifier les erreurs
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });
});
```

### Test de Modal

```typescript
// components/Modal.test.tsx
test('should close on escape key', async () => {
  const handleClose = vi.fn();
  const user = userEvent.setup();

  render(
    <Modal isOpen onClose={handleClose}>
      <p>Modal content</p>
    </Modal>
  );

  // Appuyer sur Escape
  await user.keyboard('{Escape}');

  expect(handleClose).toHaveBeenCalledTimes(1);
});

test('should trap focus', async () => {
  render(
    <Modal isOpen onClose={vi.fn()}>
      <button>First</button>
      <button>Last</button>
    </Modal>
  );

  const first = screen.getByText('First');
  const last = screen.getByText('Last');

  // Tab de first à last
  first.focus();
  await userEvent.tab();
  expect(last).toHaveFocus();

  // Tab de last retourne à first
  await userEvent.tab();
  expect(first).toHaveFocus();
});
```

---

## 🔄 Tests Asynchrones

### Test avec Async/Await

```typescript
test('should load user data', async () => {
  render(<UserProfile userId="123" />);

  // Attendre le chargement
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Attendre les données
  const userName = await screen.findByText('John Doe');
  expect(userName).toBeInTheDocument();

  // Loading a disparu
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

### Test avec waitFor

```typescript
test('should update on prop change', async () => {
  const { rerender } = render(<Counter count={0} />);

  expect(screen.getByText('0')).toBeInTheDocument();

  // Update props
  rerender(<Counter count={5} />);

  // Attendre la mise à jour
  await waitFor(() => {
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
```

---

## 🎨 Tests Visuels (Snapshot Testing)

```typescript
// ⚠️ Utiliser avec modération
test('should match snapshot', () => {
  const { container } = render(<Button>Click me</Button>);
  expect(container).toMatchSnapshot();
});

// ✅ Mieux: Snapshot d'un élément spécifique
test('should render correct HTML structure', () => {
  const { getByRole } = render(<Button>Click me</Button>);
  const button = getByRole('button');
  expect(button).toMatchInlineSnapshot(`
    <button class="btn btn-primary">
      Click me
    </button>
  `);
});
```

---

## 🔒 Tests de Sécurité

### Test d'Authentification

```typescript
test('should redirect unauthenticated users', async () => {
  // Mock de l'état non authentifié
  vi.mock('@/lib/auth', () => ({
    useAuth: () => ({ isAuthenticated: false }),
  }));

  render(<ProtectedRoute><Dashboard /></ProtectedRoute>);

  await waitFor(() => {
    expect(window.location.pathname).toBe('/login');
  });
});
```

### Test de Rate Limiting

```typescript
test('should enforce rate limit', async () => {
  const mockFetch = vi.fn().mockResolvedValue({ ok: true });
  global.fetch = mockFetch;

  // 100 requêtes
  for (let i = 0; i < 100; i++) {
    await apiClient.get('/data');
  }

  // 101ème requête devrait être bloquée
  await expect(apiClient.get('/data')).rejects.toThrow('Rate limit exceeded');
});
```

---

## 📊 Coverage Best Practices

### Que Tester ?

#### ✅ À Tester en Priorité

1. **Logique Métier Critique**
   - Calculs
   - Validations
   - Transformations de données

2. **Chemins d'Erreur**
   - Gestion d'erreurs
   - Cas limites
   - Validations

3. **Intégrations Externes**
   - APIs
   - Base de données
   - Services tiers

#### ⚠️ Tester avec Modération

1. **UI Simple**
   - Composants purement visuels
   - Styling

2. **Configuration**
   - Fichiers de config
   - Constants

#### ❌ Ne Pas Tester

1. **Code Tiers**
   - Librairies externes
   - Framework code

2. **Types TypeScript**
   - Déjà vérifié par le compilateur

3. **Trivial Code**
   - Getters/Setters simples
   - Pass-through functions

---

## 🐛 Debugging Tests

### 1. Debug dans le Terminal

```typescript
import { debug } from '@testing-library/react';

test('debug test', () => {
  const { debug } = render(<MyComponent />);

  // Afficher le DOM
  debug();

  // Afficher un élément spécifique
  debug(screen.getByRole('button'));
});
```

### 2. Debug avec VS Code

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Vitest",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["test", "--run", "--no-coverage"],
      "console": "integratedTerminal"
    }
  ]
}
```

### 3. Tests Interactifs

```bash
# UI de test interactive
pnpm test:ui

# Browser avec Playwright
pnpm test:e2e --headed
pnpm test:e2e --debug
```

---

## 📈 Métriques de Qualité

### Code Coverage

```bash
# Générer le rapport
pnpm test --coverage

# Seuils recommandés
Statements   : 80%
Branches     : 75%
Functions    : 80%
Lines        : 80%
```

### Mutation Testing (Avancé)

```bash
# Installer Stryker
pnpm add -D @stryker-mutator/core

# Exécuter
pnpm stryker run
```

---

## 🎯 Checklist de Test

### Avant de Commiter

- [ ] Tous les tests passent
- [ ] Nouveaux tests pour nouveau code
- [ ] Coverage >= 80%
- [ ] Pas de tests skip/only
- [ ] Tests lisibles et maintenables

### Pour Chaque Feature

- [ ] Tests unitaires des fonctions
- [ ] Tests des composants React
- [ ] Tests d'intégration API
- [ ] Test E2E du flow principal
- [ ] Tests des cas d'erreur

### Code Review

- [ ] Tests couvrent les cas limites
- [ ] Tests sont déterministes
- [ ] Mocks appropriés
- [ ] Pas de dépendances externes

---

## 🚀 Tips & Tricks

### 1. Accélérer les Tests

```typescript
// ❌ Lent
test('slow test', async () => {
  await new Promise((r) => setTimeout(r, 5000));
});

// ✅ Rapide avec fake timers
test('fast test', async () => {
  vi.useFakeTimers();
  const promise = doSomethingAfter5Seconds();
  vi.advanceTimersByTime(5000);
  await promise;
  vi.useRealTimers();
});
```

### 2. Tests Paramétrés

```typescript
describe.each([
  [0, 0],
  [1, 1],
  [2, 4],
  [3, 9],
])('square(%i)', (input, expected) => {
  it(`should return ${expected}`, () => {
    expect(square(input)).toBe(expected);
  });
});
```

### 3. Setup/Teardown

```typescript
describe('Database tests', () => {
  beforeAll(async () => {
    // Setup: Connexion DB
    await db.connect();
  });

  afterAll(async () => {
    // Teardown: Fermeture DB
    await db.disconnect();
  });

  beforeEach(async () => {
    // Nettoyer avant chaque test
    await db.clear();
  });

  test('should insert user', async () => {
    // Test isolation garanti
  });
});
```

---

## 📚 Ressources

- [Vitest Best Practices](https://vitest.dev/guide/best-practices.html)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Kent C. Dodds Testing Blog](https://kentcdodds.com/blog?q=testing)

---

**Dernière mise à jour**: 18 Novembre 2025
**Mainteneur**: Équipe Technique MED-MNG
