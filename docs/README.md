# 📚 Documentation MED-MNG - Générateur Musical

Bienvenue dans la documentation complète du module Générateur Musical de MED-MNG.

---

## 📖 Table des Matières

### 🎯 Pour les Utilisateurs

- **[Guide Utilisateur](./GENERATOR-USER-GUIDE.md)** ⭐
  - Démarrage rapide
  - Utilisation du générateur
  - Conseils d'apprentissage
  - Cas d'usage
  - FAQ

- **[Guide de Dépannage](./GENERATOR-TROUBLESHOOTING.md)** 🔧
  - Problèmes courants et solutions
  - Outils de diagnostic
  - Codes d'erreur
  - Contact support

### 🔧 Pour les Développeurs

- **[Documentation Technique](./GENERATOR-TECHNICAL-DOCS.md)** 💻
  - Architecture globale
  - Stack technique
  - Flow de génération
  - Schéma base de données
  - API Reference

- **[Audit & Refactoring](./GENERATOR-AUDIT-REPORT.md)** 📊
  - État du module
  - Problèmes identifiés
  - Corrections appliquées
  - Actions recommandées

- **[Refactoring Détaillé](./REFACTORING-GENERATE-MUSIC.md)** ♻️
  - Migration 562 → 265 lignes
  - Modules créés
  - Avantages
  - Utilisation

### 📊 Monitoring & Logs

- **[Système de Monitoring](./MONITORING-LOGS.md)** 📈
  - Dashboard analytics
  - Métriques en temps réel
  - Logs edge functions
  - Accès aux données

- **[Audit de Sécurité](./SECURITY-AUDIT.md)** 🔒
  - RLS Policies
  - Fonctions sécurisées
  - Warnings et résolutions
  - Best practices

### 🧪 Tests

- **[Tests E2E](./E2E-TESTS.md)** ✅
  - Configuration Playwright
  - Couverture des tests
  - Commandes
  - CI/CD intégration

---

## 🚀 Démarrage Rapide

### Pour Utilisateurs

```markdown
1. Lire le [Guide Utilisateur](./GENERATOR-USER-GUIDE.md)
2. Accéder à /generator
3. Suivre les étapes de génération
4. En cas de problème : [Guide de Dépannage](./GENERATOR-TROUBLESHOOTING.md)
```

### Pour Développeurs

```markdown
1. Lire la [Documentation Technique](./GENERATOR-TECHNICAL-DOCS.md)
2. Consulter l'[Audit Report](./GENERATOR-AUDIT-REPORT.md)
3. Explorer le code dans src/pages/Generator.tsx
4. Vérifier les tests dans tests/e2e/generator/
```

---

## 📊 Métriques Clés

| Métrique | Valeur | Status |
|----------|--------|--------|
| **Frontend** |
| Page principale | 1 fichier (Generator.tsx) | ✅ |
| Hooks custom | 6 hooks | ✅ |
| Components | 5 components | ✅ |
| **Backend** |
| Edge functions | 4 functions | ✅ |
| Modules partagés | 3 modules | ✅ |
| Lignes generate-music | 265 (-53%) | ✅ |
| **Database** |
| Tables principales | 2 tables | ✅ |
| Vues analytics | 4 vues | ✅ |
| RLS Policies | 8 policies | ✅ |
| **Tests** |
| E2E tests | 6 tests | ✅ |
| Couverture | Extraction, Music, Auth, API | ✅ |

---

## 🎯 Architecture Simplifiée

```
┌─────────────────────────────────────────┐
│           FRONTEND (React)              │
│                                         │
│  Generator.tsx ──┐                      │
│                  │                      │
│  Hooks ──────────┼──> Supabase Client  │
│  Components ─────┘                      │
└─────────────────────┬───────────────────┘
                      │
┌─────────────────────▼───────────────────┐
│         BACKEND (Supabase)              │
│                                         │
│  Edge Functions:                        │
│  ├─ generate-music (265L) ──> Suno API │
│  ├─ music-status                        │
│  ├─ music-metrics                       │
│  └─ suno-callback                       │
│                                         │
│  Database:                              │
│  ├─ generated_music_tracks              │
│  ├─ music_generation_metrics            │
│  └─ 4 vues analytics                    │
└─────────────────────────────────────────┘
```

---

## 🔗 Liens Rapides

### Pages Application

- **Générateur** : `/generator`
- **Monitoring** : `/monitoring`
- **Bibliothèque** : `/library`
- **Profile** : `/profile`

### Supabase Dashboard

- [Edge Functions](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions)
- [Database](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/editor)
- [Logs generate-music](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions/generate-music/logs)
- [Logs music-status](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions/music-status/logs)

### Externes

- [Suno API Docs](https://api.sunoapi.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Playwright Docs](https://playwright.dev/)

---

## 📝 Changelog

### Version 2.0.0 (2025-10-29)

**🎉 Refactoring Majeur**
- ✅ generate-music refactorisé : 562 → 265 lignes (-53%)
- ✅ 3 modules partagés créés (suno-api-client, prompt-builders, music-database)
- ✅ Système de monitoring complet avec dashboard `/monitoring`
- ✅ Table `music_generation_metrics` avec RLS
- ✅ 4 vues analytics temps réel
- ✅ Tests E2E complets avec mocking API
- ✅ Documentation complète (5 guides)
- ✅ Audit de sécurité avec résolutions

**🔧 Corrections**
- ✅ Endpoint music-status corrigé
- ✅ RLS policies vérifiées et validées
- ✅ Fonctions custom toutes sécurisées (SET search_path)
- ✅ Optimisations performance (useCallback, useMemo)

**📚 Documentation**
- ✅ Guide utilisateur complet
- ✅ Documentation technique détaillée
- ✅ Guide de dépannage exhaustif
- ✅ Monitoring & logs
- ✅ Audit sécurité

---

## 🤝 Contribution

### Pour Rapporter un Bug

1. Vérifier le [Guide de Dépannage](./GENERATOR-TROUBLESHOOTING.md)
2. Chercher dans les issues GitHub existantes
3. Créer une nouvelle issue avec le template

### Pour Proposer une Feature

1. Discuter sur Discord #feature-requests
2. Créer une issue GitHub avec description détaillée
3. Attendre validation avant de coder

### Pour Contribuer au Code

1. Fork le repository
2. Créer une branche `feature/ma-feature`
3. Suivre les conventions de code
4. Ajouter tests E2E si nécessaire
5. Créer une Pull Request

---

## 📞 Support

### Communauté

- **Discord** : [Serveur MED-MNG](https://discord.gg/medmng)
- **Forum** : [forum.med-mng.com](https://forum.med-mng.com)
- **GitHub** : [Issues](https://github.com/med-mng/issues)

### Support Technique

- **Email** : support@med-mng.com
- **Chat** : Bouton "Support" dans l'app
- **Urgent** : Tel +33 X XX XX XX XX (Premium)

### Heures d'ouverture

- **Support Email** : 24/7 (réponse sous 24-48h)
- **Chat en direct** : Lun-Ven 9h-18h CET
- **Téléphone** : Lun-Ven 10h-17h CET

---

## 📜 Licence

© 2025 MED-MNG. Tous droits réservés.

Cette documentation est propriétaire et confidentielle.  
Reproduction interdite sans autorisation écrite.

---

## ✨ Remerciements

- **Équipe Backend** : Refactoring et optimisations
- **Équipe Frontend** : Interface et UX
- **Équipe QA** : Tests E2E complets
- **Équipe DevOps** : Monitoring et logs
- **Communauté** : Feedback et suggestions

---

**Documentation maintenue par l'équipe MED-MNG** 📚✨  
**Dernière mise à jour : 2025-10-29**
