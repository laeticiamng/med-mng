# Configuration GitHub Actions pour Chromatic

Ce guide explique comment configurer l'automatisation des tests visuels Chromatic via GitHub Actions.

## 🎯 Objectif

Automatiser les tests visuels Chromatic sur chaque pull request pour :
- ✅ Détecter automatiquement les régressions visuelles
- ✅ Commenter les PRs avec les résultats
- ✅ Bloquer ou alerter en cas de changements non approuvés
- ✅ Maintenir un historique visuel du design system

## 📋 Prérequis

1. **Repository GitHub connecté** à votre projet Lovable
2. **Compte Chromatic** avec un projet configuré
3. **Project Token** Chromatic (format: `chpt_xxxxx`)

## 🚀 Configuration

### Étape 1: Ajouter le secret GitHub

1. Allez dans votre repository GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Cliquez sur **New repository secret**
4. Ajoutez:
   - **Name**: `CHROMATIC_PROJECT_TOKEN`
   - **Secret**: Votre token Chromatic (obtenu sur chromatic.com)

### Étape 2: Vérifier le workflow

Le workflow `.github/workflows/chromatic.yml` est déjà créé et configuré avec:

#### Job principal: `chromatic`
```yaml
- Checkout du code avec historique complet
- Installation de Node.js 20 avec cache npm
- Installation des dépendances (npm ci)
- Exécution de Chromatic avec optimisations
- Publication des résultats dans les PRs
- Upload des artifacts en cas d'erreur
```

#### Job statistiques: `storybook-stats`
```yaml
- Comptage des stories
- Publication des statistiques dans les PRs
```

### Étape 3: Configuration Chromatic

Vérifiez que `chromatic.config.json` contient:

```json
{
  "projectId": "VOTRE_PROJECT_ID",
  "buildScriptName": "build-storybook",
  "exitZeroOnChanges": true,
  "exitOnceUploaded": true,
  "onlyChanged": true,
  "autoAcceptChanges": "main"
}
```

## 🔄 Fonctionnement

### Déclenchement

Le workflow se déclenche automatiquement sur:
- ✅ Push vers `main` ou `develop`
- ✅ Ouverture, synchronisation ou réouverture de PR

### Workflow PR typique

1. **Développeur crée une PR**
2. **GitHub Actions démarre** automatiquement
3. **Chromatic build** et capture les screenshots
4. **Comparaison** avec le baseline
5. **Bot GitHub commente** avec les résultats:
   ```
   ## 🎨 Chromatic Visual Tests
   
   ✅ Chromatic build successful
   
   📊 Build URL: https://chromatic.com/build?appId=...
   📚 Storybook: https://...
   🔄 Changes detected: 3
   
   ⚠️ Visual changes detected! Please review...
   ```

6. **Review des changements** sur Chromatic
7. **Approbation ou correction**
8. **Merge** une fois validé

## 🎯 Optimisations incluses

### Économie de crédits
- ✅ `onlyChanged: true` - Teste uniquement les stories modifiées
- ✅ `exitOnceUploaded: true` - Ne pas attendre les résultats
- ✅ `skip: dependabot/**` - Ignore les PRs Dependabot

### Performance
- ✅ Cache npm pour builds plus rapides
- ✅ `fetch-depth: 0` pour comparaisons Git
- ✅ Parallélisation des jobs (chromatic + stats)

### UX
- ✅ Commentaires automatiques sur les PRs
- ✅ Summary détaillé dans les annotations GitHub
- ✅ Artifacts Storybook en cas d'échec

## 📊 Interprétation des résultats

### ✅ Aucun changement
```
✅ No visual changes detected. All components look good!
```
→ Peut merger sans review visuelle

### ⚠️ Changements détectés
```
⚠️ Visual changes detected! Please review...
🔄 Changes detected: 3
```
→ Cliquez sur le lien Chromatic pour review
→ Acceptez ou corrigez les changements
→ Re-run le workflow si corrections

### ❌ Build échoué
```
❌ Build failed. Check the workflow logs for details.
```
→ Vérifiez les logs du workflow
→ Souvent: erreur TypeScript ou import manquant
→ Fixez et pushez à nouveau

## 🔐 Sécurité

### Secrets GitHub
- ✅ Le token est stocké de manière sécurisée
- ✅ Jamais exposé dans les logs
- ✅ Accès limité aux membres autorisés

### Permissions
Le workflow nécessite:
- ✅ `contents: read` - Lire le code
- ✅ `pull-requests: write` - Commenter les PRs

## 🛠️ Personnalisation

### Modifier les branches surveillées

Éditez `.github/workflows/chromatic.yml`:
```yaml
on:
  push:
    branches:
      - main
      - develop
      - staging  # Ajoutez vos branches
```

### Désactiver l'auto-accept sur main

```yaml
autoAcceptChanges: false  # Au lieu de "main"
```

### Ajouter des notifications Slack

Ajoutez un step après Chromatic:
```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
```

## 🆘 Troubleshooting

### Erreur: "Missing project token"

✅ **Solution**: Vérifiez que le secret `CHROMATIC_PROJECT_TOKEN` est bien configuré dans GitHub

### Erreur: "Build Storybook failed"

✅ **Solution**: 
```bash
# Testez localement
npm run build-storybook
# Vérifiez les erreurs TypeScript
npm run type-check
```

### Erreur: "Invalid project ID"

✅ **Solution**: Vérifiez que `chromatic.config.json` contient le bon `projectId`

### Le workflow ne se déclenche pas

✅ **Solution**: 
- Vérifiez que le fichier est dans `.github/workflows/`
- Vérifiez la syntaxe YAML (indentation)
- Vérifiez les permissions GitHub Actions (Settings → Actions)

## 📚 Ressources

- 🌐 [Documentation Chromatic CI](https://www.chromatic.com/docs/ci)
- 🤖 [Chromatic GitHub Action](https://github.com/chromaui/action)
- 📖 [GitHub Actions Docs](https://docs.github.com/actions)
- 💬 [Community Support](https://discord.com/invite/chromatic)

## 🎓 Prochaines étapes

1. ✅ Vérifiez que le secret est configuré
2. ✅ Créez une PR de test
3. ✅ Vérifiez que le workflow se déclenche
4. ✅ Reviewez les résultats dans Chromatic
5. ✅ Configurez les règles de protection de branche

---

**Questions?** Consultez la documentation Storybook ou créez une issue dans le repository.
