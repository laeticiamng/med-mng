# Système de Méthodes de Révision

## Vue d'ensemble

Le système de méthodes de révision permet aux étudiants de Med-Mng de choisir entre **3 stratégies d'apprentissage** optimisées :

1. **Méthode des J 2.0** - Répétition espacée (J+2, J+7, J+14, J+30)
2. **Méthode Blocs Profonds** - Deep focus sur N items par jour
3. **Méthode QCM First** - Questions d'abord, puis fiches ciblées

## Architecture

### Base de données (Supabase)

#### Nouvelle migration : `20251116000000_add_revision_methods.sql`

**Tables créées :**

1. **`revision_schedule`** - Planning des révisions
   - Stocke toutes les révisions planifiées pour les 3 méthodes
   - Champs clés : `item_id`, `item_type`, `scheduled_for`, `status`, `revision_method`, `method_metadata`
   - Statuts : `PENDING`, `DONE`, `MISSED`, `SKIPPED`

2. **`revision_method_config`** - Configuration par méthode
   - Configuration personnalisée de chaque méthode par utilisateur
   - JSONB flexible pour stocker les paramètres spécifiques
   - Un seul config actif par méthode par utilisateur

3. **`revision_sessions`** - Historique des sessions
   - Enregistre toutes les sessions de révision complétées
   - Métriques : `success_rate`, `total_duration_minutes`, `items_reviewed`

4. **`method_performance_metrics`** - Analytics
   - Métriques agrégées par méthode et période
   - Tracking de streaks et taux de complétion

**Colonne ajoutée :**
- `user_profiles.revision_method` - Méthode active de l'utilisateur

**Fonctions SQL créées :**

- `get_today_revisions(user_id)` - Révisions du jour
- `get_overdue_revisions(user_id)` - Révisions en retard
- `schedule_j_method_revisions(...)` - Planifier J+2, J+7, J+14, J+30
- `mark_revision_done(...)` - Marquer une révision comme terminée
- `get_revision_stats_by_method(...)` - Statistiques par méthode

### Frontend

#### Types TypeScript

**Fichier :** `src/types/revision-methods.ts`

- `RevisionMethodType` - `'J_METHOD' | 'BLOCK_METHOD' | 'QCM_FIRST'`
- `RevisionStatus` - `'PENDING' | 'DONE' | 'MISSED' | 'SKIPPED'`
- `RevisionSchedule` - Item de révision planifié
- `RevisionSession` - Session de révision complétée
- `JMethodConfig`, `BlockMethodConfig`, `QCMFirstConfig` - Configurations

**Constante :** `REVISION_METHODS`
- Métadonnées de chaque méthode (nom, description, icône, pros/cons, etc.)

#### Services

**Fichier :** `src/services/revisionMethods.service.ts`

**Fonctions principales :**

```typescript
// User method
getUserRevisionMethod(userId)
updateUserRevisionMethod(userId, method)

// Schedule
getTodayRevisions(userId)
getOverdueRevisions(userId)
createRevisionSchedule(revision)
markRevisionDone(params)

// Méthode des J
scheduleJMethodRevisions(params)
getJMethodConfig(userId)
updateJMethodConfig(userId, config)

// Méthode Blocs Profonds
generateBlockMethodSchedule(userId, itemIds, config)
getBlockMethodConfig(userId)
updateBlockMethodConfig(userId, config)

// Méthode QCM First
analyzeQCMAndScheduleReviews(userId, qcmResults, config)
getQCMFirstConfig(userId)
updateQCMFirstConfig(userId, config)

// Sessions & Stats
createRevisionSession(session)
getRevisionSessions(userId, limit)
getRevisionStatsByMethod(userId, method)
```

#### Hooks React Query

**Fichier :** `src/hooks/useRevisionMethods.ts`

**Hooks disponibles :**

```typescript
// User method
useUserRevisionMethod()
useUpdateRevisionMethod()

// Schedule
useTodayRevisions()
useOverdueRevisions()
useRevisionSchedule(filters?)
useCreateRevisionSchedule()
useUpdateRevisionSchedule()
useMarkRevisionDone()

// Méthode des J
useScheduleJMethod()
useJMethodConfig()
useUpdateJMethodConfig()

// Méthode Blocs Profonds
useGenerateBlockMethodSchedule()
useBlockMethodConfig()
useUpdateBlockMethodConfig()

// Méthode QCM First
useAnalyzeQCMAndSchedule()
useQCMFirstConfig()
useUpdateQCMFirstConfig()

// Sessions & Stats
useCreateRevisionSession()
useRevisionSessions(limit)
useRevisionStats(method)
useMethodPerformanceMetrics(method, periodStart?, periodEnd?)
```

#### Composants UI

**1. `MethodSelector.tsx`**
- Affichage des 3 méthodes sous forme de cartes
- Sélection avec dialog de confirmation si changement
- Props : `currentMethod`, `onMethodSelected`, `showCurrentBadge`, `allowChange`

**2. `TodayRevisionsView.tsx`**
- Affiche les révisions du jour pour une méthode donnée
- S'adapte à la méthode (affichage des metadata spécifiques)
- Bouton "Terminé" pour marquer les révisions
- Progress bar de complétion

**3. `RevisionDashboard.tsx` (modifié)**
- Ajout d'un banner affichant la méthode active
- Nouvel onglet "Méthode" pour choisir/changer de méthode
- Onglet "Aujourd'hui" adapté : utilise `TodayRevisionsView` si méthode active
- Statistiques mises à jour avec les données du nouveau système

## Fonctionnement des 3 Méthodes

### 1. Méthode des J 2.0

**Principe :**
Répétition espacée scientifiquement prouvée. Chaque item est automatiquement revu à J+2, J+7, J+14, J+30 après la première étude.

**Configuration :**
```typescript
{
  intervals: [2, 7, 14, 30],
  auto_schedule: true,
  notify_on_review_day: true
}
```

**Workflow :**
1. L'utilisateur étudie un item (fiche, QCM, etc.)
2. La fonction `scheduleJMethodRevisions()` crée 4 entrées dans `revision_schedule`
3. Chaque jour, `getTodayRevisions()` retourne les items à réviser
4. L'utilisateur marque les révisions comme `DONE`
5. Les items non faits passent en `MISSED`

**Metadata :**
```typescript
{
  repetition_number: 1-4,
  interval_days: 2|7|14|30,
  initial_date: "2025-11-16"
}
```

### 2. Méthode Blocs Profonds

**Principe :**
Concentration intense sur un petit nombre d'items par jour (deep work).

**Configuration :**
```typescript
{
  items_per_day: 5,
  target_date: "2025-06-15",
  deep_work_duration: 60,
  include_weekends: false,
  preferred_time?: 'morning' | 'afternoon' | 'evening'
}
```

**Workflow :**
1. L'utilisateur configure : items à couvrir, items/jour, date cible
2. `generateBlockMethodSchedule()` répartit les items sur les jours disponibles
3. Chaque jour, l'utilisateur voit N items à travailler en profondeur
4. Pas de répétition stricte (peut être ajouté en V2)

**Metadata :**
```typescript
{
  block_position: 1-N,
  session_duration: 60,
  total_items_in_block: 5
}
```

### 3. Méthode QCM First

**Principe :**
Apprentissage par testing : commence par les QCM, puis revoit les fiches où tu as des difficultés.

**Configuration :**
```typescript
{
  questions_per_session: 20,
  difficulty_threshold: 0.6,
  auto_review: true,
  min_score_to_pass: 70
}
```

**Workflow :**
1. L'utilisateur fait une session QCM
2. `analyzeQCMAndScheduleReviews()` identifie les items avec erreurs
3. Les fiches correspondantes sont automatiquement planifiées pour J+1 ou J+2
4. Plus d'erreurs = révision plus proche

**Metadata :**
```typescript
{
  question_ids: ["q1", "q2", "q3"],
  error_count: 3,
  last_score: 0.45
}
```

## Utilisation dans le code

### Exemple 1 : Planifier des révisions J Method

```typescript
import { useScheduleJMethod } from '@/hooks/useRevisionMethods'

function MyComponent() {
  const scheduleJ = useScheduleJMethod()

  const handleItemStudied = async (itemId: string, itemTitle: string) => {
    await scheduleJ.mutateAsync({
      item_type: 'edn',
      item_id: itemId,
      item_title: itemTitle,
      item_data: { tags: ['cardio'] }
    })
    // 4 révisions créées : J+2, J+7, J+14, J+30
  }
}
```

### Exemple 2 : Afficher les révisions du jour

```typescript
import { useTodayRevisions, useUserRevisionMethod } from '@/hooks/useRevisionMethods'
import { TodayRevisionsView } from '@/components/revision/TodayRevisionsView'

function DailyRevisions() {
  const { data: method } = useUserRevisionMethod()
  const { data: todayRevisions } = useTodayRevisions()

  if (!method) return <p>Choisissez une méthode d'abord</p>

  return <TodayRevisionsView method={method} />
}
```

### Exemple 3 : Changer de méthode

```typescript
import { useUpdateRevisionMethod } from '@/hooks/useRevisionMethods'
import { MethodSelector } from '@/components/revision/MethodSelector'

function Settings() {
  const updateMethod = useUpdateRevisionMethod()

  return (
    <MethodSelector
      currentMethod="J_METHOD"
      onMethodSelected={(method) => {
        // Dialog de confirmation affiché automatiquement
      }}
    />
  )
}
```

## Migration et Déploiement

### Étapes de déploiement

1. **Appliquer la migration SQL**
   ```bash
   # En production
   npx supabase db push

   # Ou via dashboard Supabase
   # > SQL Editor > Copier le contenu de 20251116000000_add_revision_methods.sql
   ```

2. **Vérification post-migration**
   - Vérifier que les 4 tables sont créées
   - Vérifier que `user_profiles.revision_method` existe
   - Tester les fonctions SQL avec des données de test

3. **Déploiement frontend**
   - Build : `npm run build`
   - Deploy : Vercel/Netlify auto-deploy depuis la branche

### Compatibilité arrière

Le système est **rétrocompatible** :
- Si `revision_method` est `NULL` → ancien système utilisé
- Si `revision_method` est défini → nouveau système utilisé
- Les deux systèmes coexistent dans le `RevisionDashboard`

## TODO / Améliorations futures

- [ ] **Notifications push** quand révisions du jour disponibles
- [ ] **Analytics comparatives** entre les 3 méthodes
- [ ] **Recommandation automatique** de méthode basée sur profil
- [ ] **Gamification** : badges pour streaks par méthode
- [ ] **Export/import** de planning de révision
- [ ] **Rappels cycliques** dans Méthode Blocs Profonds
- [ ] **QCM adaptatifs** pour QCM First
- [ ] **Onboarding interactif** pour choisir sa méthode
- [ ] **Tests A/B** pour optimiser les intervalles de la Méthode des J
- [ ] **Mode hybride** : combiner plusieurs méthodes

## Support

Pour toute question ou bug, contacter l'équipe de développement ou créer une issue sur GitHub.

---

**Version :** 1.0
**Date :** 2025-11-16
**Auteur :** Claude (AI Assistant)
