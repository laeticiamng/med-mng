# 🛡️ Configuration Branch Protection Rules GitHub

## 📋 Vue d'ensemble

Ce guide explique comment configurer les **Branch Protection Rules** sur GitHub pour **bloquer automatiquement les merges** si les tests d'accessibilité échouent, garantissant ainsi une conformité à 100% WCAG 2.1 AA / RGAA 4.1 en production.

---

## 🎯 Objectif

**Empêcher tout code non conforme d'atteindre la branche `main` en production.**

### Règles appliquées
- ✅ Tous les tests d'accessibilité doivent passer (100%)
- ✅ Score Lighthouse accessibilité ≥ 100/100
- ✅ Revue de code obligatoire (1 approbation minimum)
- ✅ Statuts CI/CD requis avant merge
- ✅ Pas de force push sur `main`

---

## 📝 Configuration Manuelle (Interface GitHub)

### Étape 1 : Accéder aux paramètres du repository

1. Allez sur votre repository GitHub
2. Cliquez sur **Settings** (Paramètres)
3. Dans le menu latéral gauche, cliquez sur **Branches**
4. Sous "Branch protection rules", cliquez sur **Add rule**

### Étape 2 : Configurer la règle pour `main`

#### 2.1 Branch name pattern
```
main
```

#### 2.2 Protect matching branches

**☑️ Require a pull request before merging**
- ☑️ Require approvals: `1`
- ☑️ Dismiss stale pull request approvals when new commits are pushed
- ☑️ Require review from Code Owners (optionnel)

**☑️ Require status checks to pass before merging**
- ☑️ Require branches to be up to date before merging

**Status checks requis** (cliquez sur le champ de recherche et sélectionnez):
```
✅ Tests Accessibilité (axe-core) / chromium
✅ Tests Accessibilité (axe-core) / firefox  
✅ Tests Accessibilité (axe-core) / webkit
✅ Audit Lighthouse Accessibilité
✅ Résumé Accessibilité
```

**☑️ Require conversation resolution before merging**
- Oblige à résoudre tous les commentaires de revue

**☑️ Require signed commits** (recommandé pour la sécurité)

**☑️ Require linear history** (optionnel, force rebase au lieu de merge commits)

**☑️ Do not allow bypassing the above settings**
- Empêche les admins de bypass (IMPORTANT)

**☑️ Restrict who can push to matching branches** (optionnel)
- Limiter les pushs directs à certains utilisateurs/équipes

#### 2.3 Rules applied to everyone including administrators

**☑️ Apply to administrators**
- CRITIQUE: même les admins doivent respecter les règles

### Étape 3 : Sauvegarder

Cliquez sur **Create** ou **Save changes**

---

## 🤖 Configuration Automatique (GitHub API)

### Prérequis

```bash
# Installer GitHub CLI
brew install gh  # macOS
# ou
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo gpg --dearmor -o /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list
sudo apt update && sudo apt install gh

# S'authentifier
gh auth login
```

### Script de configuration

Créez le fichier `scripts/setup-branch-protection.sh`:

```bash
#!/bin/bash

# Configuration Branch Protection pour MED-MNG
# Garantit 100% conformité accessibilité en production

REPO_OWNER="votre-username-ou-org"
REPO_NAME="med-mng"
BRANCH="main"

echo "🛡️ Configuration des Branch Protection Rules pour $REPO_OWNER/$REPO_NAME:$BRANCH"

gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "/repos/$REPO_OWNER/$REPO_NAME/branches/$BRANCH/protection" \
  -f "required_status_checks[strict]=true" \
  -f "required_status_checks[contexts][]=Tests Accessibilité (axe-core) / chromium" \
  -f "required_status_checks[contexts][]=Tests Accessibilité (axe-core) / firefox" \
  -f "required_status_checks[contexts][]=Tests Accessibilité (axe-core) / webkit" \
  -f "required_status_checks[contexts][]=Audit Lighthouse Accessibilité" \
  -f "required_status_checks[contexts][]=Résumé Accessibilité" \
  -f "enforce_admins=true" \
  -f "required_pull_request_reviews[dismiss_stale_reviews]=true" \
  -f "required_pull_request_reviews[require_code_owner_reviews]=false" \
  -f "required_pull_request_reviews[required_approving_review_count]=1" \
  -f "required_pull_request_reviews[require_last_push_approval]=false" \
  -f "required_conversation_resolution=true" \
  -f "required_linear_history=false" \
  -f "allow_force_pushes=false" \
  -f "allow_deletions=false" \
  -f "block_creations=false" \
  -f "required_signatures=true"

if [ $? -eq 0 ]; then
  echo "✅ Branch protection configurée avec succès !"
  echo ""
  echo "📋 Règles appliquées:"
  echo "  ✅ Tests accessibilité requis sur 3 navigateurs"
  echo "  ✅ Audit Lighthouse accessibilité obligatoire"
  echo "  ✅ 1 approbation de revue de code requise"
  echo "  ✅ Conversations doivent être résolues"
  echo "  ✅ Commits signés requis"
  echo "  ✅ Force push interdit"
  echo "  ✅ Suppression de branche interdite"
  echo "  ✅ Règles appliquées aux admins"
  echo ""
  echo "🎯 Conformité accessibilité garantie à 100% en production !"
else
  echo "❌ Erreur lors de la configuration"
  exit 1
fi
```

### Exécution du script

```bash
# Rendre le script exécutable
chmod +x scripts/setup-branch-protection.sh

# Configurer les variables
export REPO_OWNER="votre-username"
export REPO_NAME="med-mng"

# Exécuter
./scripts/setup-branch-protection.sh
```

---

## 📄 Configuration via JSON (API REST)

Créez le fichier `.github/branch-protection.json`:

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Tests Accessibilité (axe-core) / chromium",
      "Tests Accessibilité (axe-core) / firefox",
      "Tests Accessibilité (axe-core) / webkit",
      "Audit Lighthouse Accessibilité",
      "Résumé Accessibilité"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1,
    "require_last_push_approval": false
  },
  "required_conversation_resolution": true,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_signatures": true,
  "lock_branch": false,
  "allow_fork_syncing": true
}
```

### Application via curl

```bash
curl -X PUT \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/OWNER/REPO/branches/main/protection \
  -d @.github/branch-protection.json
```

---

## 🔍 Vérification de la Configuration

### Via l'interface GitHub

1. Allez sur votre repo → **Settings** → **Branches**
2. Vérifiez que la règle pour `main` affiche:
   ```
   ✅ Require status checks to pass before merging
   ✅ Require approvals
   ✅ Require conversation resolution
   ✅ Do not allow bypassing the above settings
   ```

### Via GitHub CLI

```bash
gh api \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/OWNER/REPO/branches/main/protection

# Vérifier les status checks requis
gh api \
  /repos/OWNER/REPO/branches/main/protection/required_status_checks \
  | jq '.contexts'
```

### Test manuel

Créez une PR avec du code non conforme:

```tsx
// Créez une branche de test
git checkout -b test/branch-protection

// Ajoutez du code avec violation d'accessibilité
// Par exemple, un bouton sans label
echo '<button onClick={handleClick}><Icon /></button>' > test.tsx

git add test.tsx
git commit -m "test: vérification branch protection"
git push origin test/branch-protection

// Créez une PR sur GitHub
// ❌ Le merge sera bloqué car les tests d'accessibilité échoueront
```

---

## 🚦 Comportement Attendu

### ✅ Cas 1 : Tests réussis

```
Pull Request #42: feat: ajout lecteur audio accessible

Checks:
✅ Tests Accessibilité (axe-core) / chromium
✅ Tests Accessibilité (axe-core) / firefox
✅ Tests Accessibilité (axe-core) / webkit
✅ Audit Lighthouse Accessibilité
✅ Résumé Accessibilité

Reviews:
✅ Approved by @reviewer

Status: ✅ Ready to merge
[Merge pull request] ← Bouton actif
```

### ❌ Cas 2 : Tests échoués

```
Pull Request #43: feat: nouveau composant

Checks:
❌ Tests Accessibilité (axe-core) / chromium (4 violations)
   - color-contrast: Bouton ligne 42 (ratio 3.1:1, requis 4.5:1)
   - button-name: Bouton sans label ligne 56
   - image-alt: Image sans alt ligne 78
   - heading-order: h3 avant h2 ligne 92
✅ Tests Accessibilité (axe-core) / firefox
✅ Tests Accessibilité (axe-core) / webkit
✅ Audit Lighthouse Accessibilité

Reviews:
✅ Approved by @reviewer

Status: ❌ Merge blocked
[Merge pull request] ← Bouton désactivé

⚠️ Required status check "Tests Accessibilité (axe-core) / chromium" has not passed.
Please resolve the failing checks before merging.
```

### 🔄 Cas 3 : Branch pas à jour

```
Pull Request #44: fix: correction styles

Checks:
⚠️ This branch is out-of-date with the base branch

Status: ⚠️ Update required
[Update branch] ← Bouton pour rebase
```

---

## 👥 Configuration pour Équipes

### Ajouter des Code Owners

Créez `.github/CODEOWNERS`:

```
# Accessibilité - Revue obligatoire par l'équipe A11y
/tests/accessibility-*.spec.ts @votre-org/accessibility-team
/src/components/ui/accessible.tsx @votre-org/accessibility-team
/docs/*ACCESSIBILITE*.md @votre-org/accessibility-team

# Frontend - Revue par l'équipe dev
/src/** @votre-org/frontend-team

# CI/CD - Revue par l'équipe DevOps
/.github/workflows/** @votre-org/devops-team
```

### Équipes recommandées

```
@votre-org/accessibility-team
  - Expert accessibilité
  - Développeur senior
  
@votre-org/frontend-team
  - Tous les devs frontend
  
@votre-org/devops-team
  - DevOps lead
  - SRE
```

---

## 🔧 Configuration Avancée

### Protection pour `develop` aussi

```bash
# Appliquer les mêmes règles sur develop
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/$REPO_OWNER/$REPO_NAME/branches/develop/protection" \
  -f "required_status_checks[strict]=true" \
  -f "required_status_checks[contexts][]=Tests Accessibilité (axe-core) / chromium" \
  # ... (mêmes règles que main)
```

### Rulesets (nouvelle fonctionnalité GitHub)

GitHub propose maintenant des **Rulesets** plus flexibles que les Branch Protection Rules.

Pour les configurer:
1. Settings → **Rulesets** (Beta)
2. New ruleset → New branch ruleset
3. Appliquer les mêmes règles que ci-dessus

**Avantages des Rulesets**:
- Règles applicables à plusieurs branches via patterns
- Héritage de règles
- Plus granulaire

---

## 📊 Monitoring

### Dashboard GitHub Actions

Créez un workflow pour monitorer les protections:

```yaml
# .github/workflows/monitor-branch-protection.yml
name: 🛡️ Vérification Branch Protection

on:
  schedule:
    - cron: '0 0 * * 0'  # Tous les dimanches à minuit
  workflow_dispatch:

jobs:
  check-protection:
    runs-on: ubuntu-latest
    steps:
      - name: Vérifier la protection de main
        run: |
          gh api /repos/${{ github.repository }}/branches/main/protection \
            | jq '.required_status_checks.contexts[]' \
            | grep -q "Tests Accessibilité" && echo "✅ Protection active" || echo "❌ Protection manquante"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Alertes Slack (optionnel)

Intégrez des notifications Slack quand une PR est bloquée:

```yaml
- name: Notifier Slack si tests échoués
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "❌ Tests d'accessibilité échoués sur PR #${{ github.event.pull_request.number }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "La PR *${{ github.event.pull_request.title }}* a échoué aux tests d'accessibilité.\n\nMerge bloqué jusqu'à résolution."
            }
          }
        ]
      }
```

---

## 🎓 Formation Équipe

### Message de sensibilisation

Envoyez ce message à votre équipe après configuration:

```
🛡️ NOUVELLE POLITIQUE: Protection des branches activée

À partir d'aujourd'hui, toutes les PR doivent passer les tests d'accessibilité avant merge.

✅ Ce qui est requis:
- Tous les tests axe-core doivent passer (0 violation)
- Score Lighthouse accessibilité ≥ 100
- 1 approbation de revue de code
- Toutes les conversations résolues

❌ Impossible de merger si:
- Tests d'accessibilité échouent
- Violations WCAG 2.1 AA détectées
- Pas d'approbation

📚 Ressources:
- Guide accessibilité: /docs/ACCESSIBILITE-100-CERTIFIEE.md
- Tests en local: npm run test:accessibility
- Support: #channel-accessibilite

🎯 Objectif: Maintenir 100% conformité WCAG 2.1 AA en production
```

---

## ❓ FAQ

### Q: Puis-je bypass temporairement pour un hotfix urgent?

**R**: Non, par design. Les règles sont appliquées même aux admins. Pour un hotfix:
1. Créez une PR
2. Corrigez les problèmes d'accessibilité
3. Attendez la validation des tests
4. Mergez normalement

### Q: Que faire si GitHub Actions est en panne?

**R**: GitHub permet un bypass manuel en cas de panne de leur infrastructure. Contactez votre admin GitHub.

### Q: Combien de temps prennent les tests?

**R**: ~5 minutes par navigateur en parallèle = ~5 minutes total.

### Q: Les tests sont-ils payants?

**R**: GitHub Actions offre 2000 minutes/mois gratuites (plan Free). Nos tests consomment ~15 min/jour = ~450 min/mois.

---

## ✅ Checklist de Configuration

Avant de déclarer la configuration terminée:

- [ ] Branch Protection Rule activée sur `main`
- [ ] Status checks requis configurés (5 au total)
- [ ] Enforcement pour admins activé
- [ ] Revue de code obligatoire (1 approbation)
- [ ] Conversations doivent être résolues
- [ ] Force push interdit
- [ ] Configuration testée avec une PR de test
- [ ] Équipe notifiée des nouvelles règles
- [ ] Documentation mise à jour
- [ ] CODEOWNERS créé (optionnel)

---

## 🎉 Résultat Final

**Une fois configuré:**

```
❌ IMPOSSIBLE de merger du code avec violations d'accessibilité
✅ 100% de conformité WCAG 2.1 AA garantie en production
🛡️ Protection automatique 24/7
📊 Transparence totale via PR checks
🚀 Qualité de code maintenue en permanence
```

---

## 📞 Support

**Problème de configuration**: Ouvrir une issue GitHub  
**Questions**: Voir la [documentation GitHub](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

**Prochaine révision**: 6 mois  
**Dernière mise à jour**: 7 novembre 2025
