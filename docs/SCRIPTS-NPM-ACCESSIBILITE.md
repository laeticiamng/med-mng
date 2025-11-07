# 📝 Scripts NPM à ajouter dans package.json

Ajoutez ces scripts dans votre `package.json` pour faciliter l'exécution des tests d'accessibilité:

```json
{
  "scripts": {
    "test:accessibility": "playwright test tests/accessibility-axe.spec.ts",
    "test:accessibility:chromium": "playwright test tests/accessibility-axe.spec.ts --project=chromium",
    "test:accessibility:firefox": "playwright test tests/accessibility-axe.spec.ts --project=firefox",
    "test:accessibility:webkit": "playwright test tests/accessibility-axe.spec.ts --project=webkit",
    "test:accessibility:ui": "playwright test tests/accessibility-axe.spec.ts --ui",
    "test:accessibility:report": "playwright show-report",
    "test:a11y": "npm run test:accessibility",
    "lighthouse": "lhci autorun --config=.github/lighthouse/lighthouserc.json"
  }
}
```

## 🚀 Utilisation

```bash
# Exécuter tous les tests d'accessibilité
npm run test:accessibility

# Tests sur un navigateur spécifique
npm run test:accessibility:chromium
npm run test:accessibility:firefox
npm run test:accessibility:webkit

# Mode UI interactif
npm run test:accessibility:ui

# Voir le rapport HTML
npm run test:accessibility:report

# Alias court
npm run test:a11y

# Audit Lighthouse
npm run lighthouse
```

## ⚙️ Configuration Playwright

Le fichier `playwright.config.ts` est déjà configuré pour supporter ces tests.

## 🔗 Intégration GitHub

Les workflows CI/CD dans `.github/workflows/accessibility-ci.yml` utilisent ces mêmes commandes pour garantir la conformité à chaque déploiement.
