# 🎫 TICKET CRITIQUE : Standardisation des noms de variables Supabase

**Date de création:** 26 janvier 2026  
**Priorité:** P0 - BLOQUANT  
**Temps estimé:** 2-3 heures  
**Statut:** EN COURS

---

## 📋 RÉSUMÉ DU PROBLÈME

Le projet utilise des préfixes underscore (`_data`, `_error`) dans les destructurations Supabase, alors que le SDK retourne `{ data, error }`. Cela cause des `TypeError` et `ReferenceError` qui cassent l'application.

---

## 🔴 ERREUR RACINE

```typescript
// ❌ INCORRECT - Le SDK ne retourne pas _data/_error
const { _data, _error } = await supabase.from('table').select('*');

// ✅ CORRECT - Le SDK retourne data/error
const { data, error } = await supabase.from('table').select('*');
```

---

## 📁 FICHIERS À CORRIGER

### Priorité 1 - CRITIQUES (bloquent l'app)

| Fichier | Lignes | Problème |
|---------|--------|----------|
| `src/components/med-mng/AuthProvider.tsx` | 59 | ✅ CORRIGÉ |
| `src/hooks/useActivityTracking.ts` | multiples | ✅ CORRIGÉ |
| `src/hooks/useOnboarding.ts` | 40, 65 | `_data`, `_steps`, `_currentStep` |

### Priorité 2 - Gamification

| Fichier | Lignes | Problème |
|---------|--------|----------|
| `src/components/gamification/LeaderboardPersistent.tsx` | 74, 97-99 | `_data`, `_error` |
| `src/components/gamification/WeeklyChallenges.tsx` | 175 | `addPoints` signature |
| `src/components/gamification/WeeklyGoalCard.tsx` | 62, 97 | `_data` |
| `src/components/gamification/AchievementSystem.tsx` | 86-98 | ✅ CORRIGÉ |
| `src/components/gamification/CertificateGenerator.tsx` | 66 | ✅ CORRIGÉ |
| `src/components/gamification/GamificationPanel.tsx` | 102 | ✅ CORRIGÉ |
| `src/components/gamification/Leaderboard.tsx` | 67-96 | ✅ CORRIGÉ |

### Priorité 3 - Generator

| Fichier | Lignes | Problème |
|---------|--------|----------|
| `src/components/generator/CancelGenerationButton.tsx` | 37 | `_data` |
| `src/components/generator/EcosSelector.tsx` | 50 | `_data`, `_error` |
| `src/components/generator/GenerationHistory.tsx` | 147-487 | `_data`, `_error` (multiple) |
| `src/components/generator/MobileHistoryDrawer.tsx` | 50 | `_data`, `_error` |
| `src/components/generator/PlaylistManager.tsx` | 72-197 | `_data`, `_error` (multiple) |
| `src/components/generator/PlaylistQuickAdd.tsx` | 60, 119 | `_data`, `_error` |

### Priorité 4 - Library

| Fichier | Lignes | Problème |
|---------|--------|----------|
| `src/components/library/BatchActions.tsx` | 68, 97 | `_error` |
| `src/components/library/FavoritesTab.tsx` | 39+ | `_data`, `_error` |
| `src/components/library/PlaylistsTab.tsx` | 41, 100 | `_data`, `_error` |
| `src/components/library/RecentTab.tsx` | 37 | `_data`, `_error` |
| `src/components/library/PlaylistQuickAdd.tsx` | 52 | `_data`, `_error` |

### Priorité 5 - Learning

| Fichier | Lignes | Problème |
|---------|--------|----------|
| `src/components/learning/ActivityHeatmap.tsx` | 32 | `_getHeatmapData` |
| `src/components/learning/ItemMasteryGrid.tsx` | 52, 63 | `_data` |
| `src/components/learning/StudyCalendar.tsx` | 23 | `_getHeatmapData` |

### Priorité 6 - Items & Export

| Fichier | Lignes | Problème |
|---------|--------|----------|
| `src/components/items/ItemTableauViewer.tsx` | 47 | `_data`, `_error` |
| `src/components/export/ProgressExport.tsx` | 123 | ✅ CORRIGÉ |

### Priorité 7 - Security & Monitoring

| Fichier | Lignes | Problème |
|---------|--------|----------|
| `src/components/security/AlertsAnalyticsDashboard.tsx` | 37, 64 | `_data`, `_error` |
| `src/components/security/ScheduledReports.tsx` | 34 | `_data`, `_error` |
| `src/components/monitoring/SentryErrorMonitor.tsx` | 37 | `_data`, `_error` |

### Priorité 8 - Social & Other

| Fichier | Lignes | Problème |
|---------|--------|----------|
| `src/components/social/ForumDiscussion.tsx` | 345, 394 | `_data`, `_error` |
| `src/components/test/TestItemCompetencesDisplay.tsx` | 19 | `_data`, `_error` |
| `src/components/test/EdnExtractionTest.tsx` | 116 | `_data`, `_error` |
| `src/components/priority/PriorityMode.tsx` | 72 | `_data` |

### Priorité 9 - Props de composants

| Fichier | Lignes | Problème |
|---------|--------|----------|
| `src/components/edn/TableauRangA.tsx` | 11-12 | `_data` prop → `data` |
| `src/components/edn/TableauRangB.tsx` | 15-16 | `_data` prop → `data` |
| `src/components/shared/TableauRangSelector.tsx` | 179-180 | Passer `data` au lieu de `_data` |

---

## 🔧 PATTERN DE CORRECTION

### Pour les requêtes Supabase :
```typescript
// Rechercher :
const { _data, _error } = await supabase

// Remplacer par :
const { data, error } = await supabase

// Et toutes les références :
if (_error) → if (error)
if (_data) → if (data)
_data.map → data.map
```

### Pour la fonction addPoints :
```typescript
// Rechercher :
addPoints(userId, 'reason')

// Remplacer par :
addPoints(userId, POINTS_VALUE, 'reason')

// Exemples de valeurs :
addPoints(user.id, 100, 'examCompleted')
addPoints(user.id, 200, 'perfectExam')
addPoints(user.id, 10, 'itemReviewed')
addPoints(user.id, 50, 'itemMastered')
```

### Pour les props de composants :
```typescript
// Dans l'interface :
interface Props {
  data?: TableauData; // Pas _data
}

// Dans l'appel :
<TableauRangA data={item.tableau_rang_a} />
```

---

## ✅ FICHIERS DÉJÀ CORRIGÉS

1. ✅ `src/components/med-mng/AuthProvider.tsx`
2. ✅ `src/hooks/useActivityTracking.ts`
3. ✅ `src/components/edn/quiz/ProgressHeatmap.tsx`
4. ✅ `src/components/edn/quiz/OicQuizGenerator.tsx`
5. ✅ `src/components/export/ProgressExport.tsx`
6. ✅ `src/components/gamification/AchievementSystem.tsx`
7. ✅ `src/components/gamification/CertificateGenerator.tsx`
8. ✅ `src/components/gamification/GamificationPanel.tsx`
9. ✅ `src/components/gamification/Leaderboard.tsx`

---

## 📊 PROGRESSION

- **Total fichiers à corriger:** ~40
- **Fichiers corrigés:** 9
- **Restants:** ~31

---

## 🎯 COMMANDES FIND & REPLACE (VS Code)

```
Rechercher: { _data
Remplacer: { data

Rechercher: { _error
Remplacer: { error

Rechercher: _data:
Remplacer: data:

Rechercher: _error:
Remplacer: error:

Rechercher: if (_error)
Remplacer: if (error)

Rechercher: if (_data)
Remplacer: if (data)

Rechercher: _data.
Remplacer: data.

Rechercher: _data?.
Remplacer: data?.

Rechercher: _data || 
Remplacer: data || 

Rechercher: || _data
Remplacer: || data
```

---

## 🚨 VALIDATION POST-CORRECTION

1. `npm run build` - Doit passer sans erreurs TypeScript
2. `npm test` - Les tests unitaires doivent passer
3. Vérifier la console navigateur - Aucun TypeError/ReferenceError
4. Tester l'authentification - La page doit charger

---

*Ticket créé automatiquement par l'audit du 26 janvier 2026*
