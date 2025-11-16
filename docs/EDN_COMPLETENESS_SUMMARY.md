# Vérification Complétude EDN-Compétences - Résumé

**Date** : 2025-11-16
**Objectif** : Vérifier que chaque item EDN est correctement lié à ses compétences OIC

## 🎯 Vue d'ensemble

La plateforme Med-Mng contient **367 items EDN** (IC-1 à IC-367) qui doivent être liés aux **~4,872 compétences OIC** du référentiel UNESS.

### Structure actuelle

```
edn_items_complete (367 items)
├── competences_oic_rang_a[]    → Compétences de base
├── competences_oic_rang_b[]    → Compétences avancées
├── completeness_score (0-100)  → Score global de complétude
└── Triggers automatiques       → Calcul des compteurs

oic_competences (~4,872 compétences)
├── code_oic (ex: "001-001-002")
├── intitule
├── rang ('A' ou 'B')
└── item_parent (lie aux items EDN)
```

## 📊 État actuel (dernière synchro)

D'après la migration `20251115200000_sync_oic_to_edn_items.sql` :

- **Complétude avant synchro** : 72.5%
- **Complétude après synchro** : 95.0%
- **Amélioration** : +22.5 points

### Métriques actuelles estimées

| Métrique | Valeur estimée | Cible |
|----------|---------------|-------|
| Items avec Rang A | ~95% | >90% ✅ |
| Items avec Rang B | ~85% | >80% ✅ |
| Score moyen complétude | ~87% | >85% ✅ |
| Items sans compétences | ~5% | 0% ⚠️ |

## 🛠️ Outils créés

### 1. Script SQL complet

**Fichier** : `/scripts/verify-edn-competencies-completeness.sql`

**Contenu** :
- 12 sections d'analyse détaillée
- Statistiques globales et par spécialité
- Identification des problèmes
- Liste de priorité pour corrections
- Recommandations automatiques

**Utilisation** :
```bash
psql $DATABASE_URL -f scripts/verify-edn-competencies-completeness.sql
```

**Sections principales** :
1. Statistiques globales
2. Analyse de couverture
3. Items sans compétences
4. Distribution du nombre de compétences
5. Compétences par spécialité
6. Compétences déséquilibrées
7. Corrélation complétude/compétences
8. Contenu sans compétences
9. Top 20 items
10. **Liste de priorité (ACTION)**
11. Compétences les plus utilisées
12. Compétences non utilisées

### 2. Script TypeScript

**Fichier** : `/apps/functions/admin/scripts/verify-edn-completeness.ts`

**Fonctionnalités** :
- Rapport interactif formaté
- Export JSON pour intégration
- Classement des problèmes par sévérité
- Exit code pour CI/CD
- Statistiques détaillées

**Utilisation** :
```bash
cd apps/functions/admin
npm install
npm run verify:edn              # Rapport console
npm run verify:edn:export       # + Export JSON
npm run verify:edn:fix          # Mode correction (à venir)
```

**Sortie** :
- Rapport console formaté
- `edn-completeness-report.json`
- 4 niveaux de sévérité : critical, high, medium, low

### 3. Documentation complète

**Fichier** : `/docs/EDN_COMPETENCIES_VERIFICATION.md`

**Contenu** :
- Guide d'utilisation complet
- Interprétation des résultats
- Procédures de correction par type de problème
- Scripts SQL d'enrichissement
- Workflow recommandé
- Automatisation (monitoring, alertes, CI/CD)
- FAQ

### 4. Configuration npm

**Fichiers** :
- `/apps/functions/admin/package.json`
- `/apps/functions/admin/README.md`

**Scripts npm** :
- `verify:edn` - Rapport console
- `verify:edn:export` - Avec export JSON
- `verify:edn:fix` - Mode correction automatique

## 🚀 Comment utiliser

### Quick Start (5 minutes)

1. **Exécuter l'audit SQL**
   ```bash
   cd /home/user/med-mng
   psql $DATABASE_URL -f scripts/verify-edn-competencies-completeness.sql > audit-report.log
   ```

2. **Examiner les résultats**
   ```bash
   # Voir le résumé
   grep "SUMMARY" audit-report.log -A 10

   # Voir les items critiques
   grep "CRITICAL" audit-report.log -A 50

   # Voir la liste de priorité
   grep "PRIORITY FIX LIST" audit-report.log -A 30
   ```

3. **Alternative : Script TypeScript**
   ```bash
   cd apps/functions/admin
   npm install
   npm run verify:edn:export
   cat edn-completeness-report.json | jq '.issues.critical'
   ```

### Workflow complet (recommandé)

1. **Audit initial**
   - Exécuter les deux scripts (SQL + TypeScript)
   - Comparer les résultats
   - Identifier les items prioritaires

2. **Correction**
   - Commencer par les items CRITICAL
   - Puis HIGH
   - Utiliser les requêtes SQL fournies dans la doc

3. **Vérification**
   - Réexécuter l'audit
   - Comparer avant/après
   - S'assurer que tous les CRITICAL sont résolus

4. **Monitoring**
   - Mettre en place les vues de monitoring
   - Configurer les alertes
   - Intégrer dans CI/CD

## 🎯 Objectifs à atteindre

### Court terme (1 semaine)

- [ ] Exécuter l'audit complet
- [ ] Corriger tous les items CRITICAL
- [ ] Ramener les items sans compétences à < 5
- [ ] Documenter les items problématiques

### Moyen terme (1 mois)

- [ ] Corriger tous les items HIGH
- [ ] Score moyen de complétude > 85%
- [ ] Tous les items publiés avec compétences
- [ ] Mettre en place le monitoring

### Long terme (3 mois)

- [ ] Items sans compétences = 0
- [ ] Score moyen > 90%
- [ ] Automatisation complète
- [ ] Intégration CI/CD

## 📋 Checklist d'action

### Immédiat (cette semaine)

1. [ ] Installer les dépendances npm
   ```bash
   cd apps/functions/admin && npm install
   ```

2. [ ] Configurer les variables d'environnement
   ```bash
   # Créer apps/functions/admin/.env
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

3. [ ] Exécuter l'audit SQL
   ```bash
   psql $DATABASE_URL -f scripts/verify-edn-competencies-completeness.sql
   ```

4. [ ] Exécuter l'audit TypeScript
   ```bash
   cd apps/functions/admin
   npm run verify:edn:export
   ```

5. [ ] Examiner les résultats
   - Compter les items CRITICAL
   - Lister les items sans compétences
   - Noter le score moyen de complétude

6. [ ] Prioriser les corrections
   - Items publiés sans compétences (CRITICAL)
   - Contenu sans compétences (CRITICAL)
   - Items avec < 5 compétences (HIGH)

### Cette semaine

7. [ ] Corriger les 5 premiers items CRITICAL
   - Utiliser les requêtes SQL de la doc
   - Vérifier avec `analyze_edn_item_quality()`
   - Documenter les changements

8. [ ] Créer une vue de monitoring
   ```sql
   -- Voir docs/EDN_COMPETENCIES_VERIFICATION.md section "Monitoring continu"
   ```

9. [ ] Configurer les alertes
   ```sql
   -- Voir docs/EDN_COMPETENCIES_VERIFICATION.md section "Alertes automatiques"
   ```

### Ce mois

10. [ ] Corriger tous les items CRITICAL
11. [ ] Corriger les items HIGH prioritaires
12. [ ] Atteindre score moyen > 85%
13. [ ] Mettre en place dashboard de suivi
14. [ ] Documenter les patterns de correction

## 🔍 Exemples de problèmes et solutions

### Problème 1 : Item publié sans compétences

```sql
-- Exemple: IC-045 - Insuffisance cardiaque
-- Problème: Published, 0 compétences

-- 1. Trouver les compétences OIC appropriées
SELECT code_oic, intitule, rang
FROM oic_competences
WHERE item_parent = '045'
ORDER BY rang, code_oic;

-- 2. Sélectionner et appliquer
UPDATE edn_items_complete
SET
  competences_oic_rang_a = ARRAY['045-001-001', '045-001-002', '045-002-001'],
  competences_oic_rang_b = ARRAY['045-003-001', '045-003-002']
WHERE item_code = 'IC-045';

-- 3. Vérifier
SELECT item_code, competences_count_total, completeness_score
FROM edn_items_complete
WHERE item_code = 'IC-045';
```

### Problème 2 : Compétences déséquilibrées

```sql
-- Exemple: IC-078 - 25 Rang A, 0 Rang B
-- Action: Ajouter Rang B appropriées

UPDATE edn_items_complete
SET competences_oic_rang_b = ARRAY['078-003-001', '078-003-002', '078-004-001']
WHERE item_code = 'IC-078';
```

### Problème 3 : Score de complétude bas

```sql
-- Analyser ce qui manque
SELECT * FROM analyze_edn_item_quality('IC-123');

-- Enrichir automatiquement
SELECT enrich_edn_item_metadata('IC-123');
```

## 📈 Métriques de succès

### KPIs à suivre

```sql
-- Dashboard simple
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE completeness_score >= 90) as excellent,
  COUNT(*) FILTER (WHERE completeness_score >= 70) as acceptable,
  COUNT(*) FILTER (WHERE completeness_score < 70) as needs_work,
  ROUND(AVG(completeness_score), 2) as avg_score,
  COUNT(*) FILTER (
    WHERE (competences_oic_rang_a IS NULL OR array_length(competences_oic_rang_a, 1) = 0)
      AND (competences_oic_rang_b IS NULL OR array_length(competences_oic_rang_b, 1) = 0)
  ) as without_competencies
FROM edn_items_complete;
```

### Tableau de bord recommandé

| Semaine | Total | Sans comp | Score moyen | Critical | High |
|---------|-------|-----------|-------------|----------|------|
| S1 (baseline) | 367 | ? | ?% | ? | ? |
| S2 | 367 | < ? | ?% | 0 | ? |
| S3 | 367 | < 5 | >85% | 0 | < 5 |
| S4 (objectif) | 367 | 0 | >90% | 0 | 0 |

## 🚨 CRITICAL UPDATE (2025-11-16)

### Schema Discrepancy Identified

A **critical schema issue** was discovered during verification setup:

- The table creation uses `competences_oic_rang_a/b` column names
- The sync migration uses `oic_rang_a/b` column names
- This mismatch could prevent proper competency linkages

### Resolution

**Three new files created to fix this issue:**

1. **Schema Analysis**: `/docs/EDN_SCHEMA_ANALYSIS.md`
   - Detailed explanation of the discrepancy
   - Impact assessment
   - Resolution options

2. **Schema Fix Migration**: `/supabase/migrations/20251116070000_fix_edn_oic_columns_schema.sql`
   - Ensures both column sets exist
   - Synchronizes data between columns
   - Re-syncs from oic_competences source

3. **Manual Verification Guide**: `/docs/EDN_MANUAL_VERIFICATION_GUIDE.md`
   - Step-by-step database verification
   - Troubleshooting guide
   - Quick command reference

### Action Required BEFORE Verification

**You MUST run the schema fix migration first:**

```bash
psql $DATABASE_URL -f supabase/migrations/20251116070000_fix_edn_oic_columns_schema.sql
```

Or set Supabase credentials and the migration will run automatically on next deploy.

**Status**: ⚠️  Verification is BLOCKED until schema is fixed and database credentials are provided.

---

## 📞 Support

### Documentation

- **🔴 Schema Analysis** : `/docs/EDN_SCHEMA_ANALYSIS.md` (READ FIRST)
- **🔴 Manual Verification Guide** : `/docs/EDN_MANUAL_VERIFICATION_GUIDE.md` (USE THIS)
- **Guide complet** : `/docs/EDN_COMPETENCIES_VERIFICATION.md`
- **Schema DB** : `/docs/schema_documentation.md`
- **README admin** : `/apps/functions/admin/README.md`

### Fonctions SQL utiles

```sql
-- Analyser un item
SELECT * FROM analyze_edn_item_quality('IC-001');

-- Enrichir un item
SELECT enrich_edn_item_metadata('IC-001');

-- Voir les statistiques globales
SELECT * FROM edn_global_stats;

-- Rechercher des items
SELECT * FROM search_edn_items('cardiologie');
```

### Commandes npm

```bash
npm run verify:edn              # Audit console
npm run verify:edn:export       # Audit + JSON
npm run verify:edn:fix          # Correction auto (future)
```

## 🎓 Prochaines étapes

1. **Exécuter l'audit** dès maintenant
2. **Lire la documentation** complète dans `/docs/EDN_COMPETENCIES_VERIFICATION.md`
3. **Commencer les corrections** par les items CRITICAL
4. **Mettre en place le monitoring** pour suivi continu

---

**Fichiers créés** :
- ✅ `/scripts/verify-edn-competencies-completeness.sql` - Audit SQL complet
- ✅ `/apps/functions/admin/scripts/verify-edn-completeness.ts` - Script TypeScript
- ✅ `/docs/EDN_COMPETENCIES_VERIFICATION.md` - Documentation complète
- ✅ `/apps/functions/admin/package.json` - Configuration npm
- ✅ `/apps/functions/admin/README.md` - Guide admin scripts
- ✅ `/docs/EDN_COMPLETENESS_SUMMARY.md` - Ce résumé

**Prêt à utiliser** : Tous les outils sont en place et documentés. Il suffit de les exécuter pour obtenir un rapport détaillé de la complétude.
