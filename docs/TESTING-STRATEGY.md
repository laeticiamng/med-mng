# Strategie de Tests MED-MNG

## Contexte Critique

Ce projet est une plateforme d'education medicale. Les risques sont demultiplies:
- Donnees de sante (meme pedagogiques)
- Utilisateurs en formation medicale
- Contenus devant etre medicalement exacts
- Conformite RGPD obligatoire

---

## 1. MATRICE DE COUVERTURE ACTUELLE

### Modules CRITIQUES (Priorite 1 - Securite/Auth)

| Module | Fichier | Tests Existants | Couverture | Action |
|--------|---------|-----------------|------------|--------|
| AuthProvider | `src/components/med-mng/AuthProvider.tsx` | AUCUN | 0% | URGENT |
| AdminRoute | `src/components/med-mng/AdminRoute.tsx` | AUCUN | 0% | URGENT |
| ProtectedRoute | `src/components/med-mng/ProtectedRoute.tsx` | AUCUN | 0% | URGENT |
| RLS Policies | `test/rls-security.test.ts` | OUI | ~40% | AMELIORER |
| secureApiClient | `src/lib/secureApiClient.ts` | AUCUN | 0% | URGENT |
| rateLimitService | `src/services/rateLimitService.ts` | AUCUN | 0% | URGENT |

### Modules CRITIQUES (Priorite 2 - Donnees Medicales)

| Module | Fichier | Tests Existants | Couverture | Action |
|--------|---------|-----------------|------------|--------|
| ednTableauxService | `src/services/ednTableauxService.ts` | AUCUN | 0% | CREER |
| ecosService | `src/services/ecosService.ts` | AUCUN | 0% | CREER |
| qcmService | `src/services/qcmService.ts` | AUCUN | 0% | CREER |
| pedagogicalContentService | `src/services/pedagogicalContentService.ts` | AUCUN | 0% | CREER |
| medMngItemsService | `src/services/medMngItemsService.ts` | AUCUN | 0% | CREER |

### Contextes React (Priorite 3 - Etat Global)

| Contexte | Tests | Action |
|----------|-------|--------|
| ErrorContext | AUCUN | CREER |
| GlobalAudioContext | AUCUN | CREER |
| NotificationContext | AUCUN | CREER |
| PerformanceContext | AUCUN | CREER |
| PlayerContext | AUCUN | CREER |
| LanguageContext | AUCUN | CREER |
| InternationalizationContext | AUCUN | CREER |

### Stores Zustand (Priorite 3)

| Store | Tests | Action |
|-------|-------|--------|
| cartStore | AUCUN | CREER |
| quizStore | AUCUN | CREER |
| studyStore | AUCUN | CREER |
| userStore | AUCUN | CREER |

### Hooks (Priorite 4 - 150+ hooks, 5 testes)

| Hook | Tests | Criticite |
|------|-------|-----------|
| useAuth | AUCUN | HAUTE |
| useAIChat | AUCUN | HAUTE |
| useClinicalCases | AUCUN | HAUTE |
| useExamMode | AUCUN | HAUTE |
| useFlashcards | AUCUN | MOYENNE |
| useFavorites | AUCUN | MOYENNE |
| ... (145+ autres) | AUCUN | VARIABLE |

---

## 2. RISQUES IDENTIFIES

### 2.1 Risques Securite (CRITIQUE)

1. **Auth non testee** - AuthProvider sans tests = failles potentielles
2. **Token refresh** - handleAuthError jamais teste
3. **Mode test** - TEST_MODE_ENABLED pourrait etre active en prod
4. **OAuth flows** - Google/Facebook/Apple non testes
5. **Session persistence** - localStorage non valide
6. **RLS bypass** - Policies partiellement testees

### 2.2 Risques RGPD (LEGAL)

1. **Droit a l'oubli** - Pas de test de suppression complete des donnees
2. **Export donnees** - Pas de test d'export utilisateur
3. **Consentement** - Pas de test de gestion des cookies
4. **Logs sensibles** - Console.log avec emails visibles
5. **Retention** - Pas de test de purge automatique

### 2.3 Risques Donnees Medicales

1. **Integrite contenu** - Pas de validation des contenus EDN/ECOS
2. **Coherence quiz** - QCM potentiellement incorrects
3. **Suivi progression** - Donnees d'apprentissage non validees
4. **IA hallucinations** - Reponses AI non verifiees

### 2.4 Risques Techniques

1. **Edge cases** - Hooks sans tests de limites
2. **Erreurs silencieuses** - catch vides dans AuthProvider
3. **Race conditions** - Pas de tests concurrence
4. **Memory leaks** - Subscriptions non testees

---

## 3. STRATEGIE DE TESTS PAR PRIORITE

### Phase 1: Securite & Auth (IMMEDIAT)

```
test/
  security/
    auth/
      AuthProvider.test.tsx          # Tests unitaires complets
      AuthProvider.integration.test.ts # Tests avec Supabase mock
      session-management.test.ts     # Persistence, refresh, cleanup
      oauth-flows.test.ts            # Google, Facebook, Apple
      test-mode-isolation.test.ts    # Verification env prod
    rls/
      rls-comprehensive.test.ts      # Toutes les tables
      rls-edge-cases.test.ts         # Cas limites
      rls-regression.test.ts         # Detection regressions
    rate-limiting/
      rateLimitService.test.ts       # Limites correctes
      bypass-attempts.test.ts        # Tentatives contournement
```

### Phase 2: Donnees Medicales (URGENT)

```
test/
  medical-content/
    edn/
      ednTableauxService.test.ts     # Service complet
      edn-item-integrity.test.ts     # Validation contenu
      edn-ranking.test.ts            # Rang A/B correct
    ecos/
      ecosService.test.ts            # Service complet
      ecos-scenarios.test.ts         # Scenarios valides
    quiz/
      qcmService.test.ts             # Service complet
      quiz-answers-validation.test.ts # Reponses correctes
    ai/
      ai-responses-validation.test.ts # Pas de hallucinations
      ai-medical-safety.test.ts      # Contenus surs
```

### Phase 3: RGPD & Conformite (OBLIGATOIRE)

```
test/
  compliance/
    rgpd/
      data-deletion.test.ts          # Suppression complete
      data-export.test.ts            # Export utilisateur
      consent-management.test.ts     # Cookies/consentement
      data-retention.test.ts         # Purge automatique
      audit-trail.test.ts            # Tracabilite
    accessibility/
      wcag-compliance.test.ts        # Standards WCAG
      screen-reader.test.ts          # Lecteurs d'ecran
```

### Phase 4: Stores & Contextes (IMPORTANT)

```
test/
  state/
    stores/
      cartStore.test.ts
      quizStore.test.ts
      studyStore.test.ts
      userStore.test.ts
    contexts/
      ErrorContext.test.tsx
      GlobalAudioContext.test.tsx
      NotificationContext.test.tsx
      PerformanceContext.test.tsx
```

### Phase 5: Hooks Critiques (NECESSAIRE)

```
test/
  hooks/
    auth/
      useAuth.test.ts
    ai/
      useAIChat.test.ts
      useAIClinicalCases.test.ts
    learning/
      useExamMode.test.ts
      useFlashcards.test.ts
      useAdaptiveSRS.test.ts
    data/
      useClinicalCases.test.ts
      useEdnItems.test.ts
```

---

## 4. TESTS OBLIGATOIRES PAR TYPE

### 4.1 Tests Unitaires (Jest/Vitest)

Chaque service/hook DOIT avoir:
- Test du cas nominal (happy path)
- Test des erreurs (error handling)
- Test des limites (edge cases)
- Test des valeurs nulles/undefined
- Test des timeouts

### 4.2 Tests d'Integration

- API endpoints avec mocks realistes
- Interactions Supabase
- Workflows complets (login -> action -> logout)

### 4.3 Tests E2E (Playwright)

- Parcours utilisateur complets
- Authentification reelle
- Persistance entre pages
- Multi-navigateur

### 4.4 Tests de Performance

- Temps de reponse < 3s
- Pas de memory leaks
- Pagination correcte
- Cache efficace

### 4.5 Tests de Securite

- Injection SQL/XSS
- CSRF
- Token manipulation
- Privilege escalation

---

## 5. METRIQUES CIBLES

| Metrique | Actuel | Cible | Deadline |
|----------|--------|-------|----------|
| Couverture Auth | 0% | 95% | S+2 |
| Couverture Services | ~5% | 80% | S+4 |
| Couverture Hooks | ~3% | 60% | S+6 |
| Tests RLS | ~40% | 95% | S+2 |
| Tests RGPD | 0% | 100% | S+3 |
| Tests E2E | ~30% | 70% | S+5 |

---

## 6. CHECKLIST AVANT CHAQUE MERGE

- [ ] Nouveaux tests pour chaque nouvelle fonctionnalite
- [ ] Pas de regression dans les tests existants
- [ ] Couverture du module >= 80%
- [ ] Tests de securite passes
- [ ] Tests RGPD passes (si donnees utilisateur)
- [ ] Pas de console.log avec donnees sensibles
- [ ] Tests d'accessibilite passes

---

## 7. OUTILS & CONFIGURATION

### Vitest (Tests Unitaires React)
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      threshold: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  }
});
```

### Playwright (E2E)
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' }
  ]
});
```

---

## 8. PROCESSUS DE VALIDATION

1. **Pre-commit**: Lint + Tests unitaires rapides
2. **PR**: Tests complets + Coverage report
3. **Staging**: Tests E2E + Performance
4. **Production**: Smoke tests + Monitoring

---

## 9. ALERTES CRITIQUES

### Bloquants Immediats
- [ ] AuthProvider sans tests
- [ ] TEST_MODE_ENABLED verification prod
- [ ] RLS sur tables sensibles
- [ ] Logs avec donnees personnelles

### A Surveiller
- [ ] Couverture < 50% sur module critique
- [ ] Tests flaky (>2 failures/semaine)
- [ ] Temps de build > 10 min

---

*Document genere le 2026-01-24*
*A mettre a jour apres chaque sprint*
