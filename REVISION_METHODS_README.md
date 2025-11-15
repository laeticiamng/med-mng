# Système de Méthodes de Révision - Med MNG

## 📋 Vue d'ensemble

Ce système permet aux étudiants de choisir parmi **3 méthodes de révision** optimisées pour différents styles d'apprentissage :

1. **Méthode des J 2.0** 📅 - Répétition espacée (J+2, J+7, J+14, J+30)
2. **Méthode Blocs Profonds** 🎯 - Deep focus sur un nombre limité d'items par jour
3. **Méthode QCM First** ❓ - Questions d'abord, puis fiches ciblées sur les erreurs

---

## 🗂️ Architecture

### Base de données (Supabase/PostgreSQL)

#### Tables créées

1. **`user_profiles` (modifié)**
   - `revision_method` : Méthode active ('J_METHOD', 'BLOCK_METHOD', 'QCM_FIRST')
   - `revision_method_config` : Configuration JSON de la méthode
   - `revision_method_changed_at` : Date du dernier changement

2. **`revision_schedule`**
   - Planning des révisions pour toutes les méthodes
   - Colonnes clés : `item_id`, `scheduled_for`, `status`, `revision_method`, `revision_number`

3. **`revision_method_effectiveness`**
   - Suivi de l'efficacité de chaque méthode par utilisateur
   - Métriques : `total_sessions`, `average_success_rate`, `streak_days`

4. **`block_method_config`**
   - Configuration spécifique pour la Méthode Blocs Profonds
   - `items_per_day`, `target_date`, `selected_items`

5. **`qcm_first_sessions`**
   - Sessions QCM First avec suggestions de fiches
   - `total_questions`, `success_rate`, `suggested_fiches`

### Fichiers créés

```
src/
├── types/
│   └── revision-methods.ts          # Types TypeScript complets
├── services/
│   └── revision-methods.service.ts  # Logique métier et API Supabase
├── hooks/
│   └── useRevisionMethods.ts        # Hook React principal
├── components/revision/
│   ├── RevisionMethodSelector.tsx   # Sélection de méthode
│   ├── JMethodView.tsx             # Vue Méthode des J
│   ├── BlockMethodView.tsx         # Vue Blocs Profonds
│   ├── QCMFirstView.tsx            # Vue QCM First
│   └── RevisionDashboard.tsx (modifié) # Dashboard principal
└── supabase/migrations/
    └── 20251115150000_create_revision_methods_system.sql
```

---

## 🎯 Méthodes de révision détaillées

### 1. Méthode des J 2.0 📅

**Principe** : Répétition espacée automatique

**Fonctionnement** :
- À chaque fois qu'un étudiant découvre un item (fiche, QCM, cas) :
  - Révision automatiquement planifiée à **J+2, J+7, J+14, J+30**
- Chaque jour, l'étudiant voit :
  - Les révisions planifiées pour aujourd'hui
  - Les révisions en retard (prioritaires)
- Actions possibles :
  - ✅ Révision faite
  - 🔁 Reporter au lendemain
  - ⏭️ Passer

**Utilisation** :
```typescript
import { useRevisionMethods } from '@/hooks/useRevisionMethods';

const { markItemSeenAndSchedule } = useRevisionMethods();

// Quand un étudiant termine une fiche :
await markItemSeenAndSchedule(
  itemId,
  'fiche',
  'FICHE-DIABETE-001'
);
// → Crée automatiquement 4 révisions espacées
```

**Meilleur pour** :
- Préparation longue durée (plusieurs mois)
- Consolidation mémoire long terme
- Étudiants réguliers et disciplinés

---

### 2. Méthode Blocs Profonds 🎯

**Principe** : Deep work sur peu d'items

**Fonctionnement** :
- L'étudiant configure :
  - Nombre d'items par jour (ex: 5)
  - Date cible (examen)
  - Items à couvrir
- Le système génère un planning quotidien
- Chaque item = 3 phases :
  1. 📖 Lecture active de la fiche
  2. ❓ QCM sur le sujet
  3. ✍️ Mini-synthèse

**Utilisation** :
```typescript
const { createBlockConfig } = useRevisionMethods();

await createBlockConfig({
  items_per_day: 5,
  target_date: '2025-06-15',
  selected_items: ['uuid1', 'uuid2', 'uuid3', ...]
});
// → Génère planning quotidien jusqu'à la date cible
```

**Meilleur pour** :
- Sujets complexes nécessitant du temps
- Étudiants préférant la concentration profonde
- Préparation intensive courte durée

---

### 3. Méthode QCM First ❓

**Principe** : Questions d'abord, fiches ciblées après

**Fonctionnement** :
- Chaque session :
  1. L'étudiant répond à N questions (ex: 20 QCM)
  2. Le système analyse les erreurs
  3. Suggère les fiches à revoir (basé sur les erreurs)
  4. L'étudiant ne révise QUE les fiches suggérées
- Les fiches suggérées sont planifiées pour J+1 ou J+2

**Utilisation** :
```typescript
const { createQCMSession } = useRevisionMethods();

// Après une session QCM :
await createQCMSession({
  total_questions: 20,
  correct_answers: 14,
  incorrect_answers: 6,
  suggested_fiches: ['fiche-cardio-1', 'fiche-pneumo-2']
});
// → Planifie les fiches suggérées pour demain
```

**Meilleur pour** :
- Étudiants qui apprennent en se testant
- Révisions ciblées sur les faiblesses
- Préparation de dernière minute efficace

---

## 🔧 API et services

### Service principal : `revision-methods.service.ts`

#### Gestion des méthodes
```typescript
// Récupérer la méthode actuelle
const method = await getUserRevisionMethod(userId);

// Changer de méthode
await changeRevisionMethod(userId, {
  new_method: 'BLOCK_METHOD',
  config: { items_per_day: 5 }
});
```

#### Révisions
```typescript
// Révisions du jour
const todayItems = await getTodayRevisionItems(userId);

// Révisions en retard
const overdueItems = await getOverdueRevisionItems(userId);

// Statistiques
const stats = await getRevisionMethodStats(userId);

// Compléter une révision
await completeRevision({
  revision_id: 'uuid',
  success_rate: 85,
  time_spent_minutes: 15
});
```

#### Méthode des J
```typescript
// Créer les 4 révisions espacées
await createJMethodRevisions(userId, {
  item_id: 'uuid',
  item_type: 'fiche',
  item_code: 'FICHE-001'
});
```

#### Méthode Blocs
```typescript
// Créer config
await createBlockMethodConfig(userId, {
  items_per_day: 5,
  target_date: '2025-06-15',
  selected_items: ['uuid1', 'uuid2']
});

// Récupérer config active
const config = await getActiveBlockMethodConfig(userId);
```

#### Méthode QCM First
```typescript
// Créer session
await createQCMFirstSession(userId, {
  total_questions: 20,
  correct_answers: 14,
  incorrect_answers: 6,
  suggested_fiches: ['fiche-1', 'fiche-2']
});

// Marquer fiche comme revue
await markFicheReviewedInQCMSession(sessionId, ficheId);
```

---

## 📊 Hook React : `useRevisionMethods`

```typescript
import { useRevisionMethods } from '@/hooks/useRevisionMethods';

function MyComponent() {
  const {
    // État
    loading,
    error,
    currentMethod,         // 'J_METHOD' | 'BLOCK_METHOD' | 'QCM_FIRST'
    todayItems,           // Révisions du jour
    overdueItems,         // Révisions en retard
    stats,                // Statistiques
    blockConfig,          // Config Blocs (si méthode active)
    todayQCMSession,      // Session QCM du jour (si méthode active)

    // Actions
    changeMethod,         // Changer de méthode
    completeRevision,     // Marquer comme fait
    skipRevision,         // Passer
    rescheduleRevision,   // Reporter

    // Méthode J
    markItemSeenAndSchedule,

    // Méthode Blocs
    createBlockConfig,

    // Méthode QCM First
    createQCMSession,
    markFicheReviewed,
    completeQCMSession
  } = useRevisionMethods();

  return (
    // ...
  );
}
```

---

## 🎨 Composants UI

### `RevisionMethodSelector`
Affiche les 3 méthodes côte à côte avec :
- Description complète
- Avantages
- Cas d'usage
- Exemple concret

```tsx
<RevisionMethodSelector
  currentMethod={currentMethod}
  onMethodSelected={(method) => console.log(method)}
  showCancelButton
/>
```

### `JMethodView`
Vue pour la Méthode des J avec :
- Révisions du jour
- Révisions en retard (priorité)
- Badges J+2, J+7, J+14, J+30
- Progression

```tsx
<JMethodView
  todayItems={todayItems}
  overdueItems={overdueItems}
/>
```

### `BlockMethodView`
Vue pour Blocs Profonds avec :
- Configuration (items/jour, date cible)
- Items du jour
- Phases (lecture, QCM, synthèse)
- Progression vers objectif

```tsx
<BlockMethodView
  todayItems={todayItems}
  blockConfig={blockConfig}
/>
```

### `QCMFirstView`
Vue pour QCM First avec :
- Lancement de session
- Résultats (score, taux réussite)
- Fiches suggérées
- Tracking fiches revues

```tsx
<QCMFirstView
  todayItems={todayItems}
  todaySession={todayQCMSession}
/>
```

---

## 🔄 Flux utilisateur

### Premier accès
1. L'utilisateur accède au `RevisionDashboard`
2. Aucune méthode n'est définie → affichage du `RevisionMethodSelector`
3. L'utilisateur choisit sa méthode → enregistrement dans `user_profiles`
4. Redirection vers le dashboard avec la vue de la méthode choisie

### Changement de méthode
1. Clic sur "Changer de méthode" dans le dashboard
2. Affichage du sélecteur avec warning
3. Confirmation → recalcul du planning selon la nouvelle méthode
4. Statistiques et progression conservées

### Révision quotidienne
1. L'utilisateur se connecte
2. Dashboard affiche :
   - Méthode actuelle
   - Statistiques du jour
   - Vue spécifique à la méthode avec items à réviser
3. L'utilisateur complète ses révisions
4. Progression mise à jour en temps réel

---

## 📈 Statistiques et Analytics

### Métriques suivies
- `completion_rate` : Taux de complétion global
- `completed_today` : Révisions complétées aujourd'hui
- `pending_today` : Révisions en attente aujourd'hui
- `overdue_count` : Révisions en retard
- `average_success_rate` : Taux de réussite moyen

### Fonctions SQL
```sql
-- Statistiques utilisateur
SELECT * FROM get_revision_method_stats('user-uuid');

-- Révisions du jour
SELECT * FROM get_today_revision_items('user-uuid');

-- Révisions en retard
SELECT * FROM get_overdue_revision_items('user-uuid');
```

---

## 🚀 Installation et déploiement

### 1. Appliquer la migration
```bash
# Via Supabase CLI
supabase db push

# Ou manuellement dans Supabase Dashboard
# → SQL Editor → Copier le contenu de 20251115150000_create_revision_methods_system.sql
```

### 2. Vérifier les tables
```sql
-- Vérifier que les tables existent
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'revision_schedule',
    'revision_method_effectiveness',
    'block_method_config',
    'qcm_first_sessions'
  );

-- Vérifier la colonne revision_method dans user_profiles
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name = 'revision_method';
```

### 3. Tester les fonctions
```sql
-- Tester la création de révisions J Method
SELECT create_j_method_revisions(
  'user-uuid',
  'item-uuid',
  'fiche',
  'FICHE-001'
);

-- Vérifier les révisions créées
SELECT * FROM revision_schedule
WHERE user_id = 'user-uuid'
ORDER BY scheduled_for;
```

---

## ⚠️ Points d'attention

### Compatibilité
- Le système est rétro-compatible avec l'ancien `usePersonalizedRevision`
- Si `currentMethod` est `null`, le dashboard affiche le sélecteur de méthode
- Les anciennes données de révision ne sont pas migrées automatiquement

### Performance
- Index créés sur toutes les colonnes fréquemment requêtées
- RLS activé sur toutes les tables
- Triggers pour auto-update des timestamps

### Sécurité
- Row Level Security (RLS) activé
- Users peuvent voir/modifier uniquement leurs propres données
- Fonctions SQL en mode `SECURITY DEFINER` pour opérations sensibles

---

## 🧪 Tests

### Test manuel rapide
1. Se connecter à l'app
2. Aller sur le RevisionDashboard
3. Sélectionner "Méthode des J 2.0"
4. Vérifier l'affichage du dashboard
5. Marquer une fiche comme vue → vérifier les 4 révisions créées
6. Changer pour "Méthode Blocs Profonds"
7. Configurer (5 items/jour, date future)
8. Vérifier le planning généré

### Vérification SQL
```sql
-- Compter les révisions par méthode
SELECT
  revision_method,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'DONE' THEN 1 ELSE 0 END) as completed
FROM revision_schedule
WHERE user_id = 'user-uuid'
GROUP BY revision_method;
```

---

## 📝 TODO / Améliorations futures

- [ ] Ajouter un sélecteur d'items pour la Méthode Blocs Profonds
- [ ] Intégrer avec le système de QCM existant pour QCM First
- [ ] Ajouter des graphiques de progression par méthode
- [ ] Notifications push pour les révisions du jour
- [ ] Export des statistiques en CSV/PDF
- [ ] Comparaison d'efficacité entre méthodes (A/B testing)
- [ ] Recommandations IA de méthode basées sur le profil
- [ ] Gamification (badges, streaks, etc.)

---

## 🤝 Contribution

Pour ajouter une nouvelle méthode de révision :

1. Ajouter le type dans `revision-methods.ts` :
   ```typescript
   export type RevisionMethodType = 'J_METHOD' | 'BLOCK_METHOD' | 'QCM_FIRST' | 'NEW_METHOD';
   ```

2. Créer la vue React : `NewMethodView.tsx`

3. Ajouter la logique dans `revision-methods.service.ts`

4. Mettre à jour le sélecteur dans `REVISION_METHODS`

5. Intégrer dans `RevisionDashboard.tsx`

---

## 📚 Ressources

- [Spaced Repetition Research](https://www.gwern.net/Spaced-repetition)
- [Deep Work - Cal Newport](https://www.calnewport.com/books/deep-work/)
- [Testing Effect in Learning](https://www.apa.org/science/about/psa/2016/06/learning-memory)

---

**Développé pour Med MNG** | Version 1.0 | 2025-11-15
