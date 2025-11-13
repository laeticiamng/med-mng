# 🎨 Configuration Storybook & Chromatic

## 📚 Introduction

Storybook permet de développer et tester les composants UI en isolation. Chromatic ajoute les tests de régression visuelle automatiques.

## 🚀 Installation Locale

### Démarrer Storybook

```bash
# Lancer Storybook
npm run storybook

# Ouvre http://localhost:6006
```

### Build Storybook

```bash
# Build pour production
npm run build-storybook

# Résultat dans storybook-static/
```

## 📝 Écrire des Stories

### Structure de Base

```typescript
// src/components/ui/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};
```

### Story Avancée avec Interactions

```typescript
import { expect } from '@storybook/test';
import { userEvent, within } from '@storybook/testing-library';

export const Clickable: Story = {
  args: {
    children: 'Click me',
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalled();
  },
};
```

### Story avec État

```typescript
import { useState } from 'react';

export const WithState: Story = {
  render: () => {
    const [count, setCount] = useState(0);
    return (
      <Button onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </Button>
    );
  },
};
```

## 🎨 Chromatic Setup

### Étape 1: Créer un Compte

1. Aller sur [Chromatic.com](https://www.chromatic.com/)
2. Se connecter avec GitHub
3. Choisir votre repository

### Étape 2: Obtenir le Token

```bash
# Copier le project token depuis Chromatic
CHROMATIC_PROJECT_TOKEN=chpt_xxxxxxxxx
```

### Étape 3: Ajouter le Secret GitHub

GitHub Settings → Secrets → Actions :

```bash
CHROMATIC_PROJECT_TOKEN=your-chromatic-token
```

### Étape 4: Mettre à Jour la Config

Modifier `chromatic.config.json` :

```json
{
  "projectId": "YOUR_PROJECT_ID",
  "buildScriptName": "build-storybook"
}
```

### Étape 5: Premier Build

```bash
# Manuel (local)
npm install -g chromatic
chromatic --project-token=YOUR_TOKEN

# Ou push vers GitHub
git push origin main
# Workflow .github/workflows/chromatic.yml s'exécute
```

## 📊 Tests de Régression Visuelle

### Comment ça Marche

1. **Baseline** : Premier build crée la référence
2. **Comparaison** : Builds suivants comparent avec baseline
3. **Détection** : Chromatic détecte les différences pixel par pixel
4. **Review** : Vous acceptez ou rejetez les changements

### Workflow Automatique

```yaml
# .github/workflows/chromatic.yml

- Checkout code
- Install dependencies
- Build Storybook
- Publish to Chromatic
  → Détection automatique des changements
  → Commentaire sur PR
```

### Commentaire sur PR

```markdown
## 🎨 Chromatic Visual Tests

⚠️ **2 visual change(s) detected**

Please review the changes and accept or reject them in Chromatic.

[📊 View Build](https://www.chromatic.com/build?...)
[📖 View Storybook](https://xyz.chromatic.com)
```

## 🔍 Reviewing Changes

### Dans Chromatic UI

1. **Ouvrir le build** depuis le lien dans le commentaire PR
2. **Comparer** side-by-side :
   - Before (baseline)
   - After (nouveau build)
   - Diff (différences en rouge)
3. **Actions** :
   - ✅ **Accept** : Changement intentionnel → nouvelle baseline
   - ❌ **Deny** : Bug visuel → fix requis
   - 👁️ **Spec** : Demander review à l'équipe

### Accepter en Masse

```bash
# Auto-accept sur la branche main
autoAcceptChanges: "main"
```

## 📱 Multi-Viewport Testing

### Configuration Viewports

```typescript
// .storybook/preview.tsx
export default {
  parameters: {
    chromatic: {
      viewports: [320, 768, 1024, 1440],
      delay: 300,
    },
  },
};
```

### Par Story

```typescript
export const Responsive: Story = {
  parameters: {
    chromatic: {
      viewports: [375, 768],
    },
  },
};
```

## 🎯 Best Practices

### Organisation des Stories

```
src/components/
├── ui/
│   ├── button.tsx
│   ├── button.stories.tsx
│   ├── card.tsx
│   └── card.stories.tsx
└── features/
    ├── template-card.tsx
    └── template-card.stories.tsx
```

### Nommer les Stories

```typescript
// ✅ Bon
export const Default: Story = {};
export const WithIcon: Story = {};
export const Loading: Story = {};
export const Disabled: Story = {};

// ❌ Éviter
export const Story1: Story = {};
export const Test: Story = {};
```

### Documentation Auto

```typescript
const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'], // Active la doc auto
  argTypes: {
    variant: {
      description: 'Visual style of the button',
      control: 'select',
    },
  },
} satisfies Meta<typeof Button>;
```

### Args vs Render

```typescript
// ✅ Simple: Utiliser args
export const Default: Story = {
  args: {
    children: 'Click me',
    variant: 'default',
  },
};

// ✅ Complexe: Utiliser render
export const WithHooks: Story = {
  render: () => {
    const [count, setCount] = useState(0);
    return <Button onClick={() => setCount(count + 1)}>
      Count: {count}
    </Button>;
  },
};
```

## 🔧 Addons Utiles

### Déjà Installés

- ✅ **addon-essentials** : Controls, Actions, Viewport, etc.
- ✅ **addon-a11y** : Tests d'accessibilité
- ✅ **addon-interactions** : Tests d'interaction

### Installer Plus d'Addons

```bash
npm install --save-dev @storybook/addon-coverage
```

```typescript
// .storybook/main.ts
export default {
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-coverage', // Nouveau
  ],
};
```

## 🧪 Tests d'Interaction

### Play Function

```typescript
import { expect } from '@storybook/test';
import { userEvent, within } from '@storybook/testing-library';

export const FormSubmit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Remplir le formulaire
    await userEvent.type(
      canvas.getByLabelText('Email'),
      'test@example.com'
    );
    
    // Soumettre
    await userEvent.click(
      canvas.getByRole('button', { name: /submit/i })
    );
    
    // Vérifier
    await expect(
      canvas.getByText('Success')
    ).toBeInTheDocument();
  },
};
```

### Lancer les Tests

```bash
# Installer test runner
npm install --save-dev @storybook/test-runner

# Lancer les tests
npm run test-storybook
```

## 📈 Monitoring & Insights

### Métriques Chromatic

- **Snapshots** : Nombre total de screenshots
- **Changes** : Changements détectés par build
- **Coverage** : Composants avec stories
- **Build time** : Temps de build

### Dashboard

Accéder au dashboard : `https://www.chromatic.com/builds?appId=YOUR_APP_ID`

## 🚫 Ignorer des Changements

### Ignorer un Composant

```typescript
export const WithRandomData: Story = {
  parameters: {
    chromatic: { 
      disableSnapshot: true // Skip visual test
    },
  },
};
```

### Ignorer une Région

```typescript
<div data-chromatic="ignore">
  {/* Cette zone sera ignorée */}
  <RandomImage />
</div>
```

### Pausé les Animations

```typescript
export const Animated: Story = {
  parameters: {
    chromatic: {
      pauseAnimationAtEnd: true,
    },
  },
};
```

## 🔄 CI/CD Integration

### Workflow Complet

```yaml
# .github/workflows/chromatic.yml
jobs:
  chromatic:
    - Checkout
    - Install
    - Build Storybook
    - Publish to Chromatic
      → Auto-accept on main
      → Only changed stories
      → Comment on PR
  
  storybook-tests:
    - Run interaction tests
    - Upload results
```

## 📚 Ressources

- [Storybook Docs](https://storybook.js.org/docs)
- [Chromatic Docs](https://www.chromatic.com/docs)
- [Writing Stories](https://storybook.js.org/docs/react/writing-stories/introduction)
- [Visual Testing Guide](https://www.chromatic.com/docs/test)

## 🆘 Troubleshooting

### Build Chromatic Échoue

```bash
# Vérifier le token
echo $CHROMATIC_PROJECT_TOKEN

# Build local
npm run build-storybook

# Test Chromatic local
chromatic --project-token=YOUR_TOKEN --dry-run
```

### Stories Ne S'affichent Pas

```typescript
// Vérifier l'export default
export default meta;

// Vérifier le pattern dans main.ts
stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)']
```

### Trop de Snapshots

```typescript
// Limiter les viewports
chromatic: {
  viewports: [1440], // Au lieu de [320, 768, 1024, 1440]
}
```

## ✅ Checklist

Avant de merger :

- [ ] Toutes les stories build correctement
- [ ] Tests d'interaction passent
- [ ] Accessibilité OK (addon-a11y)
- [ ] Chromatic changes reviewed
- [ ] Documentation auto générée
- [ ] Multi-viewport testé

---

**🎨 Objectif : Composants UI robustes et testés visuellement**
