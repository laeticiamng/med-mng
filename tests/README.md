# Tests End-to-End avec Playwright

Ce dossier contient les tests end-to-end de l'application MED-MNG utilisant Playwright.

## Installation et Configuration

```bash
# Les dépendances sont déjà installées
# Pour installer les navigateurs Playwright :
npx playwright install
```

## Structure des Tests

### Tests de Navigation (`navigation.spec.ts`)
- ✅ Navigation via bottom nav sur mobile
- ✅ Masquage de la bottom nav sur desktop  
- ✅ Navigation via boutons principaux sur desktop
- ✅ Tests des routes EDN, ECOS, Audit

### Tests de Bibliothèque (`library.spec.ts`)
- ✅ Affichage correct de la page bibliothèque
- ✅ Skeleton loader pendant le chargement
- ✅ Fonctionnalité de recherche
- ✅ Adaptation responsive sur tous viewports
- ✅ Gestion de l'état bibliothèque vide

### Tests de Création (`song-creation.spec.ts`)
- ✅ Chargement correct de la page création
- ✅ Validation des formulaires
- ✅ Accessibilité via navigation mobile
- ✅ Responsive sur différentes tailles d'écran

### Tests Responsive (`responsive.spec.ts`)
- ✅ Tests sur iPhone 13 (390x844)
- ✅ Tests sur iPad (768x1024)
- ✅ Tests sur Galaxy S20 (360x800)
- ✅ Tests sur Desktop 1440p
- ✅ Tests sur Large Desktop (1920x1080)
- ✅ Gestion des changements d'orientation
- ✅ Validation des grilles responsives
- ✅ Zones tactiles min 44x44px sur mobile

### Tests d'Accessibilité (`accessibility.spec.ts`)
- ✅ Structure de titres appropriée
- ✅ Navigation clavier
- ✅ Labels ARIA sur navigation mobile
- ✅ Formulaires accessibles avec labels
- ✅ Indicateurs de focus visibles
- ✅ Simulation lecteur d'écran

## Exécution des Tests

### Tous les tests
```bash
npx playwright test
```

### Tests spécifiques
```bash
# Tests de navigation uniquement
npx playwright test navigation

# Tests sur mobile uniquement  
npx playwright test --project="Mobile Chrome"

# Tests sur desktop uniquement
npx playwright test --project="chromium"

# Tests responsive
npx playwright test responsive
```

### Avec interface graphique
```bash
npx playwright test --ui
```

### Mode debug
```bash
npx playwright test --debug
```

## Viewports Testés

| Device | Viewport | Use Case |
|--------|----------|-----------|
| iPhone 13 | 390x844 | Mobile portrait |
| Pixel 5 | 393x851 | Android mobile |
| iPad Pro | 1024x1366 | Tablet |
| Galaxy S20 | 360x800 | Small mobile |
| Desktop Chrome | 1280x720 | Standard desktop |
| Desktop 1440p | 1440x900 | High-res desktop |
| Large Desktop | 1920x1080 | Full HD |

## Scenarios Critiques Testés

### 🎯 Parcours Utilisateur Principal
1. **Navigation via bottom nav mobile**
   - Accueil → Bibliothèque → Créer → Abonnements → Profil
   - Validation des URLs et contenus

2. **Création de chanson**
   - Accès via navigation
   - Validation des formulaires
   - Responsive design

3. **Bibliothèque musicale**
   - Chargement avec skeleton
   - Recherche fonctionnelle
   - États vide/avec contenu

### 📱 Tests Mobile/Responsive
- **Zones tactiles** : Boutons ≥ 44x44px
- **Bottom nav** : Visible mobile, masquée desktop
- **Grilles** : 1 col mobile → 2-3 tablet → 4+ desktop
- **Orientations** : Portrait/paysage mobile

### ♿ Tests Accessibilité
- **Navigation clavier** : Tous éléments focusables
- **ARIA** : Labels sur navigation et formulaires
- **Sémantique** : Structure h1-h6, main, nav
- **Focus** : Indicateurs visibles

## Rapports

Les rapports HTML sont générés dans `playwright-report/` après chaque exécution.

```bash
# Ouvrir le dernier rapport
npx playwright show-report
```

## Configuration CI/CD

Les tests sont configurés pour :
- **Parallélisation** : Tests en parallèle en local
- **Retry** : 2 tentatives en CI
- **Screenshots** : Sur échec uniquement
- **Traces** : Sur retry
- **Serveur** : Démarrage automatique en local

## Debugging

### Inspect Mode
```bash
npx playwright test --debug navigation.spec.ts
```

### Screenshots et Traces
- Screenshots automatiques sur échec
- Traces sur retry dans `test-results/`

### Codegen pour nouveaux tests
```bash
npx playwright codegen localhost:8080
```

## Critères d'Acceptation

✅ **Navigation** : 100% parcours critiques fonctionnels  
✅ **Responsive** : Tous viewports iPhone → Desktop 1920p  
✅ **Touch targets** : Min 44x44px sur mobile  
✅ **Performance** : Skeleton visible pendant chargements  
✅ **Accessibilité** : Navigation clavier + ARIA  
✅ **Cross-browser** : Chrome, Firefox, Safari, Mobile Safari  

## Maintenance

- **Sélecteurs robustes** : Utilisation `aria-label`, `text=`, `role=`
- **Attentes explicites** : `expect().toBeVisible()` vs timeouts
- **Data attributes** : Préférer `[data-testid]` si nécessaire
- **Mocks API** : À implémenter si tests flaky