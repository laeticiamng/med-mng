# Pipeline CI/CD MED-MNG

## 🚀 Pipeline complet mis en place

[![CI/CD Pipeline](https://github.com/med-mng/med-mng/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/med-mng/med-mng/actions/workflows/ci-cd.yml)

### ✅ Jobs implémentés

1. **🔒 Security Audit** - Scan des secrets hardcodés
2. **🧹 Lint & TypeCheck** - Vérification code qualité
3. **🧪 Test Suite** - Tests unitaires et Edge Functions
4. **🏗️ Build Validation** - Validation build application
5. **🗃️ Supabase Validation** - Vérification config Supabase
6. **📚 Documentation** - Mise à jour automatique docs
7. **🚀 Deploy Staging** - Déploiement auto sur main
8. **🌟 Deploy Production** - Déploiement sur release
9. **🏥 Health Check** - Vérifications post-déploiement
10. **🧹 Cleanup** - Nettoyage ressources

### 📋 Triggers

- **Push/PR** → main, develop : Tous les jobs de validation
- **Push main** → Déploiement staging automatique
- **Release** → Déploiement production

### 🔑 Secrets requis

Aucun secret hardcodé - utilisation sécurisée des variables d'environnement Supabase.

### 🎯 Critères de succès

✅ Sécurité garantie (scan automatique)
✅ Qualité code (lint + typecheck)
✅ Build validation systématique
✅ Déploiements automatisés
✅ Documentation à jour

**Pipeline prêt pour la production !**