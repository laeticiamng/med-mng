# 📚 Storybook - Design System MED-MNG

Bienvenue dans le design system de MED-MNG ! Cette documentation interactive présente tous les composants UI de la plateforme.

## 🚀 Accès rapide

### Lancer Storybook
```bash
npm run storybook
# ➡️ http://localhost:6006
```

### Build Storybook
```bash
npm run build-storybook
# ➡️ Génère dans storybook-static/
```

---

## 🎨 Composants disponibles

### 📊 Admin & Monitoring
- **AdminDashboard** - Dashboard temps réel avec métriques
- **ExtractionMonitoringDashboard** - Suivi des extractions 
- **SecurityDashboard** - Monitoring sécurité avec scoring
- **AuditDashboard** - Audit complet de la plateforme

### 🚨 Alertes & Erreurs  
- **AlertBanner** - Bannières d'alerte système
- **RobustErrorDisplay** - Affichage d'erreurs robuste
- **NotificationCenter** - Centre de notifications intelligent
- **ErrorBoundary** - Gestion des erreurs React

### 🔒 Sécurité
- **SecurityHeaders** - Composant headers de sécurité
- **SecureCredentialsForm** - Formulaires sécurisés

### 🎵 Musique & Media
- **GeneratorMusicPlayer** - Lecteur musical avec contrôles
- **GlobalMiniPlayer** - Mini-lecteur global

### 🔧 Utilitaires
- **LoadingSpinner** - Indicateurs de chargement
- **SkeletonLibraryGrid** - Squelettes d'interface

---

## 🎯 Guide d'utilisation

### Structure des stories

Chaque composant suit cette structure :
```typescript
// Button.stories.tsx
export default {
  title: 'Example/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'Description du composant...'
      }
    }
  }
};

export const Primary = {
  args: {
    primary: true,
    label: 'Button',
  },
};
```

### Variantes documentées

Pour chaque composant, vous trouverez :
- **Default** - État par défaut
- **Variants** - Toutes les variantes (primary, secondary, etc.)
- **States** - États (loading, error, success, etc.)  
- **Interactive** - Comportements interactifs
- **Edge Cases** - Cas limites et erreurs

### Exemples d'usage

Chaque story inclut :
- ✅ **Code source** copiable
- ✅ **Props documentation** automatique
- ✅ **Controls interactifs** pour tester
- ✅ **Accessibility** notes
- ✅ **Design tokens** utilisés

---

## 🏗️ Architecture Design System

### Tokens de design
```typescript
// Couleurs sémantiques (index.css)
--primary: 220 14% 96%;
--primary-foreground: 220 9% 46%;
--secondary: 220 14% 96%;
--accent: 220 14% 96%;

// Espacements
--spacing-xs: 0.25rem;
--spacing-sm: 0.5rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;

// Typography
--font-sans: ui-sans-serif, system-ui;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
```

### Variants système
```typescript
// Utilisation avec cva (class-variance-authority)
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8"
      }
    }
  }
);
```

---

## 📋 Guidelines de contribution

### Créer une nouvelle story

1. **Créer le fichier story**
```bash
# Pour un composant dans src/components/example/Button.tsx
touch src/stories/Button.stories.tsx
```

2. **Structure minimale**
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};
```

3. **Ajouter les variantes importantes**
```typescript
export const Primary: Story = {
  args: {
    variant: 'default',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary', 
    children: 'Secondary Button',
  },
};

export const Loading: Story = {
  args: {
    disabled: true,
    children: 'Loading...',
  },
};
```

### Bonnes pratiques

#### ✅ À faire
- **Documenter tous les variants** (primary, secondary, etc.)
- **Inclure les états** (loading, error, disabled)
- **Ajouter des descriptions** claires
- **Tester l'accessibilité** (screen readers, keyboard)
- **Utiliser les design tokens** (pas de couleurs hardcodées)

#### ❌ À éviter
- Stories sans documentation
- Props hardcodées non configurables
- Composants non accessibles
- Couleurs/styles inline

---

## 🔧 Configuration Storybook

### Addons installés
```json
{
  "@storybook/addon-essentials": "Documentation, controls, actions",
  "@storybook/addon-a11y": "Tests d'accessibilité", 
  "@storybook/addon-design-tokens": "Design tokens",
  "@storybook/addon-docs": "Documentation automatique"
}
```

### Configuration personnalisée
```javascript
// .storybook/main.js
module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-design-tokens'
  ],
  framework: '@storybook/react-vite'
};
```

---

## 🎯 Utilisation par équipe

### 👨‍💻 Développeurs
- **Référence composants** : Explorer les props disponibles
- **Copy/paste code** : Code source immédiatement utilisable
- **Test interactif** : Controls pour tester les comportements

### 🎨 Designers  
- **Design review** : Validation visuelle des composants
- **Tokens validation** : Vérification cohérence design system
- **Responsive test** : Test sur différentes tailles d'écran

### 🧪 QA
- **Test cases** : Toutes les variantes documentées
- **Accessibility** : Tests automatiques d'accessibilité
- **Edge cases** : Cas limites documentés

### 📋 Product Owners
- **Component catalog** : Vue d'ensemble des possibilités
- **Feature planning** : Composants disponibles vs. à créer
- **Consistency** : Validation cohérence UX

---

## 📊 Métriques & Analytics

### Components coverage
- **Total components** : [Auto-calculé]
- **Stories created** : [Auto-calculé]  
- **Tests coverage** : [Lié aux tests Playwright]

### Usage tracking
- **Most used components** : Analytics Storybook
- **Performance metrics** : Temps de rendu
- **Accessibility score** : Notes d'accessibilité

---

## 🔗 Liens utiles

### Documentation
- [Storybook officiel](https://storybook.js.org/)
- [Design tokens](./design-tokens.md)
- [Guidelines UI/UX](./ui-guidelines.md)

### Outils
- **Figma** : Maquettes design
- **Chromatic** : Visual testing (si configuré)
- **Accessibility checker** : axe-core intégré

---

🎨 **Happy coding !** Votre design system est maintenant prêt à faire briller MED-MNG ✨