# 🚀 Quick Start - Migration des couleurs hardcodées

## ⚡ TL;DR - Commandes essentielles

```bash
# 1. Installer les dépendances
npm install --save-dev husky lint-staged && npm install glob

# 2. Voir combien de violations existent
node scripts/migrate-colors.js --stats

# 3. Prévisualiser les changements
node scripts/migrate-colors.js --dry-run

# 4. Créer un backup
git branch backup-before-migration

# 5. MIGRER (applique tous les changements)
node scripts/migrate-colors.js

# 6. Tester
npm run dev

# 7. Commit
git add . && git commit -m "chore: migrate hardcoded colors to semantic tokens"
```

---

## 📊 Que va faire le script?

Le script va scanner **TOUS les fichiers .tsx et .ts** dans le dossier `src/` et:

1. **Détecter** ~900-1000 couleurs hardcodées (ex: `bg-blue-50`, `text-green-600`)
2. **Remplacer** par des tokens sémantiques (ex: `bg-primary/10`, `text-success`)
3. **Modifier** ~200-250 fichiers automatiquement
4. **Supprimer** les classes dark mode redondantes (`dark:bg-blue-500` → supprimé car géré par le token)

---

## ⚠️ IMPORTANT - À faire AVANT d'exécuter

### ✅ Checklist pré-migration

- [ ] Commit ou stash tous vos changements en cours
- [ ] Créer une branche de backup: `git branch backup-before-migration`
- [ ] Vérifier que vous êtes sur la bonne branche: `git branch --show-current`
- [ ] Installer les dépendances: `npm install glob`

### ❌ Ne PAS exécuter si:

- ❌ Vous avez des changements non commités
- ❌ Vous n'avez pas créé de branche de backup
- ❌ Vous n'avez pas lu la section "Résultats attendus" ci-dessous

---

## 📈 Résultats attendus

### Statistiques (étape 1: --stats)

```
📊 STATISTIQUES DE MIGRATION
════════════════════════════════════════

📁 Fichiers analysés:     ~900-1000
✏️  Fichiers modifiés:     ~220-250
🔄 Total remplacements:   ~900-1000

📈 Top 10 couleurs remplacées:
   1. bg-blue-50           → 45 fois
   2. text-gray-600        → 38 fois
   3. text-green-600       → 29 fois
   4. bg-amber-50          → 27 fois
   5. text-red-600         → 23 fois
   6. border-gray-200      → 21 fois
   7. text-blue-600        → 19 fois
   8. bg-green-50          → 17 fois
   9. text-amber-600       → 15 fois
   10. bg-red-50           → 14 fois
```

### Changements typiques (étape 2: --dry-run)

```
📝 src/components/ui/MyComponent.tsx
   Ligne 15: bg-blue-50 → bg-primary/10
   Ligne 22: text-green-600 → text-success
   Ligne 35: border-red-200 → border-destructive/20
   Ligne 48: dark:bg-blue-900/20 → (removed)
   Ligne 51: dark:text-green-400 → (removed)
```

### Impact Git (après migration)

```bash
$ git status
Modified:   ~220-250 files
Changes:    ~900-1000 lines changed
```

---

## 🔍 Vérifications post-migration

### 1. Test visuel rapide

```bash
npm run dev
```

Vérifier **en 2 minutes**:
1. Page d'accueil s'affiche correctement
2. Toggle light/dark mode fonctionne
3. Badges ont les bonnes couleurs
4. Pas de texte invisible

### 2. Test complet (recommandé)

- [ ] Dashboard
- [ ] Formulaires
- [ ] Composants accessibility/
- [ ] Composants admin/
- [ ] Composants music/
- [ ] Alertes et notifications
- [ ] Modales et dialogs

### 3. Tests automatisés

```bash
npm run lint   # Doit passer sans erreurs
npm test       # Si vous avez des tests
```

---

## 🆘 En cas de problème

### Problème: Texte invisible après migration

**Cause**: Mauvaise combinaison de variant et classe

**Solution**:
```tsx
// ❌ Problème
<Alert variant="default">
  <span className="text-destructive">Error</span>
</Alert>

// ✅ Solution
<Alert variant="destructive">
  <span>Error</span>  {/* Hérite de la couleur du variant */}
</Alert>
```

### Problème: Certains fichiers n'ont pas été migrés

**Cause**: Couleurs dans des endroits non supportés (style inline, props, CSS)

**Solution**: Migrer manuellement ces fichiers
```tsx
// Non détecté par le script (à corriger manuellement)
<Component style={{ color: '#blue' }} />
<Component color="blue-500" />
```

### Problème: Le script a fait une erreur

**Solution**: Revenir en arrière et corriger manuellement
```bash
# Annuler tous les changements
git checkout backup-before-migration

# Corriger le fichier problématique manuellement
# Puis ré-exécuter le script en excluant ce fichier
```

---

## 🎯 Hook pre-commit (automatique)

Après cette migration, le hook pre-commit **bloquera automatiquement** tout nouveau commit contenant des couleurs hardcodées.

### Tester le hook

```bash
# Créer un fichier test avec couleur hardcodée
echo 'export const Test = () => <div className="bg-blue-500">Test</div>' > test.tsx

# Essayer de commit
git add test.tsx
git commit -m "test"

# Résultat attendu:
# 🔴 COMMIT BLOQUÉ - Couleurs hardcodées détectées!
```

### Bypass le hook (urgence seulement)

```bash
git commit --no-verify -m "hotfix: critical fix"
```

---

## 📚 Documentation complète

Pour plus de détails:
- [Guide complet de migration](./MIGRATION_GUIDE.md)
- [Instructions d'exécution détaillées](./EXECUTION_INSTRUCTIONS.md)
- [Guide du Design System](./DESIGN_SYSTEM_GUIDE.md)

---

## ✅ Checklist finale

Avant de considérer la migration comme terminée:

- [ ] Script exécuté avec succès (0 erreurs)
- [ ] Tests visuels OK (light + dark)
- [ ] `npm run lint` passe sans erreur
- [ ] Hook pre-commit actif et testé
- [ ] Branche de backup créée
- [ ] Changements commités
- [ ] PR créée et reviewée

---

**Temps estimé total**: 30-45 minutes  
**Difficulté**: ⭐⭐☆☆☆ (Facile avec le script automatique)

---

**Vous êtes prêt!** 🚀  
Exécutez les commandes ci-dessus et consultez les autres docs en cas de besoin.
