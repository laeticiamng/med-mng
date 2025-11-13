# 🔄 Migration vers l'Analyse Qualité par IA

## ✅ Ce qui a été fait

### 1. Suppression des anciennes configurations
- ❌ SonarQube (workflows, config)
- ❌ Chromatic (workflows, config)
- ❌ Codecov (références)
- ❌ Storybook stories de test

### 2. Création du système IA
✅ **Edge Functions Supabase déployées:**
- `ai-code-analysis`: Analyse de code avec GPT-4o
- `ai-visual-analysis`: Analyse visuelle avec GPT-4o Vision

✅ **Base de données:**
- Table `code_quality_reports` créée
- Table `visual_quality_reports` créée
- Fonction `get_latest_quality_metrics()` créée
- RLS policies configurées (lecture publique, écriture service role)

✅ **CI/CD GitHub Actions:**
- Workflow `.github/workflows/ai-quality-check.yml` créé
- Analyse automatique sur push/PR
- Capture de screenshots avec Playwright
- Génération de rapports

✅ **Documentation:**
- `docs/AI-QUALITY-SETUP.md` créé (guide complet)
- README.md mis à jour avec nouveaux badges
- Configuration Supabase documentée

## 🔧 Configuration requise

### Secrets Supabase
La clé `OPENAI_API_KEY` doit être configurée dans Supabase Edge Functions:
```bash
# Vérifier si configurée
supabase secrets list

# Si nécessaire, configurer
supabase secrets set OPENAI_API_KEY=sk-...
```

### Secrets GitHub
Dans les paramètres du repository GitHub, ajouter:
- `SUPABASE_URL`: https://yaincoxihiqdksxgrsrk.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY`: Clé service role Supabase
- `SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

## 🚀 Utilisation

### Analyse automatique
Le workflow CI/CD s'exécute automatiquement sur:
- Push vers `main` ou `develop`
- Pull requests

### Analyse manuelle
```bash
# Analyser un fichier
curl -X POST "https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/ai-code-analysis" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"code": "...", "filePath": "src/file.ts"}'

# Analyser une capture d'écran
curl -X POST "https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/ai-visual-analysis" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"screenshotBase64": "...", "componentName": "Button"}'
```

### Consulter les métriques
```sql
-- Dans le dashboard Supabase
SELECT * FROM get_latest_quality_metrics();

-- Derniers rapports de code
SELECT * FROM code_quality_reports 
ORDER BY analyzed_at DESC 
LIMIT 10;

-- Derniers rapports visuels
SELECT * FROM visual_quality_reports 
ORDER BY analyzed_at DESC 
LIMIT 10;
```

## 📊 Badges dynamiques

Les badges dans le README.md affichent:
- ✅ AI Quality Gate (A-E)
- 🐛 Bugs Count
- 🔒 Vulnerabilities
- 🛡️ Security Rating
- 🔧 Maintainability Rating
- 👁️ Visual Regressions
- ♿ Accessibility Score

Les données sont mises à jour à chaque analyse.

## 🎯 Avantages

### Par rapport à SonarQube
- ❌ Pas de serveur externe à gérer
- ✅ Analyse contextuelle et sémantique
- ✅ Recommandations concrètes en français
- ✅ Détection de bugs logiques
- ✅ Tout sur Supabase

### Par rapport à Chromatic
- ❌ Pas d'abonnement payant
- ✅ Analyse sémantique du design
- ✅ Détection d'accessibilité
- ✅ Compréhension du contexte métier
- ✅ Analyse des intentions UI/UX

## ⚠️ Limitations

- **Coût**: Consommation API OpenAI (GPT-4o)
- **Déterminisme**: Résultats peuvent varier légèrement
- **Historique**: Pas de tracking natif (requiert SQL)
- **IDE**: Pas d'intégration IDE pour l'instant

## 🔄 Prochaines étapes

1. **Configurer les secrets GitHub** (si pas déjà fait)
2. **Tester le workflow** (push vers develop)
3. **Vérifier les rapports** dans Supabase
4. **Ajuster les prompts** si nécessaire
5. **Créer un dashboard** pour visualiser les métriques

## 📚 Références

- [OpenAI GPT-4o](https://platform.openai.com/docs/models/gpt-4o)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Playwright](https://playwright.dev/)

---

**Dernière mise à jour**: 13 Novembre 2025
