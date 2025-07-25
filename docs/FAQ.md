# ❓ FAQ - MED-MNG Platform

## 🚀 Démarrage & Setup

### Q: Comment installer le projet en moins de 5 minutes ?
```bash
git clone [repo-url]
cd med-mng
npm install
npm run dev
```
✅ **Résultat** : App disponible sur http://localhost:5173

### Q: J'ai des erreurs TS6305, est-ce grave ?
❌ **Non, ces erreurs sont des problèmes de cache TypeScript.**
```bash
# Solution temporaire
rm -rf node_modules/.vite
npm run build
```
🔄 **Ces erreurs disparaissent automatiquement au prochain déploiement.**

### Q: Comment configurer Supabase rapidement ?
1. **Créer un projet** sur supabase.com
2. **Copier URL + clés** dans `.env.local`
3. **Configurer secrets** dans Dashboard > Edge Functions
4. **Tester** avec `npm run health:check`

---

## 🧪 Tests & Qualité

### Q: Comment lancer tous les tests ?
```bash
npm test              # Tests unitaires
npm run test:e2e      # Tests E2E  
npm run test:coverage # Avec couverture
```

### Q: Les tests E2E échouent, que faire ?
1. **Vérifier que l'app tourne** : `npm run dev`
2. **Installer Playwright** : `npx playwright install`
3. **Relancer** : `npm run test:e2e`

### Q: Comment débugger un test qui échoue ?
```bash
# Mode interactif Playwright
npm run test:e2e:ui

# Debug spécifique
npx playwright test --debug auth.spec.ts
```

---

## 🔧 Développement

### Q: Comment créer un nouveau composant ?
```typescript
// 1. Créer le composant
src/components/example/MyComponent.tsx

// 2. Ajouter les tests
src/tests/components/MyComponent.test.tsx

// 3. Créer la story Storybook
src/stories/MyComponent.stories.tsx

// 4. Documenter
docs/components/MyComponent.md
```

### Q: Comment utiliser le design system ?
```typescript
// ✅ Utiliser les tokens sémantiques
<Button variant="primary">Action</Button>

// ❌ Éviter les styles directs
<button className="bg-blue-500">Action</button>
```

### Q: Où trouver les logs en développement ?
- **Console navigateur** : F12 > Console
- **Supabase Dashboard** : Edge Functions > Logs
- **Admin Dashboard** : `/admin-center` dans l'app

---

## 🎵 Extraction & Génération Musicale

### Q: L'extraction OIC ne fonctionne pas ?
```bash
# 1. Tester la connexion
npm run extraction:test

# 2. Vérifier les credentials CAS
# Dashboard Supabase > Edge Functions > Secrets

# 3. Check logs extraction
# Dashboard Supabase > Edge Functions > extract-edn-objectifs > Logs
```

### Q: La génération musicale échoue ?
1. **Vérifier SUNO_API_KEY** dans Supabase Secrets
2. **Check quotas** Suno API
3. **Logs détaillés** dans `/admin-center`

### Q: Comment ajouter de nouveaux types d'extraction ?
1. **Créer edge function** dans `supabase/functions/`
2. **Ajouter route** dans dashboard admin
3. **Tests E2E** dans `tests/e2e/`
4. **Documentation** dans `docs/`

---

## 🔒 Sécurité

### Q: Comment vérifier la sécurité de l'app ?
```bash
# 1. Audit automatique
npm run audit:security

# 2. Dashboard sécurité
# Accès via /admin-center > Sécurité

# 3. Score en temps réel
# SecurityDashboard dans l'interface
```

### Q: Comment configurer les headers de sécurité ?
📝 **Les headers sont automatiquement configurés via :**
- `nginx.conf` (serveur)
- `SecurityHeaders.tsx` (client)
- Tests automatiques dans le pipeline

### Q: Rate limiting : comment ça marche ?
```typescript
// Auto-configuré par endpoint :
// Auth: 5 req/15min
// API: 100 req/min  
// Extraction: 10 req/min

// Check status
import { useRateLimit } from '@/services/rateLimitService';
const { checkLimit } = useRateLimit('api', userId);
```

---

## 📊 Monitoring & Admin

### Q: Comment accéder au dashboard admin ?
🔗 **URL** : `/admin-center` dans l'application
📋 **Contenu** :
- Monitoring extraction temps réel
- Logs système
- Métriques utilisateurs
- Alertes de sécurité

### Q: Comment configurer les alertes ?
📧 **Discord/Slack** : Configuré via variables d'environnement
```bash
DISCORD_WEBHOOK_URL=your-webhook
SLACK_WEBHOOK_URL=your-webhook
```

### Q: Où voir les métriques de performance ?
- **Dashboard admin** : Métriques temps réel
- **Supabase Dashboard** : Analytics base de données
- **Monitoring sécurité** : Score et recommandations

---

## 🚀 Déploiement

### Q: Comment déployer en staging ?
```bash
# Push sur main = déploiement auto
git push origin main
```
✅ **Automatique via GitHub Actions**

### Q: Comment déployer en production ?
```bash
# Créer un tag release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```
🚀 **Déploiement production automatique**

### Q: Le déploiement échoue, que faire ?
1. **Check pipeline** GitHub Actions
2. **Vérifier tests** : Tous doivent passer
3. **Check secrets** Supabase configurés
4. **Logs détaillés** dans Actions

---

## 🏗️ Architecture & Technique

### Q: Comment l'architecture est organisée ?
```
src/
├── components/     # Composants React (admin, audit, common, security)
├── hooks/          # Hooks customs (useNotifications, useRateLimit)
├── services/       # Services (API, rate limiting, logs)
├── pages/          # Pages principales
└── utils/          # Utilitaires (sanitization, validation)
```

### Q: Comment ajouter une nouvelle page ?
```typescript
// 1. Créer la page
src/pages/NewPage.tsx

// 2. Ajouter la route
src/routes/index.tsx

// 3. Tests E2E
tests/e2e/new-page.spec.ts

// 4. Documentation
docs/pages/new-page.md
```

### Q: Comment utiliser Storybook ?
```bash
# Lancer Storybook
npm run storybook
# ➡️ http://localhost:6006

# Ajouter une story
src/stories/Component.stories.tsx
```

---

## 🐛 Debugging & Erreurs courantes

### Q: "Module not found" en développement ?
```bash
# 1. Clear cache
rm -rf node_modules/.vite
rm -rf node_modules

# 2. Réinstaller
npm install

# 3. Redémarrer
npm run dev
```

### Q: Base de données Supabase inaccessible ?
1. **Vérifier URL/clés** dans `.env.local`
2. **Test connexion** : `npm run health:check`
3. **Supabase status** : status.supabase.com

### Q: Performance lente en développement ?
```bash
# Mode production local
npm run build
npm run preview
```

### Q: Erreurs TypeScript mystérieuses ?
```bash
# Reset TypeScript
npm run type-check
# OU
npx tsc --noEmit
```

---

## 👥 Équipe & Process

### Q: Comment contribuer au projet ?
1. **Fork** le repository
2. **Créer une branche** : `feature/ma-feature`
3. **Développer** avec tests
4. **Pull Request** avec description
5. **Code Review** obligatoire

### Q: Comment signaler un bug ?
1. **GitHub Issues** avec template
2. **Labels** appropriés (bug, enhancement, etc.)
3. **Steps to reproduce** détaillées
4. **Screenshots** si nécessaire

### Q: Contact en cas d'urgence ?
- **Discord** : Canal #dev-urgent
- **Slack** : #med-mng-alerts  
- **Email** : dev-team@votre-domaine.com
- **On-call** : Rotation développeurs senior

---

## 🔗 Liens utiles

### Documentation
- [📚 Guide démarrage](../README.md)
- [🔒 Sécurité](./axe5-security.md)
- [🧪 Tests](./TESTING_COMPLETE.md)
- [📊 Monitoring](./axe3-monitoring.md)

### Outils externes
- [Supabase Dashboard](https://supabase.com/dashboard)
- [GitHub Actions](https://github.com/votre-org/med-mng/actions)
- [Storybook](http://localhost:6006)

### Communauté
- [Discord Lovable](https://discord.com/channels/1119885301872070706/1280461670979993613)
- [Documentation Lovable](https://docs.lovable.dev/)

---

❓ **Question pas dans la FAQ ?** 
👉 [Créer une issue GitHub](https://github.com/votre-org/med-mng/issues/new) ou demander sur Discord !