# Configuration de Chromatic pour tests visuels

Ce guide vous explique comment configurer Chromatic pour les tests de régression visuelle automatisés.

## 📋 Prérequis

- ✅ Storybook 9.x (déjà installé)
- ✅ Package `chromatic` v13.3.3 (déjà installé)
- ✅ Fichier `chromatic.config.json` (déjà présent)

## 🚀 Configuration rapide

### Étape 1: Ajouter le script npm

Le script `chromatic` doit être ajouté dans `package.json`. **Important**: Vous devez demander à Lovable d'ajouter cette ligne ou l'ajouter manuellement:

```json
{
  "scripts": {
    "chromatic": "chromatic"
  }
}
```

### Étape 2: Obtenir votre Project Token

1. Créez un compte sur [chromatic.com](https://www.chromatic.com/)
2. Créez un nouveau projet Storybook
3. Copiez le **Project Token** fourni
4. Notez également le **Project ID** visible dans l'URL

### Étape 3: Configurer les variables d'environnement

#### Option A: Développement local

Créez un fichier `.env.local` à la racine:

```bash
CHROMATIC_PROJECT_TOKEN=chpt_xxxxxxxxxxxxxxxxxx
```

**Important**: Vérifiez que `.env.local` est dans le `.gitignore` !

#### Option B: GitHub Actions (Production)

1. Allez dans **Settings** → **Secrets and variables** → **Actions**
2. Ajoutez un nouveau secret:
   - **Name**: `CHROMATIC_PROJECT_TOKEN`
   - **Value**: Votre token Chromatic

### Étape 4: Mettre à jour chromatic.config.json

Remplacez `VOTRE_PROJECT_ID` par votre vrai Project ID:

```json
{
  "projectId": "chpt_xxxxxxxxxxxxxxxxxx",
  "buildScriptName": "build-storybook",
  "exitZeroOnChanges": true,
  "exitOnceUploaded": true,
  "onlyChanged": true,
  "externals": ["public/**"],
  "skip": "dependabot/**",
  "autoAcceptChanges": "main"
}
```

## 📝 Utilisation

### Commandes disponibles

```bash
# Démarrer Storybook localement
npm run storybook

# Build Storybook pour production
npm run build-storybook

# Lancer les tests Chromatic
npm run chromatic
```

### Workflow de développement

1. **Développez votre composant** avec Storybook
2. **Créez les stories** pour tous les états
3. **Testez localement**: `npm run storybook`
4. **Lancez Chromatic**: `npm run chromatic`
5. **Reviewez les changements** sur chromatic.com

## 🤖 GitHub Actions

Créez `.github/workflows/chromatic.yml`:

```yaml
name: Chromatic Visual Tests

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Chromatic
        uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          buildScriptName: build-storybook
          onlyChanged: true
          exitZeroOnChanges: true
```

## 🎯 Configuration actuelle

Le projet est configuré avec les optimisations suivantes:

- ✅ **onlyChanged**: Teste uniquement les stories modifiées (économise les crédits)
- ✅ **exitZeroOnChanges**: Ne bloque pas le CI si changements détectés
- ✅ **exitOnceUploaded**: Ne pas attendre les résultats (plus rapide)
- ✅ **autoAcceptChanges**: Accepte auto les changements sur la branche main
- ✅ **skip**: Ignore les PRs de Dependabot

## 📊 Métriques

Chromatic fournit:
- 📸 Screenshots automatiques de toutes les stories
- 🔍 Comparaisons visuelles pixel-perfect
- 📈 Historique des changements
- ✅ Review workflow intégré aux PRs

## 🔐 Sécurité

**⚠️ IMPORTANT**:
- Ne commitez JAMAIS votre token dans le code
- Utilisez toujours `.env.local` ou GitHub secrets
- Vérifiez que `.env.local` est dans `.gitignore`

## 🆘 Troubleshooting

### Erreur: "Missing project token"

```bash
# Vérifiez que la variable d'environnement est définie
echo $CHROMATIC_PROJECT_TOKEN

# Ou vérifiez .env.local
cat .env.local
```

### Erreur: "Build failed"

```bash
# Testez le build localement
npm run build-storybook

# Vérifiez les erreurs TypeScript
npm run type-check
```

### Erreur: "Invalid project ID"

Vérifiez que `chromatic.config.json` contient le bon `projectId` (pas le token, l'ID du projet visible dans l'URL Chromatic).

## 📚 Documentation complète

Pour plus de détails, consultez:
- 📖 [Documentation Storybook interne](?path=/docs/documentation-chromatic-visual-testing--docs)
- 🌐 [Documentation officielle Chromatic](https://www.chromatic.com/docs/)
- 💻 [Chromatic CLI](https://www.chromatic.com/docs/cli)

## 🎓 Prochaines étapes

1. ✅ Ajoutez le script `chromatic` dans package.json
2. ✅ Configurez votre token
3. ✅ Lancez votre premier build: `npm run chromatic`
4. ✅ Reviewez les résultats sur chromatic.com
5. ✅ Configurez GitHub Actions pour automatiser

---

**Besoin d'aide?** Consultez la story Storybook "Chromatic Guide" pour un guide visuel complet.
