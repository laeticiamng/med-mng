# Guide de Migration - Couleurs Hardcodées vers Tokens Sémantiques

## 🎯 Objectif

Migrer toutes les couleurs hardcodées du projet vers les tokens sémantiques du design system pour:
- ✅ Support automatique du dark mode
- ✅ Cohérence visuelle de l'application
- ✅ Maintenance simplifiée
- ✅ Meilleure accessibilité (contrastes WCAG)

---

## 🚀 Guide d'exécution

### Option 1: Script automatique avec assistant (Recommandé)

```bash
# Rendre le script exécutable
chmod +x scripts/run-migration.sh

# Exécuter le script interactif
./scripts/run-migration.sh
```

Le script vous guidera à travers 3 étapes:
1. **Statistiques**: Voir combien de violations existent
2. **Dry-run**: Prévisualiser les changements
3. **Migration**: Appliquer les changements

### Option 2: Commandes manuelles

```bash
# 1. Voir les statistiques
node scripts/migrate-colors.js --stats

# 2. Dry-run (prévisualisation)
node scripts/migrate-colors.js --dry-run

# 3. Vérifier les changements proposés
# Si tout semble correct, appliquer:

# 4. Créer une branche de sauvegarde
git branch backup-before-migration

# 5. Appliquer la migration
node scripts/migrate-colors.js

# 6. Vérifier les changements
git diff

# 7. Tester l'application
npm run dev
```

---

## 🔍 Vérifications post-migration

### 1. Tests visuels

```bash
# Lancer l'application
npm run dev

# Vérifier en mode light
# Vérifier en mode dark (toggle dans l'interface)
```

**Points à vérifier**:
- [ ] Tous les composants s'affichent correctement
- [ ] Pas de texte blanc sur fond blanc (ou noir sur noir)
- [ ] Les badges ont les bonnes couleurs (success = vert, warning = orange, etc.)
- [ ] Les boutons sont visibles et cliquables
- [ ] Les alertes ont les bonnes couleurs selon leur variant

### 2. Tests de contraste

Utiliser les DevTools du navigateur:
1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet "Lighthouse"
3. Cocher "Accessibility"
4. Lancer l'audit

**Score attendu**: ≥ 90/100

### 3. Tests automatisés

```bash
# Exécuter les tests unitaires
npm test

# Exécuter le linter
npm run lint

# Si le linter détecte encore des couleurs hardcodées:
node scripts/migrate-colors.js --path <fichier-problématique>
```

---

## 📊 Comprendre les statistiques

### Exemple de sortie

```
============================================================
📊 STATISTIQUES DE MIGRATION
============================================================

📁 Fichiers analysés:     246
✏️  Fichiers modifiés:     89
🔄 Total remplacements:   324

📈 Top 10 couleurs remplacées:
   1. bg-blue-50           → 45 fois
   2. text-gray-600        → 38 fois
   3. text-green-600       → 29 fois
   4. bg-amber-50          → 27 fois
   5. text-red-600         → 23 fois
   ...
============================================================
```

### Interprétation

- **Fichiers analysés**: Nombre total de fichiers .tsx/.ts scannés
- **Fichiers modifiés**: Fichiers contenant au moins une violation
- **Total remplacements**: Nombre de couleurs hardcodées remplacées
- **Top 10**: Les couleurs les plus fréquentes à remplacer

---

## 🛡️ Hook Git pre-commit

### Installation

```bash
# Installer Husky
npm install --save-dev husky lint-staged

# Initialiser Husky
npx husky install

# Activer le hook automatiquement après npm install
npm pkg set scripts.prepare="husky install"
```

### Fonctionnement

Le hook pre-commit vérifie automatiquement **avant chaque commit**:
- ✅ Aucune nouvelle couleur hardcodée
- ✅ ESLint passe sans warnings sur les fichiers modifiés

**Si des violations sont détectées**, le commit est **bloqué** et vous recevez:
```
❌ Commit bloqué: Des couleurs hardcodées ont été détectées!

💡 Solutions:
   1. Remplacer les couleurs hardcodées par des tokens sémantiques
   2. Consulter le guide: docs/DESIGN_SYSTEM_GUIDE.md
   3. Utiliser le script de migration: node scripts/migrate-colors.js
```

### Désactiver temporairement (non recommandé)

```bash
# Bypass le hook pour un commit urgent
git commit --no-verify -m "message"
```

---

## 🎨 Tokens sémantiques disponibles

### Couleurs primaires

```tsx
// ❌ AVANT (hardcodé)
<div className="bg-blue-50 text-blue-600">

// ✅ APRÈS (sémantique)
<div className="bg-primary/10 text-primary">
```

### Couleurs de statut

```tsx
// Success (vert)
<Badge className="bg-green-100 text-green-800">  // ❌
<Badge variant="success">                        // ✅

// Warning (orange/jaune)
<Badge className="bg-amber-100 text-amber-800">  // ❌
<Badge variant="warning">                        // ✅

// Destructive/Error (rouge)
<Badge className="bg-red-100 text-red-800">      // ❌
<Badge variant="destructive">                    // ✅
```

### Couleurs de texte

```tsx
// Texte principal
text-black          → text-foreground
text-gray-900       → text-foreground

// Texte secondaire
text-gray-500       → text-muted-foreground
text-gray-600       → text-muted-foreground

// Texte de statut
text-blue-600       → text-primary
text-green-600      → text-success
text-red-600        → text-destructive
text-amber-600      → text-warning
```

### Backgrounds

```tsx
// Backgrounds clairs
bg-white            → bg-background
bg-gray-50          → bg-muted
bg-gray-100         → bg-muted

// Backgrounds colorés
bg-blue-50          → bg-primary/10
bg-green-50         → bg-success/10
bg-red-50           → bg-destructive/10
bg-amber-50         → bg-warning/10
```

### Borders

```tsx
// Bordures neutres
border-gray-200     → border-border
border-gray-300     → border-border

// Bordures colorées
border-blue-200     → border-primary/20
border-green-200    → border-success/20
border-red-200      → border-destructive/20
```

---

## 🐛 Résolution de problèmes

### Problème: Le script ne trouve pas de violations mais le linter en signale

**Solution**: Le script ne détecte que les couleurs dans les `className`. Les couleurs dans:
- Props de composants
- Styles inline
- Fichiers CSS/SCSS

Doivent être corrigées manuellement.

### Problème: Après migration, certains textes sont invisibles

**Causes possibles**:
1. Texte blanc sur fond blanc en light mode (ou inverse en dark)
2. Mauvais variant de Badge/Alert utilisé

**Solution**:
```tsx
// Vérifier que les variants sont cohérents
<Alert variant="destructive">  {/* bg rouge */}
  <AlertDescription className="text-destructive"> {/* ✅ */}
  
// Pas:
<Alert variant="default">      {/* bg blanc */}
  <AlertDescription className="text-destructive-foreground"> {/* ❌ invisible */}
```

### Problème: Le hook pre-commit bloque un commit légitime

**Solution temporaire**:
```bash
# Bypass le hook (attention, à utiliser avec parcimonie)
git commit --no-verify -m "fix: critical hotfix"
```

**Solution permanente**:
- Corriger la violation détectée
- Ou ajouter une exception dans `.lintstagedrc.json`

---

## 📈 Suivi de progression

### État actuel (avant migration complète)

Exécuter pour voir l'état actuel:
```bash
node scripts/migrate-colors.js --stats
```

### État cible

- ✅ **0 violation** de couleurs hardcodées
- ✅ **100% des fichiers** conformes au design system
- ✅ **Score Lighthouse Accessibility** ≥ 90/100

---

## 📚 Ressources

### Documentation interne

- [Guide du Design System](./DESIGN_SYSTEM_GUIDE.md)
- [Rapport migration Accessibility](./ACCESSIBILITY_MIGRATION_REPORT.md)
- [Rapport migration UI](./UI_COMPONENTS_MIGRATION_REPORT.md)
- [Guide ESLint personnalisé](./ESLINT_CUSTOM_RULE_GUIDE.md)

### Tokens sémantiques

Voir fichier `src/index.css` section `:root` pour la liste complète:
```css
:root {
  --primary: ...
  --success: ...
  --warning: ...
  --destructive: ...
  --muted: ...
  /* etc. */
}
```

### Configuration Tailwind

Voir `tailwind.config.ts` pour les couleurs étendues.

---

## ✅ Checklist finale

Avant de merger la PR de migration:

- [ ] Script exécuté avec succès (0 erreurs)
- [ ] Tests visuels OK (light + dark mode)
- [ ] Tests automatisés passent
- [ ] Lighthouse Accessibility ≥ 90/100
- [ ] Hook pre-commit activé
- [ ] Documentation mise à jour
- [ ] PR reviewée par l'équipe

---

**Date**: 2025-01-25  
**Version**: 1.0.0  
**Auteur**: Équipe Design System
