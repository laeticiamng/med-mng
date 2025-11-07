# 📊 Dashboard Accessibilité GitHub - Documentation Complète

## 🎯 Vue d'ensemble

Le Dashboard Accessibilité GitHub est un outil personnalisé qui utilise l'API GraphQL de GitHub pour visualiser en temps réel les métriques de conformité d'accessibilité de votre projet.

### Fonctionnalités principales

✅ **Métriques en temps réel** - Données actualisées depuis GitHub
✅ **PRs bloquées** - Liste des PRs avec violations d'accessibilité
✅ **Violations par type** - Graphique des violations détectées
✅ **Métriques par développeur** - Taux de conformité individuel
✅ **Temps de correction** - Analyse des délais de résolution

---

## 🚀 Accès au Dashboard

### URL de production

```
https://votre-app.lovableproject.com/accessibility-dashboard
```

### Navigation interne

Depuis n'importe quelle page de l'application :
```typescript
navigate('/accessibility-dashboard')
```

---

## 🔑 Configuration Initiale

### 1. Créer un Personal Access Token GitHub

Le dashboard nécessite un token GitHub avec les permissions suivantes :

1. Accédez à GitHub → Settings → Developer settings → Personal access tokens
2. Ou utilisez ce lien direct : https://github.com/settings/tokens/new
3. Sélectionnez les permissions suivantes :
   - ✅ **repo** (Full control of private repositories)
   - ✅ **read:org** (Read org and team membership)
4. Donnez un nom descriptif : "MED-MNG Accessibility Dashboard"
5. Définissez une expiration (recommandé : 90 jours)
6. Cliquez sur "Generate token"
7. **Copiez le token** (vous ne pourrez plus le voir après)

### 2. Configurer le Dashboard

Au premier accès au dashboard :

1. Collez votre token GitHub dans le champ prévu
2. Cliquez sur "Enregistrer et continuer"
3. Le token est stocké localement dans votre navigateur
4. Cliquez sur "Actualiser" pour charger les métriques

---

## 📊 Métriques Disponibles

### 1. Vue d'ensemble globale

**6 indicateurs clés** :

| Métrique | Description | Seuils |
|----------|-------------|--------|
| PRs Totales | Nombre total de PRs analysées | - |
| PRs Conformes | PRs avec tous les tests d'accessibilité réussis | - |
| PRs Bloquées | PRs avec violations actives non résolues | ⚠️ > 5 |
| Taux de Conformité | Pourcentage global de conformité | 🟢 ≥ 80% / 🟡 60-79% / 🔴 < 60% |
| Temps de Correction | Temps moyen pour corriger les violations (heures) | 🟢 < 24h / 🟡 24-48h / 🔴 > 48h |
| PRs Échouées | PRs ayant eu au moins une violation | ⚠️ > 10 |

### 2. PRs Bloquées

Liste détaillée des PRs avec violations d'accessibilité :

- **Numéro et titre** de la PR
- **Auteur** et date de création
- **Tests échoués** avec descriptions détaillées
- **Lien direct** vers la PR sur GitHub

### 3. Violations par Type

Graphique en barres coloré selon la sévérité :

**Niveaux de sévérité** :
- 🔴 **Critique** - Empêche l'utilisation par certains utilisateurs
- 🟠 **Sérieux** - Difficulté importante d'accès
- 🟡 **Modéré** - Gêne l'expérience utilisateur
- 🟢 **Mineur** - Impact faible

**Types de violations détectés** :
- Contraste des couleurs insuffisant
- Labels ARIA manquants
- Hiérarchie des titres incorrecte
- Textes alternatifs manquants
- Navigation clavier défaillante
- Landmarks ARIA absents

### 4. Métriques par Développeur

Tableau de bord individuel pour chaque contributeur :

**Pour chaque développeur** :
- 🏆 Badge si taux de conformité ≥ 90%
- Nombre total de PRs
- PRs passées / échouées
- Barre de progression du taux de conformité
- Temps moyen de correction

**Classement** : Les développeurs sont triés par taux de conformité décroissant.

---

## 🔄 Mise à Jour des Données

### Actualisation manuelle

Cliquez sur le bouton **"Actualiser"** en haut à droite pour :
- Récupérer les dernières PRs
- Analyser les nouveaux status checks
- Recalculer toutes les métriques

### Fréquence de mise à jour

- **Cache** : Les données sont mises en cache pendant 5 minutes
- **Actualisation** : Recommandée toutes les 10-15 minutes
- **Automatique** : Pas d'actualisation automatique pour économiser les appels API

---

## 📥 Export des Métriques

### Formats disponibles

Le dashboard propose **4 formats d'export** différents :

#### 1. **CSV Complet** 📊
Format idéal pour l'analyse dans Excel ou Google Sheets.

**Contenu** :
- Métriques globales (taux de conformité, temps moyen, etc.)
- Liste détaillée des violations par type
- PRs bloquées avec statut et auteur
- Métriques individuelles par développeur

**Usage recommandé** : Analyse approfondie, création de graphiques personnalisés

#### 2. **JSON Complet** 💻
Structure hiérarchique pour intégrations techniques et API.

**Contenu** :
```json
{
  "metadata": { "generatedAt": "...", "version": "1.0.0" },
  "summary": { "totalPRs": 50, "conformityRate": 85.3, ... },
  "violations": [...],
  "blockedPRs": [...],
  "developerMetrics": [...]
}
```

**Usage recommandé** : Intégrations automatisées, dashboards externes, pipelines CI/CD

#### 3. **Résumé Rapide (CSV)** ⚡
Version allégée avec les indicateurs essentiels.

**Contenu** :
- Taux de conformité
- Nombre de PRs conformes / total
- PRs bloquées
- Types de violations détectés
- Développeurs actifs

**Usage recommandé** : Partage rapide par email, stand-ups quotidiens

#### 4. **Rapport Mensuel (CSV)** 🎯
Rapport exécutif formaté avec recommandations automatiques.

**Structure** :
1. **Synthèse Exécutive** - Indicateurs vs objectifs
2. **Violations Détectées** - Classement par impact
3. **Performance par Développeur** - Top contributeurs
4. **Recommandations** - Actions prioritaires automatiques

**Usage recommandé** : Réunions mensuelles, reporting management, audits

### Comment exporter

1. Cliquez sur le bouton **"Exporter"** en haut à droite
2. Choisissez le format souhaité dans le menu déroulant
3. Le fichier se télécharge automatiquement

**Nomenclature des fichiers** :
- CSV/JSON : `accessibility-metrics-YYYY-MM-DD-HH-mm-ss.[csv|json]`
- Résumé : `accessibility-summary-YYYY-MM-DD-HH-mm-ss.csv`
- Mensuel : `rapport-accessibilite-YYYY-MM.csv`

### Intégration automatique

Pour automatiser l'export via scripts :

```typescript
import { exportMetricsToJSON } from '@/utils/exportAccessibilityMetrics';

// Récupérer les métriques
const metrics = await fetchGitHubMetrics();

// Exporter automatiquement
exportMetricsToJSON(metrics);
```

---

## 🛠️ Architecture Technique

### Composants React

```
src/
├── pages/
│   └── AccessibilityDashboard.tsx           # Page principale
├── components/accessibility/
│   ├── AccessibilityDashboardMetrics.tsx    # Cartes métriques globales
│   ├── ViolationsChart.tsx                  # Graphique violations
│   ├── DeveloperMetricsTable.tsx            # Tableau développeurs
│   └── BlockedPRsList.tsx                   # Liste PRs bloquées
└── hooks/
    └── useGitHubAccessibilityMetrics.ts     # Hook API GitHub
```

### Hook personnalisé

Le hook `useGitHubAccessibilityMetrics` :

1. **Récupère** les 50 dernières PRs via GraphQL
2. **Analyse** les status checks d'accessibilité
3. **Extrait** les violations par type et sévérité
4. **Calcule** les métriques par développeur
5. **Retourne** un objet `metrics` structuré

### Requête GraphQL

```graphql
query($owner: String!, $name: String!, $first: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequests(first: $first, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        id
        number
        title
        author { login }
        createdAt
        closedAt
        merged
        commits(last: 1) {
          nodes {
            commit {
              statusCheckRollup {
                state
                contexts(first: 20) {
                  nodes {
                    ... on StatusContext {
                      context
                      state
                      description
                    }
                    ... on CheckRun {
                      name
                      conclusion
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### Analyse des violations

Le système identifie automatiquement les violations selon les mots-clés dans les descriptions :

| Mot-clé détecté | Type de violation | Sévérité |
|-----------------|-------------------|----------|
| "color contrast" | Contraste des couleurs | Sérieux |
| "aria", "label" | Labels ARIA manquants | Sérieux |
| "heading" | Hiérarchie des titres | Modéré |
| "alt", "image" | Textes alternatifs | Critique |
| "keyboard", "focus" | Navigation clavier | Critique |
| "landmark" | Landmarks ARIA | Modéré |

---

## 📈 Visualisations

### Graphique Recharts

Le dashboard utilise **Recharts** pour visualiser les violations :

```tsx
<BarChart data={violations}>
  <Bar dataKey="count" fill={colorBySeverity}>
    {/* Barres colorées selon la sévérité */}
  </Bar>
</BarChart>
```

**Couleurs** :
- 🔴 Critique : `#ef4444`
- 🟠 Sérieux : `#f97316`
- 🟡 Modéré : `#eab308`
- 🟢 Mineur : `#22c55e`

### Barres de progression

Les métriques par développeur incluent une barre de progression :

```tsx
<Progress value={conformityRate} className="h-2" />
```

---

## 🔒 Sécurité

### Stockage du token

- **LocalStorage** : Le token est stocké localement dans le navigateur
- **Pas de backend** : Aucune donnée envoyée à un serveur tiers
- **HTTPS** : Communications sécurisées avec GitHub

### Permissions minimales

Le token ne nécessite que :
- `repo` pour lire les PRs et status checks
- `read:org` pour les repositories d'organisation

### Révocation

Pour révoquer l'accès :
1. Cliquez sur "Reconfigurer" dans le dashboard
2. Ou allez sur GitHub → Settings → Developer settings → Personal access tokens
3. Cliquez sur "Revoke" à côté du token

---

## 🎨 Personnalisation

### Configuration du repository

Pour analyser un autre repository, modifiez les constantes dans `useGitHubAccessibilityMetrics.ts` :

```typescript
const REPO_OWNER = 'votre-organisation';
const REPO_NAME = 'votre-repo';
```

### Nombre de PRs analysées

Par défaut, les 50 dernières PRs sont analysées. Pour modifier :

```typescript
const PULL_REQUESTS_QUERY = `
  query($owner: String!, $name: String!, $first: Int!) {
    repository(owner: $owner, name: $name) {
      pullRequests(first: $first, ...) {
        // Changez $first à 100 par exemple
      }
    }
  }
`;
```

### Seuils de conformité

Modifiez les seuils dans `DeveloperMetricsTable.tsx` :

```typescript
const getConformityColor = (rate: number) => {
  if (rate >= 90) return 'text-green-600';  // Excellent
  if (rate >= 70) return 'text-yellow-600'; // Acceptable
  return 'text-red-600';                    // À améliorer
};
```

---

## 📊 Exemples d'utilisation

### Scénario 1 : Monitoring quotidien

**Objectif** : Vérifier l'état des tests d'accessibilité chaque matin

1. Accédez au dashboard : `/accessibility-dashboard`
2. Cliquez sur "Actualiser"
3. Vérifiez le **Taux de Conformité** global
4. Consultez les **PRs Bloquées** s'il y en a
5. Identifiez les développeurs avec un taux < 80%

### Scénario 2 : Analyse d'une violation

**Objectif** : Comprendre pourquoi une violation récurrente apparaît

1. Consultez le graphique **Violations par Type**
2. Identifiez le type avec le plus d'occurrences
3. Notez les numéros de PRs concernées
4. Cliquez sur "Voir" dans la section **PRs Bloquées**
5. Analysez les descriptions des tests échoués

### Scénario 3 : Suivi d'équipe

**Objectif** : Améliorer le taux de conformité de l'équipe

1. Consultez les **Métriques par Développeur**
2. Identifiez les contributeurs avec taux < 70%
3. Notez leur **Temps de Correction** moyen
4. Organisez une formation ciblée sur les violations fréquentes
5. Suivez l'évolution hebdomadaire

---

## 🐛 Dépannage

### Problème : "GitHub token requis"

**Solution** :
1. Vérifiez que vous avez bien saisi le token
2. Assurez-vous que le token n'a pas expiré
3. Vérifiez les permissions (repo + read:org)

### Problème : "GitHub API error"

**Solutions** :
- Vérifiez votre connexion Internet
- Attendez quelques minutes (limite de taux API)
- Vérifiez que le repository existe et est accessible
- Assurez-vous que le token a les bonnes permissions

### Problème : Aucune donnée affichée

**Solutions** :
1. Cliquez sur "Actualiser"
2. Vérifiez que des PRs existent dans le repository
3. Assurez-vous que les workflows d'accessibilité ont été exécutés
4. Consultez la console navigateur pour les erreurs

### Problème : Métriques incorrectes

**Solutions** :
1. Actualisez les données (cache de 5 minutes)
2. Vérifiez que les workflows CI/CD incluent bien les tests d'accessibilité
3. Assurez-vous que les noms de checks incluent "accessibility", "axe" ou "Lighthouse"

---

## 🔗 Intégration CI/CD

Ce dashboard fonctionne avec le workflow d'accessibilité existant :

```yaml
# .github/workflows/accessibility-ci.yml
name: 🧑‍🦯 Tests Accessibilité
on: [push, pull_request]

jobs:
  accessibility-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Tests axe-core
        run: npm run test:accessibility
```

**Le dashboard détecte automatiquement** les résultats de ce workflow !

---

## 📚 Ressources

### Documentation GitHub

- [GitHub GraphQL API](https://docs.github.com/en/graphql)
- [Creating Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Status Checks API](https://docs.github.com/en/rest/checks)

### Documentation Projet

- [Tests Accessibilité CI/CD](./TESTS-ACCESSIBILITE-CI-CD.md)
- [Branch Protection Rules](./GITHUB-BRANCH-PROTECTION.md)
- [Accessibilité 100% Certifiée](./ACCESSIBILITE-100-CERTIFIEE.md)

### Outils externes

- [Recharts Documentation](https://recharts.org/)
- [React Query](https://tanstack.com/query/latest)
- [Shadcn/ui Components](https://ui.shadcn.com/)

---

## 🎯 Roadmap Futures Améliorations

### Court terme
- [ ] Export des métriques en CSV/JSON
- [ ] Notifications par email si taux < 80%
- [ ] Comparaison historique (graphique d'évolution)

### Moyen terme
- [ ] Dashboard multi-repositories
- [ ] Webhooks pour actualisation automatique
- [ ] Intégration Slack/Discord

### Long terme
- [ ] Machine Learning pour prédire les violations
- [ ] Suggestions automatiques de correction
- [ ] Tableau de bord d'équipe avancé

---

## 👥 Support

Pour toute question ou problème :

1. **Documentation** : Consultez ce fichier d'abord
2. **Issues GitHub** : Créez une issue avec le label `accessibility-dashboard`
3. **Contact** : med-mng-support@emotionscare.com

---

## 📄 Licence

Ce dashboard fait partie du projet MED-MNG.
© 2025 EmotionsCare - Tous droits réservés.

---

**Dernière mise à jour** : 2025-11-07
**Version** : 1.0.0
**Auteur** : EmotionsCare DevOps Team
