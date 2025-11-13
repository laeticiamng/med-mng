# 🤖 Configuration de l'Analyse Qualité par IA

Ce projet utilise **OpenAI** pour analyser la qualité du code, détecter les régressions visuelles et identifier les vulnérabilités de sécurité, remplaçant les outils traditionnels comme SonarQube et Chromatic.

## 📋 Fonctionnalités

### 1. Analyse de Code avec IA
- ✅ Détection de bugs potentiels
- ✅ Identification de vulnérabilités de sécurité
- ✅ Détection de code smells et mauvaises pratiques
- ✅ Estimation du coverage et de la duplication
- ✅ Ratings de maintenabilité et sécurité (A-E)

### 2. Analyse Visuelle avec IA
- ✅ Détection de régressions visuelles
- ✅ Analyse d'accessibilité (contraste, layout)
- ✅ Vérification de la cohérence du design
- ✅ Comparaison avant/après des composants

### 3. Workflow CI/CD Automatisé
- ✅ Analyse automatique sur push/PR
- ✅ Génération de rapports détaillés
- ✅ Stockage des métriques dans Supabase
- ✅ Badges dynamiques dans le README

## 🚀 Configuration

### Prérequis
- Projet Supabase configuré
- Clé API OpenAI (`OPENAI_API_KEY`) ajoutée dans les secrets Supabase
- GitHub Actions activé

### Tables Supabase Requises

```sql
-- Table pour les rapports de qualité de code
CREATE TABLE code_quality_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL,
  bugs INTEGER DEFAULT 0,
  vulnerabilities INTEGER DEFAULT 0,
  code_smells INTEGER DEFAULT 0,
  coverage NUMERIC DEFAULT 0,
  duplications NUMERIC DEFAULT 0,
  maintainability_rating TEXT,
  security_rating TEXT,
  issues JSONB,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les rapports visuels
CREATE TABLE visual_quality_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name TEXT NOT NULL,
  has_regressions BOOLEAN DEFAULT false,
  changes JSONB,
  accessibility_issues JSONB,
  design_consistency NUMERIC DEFAULT 0,
  overall_score NUMERIC DEFAULT 0,
  screenshot TEXT,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fonction pour récupérer les dernières métriques
CREATE OR REPLACE FUNCTION get_latest_quality_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'bugs', COALESCE(SUM(bugs), 0),
    'vulnerabilities', COALESCE(SUM(vulnerabilities), 0),
    'codeSmells', COALESCE(SUM(code_smells), 0),
    'coverage', COALESCE(AVG(coverage), 0),
    'duplications', COALESCE(AVG(duplications), 0),
    'maintainabilityRating', (
      SELECT maintainability_rating 
      FROM code_quality_reports 
      ORDER BY analyzed_at DESC 
      LIMIT 1
    ),
    'securityRating', (
      SELECT security_rating 
      FROM code_quality_reports 
      ORDER BY analyzed_at DESC 
      LIMIT 1
    ),
    'visualRegressions', (
      SELECT COUNT(*) 
      FROM visual_quality_reports 
      WHERE has_regressions = true 
        AND analyzed_at > NOW() - INTERVAL '7 days'
    ),
    'accessibilityScore', COALESCE((
      SELECT AVG(overall_score) 
      FROM visual_quality_reports 
      WHERE analyzed_at > NOW() - INTERVAL '7 days'
    ), 0)
  ) INTO result
  FROM code_quality_reports
  WHERE analyzed_at > NOW() - INTERVAL '7 days';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

### Secrets GitHub Requis

Dans les paramètres de votre repository GitHub, ajoutez:
- `SUPABASE_URL`: URL de votre projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Clé service role Supabase
- `SUPABASE_ANON_KEY`: Clé publique Supabase

### Edge Functions Supabase

Les edge functions sont automatiquement déployées:
- `ai-code-analysis`: Analyse de code avec GPT-4o
- `ai-visual-analysis`: Analyse visuelle avec GPT-4o Vision

## 📊 Utilisation

### Analyse Manuelle

```bash
# Analyser un fichier spécifique
curl -X POST "https://votre-projet.supabase.co/functions/v1/ai-code-analysis" \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"code": "...", "filePath": "src/file.ts"}'

# Analyser une capture d'écran
curl -X POST "https://votre-projet.supabase.co/functions/v1/ai-visual-analysis" \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"screenshotBase64": "...", "componentName": "Button"}'
```

### Analyse Automatique

Le workflow CI/CD s'exécute automatiquement:
- Sur chaque push vers `main` ou `develop`
- Sur chaque pull request
- Analyse les fichiers critiques
- Capture et analyse les screenshots

### Consulter les Résultats

Les résultats sont stockés dans Supabase et accessibles via:
```sql
-- Derniers rapports de code
SELECT * FROM code_quality_reports 
ORDER BY analyzed_at DESC 
LIMIT 10;

-- Derniers rapports visuels
SELECT * FROM visual_quality_reports 
ORDER BY analyzed_at DESC 
LIMIT 10;

-- Métriques agrégées
SELECT get_latest_quality_metrics();
```

## 🎯 Avantages vs SonarQube/Chromatic

### ✅ Avantages
- **Zéro configuration externe**: Tout sur Supabase
- **Intelligence contextuelle**: GPT-4o comprend le contexte métier
- **Analyse sémantique**: Détection de bugs logiques, pas juste syntaxiques
- **Analyse visuelle avancée**: Compréhension du design, pas juste pixel-perfect
- **Recommandations concrètes**: Suggestions d'amélioration détaillées
- **Coût optimisé**: Pas d'abonnement SonarCloud/Chromatic

### ⚠️ Limitations
- **Moins déterministe**: Résultats peuvent varier légèrement
- **Coût API OpenAI**: Dépend du volume d'analyse
- **Pas de tracking historique natif**: Nécessite requêtes SQL custom
- **Pas d'intégration IDE**: Uniquement CI/CD pour l'instant

## 🔧 Personnalisation

### Modifier les Fichiers Analysés

Éditez `.github/workflows/ai-quality-check.yml`:
```yaml
FILES=(
  "src/votre-fichier.ts"
  "src/autre-fichier.tsx"
)
```

### Ajuster les Prompts IA

Modifiez `supabase/functions/ai-code-analysis/index.ts` et `ai-visual-analysis/index.ts` pour adapter les analyses à vos besoins.

## 📈 Métriques et Badges

Le README affiche des badges dynamiques basés sur les analyses IA:
- Quality Gate (Pass/Fail)
- Bugs Count
- Vulnerabilities
- Security Rating
- Maintainability Rating
- Visual Regressions
- Accessibility Score

## 🆘 Support

Pour toute question ou problème:
1. Vérifiez les logs dans Supabase Edge Functions
2. Consultez la documentation OpenAI
3. Vérifiez que `OPENAI_API_KEY` est bien configurée
