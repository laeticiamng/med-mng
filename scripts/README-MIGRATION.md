# 🎨 Guide d'Utilisation - Script de Migration Design System

## Vue d'Ensemble

Ce script automatise la migration des couleurs hardcodées vers les tokens sémantiques du design system MED-MNG.

**Cible:** 393 violations dans 146 fichiers  
**Patterns:** 50+ remplacements de couleurs  
**Backup:** Automatique avant application

---

## 📋 Utilisation

### 1. Mode Dry Run (Aperçu) - Recommandé en premier

```bash
node scripts/migrate-design-system.js
```

**Ce que fait cette commande:**
- ✅ Scanne tous les fichiers `src/**/*.tsx`
- ✅ Détecte les violations du design system
- ✅ Affiche les remplacements qui seraient faits
- ✅ Génère un rapport `migration-report.json`
- ❌ N'applique **AUCUN** changement

**Output exemple:**
```
📊 RAPPORT DE MIGRATION
========================
📁 Fichiers scannés: 154
✏️  Fichiers modifiés: 89
🔄 Total remplacements: 393

🎨 Remplacements par pattern:
   text-white          → text-primary-foreground     (87x)
   bg-white            → bg-card                      (62x)
   text-gray-600       → text-muted-foreground        (45x)
```

---

### 2. Appliquer les Changements

⚠️ **IMPORTANT:** Vérifiez d'abord le dry run et le rapport JSON !

```bash
node scripts/migrate-design-system.js --apply
```

**Ce que fait cette commande:**
- ✅ Crée un backup complet dans `.migration-backup/`
- ✅ Applique tous les remplacements
- ✅ Modifie les fichiers en place
- ✅ Génère un rapport final

---

### 3. Mode Fichier Unique (Pour tests)

```bash
# Dry run sur un seul fichier
node scripts/migrate-design-system.js --file src/components/ai/AIChat.tsx

# Appliquer sur un seul fichier
node scripts/migrate-design-system.js --apply --file src/components/ai/AIChat.tsx
```

---

## 🎨 Patterns de Migration

### Texte Blanc/Noir
```typescript
// AVANT                    // APRÈS
text-white          →      text-primary-foreground
text-black          →      text-foreground
```

### Backgrounds
```typescript
bg-white            →      bg-card
bg-black            →      bg-background
bg-white/95         →      bg-card/95
bg-black/50         →      bg-background/50
```

### Couleurs de Statut
```typescript
// Rouge (Destructive)
text-red-600        →      text-destructive
bg-red-500          →      bg-destructive
bg-red-100          →      bg-destructive/10

// Vert (Success)
text-green-600      →      text-success
bg-green-500        →      bg-success
bg-green-100        →      bg-success/10

// Jaune (Warning)
text-yellow-600     →      text-warning
bg-yellow-500       →      bg-warning

// Bleu (Primary)
text-blue-600       →      text-primary
bg-blue-500         →      bg-primary
hover:text-blue-600 →      hover:text-primary
```

### Couleurs Grises (Muted)
```typescript
text-gray-600       →      text-muted-foreground
text-gray-500       →      text-muted-foreground
bg-gray-50          →      bg-muted
bg-gray-100         →      bg-muted
border-gray-300     →      border-border
hover:bg-gray-50    →      hover:bg-muted
```

### Gradients
```typescript
bg-gradient-to-r from-purple-600 to-blue-600 text-white
→ bg-gradient-medical text-primary-foreground

bg-gradient-to-br from-blue-500 to-purple-500
→ bg-gradient-to-br from-primary to-accent
```

---

## 📊 Rapport de Migration

Le script génère un fichier `migration-report.json` avec:

```json
{
  "date": "2025-11-10T...",
  "mode": "applied", // ou "dry-run"
  "stats": {
    "filesScanned": 154,
    "filesModified": 89,
    "totalReplacements": 393,
    "replacementsByPattern": {
      "text-white": 87,
      "bg-white": 62,
      // ...
    },
    "errors": []
  }
}
```

---

## 🔄 Workflow Recommandé

### Étape 1: Dry Run
```bash
# 1. Aperçu des changements
node scripts/migrate-design-system.js

# 2. Vérifier le rapport
cat migration-report.json

# 3. Vérifier les fichiers les plus impactés
# (regarder la console pour les détails)
```

### Étape 2: Git Commit (Sécurité)
```bash
# Commit avant migration (au cas où)
git add .
git commit -m "chore: before design system migration"
```

### Étape 3: Migration
```bash
# Appliquer les changements
node scripts/migrate-design-system.js --apply

# Vérifier le résultat
git diff
```

### Étape 4: Tests
```bash
# Build TypeScript
npm run type-check

# Build projet
npm run build

# Tests (si configurés)
npm test
```

### Étape 5: Vérification Visuelle
- Ouvrir l'app en mode light
- Basculer en dark mode
- Vérifier les pages critiques:
  - SecurityDashboard
  - AIChat
  - Dashboard
  - EdnComplete

### Étape 6: Commit Final
```bash
git add .
git commit -m "feat: migrate to semantic design tokens (393 violations fixed)"
```

---

## 🛟 Restauration (Si Problème)

### Option 1: Git Reset
```bash
git reset --hard HEAD~1
```

### Option 2: Backup Manuel
```bash
# Les backups sont dans .migration-backup/
cp -r .migration-backup/src/* src/
```

---

## 🧪 Tests Recommandés

### 1. Vérification Automatique
```bash
# Compter violations restantes (devrait être ~0)
grep -r "text-white\|text-black\|bg-white\|bg-black" src/ | wc -l

# Vérifier patterns spécifiques
grep -r "text-red-600\|text-green-600\|text-blue-600" src/ | wc -l
```

### 2. Tests Visuels
- [ ] Page d'accueil (Index)
- [ ] SecurityDashboard
- [ ] AlertsAnalyticsDashboard
- [ ] AIChat
- [ ] Dashboard
- [ ] EdnComplete
- [ ] AppFooter
- [ ] Navigation

### 3. Tests Dark Mode
Basculer en dark mode et vérifier:
- [ ] Pas de texte invisible (blanc sur blanc)
- [ ] Contraste suffisant partout
- [ ] Boutons lisibles
- [ ] Formulaires visibles

---

## 📈 Impact Attendu

### Avant Migration
- ❌ 393 violations détectées
- ❌ Dark mode inconsistant
- ❌ Maintenance difficile
- ❌ Non conforme design system

### Après Migration
- ✅ 0 violation (objectif)
- ✅ Dark mode cohérent
- ✅ Maintenance simplifiée
- ✅ 100% design system compliant

### Performance
- Aucun impact négatif
- Même bundle size
- Meilleure cohérence CSS

---

## ❓ FAQ

**Q: Le script est-il sûr ?**  
R: Oui, il crée un backup complet avant toute modification. Vous pouvez toujours restaurer via Git ou le backup.

**Q: Combien de temps ça prend ?**  
R: ~5 secondes pour scanner, ~10 secondes pour appliquer tous les changements.

**Q: Que faire si j'ai des erreurs TypeScript après ?**  
R: C'est rare. Si ça arrive, vérifiez le rapport `migration-report.json` section "errors" et corrigez manuellement.

**Q: Puis-je exclure certains fichiers ?**  
R: Oui, modifiez le pattern glob dans le script (ligne `const files = await glob(...)`).

**Q: Le script gère-t-il les fichiers .ts (non .tsx) ?**  
R: Non, uniquement .tsx. Les fichiers .ts purs ont rarement des classes CSS.

---

## 🚀 Prochaines Étapes

Après la migration:

1. **Vérifier le résultat** (dry run + rapport)
2. **Appliquer les changements** (--apply)
3. **Tests automatiques** (build + type-check)
4. **Tests visuels** (light + dark mode)
5. **Commit** (avec message descriptif)
6. **Documenter** (mettre à jour REFACTORING_SUMMARY.md)

---

## 📞 Support

En cas de problème:
1. Vérifier `migration-report.json` pour les détails
2. Consulter `.migration-backup/` pour restaurer
3. Utiliser `git diff` pour voir les changements
4. Créer une issue avec le rapport et le contexte

---

**Auteur:** MED-MNG Team  
**Version:** 1.0.0  
**Dernière mise à jour:** 2025-11-10
