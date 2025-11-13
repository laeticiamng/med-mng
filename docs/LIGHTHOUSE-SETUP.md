# 🚀 Configuration Lighthouse CI

## 📦 Installation

### Installation Globale

```bash
# Installer Lighthouse CI globalement
npm install -g @lhci/cli@0.13.x

# Ou utiliser le script d'installation
chmod +x scripts/lighthouse-setup.sh
./scripts/lighthouse-setup.sh
```

### Vérification

```bash
lhci --version
# Devrait afficher: 0.13.x
```

## ⚙️ Configuration

Le fichier `lighthouserc.json` à la racine du projet configure Lighthouse CI :

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:5173", ...],
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        ...
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        ...
      }
    }
  }
}
```

### Pages Testées

Par défaut, Lighthouse teste 3 pages :
- `/` - Page d'accueil
- `/templates` - Page des templates
- `/analytics` - Page analytics

Pour ajouter d'autres pages, modifiez `lighthouserc.json` :

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:5173",
        "http://localhost:5173/your-page"
      ]
    }
  }
}
```

## 🏃 Exécution Locale

### Étape 1 : Build

```bash
npm run build
```

### Étape 2 : Lancer Lighthouse

```bash
lhci autorun
```

Lighthouse va :
1. Démarrer un serveur preview
2. Exécuter 3 runs par page
3. Calculer les scores moyens
4. Générer des rapports HTML

### Étape 3 : Voir les Rapports

```bash
# Ouvrir le répertoire des rapports
open .lighthouseci
```

Les rapports incluent :
- `manifest.json` - Résumé des runs
- `lhr-*.json` - Rapports détaillés
- `lhr-*.html` - Rapports visuels

## 📊 Budgets de Performance

### Scores Minimums

| Catégorie | Score Minimum | Description |
|-----------|---------------|-------------|
| Performance | 90/100 | Vitesse et optimisation |
| Accessibility | 90/100 | Accessibilité WCAG |
| Best Practices | 90/100 | Standards web |
| SEO | 90/100 | Optimisation SEO |

### Métriques Core Web Vitals

| Métrique | Budget | Description |
|----------|--------|-------------|
| LCP | < 2.5s | Largest Contentful Paint |
| FID | < 100ms | First Input Delay |
| CLS | < 0.1 | Cumulative Layout Shift |
| FCP | < 1.8s | First Contentful Paint |
| TTI | < 3.8s | Time to Interactive |
| TBT | < 300ms | Total Blocking Time |

### Personnaliser les Budgets

Modifiez `lighthouserc.json` section `assert.assertions` :

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "largest-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.05 }]
      }
    }
  }
}
```

## 🤖 GitHub Actions

### Workflow Automatique

Le workflow `.github/workflows/lighthouse.yml` s'exécute :
- ✅ À chaque push sur `main` ou `develop`
- ✅ À chaque pull request
- ✅ Manuellement via `workflow_dispatch`

### Jobs du Workflow

1. **lighthouse** : Exécute Lighthouse et génère les rapports
2. **performance-budgets** : Vérifie les budgets
3. **performance-trends** : Stocke l'historique (main seulement)

### Configuration GitHub

#### Secrets Requis

Dans GitHub Settings → Secrets → Actions :

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Secret Optionnel : LHCI_GITHUB_APP_TOKEN

Pour des rapports encore plus riches, installer l'app GitHub Lighthouse CI :

1. Aller sur https://github.com/apps/lighthouse-ci
2. Installer l'app sur votre repo
3. Récupérer le token
4. Ajouter `LHCI_GITHUB_APP_TOKEN` dans les secrets

### Artifacts

Les artifacts sont conservés 30 jours :
- `lighthouse-reports/` : Rapports complets
- `performance-history/` : Historique (main seulement)

## 📈 Interpréter les Résultats

### Scores

- **90-100** : ✅ Excellent
- **50-89** : ⚠️ À améliorer
- **0-49** : ❌ Nécessite attention

### Métriques

#### LCP (Largest Contentful Paint)
- **< 2.5s** : ✅ Bon
- **2.5-4.0s** : ⚠️ À améliorer
- **> 4.0s** : ❌ Lent

**Comment améliorer :**
- Optimiser les images
- Utiliser le lazy loading
- Réduire le CSS/JS bloquant
- Utiliser un CDN

#### FID (First Input Delay)
- **< 100ms** : ✅ Bon
- **100-300ms** : ⚠️ À améliorer
- **> 300ms** : ❌ Lent

**Comment améliorer :**
- Réduire le JavaScript
- Utiliser le code splitting
- Différer le JS non critique
- Optimiser les event listeners

#### CLS (Cumulative Layout Shift)
- **< 0.1** : ✅ Bon
- **0.1-0.25** : ⚠️ À améliorer
- **> 0.25** : ❌ Instable

**Comment améliorer :**
- Définir les dimensions des images
- Réserver l'espace pour les ads/embeds
- Éviter l'insertion de contenu dynamique
- Utiliser transform au lieu de layout changes

## 🔧 Debugging

### Lighthouse Échoue

```bash
# Vérifier que l'app se build
npm run build

# Vérifier que le preview démarre
npm run preview

# Tester avec plus de détails
lhci autorun --debug
```

### Scores Bas Inattendus

1. Vérifier en mode incognito (sans extensions)
2. Tester sur un réseau stable
3. Vérifier les ressources externes (API, CDN)
4. Désactiver temporairement les analytics/tracking

### Différences Local vs CI

Le CI peut avoir des scores différents car :
- Environnement différent (CPU, réseau)
- Pas de cache navigateur
- Configuration stricte

**Solution :** Utiliser les mêmes settings localement :

```bash
lhci autorun --preset=desktop
```

## 📚 Ressources

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Lighthouse CI GitHub](https://github.com/GoogleChrome/lighthouse-ci)
- [Web.dev - Core Web Vitals](https://web.dev/vitals/)
- [Performance Budget Calculator](https://perf-budget-calculator.firebaseapp.com/)

## 🎯 Checklist de Performance

Avant de merger une PR, vérifier :

- [ ] Score Performance ≥ 90
- [ ] Score Accessibility ≥ 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Toutes les images optimisées
- [ ] Pas de console errors/warnings
- [ ] Lighthouse CI pass dans GitHub Actions

## 🚀 Prochaines Étapes

1. **Installer Lighthouse CI** : `npm install -g @lhci/cli`
2. **Tester localement** : `npm run build && lhci autorun`
3. **Vérifier les rapports** : `.lighthouseci/`
4. **Optimiser si nécessaire** : Voir `docs/PERFORMANCE.md`
5. **Push vers GitHub** : Les tests s'exécuteront automatiquement
