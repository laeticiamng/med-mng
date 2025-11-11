# 🛠️ Guide DevTools & Tests Visuels Chromatic

## 📋 Vue d'ensemble

Ce guide documente trois fonctionnalités majeures pour le design system :

1. **DevTools Inspector** - Overlay interactif pour inspecter les tokens CSS
2. **Page Design System** - Interface interactive pour explorer tous les tokens
3. **Tests Visuels Chromatic** - Screenshots automatisés en light/dark mode

---

## 🔍 DevTools Inspector

### Accès rapide

**Raccourci clavier : `Ctrl + Shift + D`**

### Fonctionnalités

✅ **Inspection en temps réel**
- Survolez n'importe quel élément de la page
- Highlight visuel avec bordure bleue
- Extraction automatique des tokens CSS

✅ **Catégories de tokens affichées**
- **Color** : couleurs, backgrounds, bordures
- **Spacing** : padding, margin, gap, dimensions
- **Typography** : font-size, font-weight, line-height
- **Other** : border-radius, shadows, etc.

✅ **Actions disponibles**
- Copie rapide des valeurs CSS (icône Copy)
- Affichage du nom de la variable CSS si token sémantique détecté
- Fermeture : `Ctrl+Shift+D` ou bouton X

### Utilisation

```tsx
// Le composant est intégré automatiquement dans App.tsx
import DesignSystemDevTools from '@/components/devtools/DesignSystemDevTools';

function App() {
  return (
    <>
      {/* Votre app */}
      <DesignSystemDevTools />
    </>
  );
}
```

### Exemple de sortie

Quand vous survolez un bouton :

```
<button className="bg-primary text-primary-foreground">

COLOR
  color: var(--primary-foreground)
  background-color: hsl(213 94% 68%)

SPACING
  padding: 0.5rem 1rem
  
TYPOGRAPHY
  font-size: 14px
  font-weight: 500
```

---

## 🎨 Page Interactive /design-system

### Accès

Naviguez vers : **`http://localhost:5173/design-system`**

### Sections disponibles

#### 1. **Tokens Tab**

**Color Tokens**
- Visualisation de tous les tokens sémantiques
- Cards interactives avec aperçu de couleur
- Bouton Copy pour copier le code CSS

**Gradient Tokens**
- `--gradient-medical`
- `--gradient-header`
- `--gradient-card`

**Spacing & Border Radius**
- Démos visuelles des border-radius
- Exemples de spacing scale

#### 2. **Components Tab**

**Button Variants**
- default, secondary, outline, ghost, destructive, link
- Tous les sizes : sm, default, lg, icon

**Badge Variants**
- default, secondary, outline, destructive

**Card Sizes**
- Small, Medium, Large avec exemples

#### 3. **Examples Tab**

**Real-world Examples**
- Status Dashboard (success, warning, error cards)
- Action Cards avec gradient backgrounds
- Layout complexes combinant plusieurs composants

### Switch Light/Dark Mode

Toggle en haut à droite pour basculer instantanément entre les thèmes.

---

## 📸 Tests Visuels Chromatic

### Configuration

Les tests visuels sont configurés dans :
- `src/stories/VisualRegressionTests.stories.tsx`
- `.storybook/preview.tsx`
- `chromatic.config.json`

### Stories de tests

#### ✅ Stories créées

1. **AllButtons** - Tous les variants et states de Button
2. **AllBadges** - Tous les variants de Badge
3. **AllCards** - Cards avec différents styles
4. **AllAlerts** - Alerts avec variants (info, success, error)
5. **ColorTokensPalette** - Tous les tokens de couleur
6. **Gradients** - Tous les gradients définis
7. **TypographyScale** - Échelle typographique complète
8. **ComplexLayout** - Layout complexe pour tester l'intégration

#### Configuration Chromatic

Chaque story capture automatiquement :
- ✅ **Light mode** screenshot
- ✅ **Dark mode** screenshot
- ✅ **Multiple viewports** (mobile, tablet, desktop)
- ✅ **Animations pausées** pour stabilité

### Lancer les tests

#### Localement (Storybook)

```bash
# Démarrer Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

#### Tests Chromatic

```bash
# Première configuration (cf README_CHROMATIC.md)
# 1. Ajoutez le script dans package.json
# 2. Obtenez votre token sur chromatic.com
# 3. Configurez chromatic.config.json

# Lancer les tests visuels
npm run chromatic

# Dry run (sans upload)
npm run chromatic -- --dry-run

# Uniquement les stories modifiées
npm run chromatic -- --only-changed
```

### Workflow de test recommandé

1. **Développer le composant** avec toutes ses variantes
2. **Créer une story** dans `VisualRegressionTests.stories.tsx`
3. **Tester localement** avec `npm run storybook`
4. **Vérifier light/dark mode** avec le toggle Storybook
5. **Lancer Chromatic** avec `npm run chromatic`
6. **Reviewer sur chromatic.com** les changements détectés
7. **Accepter ou rejeter** les changements visuels

### Détection automatique des régressions

Chromatic détecte automatiquement :
- ❌ Changements de couleurs (même 1 pixel)
- ❌ Modifications de layout
- ❌ Changements de typographie
- ❌ Bordures, ombres, espacements modifiés
- ❌ Composants manquants ou déplacés

---

## 🎯 Best Practices

### Pour le DevTools

✅ **Utiliser pendant le développement**
- Vérifier que les tokens sémantiques sont utilisés
- Détecter les couleurs hardcodées
- Valider la cohérence du design

❌ **Ne pas laisser ouvert en production**
- Fermer avec `Ctrl+Shift+D` après usage
- Impact minimal sur performance quand fermé

### Pour la page /design-system

✅ **À utiliser comme référence**
- Onboarding des nouveaux développeurs
- Documentation vivante du design system
- Copier/coller les exemples de code

✅ **Maintenir à jour**
- Ajouter nouveaux tokens quand créés
- Documenter nouveaux variants de composants
- Mettre à jour les exemples

### Pour Chromatic

✅ **Avant chaque PR**
- Lancer `npm run chromatic` pour détecter régressions
- Reviewer tous les changements visuels
- Ne jamais merge avec régressions non reviewées

✅ **Ajouter stories pour**
- Chaque nouveau composant
- Chaque nouveau variant
- Chaque state important (hover, focus, disabled)

❌ **Éviter**
- Stories avec animations infinies
- Stories avec données aléatoires
- Stories sans tous les variants

---

## 🚀 Quick Start

### 1. Activer le DevTools

```tsx
// Déjà intégré dans App.tsx
// Appuyez sur Ctrl+Shift+D n'importe où dans l'app
```

### 2. Explorer la page Design System

```bash
# L'app doit tourner
npm run dev

# Ouvrez dans le navigateur
http://localhost:5173/design-system
```

### 3. Lancer les tests visuels

```bash
# Première fois : configurer Chromatic (voir README_CHROMATIC.md)

# Ensuite, à chaque changement :
npm run chromatic
```

---

## 📚 Ressources

### Documentation interne
- `README_CHROMATIC.md` - Setup complet Chromatic
- `docs/CHROMATIC_SETUP.md` - Guide détaillé
- `docs/design-tokens.md` - Tous les tokens disponibles
- `docs/ESLINT_CUSTOM_RULE_GUIDE.md` - Linter couleurs hardcodées

### Storybook
- **URL locale** : http://localhost:6006
- **Stories** : `src/stories/`
- **Config** : `.storybook/`

### Liens externes
- 🌐 [Chromatic Documentation](https://www.chromatic.com/docs/)
- 🌐 [Storybook Documentation](https://storybook.js.org/docs/)
- 🌐 [Visual Testing Guide](https://storybook.js.org/tutorials/visual-testing-handbook/)

---

## 🆘 Troubleshooting

### DevTools ne s'affiche pas

```bash
# Vérifier que le composant est bien importé dans App.tsx
# Vérifier la console pour erreurs JavaScript
# Essayer Ctrl+Shift+D plusieurs fois
```

### Page /design-system : erreur 404

```bash
# Vérifier que la route est ajoutée dans App.tsx
<Route path="/design-system" element={<Suspense fallback={...}><DesignSystem /></Suspense>} />
```

### Chromatic : erreur "Missing project token"

```bash
# Créez .env.local avec :
CHROMATIC_PROJECT_TOKEN=chpt_votre_token_ici

# Ou configurez dans GitHub Secrets
```

### Stories ne capturent pas le dark mode

```bash
# Vérifier .storybook/preview.tsx
# Vérifier que le decorator ThemeProvider est présent
# Vérifier chromatic.modes dans les paramètres
```

---

## ✅ Checklist de validation

Avant de merger :

- [ ] DevTools fonctionne avec `Ctrl+Shift+D`
- [ ] Page /design-system accessible et fonctionnelle
- [ ] Toggle light/dark fonctionne sur /design-system
- [ ] Storybook lance sans erreur (`npm run storybook`)
- [ ] Chromatic tests passent (`npm run chromatic`)
- [ ] Tous les changements visuels reviewés et acceptés
- [ ] Documentation mise à jour si nouveaux tokens

---

**Dernière mise à jour** : 2025-01-XX
**Mainteneur** : Design System Team
