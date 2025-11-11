# 🔄 Workflow Chromatic - Tests Visuels Automatisés

## 📋 Vue d'ensemble

Ce document explique le workflow complet pour les tests visuels avec Chromatic, de la création d'une story à la validation des changements.

---

## 🎯 Workflow complet

### 1️⃣ Développer le composant

```tsx
// src/components/ui/MyComponent.tsx
import { cn } from '@/lib/utils';

export const MyComponent = ({ variant = 'default' }) => {
  return (
    <div className={cn(
      'p-4 rounded-lg',
      variant === 'default' && 'bg-primary text-primary-foreground',
      variant === 'secondary' && 'bg-secondary text-secondary-foreground',
      variant === 'accent' && 'bg-accent text-accent-foreground'
    )}>
      Mon composant
    </div>
  );
};
```

### 2️⃣ Créer la story Chromatic

```tsx
// src/stories/VisualRegressionTests.stories.tsx
import type { Story } from '@storybook/react';
import { MyComponent } from '@/components/ui/MyComponent';

export const MyComponentStory: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">MyComponent Variants</h3>
      <div className="flex gap-4">
        <MyComponent variant="default" />
        <MyComponent variant="secondary" />
        <MyComponent variant="accent" />
      </div>
    </div>
  ),
  parameters: {
    chromatic: {
      // Configuration spécifique à cette story
      delay: 500, // Attendre 500ms avant screenshot
      pauseAnimationAtEnd: true,
    },
  },
};
```

### 3️⃣ Tester localement avec Storybook

```bash
# Démarrer Storybook
npm run storybook

# Ouvrir http://localhost:6006
# Vérifier votre story dans "Visual Regression/All Components"
# Utiliser le toggle theme (toolbar) pour tester light/dark
```

### 4️⃣ Vérifier avec DevTools

- Appuyer sur `Ctrl+Shift+D` dans Storybook
- Survoler les éléments de votre composant
- Vérifier qu'il n'y a pas de couleurs hardcodées
- Valider que les tokens sémantiques sont utilisés

### 5️⃣ Build et lancer Chromatic

```bash
# Build Storybook
npm run build-storybook

# Lancer les tests Chromatic
npm run chromatic
```

**Output attendu :**
```
Chromatic CLI v13.3.3
  ℹ Connecting to Chromatic...
  ✔ Build 42 published
  ✔ Started build 42
  ✔ Build 42 auto-accepted
  ℹ View on Chromatic: https://chromatic.com/build?appId=...
```

### 6️⃣ Reviewer sur chromatic.com

1. **Ouvrir le lien** fourni dans le terminal
2. **Voir les changements détectés** (s'il y en a)
3. **Comparer light vs dark mode**
4. **Comparer mobile/tablet/desktop**
5. **Accepter ou rejeter** les changements

---

## 🎨 Types de stories à créer

### Story basique (tous les variants)

```tsx
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      {variants.map(variant => (
        <MyComponent key={variant} variant={variant} />
      ))}
    </div>
  ),
};
```

### Story avec états (hover, focus, disabled)

```tsx
export const AllStates: Story = {
  render: () => (
    <div className="space-y-4">
      <MyComponent>Normal</MyComponent>
      <MyComponent disabled>Disabled</MyComponent>
      <MyComponent className="hover:scale-105">Hover Effect</MyComponent>
    </div>
  ),
};
```

### Story en contexte réel

```tsx
export const InContext: Story = {
  render: () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">Real Usage</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Example in a real card context
      </p>
      <MyComponent variant="primary" />
    </Card>
  ),
};
```

### Story avec light/dark forcé

```tsx
export const DarkModeOnly: Story = {
  render: () => <MyComponent />,
  parameters: {
    chromatic: {
      modes: {
        dark: { theme: 'dark' },
      },
    },
  },
};
```

---

## 🔍 Que capture Chromatic ?

### ✅ Changements capturés

- **Couleurs** : Moindre changement de teinte/saturation/luminosité
- **Dimensions** : Width, height, padding, margin
- **Typographie** : Font-size, weight, line-height
- **Layout** : Position, flexbox, grid
- **Bordures** : Border-width, border-radius, border-color
- **Ombres** : Box-shadow, text-shadow
- **Opacité** : Transparence, opacity

### ❌ Non capturé

- Animations en cours (d'où `pauseAnimationAtEnd`)
- Contenu dynamique (dates, aléatoire)
- Interactions utilisateur (clic, hover - sauf si simulé)
- Contenu externe (images non chargées, API calls)

---

## 🚨 Résolution de problèmes

### "Changes detected" alors que rien n'a changé

**Cause** : Animations, contenu dynamique, polices non chargées

**Solution** :
```tsx
parameters: {
  chromatic: {
    pauseAnimationAtEnd: true,
    delay: 1000, // Augmenter le délai
  },
}
```

### Screenshots flous/mal rendus

**Cause** : Images externes, fonts non chargées

**Solution** :
```tsx
// Précharger les fonts dans .storybook/preview-head.html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Trop de crédits consommés

**Solution** : Utiliser `onlyChanged` dans chromatic.config.json

```json
{
  "onlyChanged": true,
  "externals": ["public/**"]
}
```

### Build échoue avec erreur TypeScript

**Solution** :
```bash
# Vérifier les erreurs TypeScript
npm run type-check

# Fix les erreurs puis rebuild
npm run build-storybook
```

---

## 📊 Métriques et monitoring

### Dashboard Chromatic

Sur chromatic.com, vous pouvez voir :

- **Build history** : Historique de tous les builds
- **Coverage** : % de composants testés
- **Snapshots** : Nombre total de screenshots
- **Changes** : Changements détectés par build
- **Credits used** : Consommation de crédits

### Optimiser la consommation de crédits

```json
// chromatic.config.json
{
  "onlyChanged": true,        // Teste uniquement stories modifiées
  "exitOnceUploaded": true,   // Ne pas attendre résultats
  "skip": "dependabot/**",    // Ignore Dependabot PRs
  "autoAcceptChanges": "main" // Auto-accept sur main
}
```

---

## 🔄 CI/CD Integration

### GitHub Actions workflow

```yaml
# .github/workflows/chromatic.yml
name: Chromatic Tests

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Chromatic
        uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          buildScriptName: build-storybook
          onlyChanged: true
          exitZeroOnChanges: true
```

### Configuration requise

1. Ajouter le secret GitHub `CHROMATIC_PROJECT_TOKEN`
2. Activer GitHub Actions dans le repo
3. Le workflow se lance automatiquement sur chaque push/PR

---

## ✅ Checklist avant merge

### Developer checklist

- [ ] Story créée pour le nouveau composant
- [ ] Tous les variants testés
- [ ] Light/dark mode vérifiés localement
- [ ] DevTools ne montre pas de hardcoded colors
- [ ] `npm run chromatic` exécuté
- [ ] Tous les changements visuels reviewés sur chromatic.com

### Reviewer checklist

- [ ] Build Chromatic réussi (check vert sur PR)
- [ ] Changements visuels logiques et intentionnels
- [ ] Pas de régression visuelle non documentée
- [ ] Dark mode fonctionne correctement
- [ ] Responsive testé (mobile/tablet/desktop)

---

## 📚 Ressources

### Documentation interne
- `docs/DEVTOOLS_CHROMATIC_GUIDE.md` - Guide complet
- `docs/QUICK_START_DEVTOOLS.md` - Quick start
- `README_CHROMATIC.md` - Setup initial
- `docs/CHROMATIC_SETUP.md` - Configuration détaillée

### Documentation externe
- [Chromatic Docs](https://www.chromatic.com/docs/)
- [Visual Testing Guide](https://storybook.js.org/tutorials/visual-testing-handbook/)
- [Chromatic Best Practices](https://www.chromatic.com/docs/best-practices)

---

## 🎓 Tips & Best Practices

### ✅ DO

- Créer une story pour chaque nouveau composant
- Tester tous les variants dans une seule story
- Utiliser des stories de type "All Variants" pour overview rapide
- Accepter les changements intentionnels sur Chromatic
- Reviewer chaque changement visuel détecté

### ❌ DON'T

- Merge sans reviewer les changements Chromatic
- Créer des stories avec animations infinies
- Utiliser du contenu aléatoire/dynamique dans les stories
- Ignorer les warnings Chromatic
- Skip les tests visuels "juste cette fois"

---

**Dernière mise à jour** : 2025-01-XX
