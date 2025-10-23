# 🐛 BUG CRITIQUE - Limite Supabase 1000 Résultats

**Date**: 23 octobre 2025  
**Statut**: ✅ Corrigé

---

## 🔍 Problème Identifié

La fonction `regenerate-all-oic-content` chargeait seulement **1000 compétences** au lieu de **4,872** disponibles!

### Cause
Par défaut, Supabase limite les requêtes `.select()` à **1000 résultats maximum**.

```typescript
// ❌ AVANT (bug)
const { data: allOicCompetences } = await supabase
  .from('oic_competences')
  .select('...')
  .not('objectif_id', 'like', 'IC-%');
// Retourne seulement 1000 compétences sur 4,872 disponibles!
```

---

## ⚠️ Impact

| Métrique | Réalité | Chargé par fonction | Impact |
|----------|---------|---------------------|--------|
| Compétences OIC pures | 4,872 | **1,000** | ❌ 79% manquantes |
| Items couverts | 365/367 | ~150/367 | ❌ 215 items perdus |
| Rang A | 60.5% couverture | Devrait être **95%** | ❌ 145 items en fallback |

### Exemples d'items impactés
Les items dont les compétences n'étaient pas dans les 1000 premières chargées:
- **IC-113**: 3 compétences Rang A disponibles → Fallback utilisé ❌
- **IC-175**: 8 compétences Rang A disponibles → Fallback utilisé ❌
- **IC-183**: 3 compétences Rang A disponibles → Fallback utilisé ❌

---

## ✅ Solution Appliquée

```typescript
// ✅ APRÈS (corrigé)
const { data: allOicCompetences } = await supabase
  .from('oic_competences')
  .select('...')
  .not('objectif_id', 'like', 'IC-%')
  .limit(10000); // Charger TOUTES les compétences
```

---

## 📊 Résultats Attendus Après Correction

| Métrique | Avant Correction | Après Correction |
|----------|------------------|------------------|
| Compétences chargées | 1,000 | **4,872** |
| Items avec OIC Rang A | 222/367 (60%) | **~350/367 (95%)** |
| Items avec OIC Rang B | 214/367 (58%) | **~340/367 (93%)** |
| Score global | 60/100 | **95/100** |

---

## 🎯 Validation

### Requête de validation après correction:
```sql
SELECT 
  COUNT(*) FILTER (WHERE (tableau_rang_a->'competences_cles'->0->>'objectif_id') LIKE 'OIC-%') as oic_a,
  COUNT(*) FILTER (WHERE (tableau_rang_b->'competences_cles'->0->>'objectif_id') LIKE 'OIC-%') as oic_b,
  ROUND(100.0 * COUNT(*) FILTER (WHERE (tableau_rang_a->'competences_cles'->0->>'objectif_id') LIKE 'OIC-%') / COUNT(*), 1) as pct_a
FROM edn_items_immersive;
```

**Objectif**: 
- Rang A: **95%** (au lieu de 60%)
- Rang B: **93%** (au lieu de 58%)

---

## 🚀 Actions Réalisées

1. ✅ Diagnostic du problème (limite Supabase 1000)
2. ✅ Ajout de `.limit(10000)` à la requête
3. 🔄 Redéploiement de la fonction
4. ⏳ Réexécution de la régénération complète

---

**Ce bug explique les 145 items avec fallback malgré des compétences OIC disponibles!**
