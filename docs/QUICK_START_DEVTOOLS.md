# ⚡ Quick Start - DevTools & Design System

## 🚀 Accès rapide

### 1. DevTools Inspector

**Raccourci : `Ctrl + Shift + D`**

1. Appuyez sur `Ctrl + Shift + D` n'importe où dans l'application
2. Survolez les éléments pour voir leurs tokens CSS
3. Cliquez sur l'icône Copy pour copier les valeurs
4. Rappuyez sur `Ctrl + Shift + D` pour fermer

### 2. Page Design System

**URL : `/design-system`**

```bash
# L'app doit tourner
npm run dev

# Ouvrez :
http://localhost:5173/design-system
```

**Features :**
- 🎨 Tous les tokens de couleur avec preview
- 📐 Variants de composants (Button, Badge, Card)
- 🌓 Toggle Light/Dark mode en haut à droite
- 📋 Copie rapide de code CSS

### 3. Tests Visuels Chromatic

**Setup rapide :**

```bash
# 1. Ajouter dans package.json (manuellement ou via Lovable) :
{
  "scripts": {
    "chromatic": "chromatic"
  }
}

# 2. Créer compte sur chromatic.com et obtenir token

# 3. Créer .env.local :
CHROMATIC_PROJECT_TOKEN=chpt_votre_token

# 4. Mettre à jour chromatic.config.json :
{
  "projectId": "votre_project_id"
}

# 5. Lancer les tests :
npm run chromatic
```

---

## 📝 Utilisation quotidienne

### Workflow développeur

1. **Développer un composant**
   ```tsx
   // Utiliser les tokens sémantiques
   <div className="bg-primary text-primary-foreground">
     Mon composant
   </div>
   ```

2. **Vérifier avec DevTools** (`Ctrl+Shift+D`)
   - Survoler le composant
   - Vérifier que les tokens sont utilisés
   - Copier les valeurs si besoin

3. **Tester visuellement**
   - Aller sur `/design-system`
   - Toggle light/dark mode
   - Vérifier le rendu dans les deux thèmes

4. **Créer une story Chromatic**
   ```tsx
   // src/stories/VisualRegressionTests.stories.tsx
   export const MonComposant: Story = {
     render: () => <MonComposant />
   };
   ```

5. **Lancer les tests visuels**
   ```bash
   npm run chromatic
   ```

---

## ✅ Checklist avant PR

- [ ] DevTools ne montre pas de couleurs hardcodées
- [ ] Composant testé en light/dark sur `/design-system`
- [ ] Story Chromatic créée
- [ ] Tests visuels passent (`npm run chromatic`)
- [ ] Pas de régressions visuelles non reviewées

---

## 🆘 Aide rapide

### DevTools ne s'ouvre pas
```bash
# Vérifier la console (F12)
# Essayer plusieurs fois Ctrl+Shift+D
# Recharger la page (Ctrl+R)
```

### Page Design System erreur
```bash
# Vérifier que l'app tourne (npm run dev)
# Vérifier l'URL : http://localhost:5173/design-system
# Vérifier la console pour erreurs
```

### Chromatic erreur
```bash
# Vérifier .env.local existe
# Vérifier chromatic.config.json configuré
# Vérifier script dans package.json
# Voir README_CHROMATIC.md pour setup complet
```

---

## 📚 Documentation complète

- 📖 **Guide complet** : `docs/DEVTOOLS_CHROMATIC_GUIDE.md`
- 🎨 **Tokens** : `docs/design-tokens.md`
- 🔧 **Chromatic Setup** : `README_CHROMATIC.md`
- 📚 **Storybook** : `docs/storybook-guide.md`

---

**Prêt à l'emploi !** 🎉
