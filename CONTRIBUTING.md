
# Contributing Guide - Med Music Platform

Ce guide explique comment contribuer au projet Med Music Platform en suivant les bonnes pratiques de développement et de sécurité.

## 🎯 Structure du Projet

### Architecture Générale

```
src/
├── 📄 pages/                    # Pages principales de l'application
│   ├── MedChat.tsx             # Chat IA médical
│   ├── EdnComplete.tsx         # Interface EDN unifiée
│   ├── MedMngCreate.tsx        # Génération musicale
│   └── Admin*.tsx              # Dashboards administration
├── 🧩 components/              # Composants réutilisables
│   ├── edn/                    # Composants EDN/ECOS
│   ├── med-mng/               # Système musical
│   ├── admin/                  # Administration
│   └── ui/                     # Design system (shadcn)
├── 🔧 hooks/                   # Hooks métier spécialisés
├── 📚 lib/                     # Utilitaires + clients sécurisés
├── 🎨 styles/                  # Design system + Tailwind
└── 🔐 middleware/              # Middlewares de sécurité
```

## 🛠️ Ajouter du Contenu EDN

### 1. Schema JSON Standardisé v2

Chaque item EDN suit un schema JSON v2 pour garantir la cohérence :

```json
{
  "item_metadata": {
    "code": "IC-X",
    "title": "Titre officiel",
    "category": "relation_medecin_malade | valeurs_professionnelles | raisonnement_decision | qualite_securite | organisation_systeme",
    "difficulty": "A | B | AB",
    "version": "v2.0.0"
  },
  "content": {
    "rang_a": {
      "theme": "Thème du rang A",
      "competences": [...]
    },
    "rang_b": {
      "theme": "Thème du rang B", 
      "competences": [...]
    }
  },
  "generation_config": {
    "music_enabled": true,
    "bd_enabled": true,
    "quiz_enabled": true,
    "interactive_enabled": true
  }
}
```

### 2. Validation et Import

```bash
# Valider un item
yarn validate-item items/IC-42.json

# Importer en base de données
yarn add-item items/IC-42.json --env=staging
```

## 🔐 Variables d'Environnement

### Bonnes Pratiques Obligatoires

#### ✅ DO : Synchroniser .env.example

**OBLIGATOIRE** : Lors de l'ajout d'une nouvelle variable d'environnement dans le code :

1. **Ajouter la variable dans `.env.example`** avec documentation
2. **Mettre à jour la validation** dans `packages/config/src/env.ts`
3. **Documenter l'usage** dans `README.md` si nécessaire
4. **Tester la validation** avec `npm run validate:env`

```bash
# Exemple d'ajout dans .env.example
# ===================================
# NOUVELLE FONCTIONNALITÉ
# ===================================

# Description de la nouvelle variable
NEW_API_KEY=your-new-api-key-here        # Obligatoire pour fonctionnalité X
NEW_FEATURE_ENABLED=true                 # Active/désactive la fonctionnalité
```

#### ✅ DO : Validation Zod Obligatoire

Toute nouvelle variable DOIT être validée dans `packages/config/src/env.ts` :

```typescript
// Ajouter la validation
const envSchema = z.object({
  // Variables existantes...
  
  // Nouvelle variable avec validation
  NEW_API_KEY: z.string().min(20, 'API key must be at least 20 characters').optional(),
  NEW_FEATURE_ENABLED: z.string().transform(Boolean).default('false'),
});
```

#### ❌ DON'T : Erreurs Courantes

```bash
# ❌ NE PAS commit de vraies clés
OPENAI_API_KEY=sk-proj-abc123def456...

# ❌ NE PAS utiliser de variables non documentées
VITE_SECRET_KEY=secret123

# ❌ NE PAS oublier la validation
# Toute variable utilisée DOIT être validée
```

### Processus de Synchronisation

1. **Avant d'ajouter une variable** :
   ```bash
   # Vérifier les variables existantes
   grep -r "process.env" src/ --include="*.ts" --include="*.tsx"
   ```

2. **Ajouter la variable** :
   - Code source avec `process.env.NOUVELLE_VAR`
   - Documentation dans `.env.example`
   - Validation dans `env.ts`

3. **Tester la configuration** :
   ```bash
   # Test de validation
   npm run validate:env
   
   # Test avec valeur manquante
   SKIP_ENV_VALIDATION=false npm run dev
   ```

4. **Documentation** :
   - Ajouter dans `README.md` si la variable est importante
   - Mettre à jour `docs/README-DEVOPS.md` si nécessaire

### Catégories de Variables

#### 🔴 Critiques (Production)
Variables OBLIGATOIRES en production :
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- `JWT_SECRET` (≥32 caractères)
- `SUPABASE_SERVICE_ROLE_KEY`
- `CORS_ALLOWED_ORIGINS`

#### 🟡 Importantes (Fonctionnalités)
Variables pour activer des fonctionnalités :
- `SUNO_API_KEY` (génération musicale)
- `OPENAI_API_KEY` (chat IA)
- `SENTRY_DSN` (monitoring)

#### 🟢 Optionnelles (Configuration)
Variables de configuration avec défauts :
- `LOG_LEVEL` (default: info)
- `MAX_PAYLOAD_MB` (default: 1)
- `RATE_LIMIT_MAX_REQUESTS` (default: 100)

## 🧪 Tests et Validation

### Tests de Configuration

```bash
# Tests des variables d'environnement
npm run test:env

# Tests de sécurité complets
./scripts/test-security.sh --all --coverage

# Validation complète
npm run validate:all
```

### Standards de Qualité

#### Variables d'Environnement
- Toute variable utilisée DOIT être dans `.env.example`
- Toute variable DOIT avoir une validation Zod
- Les variables sensibles ne doivent JAMAIS être committées
- La documentation DOIT être à jour

#### Code
1. **TypeScript strict** : `noImplicitAny: true`
2. **Tests unitaires** : Couverture > 80%
3. **Tests de sécurité** : Middleware + rate limiting
4. **Validation Zod** : Toutes les entrées utilisateur

## 🚀 Processus de Contribution

### 1. Développement Local

```bash
# Setup complet
git clone https://github.com/med-mng/med-mng.git
cd med-mng
npm install

# Configuration
cp .env.example .env
# Éditer .env avec vos clés

# Validation
npm run validate:env
npm run test:security

# Développement
npm run dev
```

### 2. Pull Request

#### Checklist Obligatoire

- [ ] **Variables d'environnement synchronisées**
  - [ ] Nouvelle variable ajoutée dans `.env.example`
  - [ ] Validation Zod mise à jour dans `env.ts`
  - [ ] Tests de validation passent : `npm run validate:env`

- [ ] **Tests et qualité**
  - [ ] Tests unitaires : `npm test`
  - [ ] Tests de sécurité : `./scripts/test-security.sh`
  - [ ] Linting : `npm run lint`
  - [ ] TypeScript : `npm run type-check`

- [ ] **Documentation**
  - [ ] README.md mis à jour si nécessaire
  - [ ] Code commenté et autodocumenté
  - [ ] Changements breaking documentés

### 3. Review Process

1. **Auto-validation** : CI/CD vérifie automatiquement
2. **Review manuelle** : Code review par l'équipe
3. **Tests E2E** : Validation sur environnement de staging
4. **Deploy** : Merge vers main déclenche le déploiement

## 📊 Monitoring et Debugging

### Variables de Debug

```bash
# Mode développement avec debug complet
NODE_ENV=development
LOG_LEVEL=debug
SKIP_ENV_VALIDATION=false

# Validation stricte des variables
npm run validate:env -- --strict
```

### Outils de Debug

- **Validation env** : `npm run validate:env`
- **Tests sécurité** : `./scripts/test-security.sh`
- **Logs console** : Accessible via outils développeur
- **Supabase logs** : [Dashboard Supabase](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/logs)

## 🐛 Dépannage

### Erreurs Communes

1. **Variable manquante** :
   ```
   ❌ Environment validation failed:
   - NEW_API_KEY: Required
   ```
   → Ajouter la variable dans `.env`

2. **Variable non validée** :
   ```
   ❌ NEW_API_KEY used but not validated
   ```
   → Ajouter validation Zod dans `env.ts`

3. **Sécurité CORS** :
   ```
   ❌ CORS: Origin not allowed
   ```
   → Vérifier `CORS_ALLOWED_ORIGINS`

### Support

- **GitHub Issues** : Bugs et demandes de fonctionnalités
- **Documentation** : `docs/` répertoire complet
- **Supabase Dashboard** : [Monitoring base de données](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk)
- **Logs Sentry** : Monitoring des erreurs en temps réel

---

## 📋 Résumé des Obligations

**Lors de chaque contribution :**

1. ✅ **Variables d'environnement** synchronisées dans `.env.example`
2. ✅ **Validation Zod** pour toutes les nouvelles variables
3. ✅ **Tests de sécurité** passent sans erreur
4. ✅ **Documentation** mise à jour
5. ✅ **Aucune clé secrète** committée en dur

**La non-conformité à ces règles bloquera automatiquement la PR.**
