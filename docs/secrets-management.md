# 🔐 Gestion des Secrets - MED-MNG

## Vue d'ensemble

Ce document décrit la gestion sécurisée des credentials et secrets dans la plateforme MED-MNG.

## ⚠️ Règles de sécurité CRITIQUES

### ❌ INTERDIT
- **Jamais** de credentials en dur dans le code
- **Jamais** de fallbacks avec valeurs par défaut (`|| 'default_value'`)
- **Jamais** de logs complets de credentials
- **Jamais** de commit de fichiers `.env` ou secrets

### ✅ OBLIGATOIRE
- **Toujours** utiliser les variables d'environnement Supabase
- **Toujours** masquer/anonymiser les logs sensibles
- **Toujours** valider la présence des secrets au démarrage
- **Toujours** faire l'audit avant chaque déploiement

## 📋 Variables d'environnement requises

### Edge Functions Supabase
```bash
# Configuration Supabase (gérée automatiquement)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# APIs externes (à configurer via Supabase Secrets)
OPENAI_API_KEY=sk-xxx...
ELEVENLABS_API_KEY=xxx...
SUNO_API_KEY=xxx...
```

### Frontend (clés publiques uniquement)
```typescript
// ✅ AUTORISÉ - Clés publiques
const SUPABASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

// ❌ INTERDIT - Clés privées
const OPENAI_API_KEY = 'sk-xxx...' // JAMAIS dans le frontend !
```

## 🔧 Configuration des secrets

### 1. Via Supabase Dashboard
1. Aller sur [Supabase Project Settings > Edge Functions](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/settings/functions)
2. Ajouter les secrets requis
3. Redéployer les edge functions

### 2. Via CLI Supabase (pour dev local)
```bash
# Définir un secret
supabase secrets set OPENAI_API_KEY=sk-xxx...

# Lister les secrets
supabase secrets list

# Supprimer un secret
supabase secrets unset OPENAI_API_KEY
```

## 📝 Utilisation dans le code

### ✅ Bonnes pratiques

```typescript
// Edge Function
const openAIKey = Deno.env.get('OPENAI_API_KEY');
if (!openAIKey) {
  throw new Error('OPENAI_API_KEY is required');
}

// Log sécurisé
console.log('Using OpenAI key:', openAIKey.substring(0, 8) + '...');

// Frontend - Utilisation via edge function uniquement
const { data } = await supabase.functions.invoke('openai-chat', {
  body: { message: 'Hello' }
});
```

### ❌ Anti-patterns

```typescript
// JAMAIS de fallback
const key = Deno.env.get('OPENAI_API_KEY') || 'default-key'; // ❌

// JAMAIS de log complet
console.log('API Key:', openAIKey); // ❌

// JAMAIS dans le frontend
const OPENAI_KEY = 'sk-xxx...'; // ❌
```

## 🔍 Audit automatique

### Script de détection
```bash
# Lancer l'audit de sécurité
chmod +x scripts/detect-secrets.sh
./scripts/detect-secrets.sh
```

### CI/CD Integration
Le script d'audit s'exécute automatiquement :
- À chaque push sur `main`
- À chaque pull request
- Avant chaque déploiement

### Exemple de sortie
```
🔍 AUDIT SÉCURITÉ - Détection des credentials sensibles
==================================================
✅ AUDIT SÉCURITÉ RÉUSSI - Aucun problème critique détecté
```

## 🚨 Que faire en cas de fuite

### 1. Révocation immédiate
- Révoquer la clé compromise sur le service concerné
- Générer une nouvelle clé
- Mettre à jour les secrets Supabase

### 2. Audit de l'impact
- Vérifier les logs d'accès du service
- Identifier les actions potentiellement malveillantes
- Documenter l'incident

### 3. Correction
- Nettoyer l'historique Git si nécessaire (`git filter-branch`)
- Mettre à jour la documentation
- Renforcer les contrôles

## 📋 Checklist de déploiement

- [ ] Audit secrets réussi (`./scripts/detect-secrets.sh`)
- [ ] Tous les secrets requis configurés sur Supabase
- [ ] Aucun credential en dur dans le code
- [ ] Logs anonymisés/masqués
- [ ] Tests d'intégration passés avec les vrais secrets
- [ ] Documentation à jour

## 🔗 Liens utiles

- [Supabase Secrets Management](https://supabase.com/docs/guides/functions/secrets)
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [ElevenLabs API Keys](https://elevenlabs.io/app/settings/api-keys)

## 🆘 Support

En cas de problème de sécurité :
1. **Arrêter** immédiatement le processus à risque
2. **Contacter** l'équipe sécurité
3. **Documenter** l'incident
4. **Suivre** la procédure de révocation

---

**⚠️ RAPPEL** : La sécurité des credentials est la responsabilité de chaque développeur. En cas de doute, toujours privilégier la prudence.