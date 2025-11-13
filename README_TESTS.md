# Tests du Système de Templates

## 📋 Vue d'ensemble

Ce projet contient une suite complète de tests pour le système de gestion de templates :
- **Tests unitaires Vitest** pour les hooks React
- **Tests E2E Playwright** pour les parcours utilisateurs

## 🧪 Tests Unitaires (Vitest)

### Localisation
`src/tests/hooks/*.test.tsx`

### Hooks testés

#### 1. useFilterTemplates
- ✅ Récupération des templates
- ✅ Création de template
- ✅ Mise à jour de template
- ✅ Suppression de template
- ✅ Partage de template (global, équipe, utilisateurs spécifiques)
- ✅ Duplication de template
- ✅ Identification du template par défaut
- ✅ Gestion des erreurs

#### 2. useTemplateTags
- ✅ Récupération des tags triés par usage
- ✅ Tags populaires (top 10)
- ✅ Recherche de tags par nom
- ✅ Recherche insensible à la casse
- ✅ Limitation des résultats à 10
- ✅ Gestion des erreurs

#### 3. useTemplateComments
- ✅ Récupération des commentaires
- ✅ Calcul de la note moyenne
- ✅ Ajout de commentaire avec/sans note
- ✅ Mise à jour de commentaire
- ✅ Suppression de commentaire
- ✅ Activation conditionnelle (templateId required)
- ✅ Gestion des erreurs

#### 4. useTemplateFavorites
- ✅ Récupération des favoris utilisateur
- ✅ Vérification si un template est en favori
- ✅ Ajout aux favoris
- ✅ Retrait des favoris
- ✅ Toggle favori (add/remove)
- ✅ Gestion authentification
- ✅ Gestion des erreurs

#### 5. useTemplateHistory
- ✅ Récupération de l'historique complet
- ✅ Récupération historique par template
- ✅ Enregistrement d'une application
- ✅ Enregistrement avec/sans count de résultats
- ✅ Suppression d'entrée d'historique
- ✅ Gestion silencieuse des erreurs d'enregistrement
- ✅ Gestion authentification

### Exécuter les tests unitaires

```bash
# Tous les tests
pnpm test

# Tests spécifiques
pnpm test useFilterTemplates
pnpm test useTemplateTags

# Mode watch
pnpm test --watch

# Avec coverage
pnpm test --coverage
```

## 🎭 Tests E2E (Playwright)

### Localisation
```
test/e2e/
├── global-setup.ts           # Setup global
├── global-teardown.ts        # Cleanup global
├── template-system.spec.ts   # Tests du système de templates
├── fixtures/                 # Données de test
│   ├── templates.fixture.ts  # Fixtures templates
│   └── auth.fixture.ts       # Fixtures authentification
└── mocks/
    └── supabase.mock.ts      # Mocks API Supabase
```

### Fixtures de Test

Les fixtures fournissent des données de test cohérentes et reproductibles :

```typescript
// Utiliser les fixtures dans les tests
import { mockTemplates, mockTags } from './fixtures/templates.fixture';
import { mockUser, mockSession } from './fixtures/auth.fixture';

// Les données sont disponibles pour tous les tests
expect(mockTemplates[0].name).toBe('Template Test 1');
```

### Mocks API

Les tests E2E utilisent des mocks complets de l'API Supabase :

```typescript
import { mockSupabaseAPI, clearSupabaseMocks } from './mocks/supabase.mock';

test.beforeEach(async ({ page }) => {
  // Active les mocks automatiquement
  await mockSupabaseAPI(page);
  await page.goto('/');
});

test.afterEach(async ({ page }) => {
  // Nettoie les mocks
  await clearSupabaseMocks(page);
});
```

**Endpoints mockés :**
- ✅ Authentication (login, session, user)
- ✅ Templates (CRUD operations)
- ✅ Tags (search, popular tags)
- ✅ Comments (CRUD operations)
- ✅ Favorites (add, remove, list)
- ✅ History (tracking, analytics)
- ✅ Analytics (dashboard data)

### Configuration Playwright

#### 1. Création de Template avec Tags
- ✅ Créer un nouveau template
- ✅ Ajouter des tags
- ✅ Configurer des filtres
- ✅ Vérifier la sauvegarde
- ✅ Suggestions de tags en temps réel

#### 2. Application de Filtres
- ✅ Appliquer un template
- ✅ Vérifier les filtres actifs
- ✅ Vérifier les résultats filtrés
- ✅ Comptage de résultats

#### 3. Partage avec Équipe
- ✅ Partager un template globalement
- ✅ Partager avec l'équipe
- ✅ Consulter les templates partagés
- ✅ Filtrer par type de partage
- ✅ Filtrer par tags

#### 4. Dashboard Analytics
- ✅ Affichage des métriques clés
- ✅ Statistiques d'utilisation
- ✅ Tags populaires avec compteurs
- ✅ Templates par catégorie
- ✅ Activité récente (30 jours)

#### 5. Parcours Utilisateur Complet
- ✅ Créer template → Appliquer → Partager → Vérifier → Analyser
- ✅ Cycle de vie complet d'un template

### Exécuter les tests E2E

```bash
# Tous les tests E2E
pnpm playwright test

# Tests spécifiques
pnpm playwright test template-system

# Mode UI (interactif)
pnpm playwright test --ui

# Mode debug
pnpm playwright test --debug

# Avec rapport
pnpm playwright test --reporter=html
pnpm playwright show-report
```

## 📊 Coverage

Les tests couvrent :
- **Hooks:** 100% des fonctions principales
- **Scénarios E2E:** Parcours utilisateurs critiques
- **Cas limites:** Erreurs, états vides, non-authentifié

## 🔧 Mocking

### Tests Unitaires
Les tests utilisent des mocks pour :
- Supabase client (`vi.mock('@/integrations/supabase/client')`)
- Toast notifications (`vi.mock('sonner')`)
- React Query (QueryClientProvider wrappé)

### Tests E2E
Les tests E2E utilisent des **fixtures et mocks complets** :

#### Fixtures de données
- `fixtures/templates.fixture.ts` : Templates, tags, commentaires, favoris, historique
- `fixtures/auth.fixture.ts` : Utilisateurs, sessions, équipes

#### Mocks API Supabase
- `mocks/supabase.mock.ts` : Interception complète des appels API
- ✅ Authentication (login, session, user)
- ✅ Templates CRUD (GET, POST, PATCH, DELETE)
- ✅ Tags (recherche, tags populaires)
- ✅ Comments (CRUD operations)
- ✅ Favorites (add, remove, list)
- ✅ History (tracking, analytics)
- ✅ Analytics (dashboard data)

**Avantages :**
- Tests isolés de la base de données
- Données reproductibles
- Exécution rapide et fiable
- Pas d'effets de bord entre tests

## ⚡ Tests de Performance (Lighthouse CI)

### Métriques Core Web Vitals
- **LCP** (Largest Contentful Paint) : < 2.5s
- **FID** (First Input Delay) : < 100ms  
- **CLS** (Cumulative Layout Shift) : < 0.1
- **FCP** (First Contentful Paint) : < 1.8s
- **TTI** (Time to Interactive) : < 3.8s

### Scores Lighthouse Requis
| Catégorie | Score Minimum |
|-----------|---------------|
| Performance | 90/100 |
| Accessibility | 90/100 |
| Best Practices | 90/100 |
| SEO | 90/100 |

### Exécution

```bash
# Installer Lighthouse CI
npm install -g @lhci/cli

# Build et test
npm run build
lhci autorun
```

### Workflow CI/CD
- ✅ Exécution automatique sur chaque PR
- ✅ Rapports dans GitHub Actions artifacts
- ✅ Commentaires automatiques sur les PRs
- ✅ Historique de performance conservé 90 jours

Voir `docs/PERFORMANCE.md` pour plus de détails.

## 🚨 Notes Importantes

### Tests Unitaires
- Les tests utilisent `waitFor` pour les opérations asynchrones
- Les mutations sont testées avec les états de chargement
- Les erreurs sont vérifiées et capturées correctement

### Tests E2E
- Certains éléments UI peuvent varier selon l'implémentation
- Les tests utilisent des sélecteurs flexibles (texte, role, data-testid)
- Les timeouts sont configurés à 5000ms pour les assertions importantes
- L'authentification doit être configurée dans `beforeEach` pour un vrai environnement

## 📝 Bonnes Pratiques

1. **Tests Unitaires**
   - Un test = une fonctionnalité
   - Mock minimal nécessaire
   - Assertions claires et spécifiques
   - Nettoyer les mocks entre tests

2. **Tests E2E**
   - Tester les parcours utilisateurs réels
   - Utiliser des sélecteurs sémantiques (role, text)
   - Attendre les états de chargement
   - Vérifier les feedbacks utilisateur

3. **Maintenance**
   - Mettre à jour les tests avec les nouvelles fonctionnalités
   - Garder les mocks synchronisés avec les vraies APIs
   - Documenter les cas edge
   - Monitorer les temps d'exécution

## 🐛 Debugging

### Tests Unitaires qui échouent
```bash
# Mode verbose
pnpm test --reporter=verbose

# Isoler un test
pnpm test -t "should create template successfully"

# Debug avec Node
node --inspect-brk node_modules/.bin/vitest
```

### Tests E2E qui échouent
```bash
# Screenshots et videos activés
pnpm playwright test --trace on

# Mode headed (voir le navigateur)
pnpm playwright test --headed

# Ralentir l'exécution
pnpm playwright test --slow-mo=1000
```

## 📚 Ressources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
