# Configuration du Webhook GitHub

Ce guide explique comment configurer le webhook GitHub pour déclencher automatiquement les analyses de qualité lors des push et pull requests.

## URL du Webhook

```
https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/github-quality-webhook
```

## Configuration dans GitHub

### 1. Accéder aux paramètres du repository

1. Allez sur votre repository GitHub
2. Cliquez sur **Settings** > **Webhooks**
3. Cliquez sur **Add webhook**

### 2. Configurer le webhook

#### Payload URL
```
https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/github-quality-webhook
```

#### Content type
Sélectionnez `application/json`

#### Secret (optionnel mais recommandé)
Générez un secret aléatoire :
```bash
openssl rand -hex 32
```
Ajoutez ce secret dans les secrets Supabase sous le nom `GITHUB_WEBHOOK_SECRET`

#### Events
Sélectionnez les événements à surveiller :
- ✅ **Push** - Déclenche l'analyse après chaque push
- ✅ **Pull requests** - Déclenche l'analyse sur les PR

#### Active
✅ Cochez "Active"

### 3. Sauvegarder

Cliquez sur **Add webhook**

## Workflow GitHub Actions (Optionnel)

Pour une intégration encore plus poussée, créez un workflow GitHub Actions qui appelle l'API après les tests :

### `.github/workflows/quality-check.yml`

```yaml
name: Quality Analysis

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Récupérer tout l'historique pour l'analyse
      
      - name: Trigger Quality Analysis
        run: |
          curl -X POST \
            'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/github-quality-webhook' \
            -H 'Content-Type: application/json' \
            -H 'x-github-event: push' \
            -d '{
              "repository": {
                "name": "${{ github.event.repository.name }}",
                "full_name": "${{ github.repository }}",
                "html_url": "${{ github.event.repository.html_url }}"
              },
              "pusher": {
                "name": "${{ github.actor }}",
                "email": "${{ github.event.pusher.email }}"
              },
              "commits": ${{ toJson(github.event.commits) }},
              "ref": "${{ github.ref }}"
            }'
      
      - name: Wait for Analysis
        run: sleep 30
      
      - name: Check Results
        run: |
          echo "✅ Quality analysis triggered"
          echo "📊 Check your dashboard at /quality-dashboard"
```

## Ce que fait le webhook

Lorsqu'un événement GitHub est reçu, le webhook :

1. **Analyse les fichiers modifiés**
   - Extrait tous les fichiers de code (.ts, .tsx, .js, .jsx)
   - Liste les commits récents

2. **Appelle OpenAI GPT-4o-mini**
   - Analyse les changements de code
   - Évalue les risques de bugs
   - Détecte les vulnérabilités potentielles
   - Identifie les anti-patterns

3. **Enregistre le rapport**
   - Crée une entrée dans `code_quality_reports`
   - Stocke les métriques et recommandations

4. **Crée des notifications**
   - Si risque élevé ou critique
   - Enregistre dans `quality_notifications`

5. **Envoie des alertes email** (si critique)
   - Via la fonction `send-quality-alert`
   - Aux destinataires configurés

## Format de la réponse

### Succès (200)
```json
{
  "success": true,
  "message": "Analyse terminée",
  "analysis": {
    "risk_level": "medium",
    "bugs": 2,
    "vulnerabilities": 0,
    "code_smells": 5
  }
}
```

### Pas de fichiers de code (200)
```json
{
  "success": true,
  "message": "Aucun fichier de code modifié"
}
```

### Erreur (500)
```json
{
  "error": "Message d'erreur"
}
```

## Logs et débogage

### Vérifier les logs du webhook

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions/github-quality-webhook/logs)
2. Vérifiez les exécutions récentes
3. Recherchez les erreurs éventuelles

### Tester manuellement le webhook

```bash
curl -X POST \
  'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/github-quality-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-github-event: push' \
  -d '{
    "repository": {
      "name": "my-repo",
      "full_name": "user/my-repo",
      "html_url": "https://github.com/user/my-repo"
    },
    "pusher": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "commits": [
      {
        "id": "abc123",
        "message": "Fix authentication bug",
        "added": ["src/auth.ts"],
        "modified": ["src/components/Login.tsx"],
        "removed": []
      }
    ],
    "ref": "refs/heads/main"
  }'
```

### Vérifier dans GitHub

1. Allez sur **Settings** > **Webhooks** > Votre webhook
2. Cliquez sur l'onglet **Recent Deliveries**
3. Vérifiez les réponses et status codes

## Sécurité

### Recommandations

1. **Utilisez un secret webhook**
   - Ajoutez `GITHUB_WEBHOOK_SECRET` dans Supabase
   - Vérifiez la signature dans le code de la fonction

2. **Limitez les événements**
   - Ne surveillez que push et pull_request
   - Évitez d'autres événements non nécessaires

3. **Surveillez les logs**
   - Vérifiez régulièrement les exécutions
   - Alertez sur les erreurs répétées

### Vérification de signature (à implémenter)

```typescript
import { createHmac } from "https://deno.land/std@0.190.0/node/crypto.ts";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = createHmac("sha256", secret);
  hmac.update(payload);
  const digest = `sha256=${hmac.digest("hex")}`;
  return digest === signature;
}

// Dans le handler
const signature = req.headers.get("x-hub-signature-256");
const secret = Deno.env.get("GITHUB_WEBHOOK_SECRET")!;
const body = await req.text();

if (!verifySignature(body, signature, secret)) {
  return new Response("Invalid signature", { status: 401 });
}
```

## Coûts OpenAI

Chaque analyse utilise GPT-4o-mini :
- Coût estimé : ~$0.001 par analyse
- Pour 100 push/jour : ~$3/mois
- Modèle léger et rapide

## Limitations

- **Pas d'accès au code source complet** : Le webhook reçoit uniquement la liste des fichiers modifiés, pas leur contenu
- **Analyse basée sur les commits** : L'analyse est contextuelle aux changements, pas au code entier
- **Délai de traitement** : Environ 5-10 secondes par analyse

## Améliorations futures

- [ ] Ajouter la vérification de signature GitHub
- [ ] Analyser le contenu réel des fichiers (via GitHub API)
- [ ] Créer des commentaires automatiques sur les PR
- [ ] Intégrer avec GitHub Checks API
- [ ] Ajouter des badges de qualité dans les PR
