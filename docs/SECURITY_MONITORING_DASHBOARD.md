# 🛡️ Dashboard de Monitoring de Sécurité

**Date**: 2025-11-07  
**URL**: `/security-monitoring`  
**Version**: 1.0.0

---

## 🎯 Vue d'Ensemble

Le dashboard de monitoring de sécurité offre une surveillance en temps réel de la sécurité de votre base de données Supabase avec :

- **Métriques temps réel** : Score de sécurité, tables RLS, policies actives
- **Alertes automatiques** : Détection de vulnérabilités et dégradations
- **Historique complet** : Traçabilité de toutes les corrections appliquées
- **Visualisations** : Graphiques d'évolution et tendances
- **Actions rapides** : Résolution directe des alertes

---

## 📊 Architecture du Système

### Base de Données

#### Table: `security_corrections_history`
Stocke l'historique de toutes les corrections de sécurité appliquées.

**Colonnes principales:**
- `correction_type`: Type de correction (function_search_path, security_definer_view, rls_policy)
- `table_or_function_name`: Nom de la ressource corrigée
- `issue_description`: Description du problème
- `correction_applied`: Solution appliquée
- `severity`: Niveau de gravité (critical, high, medium, low, info)
- `applied_at`: Date et heure de la correction

**RLS**: 
- ✅ Lecture: Tous les utilisateurs authentifiés
- 🔒 Écriture: Service role uniquement

#### Table: `security_alerts`
Gère les alertes de sécurité actives nécessitant attention.

**Colonnes principales:**
- `alert_type`: Type d'alerte (new_vulnerability, rls_missing, function_unsafe)
- `severity`: Gravité (critical, high, medium, low, info)
- `title`: Titre de l'alerte
- `description`: Description détaillée
- `affected_resource`: Ressource affectée
- `recommendation`: Recommandation de correction
- `status`: Statut (open, acknowledged, resolved, dismissed)

**RLS**:
- ✅ Lecture: Tous les utilisateurs authentifiés
- ✏️ Mise à jour: Utilisateurs authentifiés (changement de statut uniquement)
- 🔒 Création/Suppression: Service role uniquement

#### Table: `security_metrics_snapshots`
Snapshots périodiques des métriques de sécurité pour analyse de tendances.

**Colonnes principales:**
- `recorded_at`: Date du snapshot
- `total_tables`: Nombre total de tables
- `tables_with_rls`: Tables avec RLS activé
- `total_policies`: Nombre total de policies RLS
- `security_score`: Score global de sécurité (0-100)
- `critical_issues`, `high_issues`, etc.: Compteurs par niveau de gravité

**RLS**:
- ✅ Lecture: Tous les utilisateurs authentifiés
- 🔒 Écriture: Service role uniquement

---

## 🔧 Edge Function: `security-metrics`

### Fonctionnalité
Collecte et analyse les métriques de sécurité en temps réel.

### Processus
1. **Collecte des données RLS**
   - Tables avec RLS activé
   - Nombre de policies par table
   
2. **Analyse des fonctions**
   - Fonctions avec/sans search_path
   - Fonctions SECURITY DEFINER
   
3. **Calcul du score de sécurité**
   ```
   Score = (RLS Coverage × 40) + (Policy Coverage × 30) + (Function Safety × 30)
   ```

4. **Détection d'alertes**
   - Score < 90% → Alerte moyenne
   - Tables sans RLS → Alerte haute
   - Nouvelles vulnérabilités → Alerte critique

5. **Création du snapshot**
   - Enregistrement dans `security_metrics_snapshots`
   - Historisation pour graphiques de tendances

### Déclenchement
- ✅ Manuel via bouton "Actualiser"
- ⏰ Automatique via cron job (recommandé: toutes les heures)
- 🔄 Webhook après migrations

---

## 📈 Métriques et KPIs

### Score de Sécurité (0-100%)
Indicateur global calculé selon:
- **40%**: Couverture RLS (tables protégées / total)
- **30%**: Densité des policies (policies / tables RLS)
- **30%**: Sécurité des fonctions (fonctions avec search_path / total)

**Seuils:**
- 🟢 90-100%: Excellent
- 🟡 70-89%: Bon (amélioration possible)
- 🟠 50-69%: Moyen (action recommandée)
- 🔴 <50%: Critique (action immédiate)

### Alertes Actives
Nombre d'alertes ouvertes nécessitant attention:
- **Critiques**: Action immédiate requise
- **Hautes**: Action urgente dans 24h
- **Moyennes**: Action dans la semaine
- **Basses**: Action opportuniste

### Tables RLS
Nombre de tables avec Row Level Security activé.
**Objectif**: 100% des tables contenant des données utilisateur.

### Policies Actives
Nombre total de policies RLS définies.
**Recommandation**: Minimum 2-4 policies par table (SELECT, INSERT, UPDATE, DELETE).

---

## 🎨 Interface Utilisateur

### Section 1: Cards Métriques
5 cartes affichant les KPIs principaux:
1. **Score de sécurité** avec tendance (↑/↓)
2. **Alertes actives** avec compteur critiques
3. **Tables RLS** (couverture %)
4. **Policies actives** (total)
5. **Corrections appliquées** (historique)

### Section 2: Graphiques
**Graphique 1 - Évolution du Score**
- Type: Area chart
- Période: 30 derniers snapshots
- Mise à jour: Toutes les 5 minutes

**Graphique 2 - Tendance des Issues**
- Type: Line chart multi-séries
- Séries: Critical, High, Medium, Low
- Période: 7 derniers jours

### Section 3: Onglets Détaillés

#### Onglet "Vue d'ensemble"
Métriques détaillées par niveau de gravité:
- Issues critiques (rouge)
- Issues hautes (orange)
- Issues moyennes (jaune)
- Issues basses (bleu)

#### Onglet "Alertes" (temps réel)
Liste des alertes actives avec:
- Titre et description
- Badge de gravité
- Statut (open/acknowledged/resolved)
- Recommandation d'action
- Ressource affectée
- Actions: Marquer comme vu / Résolu

**Actualisation automatique**: Toutes les 60 secondes

#### Onglet "Historique"
Chronologie complète des corrections:
- Type de correction
- Ressource affectée
- Problème identifié
- Solution appliquée
- Date et heure
- Notes additionnelles

---

## 🚨 Types d'Alertes

### 1. `low_security_score`
**Déclencheur**: Score < 90%  
**Gravité**: Medium  
**Action**: Vérifier tables sans RLS et fonctions non sécurisées

### 2. `rls_missing`
**Déclencheur**: Tables sans RLS détectées  
**Gravité**: High  
**Action**: Activer RLS sur toutes les tables sensibles

### 3. `new_vulnerability`
**Déclencheur**: Linter détecte nouvelle issue critique  
**Gravité**: Critical  
**Action**: Corriger immédiatement

### 4. `policy_missing`
**Déclencheur**: Table RLS sans policies  
**Gravité**: High  
**Action**: Définir policies appropriées

### 5. `function_unsafe`
**Déclencheur**: Fonction SECURITY DEFINER sans search_path  
**Gravité**: Medium  
**Action**: Ajouter `SET search_path = public`

---

## 🔄 Workflow de Résolution d'Alertes

### Étape 1: Détection
Alerte créée automatiquement par `security-metrics` function.

### Étape 2: Reconnaissance
Utilisateur clique sur "Vu" pour indiquer qu'il a pris connaissance.
- Statut: `open` → `acknowledged`

### Étape 3: Résolution
Après avoir appliqué la correction:
1. Cliquer sur "Résolu"
2. L'alerte passe à `resolved`
3. `resolved_at` est enregistré

### Étape 4: Vérification
Prochaine exécution de `security-metrics` valide la correction.
Si le problème persiste, une nouvelle alerte est créée.

---

## 📅 Configuration des Snapshots Automatiques

### Via Cron Job Supabase

```sql
-- Créer un cron job pour snapshots horaires
SELECT cron.schedule(
  'security-metrics-hourly',
  '0 * * * *', -- Toutes les heures à minute 0
  $$
  SELECT net.http_post(
    url := 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/security-metrics',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  ) as request_id;
  $$
);
```

### Via GitHub Actions

```yaml
name: Security Metrics Snapshot
on:
  schedule:
    - cron: '0 */6 * * *' # Toutes les 6 heures
  workflow_dispatch: # Manuel

jobs:
  snapshot:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Security Metrics
        run: |
          curl -X POST \
            https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/security-metrics \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
```

---

## 🎯 Bonnes Pratiques

### Surveillance Continue
✅ Configurer snapshots automatiques toutes les heures  
✅ Vérifier le dashboard quotidiennement  
✅ Réagir aux alertes critiques dans les 2 heures  
✅ Planifier corrections moyennes/basses hebdomadairement

### Traçabilité
✅ Documenter chaque correction dans `notes`  
✅ Référencer le fichier de migration dans `migration_file`  
✅ Archiver les before/after states pour audit

### Amélioration Continue
✅ Analyser les tendances mensuelles  
✅ Identifier les patterns de dégradation  
✅ Automatiser les corrections récurrentes  
✅ Former l'équipe sur les nouvelles vulnérabilités

---

## 🔐 Permissions et Accès

### Lecture (Authenticated Users)
- ✅ Consulter métriques
- ✅ Visualiser alertes
- ✅ Voir historique corrections
- ✅ Actualiser métriques

### Écriture (Service Role)
- 🔒 Créer snapshots
- 🔒 Créer alertes
- 🔒 Enregistrer corrections

### Actions Utilisateur (Authenticated)
- ✏️ Changer statut alertes (acknowledged, resolved, dismissed)
- ✏️ Ajouter notes sur alertes (à venir)

---

## 📊 Exemples de Données

### Correction Enregistrée
```json
{
  "correction_type": "security_definer_view",
  "table_or_function_name": "med_mng_view_library",
  "issue_description": "View using SECURITY DEFINER allowing privilege escalation",
  "correction_applied": "Converted to SECURITY INVOKER",
  "severity": "critical",
  "applied_at": "2025-11-07T14:30:00Z",
  "migration_file": "20251107_fix_security_definer_views.sql",
  "notes": "Part of security audit cleanup"
}
```

### Alerte Active
```json
{
  "alert_type": "rls_missing",
  "severity": "high",
  "title": "3 tables sans RLS",
  "description": "3 tables n'ont pas RLS activé, ce qui peut exposer des données",
  "affected_resource": "multiple_tables",
  "recommendation": "Activer RLS sur toutes les tables contenant des données sensibles",
  "status": "open",
  "metadata": {
    "count": 3,
    "tables": ["temp_uploads", "cache_data", "session_tokens"]
  }
}
```

---

## 🚀 Accès au Dashboard

### Via Navigation
1. Cliquer sur avatar utilisateur (coin haut-droit)
2. Sélectionner **"Monitoring Sécurité"**

### Via URL Directe
```
https://votre-domaine.com/security-monitoring
```

---

## 🆘 Troubleshooting

### Métriques ne se chargent pas
1. Vérifier que l'edge function est déployée
2. Tester l'appel manuel: `supabase functions invoke security-metrics`
3. Vérifier les logs: `supabase functions logs security-metrics`

### Alertes non créées
1. Vérifier les policies RLS sur `security_alerts`
2. Confirmer que `security-metrics` s'exécute correctement
3. Vérifier les logs de la function

### Score incorrect
1. Actualiser manuellement les métriques
2. Vérifier le calcul dans l'edge function
3. Comparer avec les métriques brutes dans Supabase Dashboard

---

## 📈 Roadmap

### v1.1 (Court terme)
- [ ] Export PDF des rapports de sécurité
- [ ] Notifications email pour alertes critiques
- [ ] Filtres avancés sur historique
- [ ] Comparaison entre périodes

### v1.2 (Moyen terme)
- [ ] Intégration Slack/Discord pour alertes
- [ ] Suggestions automatiques de corrections
- [ ] Tests automatisés RLS
- [ ] Dashboard mobile responsive

### v2.0 (Long terme)
- [ ] Machine Learning pour prédiction de vulnérabilités
- [ ] Benchmark vs. meilleures pratiques industrie
- [ ] Audit automatique après chaque déploiement
- [ ] Certification de sécurité automatisée

---

**✅ Système de monitoring de sécurité complet et opérationnel !**
