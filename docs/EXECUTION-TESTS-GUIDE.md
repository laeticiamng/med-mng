# Guide d'Exécution des Tests - EDN Complete

## 🎯 Vue d'ensemble

Ce guide explique comment exécuter les différents types de tests pour valider les performances, l'accessibilité et le comportement du lazy loading sur `/edn-complete`.

## 📋 Prérequis

```bash
# Installer les dépendances si ce n'est pas fait
npm install

# Installer les navigateurs Playwright
npx playwright install

# Builder l'application
npm run build

# Rendre les scripts exécutables
chmod +x scripts/run-all-performance-tests.sh
chmod +x scripts/quick-test.sh
```

## 🚀 Exécution Rapide

### Option 1: Tous les tests d'un coup (Recommandé)

```bash
./scripts/run-all-performance-tests.sh
```

Ce script exécute dans l'ordre:
1. ✅ Mesure de performance Lighthouse (avant/après lazy loading)
2. ✅ 15 tests E2E Playwright
3. ✅ 16 tests d'accessibilité axe-core

**Durée estimée:** 5-8 minutes

### Option 2: Tests individuels

```bash
# Tests de performance uniquement
./scripts/quick-test.sh performance

# Tests E2E uniquement
./scripts/quick-test.sh e2e

# Tests d'accessibilité uniquement
./scripts/quick-test.sh accessibility

# Tous les tests
./scripts/quick-test.sh all
```

## 📊 1. Tests de Performance Lighthouse

### Commande

```bash
node scripts/measure-lazy-loading-impact.js
```

### Objectifs de Performance

| Métrique | Objectif | Critique |
|----------|----------|----------|
| **FCP** (First Contentful Paint) | < 1.8s | Oui |
| **LCP** (Largest Contentful Paint) | < 2.5s | Oui |
| **TBT** (Total Blocking Time) | < 300ms | Oui |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Non |

### Résultats Attendus

- **Sans lazy loading:** FCP ~2.1s, LCP ~3.2s, TBT ~450ms
- **Avec lazy loading:** FCP ~1.5s, LCP ~2.2s, TBT ~200ms
- **Amélioration:** 30-40% sur toutes les métriques

### Rapports Générés

```
performance-reports/
├── comparison-[timestamp].json
├── comparison-[timestamp].html
└── lighthouse-report-[timestamp].html
```

### Interprétation

```bash
# Voir le rapport HTML
open performance-reports/comparison-*.html

# Voir les métriques JSON
cat performance-reports/comparison-*.json | jq
```

## 🎭 2. Tests E2E Playwright

### Commande

```bash
npx playwright test tests/e2e/edn-complete.spec.ts
npx playwright show-report
```

### Scénarios Testés (15 tests)

**Groupe 1: Navigation de base (3 tests)**
- ✅ Chargement de la page
- ✅ Affichage des composants principaux
- ✅ Recherche d'items

**Groupe 2: Filtrage (3 tests)**
- ✅ Filtre par catégorie
- ✅ Filtre rapide (favoris)
- ✅ Reset des filtres

**Groupe 3: Interactions (3 tests)**
- ✅ Ouverture du modal item
- ✅ Navigation entre tabs
- ✅ Lazy loading des tabs

**Groupe 4: Responsive (3 tests)**
- ✅ Vue mobile
- ✅ Vue tablette
- ✅ Vue desktop

**Groupe 5: Performance (3 tests)**
- ✅ Temps de chargement
- ✅ Stabilité visuelle
- ✅ Lazy loading composants

### Options de Debug

```bash
# Mode debug avec navigateur visible
npx playwright test tests/e2e/edn-complete.spec.ts --debug

# Mode headed (voir le navigateur)
npx playwright test tests/e2e/edn-complete.spec.ts --headed

# Test spécifique
npx playwright test tests/e2e/edn-complete.spec.ts -g "recherche"

# Avec trace
npx playwright test tests/e2e/edn-complete.spec.ts --trace on
```

### Rapport HTML

Le rapport E2E est disponible sur `http://localhost:9323` après exécution du script complet.

## ♿ 3. Tests d'Accessibilité (axe-core)

### Commande

```bash
npx playwright test tests/accessibility/edn-components.spec.ts --reporter=html
```

### Tests Effectués (16 tests)

**Groupe 1: EdnHeader (4 tests)**
- ✅ Violations WCAG 2.1 AA
- ✅ Navigation clavier
- ✅ Attributs ARIA
- ✅ Contraste des couleurs

**Groupe 2: EdnFilters (4 tests)**
- ✅ Violations WCAG
- ✅ Navigation clavier
- ✅ ARIA labels
- ✅ Contraste

**Groupe 3: EdnItemsGrid (4 tests)**
- ✅ Violations WCAG
- ✅ Navigation clavier
- ✅ ARIA labels items
- ✅ Contraste

**Groupe 4: EdnTabsContent (4 tests)**
- ✅ Violations WCAG
- ✅ Navigation tabs au clavier
- ✅ ARIA tabs
- ✅ Contraste tabs

### Critères de Réussite

- **Aucune violation critique** (niveau A)
- **Aucune violation majeure** (niveau AA)
- **Navigation complète au clavier** (Tab, Enter, Échap)
- **Ratio de contraste** ≥ 4.5:1 pour texte normal
- **ARIA labels** corrects sur tous les éléments interactifs

### Rapport Accessibilité

```bash
# Ouvrir le rapport HTML
open playwright-report/index.html

# Voir les violations spécifiques
npx playwright test tests/accessibility/edn-components.spec.ts --reporter=json > a11y-results.json
cat a11y-results.json | jq '.suites[].specs[].tests[].results[].attachments'
```

## 📈 Interprétation des Résultats

### ✅ Tous les tests passent

```
🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS
- Performance: Métriques dans les objectifs
- E2E: 15/15 scénarios validés
- Accessibilité: 16/16 tests conformes WCAG 2.1 AA
```

### ⚠️ Certains tests échouent

**Performance en dessous des objectifs:**
- Vérifier les lazy imports dans `EdnTabsContent.tsx`
- Analyser le bundle size avec `npm run build -- --stats`
- Optimiser les images et assets

**Tests E2E échouent:**
- Vérifier que l'app est bien buildée
- Lancer `npm run dev` et tester manuellement
- Regarder les screenshots d'échec dans `test-results/`

**Tests accessibilité échouent:**
- Voir le rapport HTML détaillé
- Corriger les violations axe-core
- Vérifier les attributs ARIA et tabindex

## 🔄 Automatisation CI/CD

Ces tests peuvent être intégrés dans GitHub Actions:

```yaml
# .github/workflows/edn-complete-tests.yml
name: EDN Complete Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: ./scripts/run-all-performance-tests.sh
      - uses: actions/upload-artifact@v3
        with:
          name: test-reports
          path: |
            performance-reports/
            playwright-report/
```

## 📊 Tableaux de Bord

### Performance (après exécution)

```bash
# Générer un rapport de comparaison
node scripts/measure-lazy-loading-impact.js

# Les métriques sont dans:
performance-reports/comparison-[timestamp].json
```

### E2E (après exécution)

```bash
# Ouvrir le dashboard interactif
npx playwright show-report
```

### Accessibilité (après exécution)

```bash
# Rapport HTML détaillé
open playwright-report/index.html
```

## 🛠️ Dépannage

### Erreur: "Playwright browsers not found"

```bash
npx playwright install
```

### Erreur: "Port 5173 already in use"

```bash
# Tuer le processus sur le port 5173
lsof -ti:5173 | xargs kill -9
```

### Tests très lents

```bash
# Utiliser un seul worker
npx playwright test --workers=1

# Ou désactiver la parallélisation
npx playwright test --fullyParallel=false
```

### Lighthouse échoue

```bash
# Vérifier que le build est à jour
npm run build

# Lancer preview manuellement
npm run preview

# Puis dans un autre terminal
node scripts/measure-lazy-loading-impact.js
```

## 📞 Support

Pour toute question ou problème:
1. Consulter `docs/LAZY-LOADING-PERFORMANCE-IMPACT.md`
2. Consulter `docs/TESTS-REFACTORING-EDN.md`
3. Vérifier les logs détaillés dans les rapports HTML

---

**Dernière mise à jour:** Novembre 2024  
**Version:** 1.0.0
