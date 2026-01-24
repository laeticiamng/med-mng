# Configuration des Tests MED-MNG

## ⚠️ Problème Actuel

Le projet utilise **Vitest** pour les tests unitaires mais le script `npm test` dans `package.json` pointe vers **Jest**.

### Solution Immédiate

Pour exécuter les tests correctement, utilisez:

```bash
# Tests unitaires avec Vitest
npx vitest run

# Tests unitaires avec watch mode
npx vitest

# Tests E2E avec Playwright
npx playwright test

# Tests de performance
npx playwright test --config=playwright-performance.config.ts
```

## 📁 Structure des Tests

```
src/tests/                    # Tests unitaires (Vitest)
├── hooks/                    # Tests des hooks React
│   ├── useAdaptiveSRS.test.ts
│   ├── useFlashcards.test.ts
│   ├── useGamification.test.ts
│   ├── useIdGenerator.test.ts
│   ├── useMedMngApi.test.ts
│   └── useMusicGeneration.test.ts
├── mocks/
│   └── server.ts             # MSW mock server
├── setup.ts                  # Setup global
├── api-integration.test.ts   # Tests d'intégration API
├── parsers.test.ts           # Tests des parseurs
└── critical.test.tsx         # Tests critiques

tests/e2e/                    # Tests E2E (Playwright)
├── learning/                 # Module apprentissage
├── edn/                      # Module EDN
├── music/                    # Module musique
├── admin/                    # Panel admin
├── ecos/                     # Scénarios ECOS
└── auth/                     # Authentification

tests/performance/            # Tests de performance
└── frontend-performance.spec.ts

tests/accessibility-axe.spec.ts  # Tests accessibilité
```

## ✅ Couverture Actuelle

| Module | Tests Unitaires | Tests E2E | Status |
|--------|-----------------|-----------|--------|
| SRS/Flashcards | ✅ | ✅ | Complet |
| Gamification | ✅ | ⚠️ | Partiel |
| EDN Items | ✅ | ✅ | Complet |
| Music Generation | ✅ | ✅ | Complet |
| Authentication | ⚠️ | ✅ | Partiel |
| Admin Panel | ⚠️ | ✅ | Partiel |
| ECOS | ⚠️ | ✅ | Partiel |

## 🔧 Configuration Vitest

Le fichier `vitest.config.ts` est correctement configuré:

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## 🚀 Prochaines Étapes

1. **Mettre à jour package.json** pour utiliser Vitest:
   ```json
   "scripts": {
     "test": "vitest run",
     "test:watch": "vitest",
     "test:e2e": "playwright test",
     "test:coverage": "vitest run --coverage"
   }
   ```

2. **Ajouter la couverture de code**:
   ```bash
   pnpm add -D @vitest/coverage-v8
   ```

3. **CI/CD**: Mettre à jour les workflows GitHub Actions

## 📊 Métriques de Qualité

- **Objectif Couverture**: > 80%
- **Tests Critiques**: 100% pass
- **Performance**: < 3s par endpoint
- **Accessibilité**: 0 violation WCAG 2.1 AA
