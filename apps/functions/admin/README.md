# Med-Mng Admin Scripts

Scripts d'administration et de maintenance pour la plateforme Med-Mng.

## 📦 Installation

```bash
cd apps/functions/admin
npm install
```

## 🔧 Configuration

Créer un fichier `.env` :

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🚀 Scripts disponibles

### Vérification de complétude EDN

Analyse la complétude des items EDN et leurs compétences OIC.

```bash
# Rapport console
npm run verify:edn

# Avec export JSON
npm run verify:edn:export

# Mode correction automatique
npm run verify:edn:fix
```

**Fichier** : `scripts/verify-edn-completeness.ts`

**Documentation complète** : `/docs/EDN_COMPETENCIES_VERIFICATION.md`

**Sortie** :
- Rapport détaillé dans la console
- Fichier `edn-completeness-report.json` (avec --export-json)
- Exit code 1 si problèmes critiques

## 📊 Rapport généré

Le rapport inclut :

- **Résumé** : Statistiques globales, couverture des compétences
- **Problèmes** : Classés par sévérité (critical, high, medium, low)
- **Distribution** : Par nombre de compétences et score de complétude
- **Spécialités** : Statistiques par spécialité médicale
- **Recommandations** : Actions à prendre

### Exemple de sortie

```
================================================================================
EDN ITEMS - COMPETENCIES COMPLETENESS REPORT
================================================================================
Generated: 11/16/2025, 10:30:00 AM

📊 SUMMARY
--------------------------------------------------------------------------------
Total EDN Items: 367
Items with Rang A: 349 (95.1%)
Items with Rang B: 312 (85.0%)
Items WITHOUT competencies: 5 (1.4%)
Average competencies/item: 13.24
Average completeness score: 87.32%

🚨 ISSUES SUMMARY
--------------------------------------------------------------------------------
Critical: 2
High: 8
Medium: 15
Low: 23
TOTAL: 48

🔴 CRITICAL ISSUES (Must Fix)
--------------------------------------------------------------------------------
1. IC-045 - Insuffisance cardiaque
   Type: no_competencies
   Published item has NO competencies linked
   Current: 0 competencies, 65% complete
   Action: Link appropriate competencies from OIC database or unpublish

... (suite du rapport)
```

## 🗄️ Scripts SQL

### Audit complet

Fichier : `/scripts/verify-edn-competencies-completeness.sql`

Exécuter dans Supabase Studio ou via psql :

```bash
psql $DATABASE_URL -f ../../scripts/verify-edn-competencies-completeness.sql
```

Génère 12 sections d'analyse détaillée.

## 🔄 Workflow recommandé

1. **Audit initial**
   ```bash
   npm run verify:edn:export
   ```

2. **Examiner le rapport JSON**
   ```bash
   cat edn-completeness-report.json | jq '.issues.critical'
   ```

3. **Corriger les problèmes critiques**
   - Voir documentation : `/docs/EDN_COMPETENCIES_VERIFICATION.md`
   - Utiliser les requêtes SQL fournies

4. **Vérification post-correction**
   ```bash
   npm run verify:edn
   ```

5. **Intégration CI/CD**
   - Le script retourne exit code 1 si problèmes critiques
   - Peut être utilisé dans les pipelines GitHub Actions

## 📖 Documentation

- **Guide complet** : `/docs/EDN_COMPETENCIES_VERIFICATION.md`
- **Schema database** : `/docs/schema_documentation.md`
- **Exemples de requêtes** : `/docs/schema_example_queries.md`

## 🎯 Métriques cibles

| Métrique | Cible |
|----------|-------|
| Items sans compétences | 0 |
| Score moyen complétude | > 85% |
| Items publiés avec compétences | 100% |
| Compétences par item (moyenne) | 12-15 |
| Couverture Rang A | > 90% |
| Couverture Rang B | > 85% |

## 🐛 Debugging

### Problème : Erreur de connexion Supabase

```bash
# Vérifier les variables d'environnement
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Tester la connexion
psql $DATABASE_URL -c "SELECT COUNT(*) FROM edn_items_complete;"
```

### Problème : Import TypeScript

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Problème : Permissions

Le script nécessite le service role key (pas l'anon key) pour accéder à toutes les données.

## 🔐 Sécurité

⚠️ **Important** :
- Ne jamais commiter le fichier `.env`
- Le service role key ne doit JAMAIS être exposé côté client
- Ces scripts sont pour usage admin uniquement

## 📝 Contribution

Pour ajouter de nouveaux scripts :

1. Créer le fichier dans `scripts/`
2. Ajouter le script dans `package.json`
3. Documenter dans ce README
4. Ajouter les tests si applicable

## 📞 Support

Pour questions ou problèmes :
- Consulter `/docs/EDN_COMPETENCIES_VERIFICATION.md`
- Vérifier les logs SQL dans Supabase Studio
- Contacter l'équipe technique
