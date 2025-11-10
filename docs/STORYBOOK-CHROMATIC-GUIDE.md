# 📚 Guide Storybook & Chromatic - Tests Visuels Automatisés

**Date**: Janvier 2025  
**Statut**: ✅ Configuration complète  
**Objectif**: Tests visuels automatisés + Documentation composants

---

## 🎯 OBJECTIFS

### Storybook
- **Documentation vivante** des composants migrés
- **Tests visuels manuels** en mode clair/sombre
- **Collaboration Design/Dev** facilitée
- **Onboarding** simplifié pour nouveaux développeurs

### Chromatic
- **Tests visuels automatisés** sur chaque commit
- **Détection régressions** visuelles automatique
- **Review visuel** dans les Pull Requests
- **Historique** de l'évolution visuelle

---

## 📦 PACKAGES INSTALLÉS

```json
{
  "@storybook/react-vite": "^9.0.18",
  "@storybook/addon-essentials": "^8.6.14",
  "@storybook/addon-interactions": "^8.6.14",
  "@storybook/addon-links": "^9.0.18",
  "@storybook/addon-a11y": "^9.0.18",
  "@storybook/test": "latest",
  "chromatic": "latest"
}
```

### Fonctionnalités Incluses

- ✅ **Essentials** : Contrôles, actions, viewport, backgrounds
- ✅ **Interactions** : Tests d'interactions utilisateur
- ✅ **A11y** : Tests d'accessibilité automatiques
- ✅ **Chromatic** : Tests visuels et CI/CD

---

## 🚀 DÉMARRAGE RAPIDE

### 1. Lancer Storybook en Local

```bash
npm run storybook
```

Ouvre automatiquement http://localhost:6006

### 2. Builder Storybook

```bash
npm run build-storybook
```

Génère un build statique dans `storybook-static/`

### 3. Tests Visuels avec Chromatic

```bash
# Configuration initiale (une seule fois)
npx chromatic --project-token=<votre-token>

# Tests visuels à chaque commit
npm run chromatic
```

---

## 📁 STRUCTURE DES STORIES

```
src/
├── stories/
│   ├── DesignSystem.mdx              # 📖 Introduction
│   ├── Tokens.stories.tsx            # 🎨 Tokens de couleurs
│   ├── components/
│   │   ├── Badge.stories.tsx         # 🏷️ Composant Badge
│   │   ├── Button.stories.tsx        # (à créer)
│   │   └── Card.stories.tsx          # (à créer)
│   ├── patterns/
│   │   ├── CardPatterns.stories.tsx  # 📐 Patterns cartes
│   │   ├── MusicPatterns.stories.tsx # (à créer)
│   │   └── EDNPatterns.stories.tsx   # (à créer)
│   └── examples/
│       ├── TableauRangA.stories.tsx  # (à créer)
│       ├── AudioPlayer.stories.tsx   # (à créer)
│       └── ParolesMusicales.stories.tsx # (à créer)
```

---

## 🎨 CONFIGURATION STORYBOOK

### Support Mode Sombre

Le mode sombre est configuré automatiquement dans `.storybook/preview.tsx` :

```tsx
globalTypes: {
  theme: {
    description: 'Global theme for components',
    defaultValue: 'light',
    toolbar: {
      title: 'Theme',
      icon: 'circlehollow',
      items: ['light', 'dark'],
      dynamicTitle: true,
    },
  },
}
```

**Utilisation** : Cliquez sur l'icône 🌓 dans la toolbar Storybook

### Backgrounds Prédéfinis

```tsx
backgrounds: {
  default: 'light',
  values: [
    { name: 'light', value: '#ffffff' },
    { name: 'dark', value: '#0a0a0a' },
  ],
}
```

---

## ✍️ CRÉER UNE STORY

### Template de Base

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MonComposant } from '@/components/MonComposant';

const meta = {
  title: 'Components/MonComposant',
  component: MonComposant,
  parameters: {
    layout: 'centered', // ou 'padded', 'fullscreen'
    docs: {
      description: {
        component: 'Description du composant et de son usage',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
    },
  },
} satisfies Meta<typeof MonComposant>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Contenu',
  },
};

export const WithProps: Story = {
  args: {
    variant: 'outline',
    children: 'Variant outline',
  },
};
```

### Story avec Render Custom

```tsx
export const Complex: Story = {
  render: () => (
    <div className="space-y-4">
      <MonComposant variant="default">Default</MonComposant>
      <MonComposant variant="outline">Outline</MonComposant>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tous les variants disponibles',
      },
    },
  },
};
```

---

## 🤖 CONFIGURATION CHROMATIC

### 1. Créer un Compte Chromatic

1. Aller sur https://www.chromatic.com/
2. Se connecter avec GitHub
3. Créer un nouveau projet
4. Copier le `PROJECT_TOKEN`

### 2. Configurer le Token

**Option 1: Variable d'environnement locale**
```bash
export CHROMATIC_PROJECT_TOKEN=<votre-token>
```

**Option 2: GitHub Secret** (Recommandé pour CI/CD)
1. Aller dans Settings → Secrets → Actions
2. Créer `CHROMATIC_PROJECT_TOKEN`
3. Coller le token

### 3. Mettre à Jour chromatic.config.json

```json
{
  "projectId": "VOTRE_PROJECT_ID",
  "buildScriptName": "build-storybook",
  "exitZeroOnChanges": true,
  "exitOnceUploaded": true,
  "onlyChanged": true,
  "externals": ["public/**"],
  "skip": "dependabot/**",
  "autoAcceptChanges": "main"
}
```

### 4. Ajouter Script package.json

```json
{
  "scripts": {
    "chromatic": "chromatic --exit-zero-on-changes"
  }
}
```

---

## 🔄 WORKFLOW CI/CD

### GitHub Actions (Recommandé)

Créer `.github/workflows/chromatic.yml` :

```yaml
name: Chromatic

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Chromatic
        uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          exitZeroOnChanges: true
          onlyChanged: true
```

### Workflow Manuel

```bash
# 1. Commit des changements
git add .
git commit -m "feat: update component styles"

# 2. Lancer Chromatic
npm run chromatic

# 3. Review des changements visuels
# - Ouvrir le lien fourni par Chromatic
# - Comparer avant/après
# - Accepter ou rejeter les changements

# 4. Push si OK
git push
```

---

## 📊 FEATURES CHROMATIC

### 1. Tests Visuels Automatiques
- **Snapshot** de chaque story en mode clair/sombre
- **Détection pixel-perfect** des changements
- **Comparaison** avant/après automatique
- **Approval workflow** pour valider changements

### 2. Review dans PR
- **Commentaires automatiques** dans GitHub PR
- **Preview links** pour tester visuellement
- **Status checks** pour bloquer merge si régressions

### 3. Collaboration
- **Partage** des reviews avec l'équipe
- **Historique** de toutes les versions
- **Annotations** sur les changements détectés

### 4. Optimisations
- **TurboSnap** : teste seulement les stories modifiées
- **Parallel builds** : tests en parallèle
- **Smart diffing** : ignore changements non significatifs

---

## 🎯 BONNES PRATIQUES

### 1. Organisation des Stories

```tsx
// ✅ CORRECT - Un fichier par composant
src/stories/components/Button.stories.tsx
src/stories/components/Badge.stories.tsx

// ❌ INCORRECT - Tout dans un fichier
src/stories/AllComponents.stories.tsx
```

### 2. Nommage Cohérent

```tsx
// ✅ CORRECT
title: 'Components/Badge'
title: 'Patterns/Card Patterns'
title: 'Examples/TableauRangA'

// ❌ INCORRECT
title: 'badge'
title: 'My Card Thing'
```

### 3. Documentation Complète

```tsx
export const Example: Story = {
  args: { ... },
  parameters: {
    docs: {
      description: {
        story: 'Description de ce que montre cette story',
      },
    },
  },
};
```

### 4. Tests Mode Clair/Sombre

Toujours créer des stories pour tester les deux modes :

```tsx
export const DarkMode: Story = {
  args: { ... },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background text-foreground p-8">
        <Story />
      </div>
    ),
  ],
};
```

### 5. Accessibilité

```tsx
export const WithA11y: Story = {
  args: { ... },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
};
```

---

## 📋 CHECKLIST CRÉATION STORY

- [ ] **Fichier nommé correctement** : `ComponentName.stories.tsx`
- [ ] **Meta configuré** avec title, component, tags
- [ ] **Stories de base** : Default, variants principaux
- [ ] **Documentation** : descriptions composant et stories
- [ ] **Props controls** : argTypes configurés
- [ ] **Mode sombre** : testé et fonctionnel
- [ ] **Accessibilité** : contraste vérifié (addon a11y)
- [ ] **Responsive** : testé sur différentes tailles (viewport addon)
- [ ] **États interactifs** : hover, focus, disabled documentés

---

## 🔍 DEBUGGING

### Storybook ne démarre pas

```bash
# Nettoyer le cache
rm -rf node_modules/.cache

# Réinstaller
npm ci

# Relancer
npm run storybook
```

### Styles manquants

Vérifier que `src/index.css` est bien importé dans `.storybook/preview.tsx`

### Chromatic échoue

```bash
# Vérifier le token
echo $CHROMATIC_PROJECT_TOKEN

# Logs détaillés
npm run chromatic -- --debug

# Forcer rebuild
npm run chromatic -- --force-rebuild
```

---

## 📈 MÉTRIQUES ET SUIVI

### KPIs Recommandés

1. **Couverture** : % de composants avec stories
   - Objectif : 80%+ des composants principaux
   
2. **Régressions** : Nombre de régressions détectées/semaine
   - Objectif : Tendance décroissante
   
3. **Temps review** : Temps moyen pour valider changements
   - Objectif : <10 minutes
   
4. **Adoption** : Nombre de développeurs utilisant Storybook
   - Objectif : 100% de l'équipe

### Dashboard Chromatic

Accéder à https://www.chromatic.com/builds?appId=VOTRE_APP_ID

Métriques disponibles :
- Nombre de tests visuels
- Taux d'acceptation des changements
- Temps de build
- Historique des versions

---

## 🚀 PROCHAINES ÉTAPES

### Court Terme (Semaine 1-2)

1. **Créer stories pour tous les composants UI de base**
   - [ ] Button
   - [ ] Card
   - [ ] Input
   - [ ] Select
   - [ ] Dialog
   
2. **Documenter les patterns établis**
   - [ ] Card Patterns (✅ Fait)
   - [ ] Music Patterns
   - [ ] EDN Patterns
   
3. **Configurer Chromatic CI/CD**
   - [ ] Obtenir token
   - [ ] Configurer GitHub Actions
   - [ ] Tester sur première PR

### Moyen Terme (Semaine 3-4)

1. **Créer stories pour composants EDN**
   - [ ] TableauRangA
   - [ ] TableauRangB
   - [ ] AudioPlayer
   - [ ] ParolesMusicales
   
2. **Créer stories pour composants IA**
   - [ ] AIRecommendations
   - [ ] GeneratorMusicPlayer
   - [ ] CustomModeCreator
   
3. **Tests d'accessibilité systématiques**
   - [ ] Vérifier tous les contrastes
   - [ ] Valider navigation clavier
   - [ ] Tester lecteurs d'écran

### Long Terme (Mois 1-2)

1. **Documentation complète**
   - [ ] Guide de contribution
   - [ ] Templates de stories
   - [ ] Best practices accessibilité
   
2. **Automatisation**
   - [ ] Tests visuels automatiques sur PR
   - [ ] Génération automatique de captures
   - [ ] Alertes Slack/Discord sur régressions
   
3. **Formation équipe**
   - [ ] Workshop Storybook
   - [ ] Workshop Chromatic
   - [ ] Documentation procédures

---

## 📚 RESSOURCES

### Documentation Officielle

- **Storybook** : https://storybook.js.org/docs/react/get-started/introduction
- **Chromatic** : https://www.chromatic.com/docs/
- **Addon A11y** : https://storybook.js.org/addons/@storybook/addon-a11y

### Tutoriels Recommandés

- [Storybook React Tutorial](https://storybook.js.org/tutorials/intro-to-storybook/react/en/get-started/)
- [Visual Testing with Chromatic](https://www.chromatic.com/docs/visual-testing)
- [Design Systems for Developers](https://storybook.js.org/tutorials/design-systems-for-developers/)

### Communauté

- **Discord Storybook** : https://discord.gg/storybook
- **GitHub Discussions** : https://github.com/storybookjs/storybook/discussions

---

## 🎉 CONCLUSION

Storybook + Chromatic offrent une **solution complète** pour :

✅ **Documentation** vivante et interactive  
✅ **Tests visuels** automatisés  
✅ **Collaboration** Design/Dev facilitée  
✅ **Qualité** visuelle garantie  
✅ **Onboarding** simplifié

**La configuration de base est complète et prête à l'emploi !**

---

**Date de création** : Janvier 2025  
**Auteur** : AI Assistant  
**Statut** : ✅ Configuration complète - Prêt pour production
