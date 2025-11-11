# 🤖 GitHub Actions - Chromatic CI/CD

## 📋 Vue d'ensemble

Ce document explique le workflow GitHub Actions qui exécute automatiquement les tests visuels Chromatic sur chaque PR et bloque le merge en cas de régressions.

---

## 🔧 Configuration

### 1️⃣ Fichier workflow

**Chemin** : `.github/workflows/chromatic.yml`

Le workflow se déclenche sur :
- ✅ Push sur `main` et `develop`
- ✅ Ouverture/mise à jour de Pull Request
- ✅ Synchronisation de PR

### 2️⃣ Secrets GitHub requis

Vous **devez** configurer le secret suivant :

1. Allez sur **GitHub** → **Settings** → **Secrets and variables** → **Actions**
2. Cliquez sur **New repository secret**
3. Ajoutez :
   - **Name** : `CHROMATIC_PROJECT_TOKEN`
   - **Value** : Votre token Chromatic (commence par `chpt_`)

**Où trouver le token ?**
- Sur [chromatic.com](https://www.chromatic.com/)
- Dans les settings de votre projet Chromatic
- Section "Manage" → "Configure"

---

## 🚀 Comment ça marche

### Étapes du workflow

1. **📥 Checkout code** - Clone le repository avec historique complet
2. **📦 Setup Node.js** - Installe Node.js 20 avec cache npm
3. **🔧 Install dependencies** - Installe les dépendances (`npm ci`)
4. **🏗️ Build Storybook** - Build Storybook pour production
5. **📸 Run Chromatic** - Exécute les tests visuels
6. **📊 Comment on PR** - Poste un commentaire avec les résultats
7. **❌ Fail on regressions** - Bloque le merge si régressions détectées

### Comportements

#### ✅ Sur la branche `main`

- Les tests s'exécutent
- Les changements sont **auto-acceptés** (`autoAcceptChanges: main`)
- Le build ne fail pas
- Utile pour établir la baseline

#### ⚠️ Sur les Pull Requests

- Les tests s'exécutent
- Si **0 changement** : ✅ Check vert, merge autorisé
- Si **changements détectés** : ❌ Check rouge, merge bloqué
- Un commentaire automatique est posté sur la PR avec :
  - Nombre de changements
  - Liens vers Chromatic et Storybook
  - Instructions pour review

---

## 📊 Exemple de résultats

### ✅ Pas de changements

```
🎨 Chromatic Visual Tests Results

✅ No visual changes detected - All components look good!

📊 Reports
- View Chromatic Build
- View Storybook Preview

---
💡 Tip: Use the DevTools (Ctrl+Shift+D) to inspect component tokens while reviewing.
```

**Status** : ✅ Check vert → Merge autorisé

### ⚠️ Changements détectés

```
🎨 Chromatic Visual Tests Results

⚠️ 3 visual change(s) detected

Please review the changes on Chromatic before merging.

📊 Reports
- View Chromatic Build
- View Storybook Preview

---
💡 Tip: Use the DevTools (Ctrl+Shift+D) to inspect component tokens while reviewing.
```

**Status** : ❌ Check rouge → Merge bloqué

---

## 🔄 Workflow développeur

### 1. Créer une branche

```bash
git checkout -b feature/new-component
```

### 2. Développer et commit

```bash
# Créer le composant
# Créer la story dans src/stories/VisualRegressionTests.stories.tsx
git add .
git commit -m "feat: add new component"
git push origin feature/new-component
```

### 3. Ouvrir une PR

Sur GitHub, le workflow se déclenche automatiquement :

```
Checks
  🎨 Chromatic Visual Tests / Run Visual Tests
  ⏳ In progress...
```

### 4. Attendre les résultats (5-10 min)

Le workflow :
- Build Storybook
- Upload vers Chromatic
- Compare avec la baseline
- Poste un commentaire

### 5. Reviewer les changements

Si changements détectés :

1. **Cliquer sur le lien Chromatic** dans le commentaire
2. **Comparer avant/après** pour chaque story
3. **Accepter** si changements intentionnels
4. **Rejeter** si régressions non souhaitées

### 6. Re-push si nécessaire

Si changements rejetés :

```bash
# Fix le problème
git add .
git commit -m "fix: visual regression"
git push
# Le workflow se relance automatiquement
```

### 7. Merge

Une fois tous les checks verts : ✅ Merge autorisé

---

## 🎯 Optimisations

### Réduire le temps d'exécution

Le workflow utilise déjà plusieurs optimisations :

```yaml
onlyChanged: true        # Teste uniquement les stories modifiées
exitOnceUploaded: false  # Attendre les résultats
autoAcceptChanges: main  # Auto-accept sur main
```

### Réduire la consommation de crédits

Le `chromatic.config.json` est configuré pour :

```json
{
  "onlyChanged": true,
  "exitZeroOnChanges": true,
  "exitOnceUploaded": true,
  "skip": "dependabot/**"
}
```

### Skip CI pour commits mineurs

```bash
# Ajouter [skip ci] dans le commit message
git commit -m "docs: update README [skip ci]"
```

---

## 🛠️ Troubleshooting

### ❌ Workflow fails : "Missing CHROMATIC_PROJECT_TOKEN"

**Solution** :
1. Aller sur GitHub → Settings → Secrets → Actions
2. Vérifier que `CHROMATIC_PROJECT_TOKEN` existe
3. Si manquant, l'ajouter avec votre token Chromatic

### ❌ Workflow fails : "Build failed"

**Causes possibles** :
- Erreurs TypeScript
- Erreurs dans les stories
- Dépendances manquantes

**Solution** :
```bash
# Tester localement
npm run build-storybook

# Si erreurs, fix puis commit
git add .
git commit -m "fix: storybook build errors"
git push
```

### ⚠️ Trop de changements détectés

**Causes possibles** :
- Animations non pausées
- Contenu dynamique (dates, random)
- Fonts non chargées

**Solution** :
```tsx
// Dans la story
parameters: {
  chromatic: {
    pauseAnimationAtEnd: true,
    delay: 1000,
  },
}
```

### 🐌 Workflow trop lent

**Solution** : Activer le cache npm (déjà fait)

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'  # ✅ Déjà activé
```

---

## 📈 Monitoring

### Voir l'historique des builds

1. **GitHub** → **Actions** → **Chromatic Visual Tests**
2. Voir tous les runs passés
3. Cliquer sur un run pour voir les détails

### Métriques Chromatic

Sur chromatic.com :
- **Builds** : Nombre total de builds
- **Snapshots** : Screenshots capturés
- **Changes** : Changements détectés
- **Credits** : Consommation

---

## 🔒 Sécurité

### Permissions

Le workflow a les permissions minimales nécessaires :

```yaml
permissions:
  contents: read        # Lecture du code
  pull-requests: write  # Commentaires sur PR
```

### Secrets

- ✅ `CHROMATIC_PROJECT_TOKEN` est stocké en secret GitHub
- ✅ Jamais exposé dans les logs
- ✅ Accessible uniquement au workflow

---

## 🎓 Best Practices

### ✅ DO

- Toujours reviewer les changements sur Chromatic
- Accepter uniquement les changements intentionnels
- Merger uniquement avec check vert
- Documenter les changements visuels dans la PR description

### ❌ DON'T

- Bypasser le check Chromatic
- Merger avec changements non reviewés
- Ignorer les warnings
- Committer sans tester localement

---

## 📚 Ressources

### Documentation interne
- `docs/DEVTOOLS_CHROMATIC_GUIDE.md` - Guide complet
- `docs/CHROMATIC_WORKFLOW.md` - Workflow détaillé
- `README_CHROMATIC.md` - Setup initial

### GitHub Actions
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Chromatic Action](https://github.com/chromaui/action)

### Chromatic
- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [CI/CD Integration](https://www.chromatic.com/docs/ci)

---

## ✅ Checklist Setup

Avant le premier merge :

- [ ] Secret `CHROMATIC_PROJECT_TOKEN` configuré
- [ ] Workflow `.github/workflows/chromatic.yml` présent
- [ ] Script `chromatic` dans package.json
- [ ] Config `chromatic.config.json` avec bon projectId
- [ ] Build Storybook fonctionne localement
- [ ] Au moins une story créée
- [ ] Workflow testé sur une PR de test

---

**Setup complet !** Le workflow bloquera automatiquement les régressions visuelles. 🎉
