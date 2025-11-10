# 🚀 Instructions de Configuration Storybook & Chromatic

## ✅ Ce qui est déjà configuré

- ✅ Storybook installé et configuré
- ✅ Addons essentiels installés (a11y, interactions, links)
- ✅ Chromatic installé
- ✅ Support mode sombre intégré
- ✅ Stories de démonstration créées
- ✅ Configuration Chromatic prête

## 📋 Étapes Manuelles Requises

### 1. Ajouter le Script Chromatic (IMPORTANT)

Ouvrez `package.json` et ajoutez ce script dans la section `"scripts"` :

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "chromatic": "chromatic --exit-zero-on-changes"  // ← AJOUTER CETTE LIGNE
  }
}
```

### 2. Configurer le Token Chromatic

#### Option A : Projet GitHub (Recommandé)

1. Connectez votre projet à GitHub via l'interface Lovable
2. Allez sur https://www.chromatic.com/
3. Connectez-vous avec GitHub
4. Créez un nouveau projet et sélectionnez votre repo
5. Copiez le `CHROMATIC_PROJECT_TOKEN`
6. Dans GitHub : Settings → Secrets → Actions → New secret
7. Nom : `CHROMATIC_PROJECT_TOKEN`
8. Valeur : Collez le token

#### Option B : Variable d'Environnement Locale

```bash
export CHROMATIC_PROJECT_TOKEN=votre-token-ici
```

### 3. Mettre à Jour chromatic.config.json

Remplacez `"VOTRE_PROJECT_ID"` par votre vrai project ID dans `chromatic.config.json`

---

## 🎯 Commandes Disponibles

```bash
# Démarrer Storybook en développement
npm run storybook

# Builder Storybook (pour production)
npm run build-storybook

# Lancer tests visuels Chromatic (après ajout du script)
npm run chromatic
```

---

## 📚 Stories Créées

### ✅ Déjà disponibles

1. **Design System/Introduction** (MDX)
   - Vue d'ensemble du design system
   - Explication de la migration
   - Navigation vers les autres sections

2. **Design System/Tokens** 
   - Tous les tokens de couleurs sémantiques
   - Démonstration avec transparence
   - Testable en mode clair/sombre

3. **Components/Badge**
   - Tous les variants (default, secondary, destructive, outline)
   - Variants personnalisés (success, warning, accent)
   - Contexte EDN

4. **Patterns/Card Patterns**
   - Pattern 1 : Bordure latérale colorée
   - Pattern 2 : Structure de section
   - Pattern 3 : Carte interactive
   - Anti-patterns à éviter

### 🔜 À créer (prochaines étapes)

- [ ] Components/Button
- [ ] Components/Card
- [ ] Components/Input
- [ ] Patterns/Music Patterns
- [ ] Patterns/EDN Patterns
- [ ] Examples/TableauRangA
- [ ] Examples/AudioPlayer
- [ ] Examples/ParolesMusicales

---

## 🔍 Test Visuel

### Mode Sombre

Tous les composants sont configurés pour tester automatiquement le mode sombre :

1. Lancez Storybook : `npm run storybook`
2. Ouvrez une story
3. Cliquez sur l'icône 🌓 dans la toolbar en haut
4. Sélectionnez "dark"
5. Vérifiez que tous les éléments sont lisibles

### Accessibilité

L'addon a11y est déjà configuré et affichera automatiquement :
- ✅ Violations d'accessibilité
- ⚠️ Warnings
- 💡 Suggestions d'amélioration

Consultez l'onglet "Accessibility" en bas de chaque story.

---

## 📖 Documentation Complète

Consultez `docs/STORYBOOK-CHROMATIC-GUIDE.md` pour :
- Guide complet d'utilisation
- Comment créer de nouvelles stories
- Bonnes pratiques
- Configuration CI/CD
- Debugging

---

## 🎉 Prêt à Démarrer

Une fois le script Chromatic ajouté dans package.json :

```bash
# 1. Démarrer Storybook
npm run storybook

# 2. Explorer les stories existantes
# Ouvrir http://localhost:6006

# 3. Tester en mode clair/sombre
# Utiliser le sélecteur 🌓 dans la toolbar

# 4. Vérifier l'accessibilité
# Consulter l'onglet "Accessibility" de chaque story
```

---

**Besoin d'aide ?** Consultez le guide complet dans `docs/STORYBOOK-CHROMATIC-GUIDE.md`
