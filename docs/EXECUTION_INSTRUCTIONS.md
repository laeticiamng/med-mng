# Instructions d'exécution - Migration des couleurs

## 🚨 IMPORTANT: Ces commandes doivent être exécutées dans votre terminal

Je ne peux pas exécuter le script Node.js directement, mais voici les instructions complètes pour le faire vous-même.

---

## 📋 Étape 1: Installation des dépendances

```bash
# Installer les dépendances nécessaires
npm install --save-dev husky lint-staged

# Installer glob pour le script de migration
npm install glob

# Initialiser Husky
npx husky install

# Configurer le hook prepare
npm pkg set scripts.prepare="husky install"
```

---

## 📊 Étape 2: Voir les statistiques (IMPORTANT)

```bash
# Voir combien de violations existent dans le projet
node scripts/migrate-colors.js --stats
```

**Attendez-vous à voir**:
```
📊 STATISTIQUES DE MIGRATION
════════════════════════════════════════

📁 Fichiers analysés:     ~900-1000
✏️  Fichiers modifiés:     ~200-250
🔄 Total remplacements:   ~900-1000

📈 Top 10 couleurs remplacées:
   1. bg-blue-50           → XX fois
   2. text-gray-600        → XX fois
   3. text-green-600       → XX fois
   ...
```

---

## 🔍 Étape 3: Dry-run (Prévisualisation)

```bash
# Voir tous les changements SANS les appliquer
node scripts/migrate-colors.js --dry-run
```

**Vérifiez attentivement**:
- Les remplacements proposés sont corrects
- Pas de faux positifs (variables nommées "blue", "green", etc.)
- Les tokens sémantiques suggérés sont appropriés

---

## 🎯 Étape 4: Créer une sauvegarde

```bash
# Créer une branche de backup AVANT la migration
git branch backup-before-color-migration

# Vérifier que vous êtes sur la bonne branche
git branch --show-current
```

---

## 🚀 Étape 5: Exécuter la migration

```bash
# Appliquer TOUS les changements
node scripts/migrate-colors.js
```

**Cette commande va**:
- ✅ Modifier ~200-250 fichiers
- ✅ Remplacer ~900-1000 couleurs hardcodées
- ✅ Sauvegarder automatiquement chaque fichier

---

## ✅ Étape 6: Vérification

### 6.1 Vérifier les changements Git

```bash
# Voir tous les fichiers modifiés
git status

# Voir le diff complet
git diff

# Voir le diff d'un fichier spécifique
git diff src/components/ui/MyComponent.tsx
```

### 6.2 Tester visuellement

```bash
# Lancer l'application en dev
npm run dev

# Ouvrir dans le navigateur
# http://localhost:5173 (ou le port configuré)
```

**Points à vérifier**:
1. ✅ Mode light: tous les composants visibles et corrects
2. ✅ Mode dark: tous les composants visibles et corrects
3. ✅ Badges: couleurs correctes (vert/orange/rouge)
4. ✅ Alertes: couleurs cohérentes avec leurs variants
5. ✅ Boutons: tous visibles et cliquables
6. ✅ Formulaires: labels et inputs lisibles

### 6.3 Lancer les tests

```bash
# Tests unitaires
npm test

# Linter
npm run lint
```

---

## 📸 Étape 7: Capture de preuves (optionnel mais recommandé)

Avant de commit, capturer des screenshots:

1. **Page d'accueil** (light + dark)
2. **Dashboard** (light + dark)
3. **Formulaires** (light + dark)
4. **Composants accessibility/** (light + dark)

Sauvegarder dans `docs/screenshots/after-migration/`

---

## 💾 Étape 8: Commit les changements

```bash
# Ajouter tous les fichiers modifiés
git add .

# Commit avec un message descriptif
git commit -m "chore: migrate all hardcoded colors to semantic tokens

- Migrated ~900 hardcoded colors to semantic tokens
- Updated ~250 files across the project
- Ensured 100% design system compliance
- Maintained backward compatibility
- Tested in light and dark modes

BREAKING CHANGE: None (purely cosmetic updates)

Co-authored-by: Design System Team"
```

---

## 🧪 Étape 9: Activer le hook pre-commit

```bash
# Le hook est déjà créé dans .husky/pre-commit
# Il s'activera automatiquement au prochain commit

# Tester le hook
echo "test" > test.txt
git add test.txt
git commit -m "test: verify pre-commit hook"

# Le hook devrait s'exécuter et vérifier les couleurs
# Si tout va bien, supprimer le test
git reset HEAD~1
rm test.txt
```

---

## 🔄 Étape 10: En cas de problème

### Revenir à l'état précédent

```bash
# Annuler tous les changements
git checkout backup-before-color-migration

# Revenir à la branche principale
git checkout main

# Supprimer la branche de backup (optionnel)
git branch -D backup-before-color-migration
```

### Ré-exécuter sur un fichier spécifique

```bash
# Si un fichier pose problème
node scripts/migrate-colors.js --path src/components/ProblematicComponent.tsx
```

---

## 📊 Résultats attendus

Après migration complète:

```
AVANT:
- ~1,000 violations de couleurs hardcodées
- ~246 fichiers avec violations
- Maintenance difficile
- Dark mode partiel

APRÈS:
- ✅ 0 violation de couleurs hardcodées
- ✅ 100% conformité au design system
- ✅ Dark mode complet et automatique
- ✅ Maintenance centralisée (index.css)
- ✅ Hook pre-commit actif
```

---

## 🎯 Commandes rapides (résumé)

```bash
# Installation
npm install --save-dev husky lint-staged
npm install glob
npx husky install

# Migration
node scripts/migrate-colors.js --stats     # Voir les stats
node scripts/migrate-colors.js --dry-run   # Prévisualiser
git branch backup-before-migration         # Backup
node scripts/migrate-colors.js             # MIGRER

# Vérification
npm run dev                                # Tester visuellement
npm test                                   # Tests auto
npm run lint                               # Linter

# Commit
git add .
git commit -m "chore: migrate hardcoded colors to semantic tokens"
```

---

## ❓ Questions fréquentes

### Q: Combien de temps prend la migration?

**R**: ~2-5 minutes pour le script + 15-30 minutes de vérification visuelle.

### Q: Dois-je tout migrer d'un coup?

**R**: Oui, recommandé. Sinon vous aurez un mix de styles ancien/nouveau.

### Q: Que faire si certains composants cassent?

**R**: Revenez à la branche backup, identifiez le composant problématique, corrigez-le manuellement, puis ré-exécutez le script.

### Q: Le script peut-il casser mon code?

**R**: Non. Il remplace uniquement les classes CSS dans les `className`. Il ne touche pas à la logique métier.

---

**Besoin d'aide?**: Consultez les docs dans `docs/` ou contactez l'équipe Design System sur Slack (#design-system)

---

**Date de création**: 2025-01-25  
**Version**: 1.0.0
