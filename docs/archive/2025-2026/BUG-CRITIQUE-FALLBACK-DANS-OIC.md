# 🐛 BUG CRITIQUE DÉCOUVERT - Fallbacks dans table OIC

**Date**: 23 octobre 2025  
**Statut**: ✅ Corrigé

---

## 🔍 Problème Identifié

La table `oic_competences` contenait **à la fois** les vraies compétences OIC **ET** les fallbacks génériques !

### Exemple pour IC-1 (item_parent = '001', rang = 'A'):

```sql
SELECT objectif_id, intitule 
FROM oic_competences 
WHERE item_parent = '001' AND rang = 'A'
LIMIT 3;
```

**Résultats:**
1. ❌ **IC-1-A** - "La relation médecin-malade..." (FALLBACK GÉNÉRIQUE)
2. ✅ **OIC-001-01-A** - "Connaître la définition..." (VRAIE OIC)
3. ✅ **OIC-001-02-A** - "Connaître les principaux déterminants..." (VRAIE OIC)

---

## ⚠️ Impact

La fonction `regenerate-all-oic-content` chargeait:
- 16 compétences pour IC-1 Rang A (dont 1 fallback + 15 vraies OIC)
- Prenait les 5 premières avec `.slice(0, 5)`
- Si le fallback était dans les 5 premiers → utilisait du contenu générique au lieu des vraies OIC

**Résultat**: Seulement 130/367 items (35%) utilisaient de vraies OIC malgré 5,000+ compétences disponibles.

---

## ✅ Solution Appliquée

### Filtre ajouté à la requête Supabase:

```typescript
// AVANT (bug)
.from('oic_competences')
.select('...')
.not('intitule', 'is', null)
.not('description', 'is', null);

// APRÈS (corrigé)
.from('oic_competences')
.select('...')
.not('intitule', 'is', null)
.not('description', 'is', null)
.not('objectif_id', 'like', 'IC-%'); // EXCLURE les fallbacks
```

---

## 📊 Résultats Attendus Après Correction

| Métrique | Avant | Après Correction |
|----------|-------|------------------|
| Items avec vraies OIC Rang A | 130/367 (35%) | **~350/367 (95%)** |
| Items avec vraies OIC Rang B | 169/367 (46%) | **~340/367 (93%)** |
| Compétences chargées | 5,356 (avec fallbacks) | ~5,100 (pures OIC) |

---

## 🎯 Validation

### Items à vérifier après correction:
- ✅ IC-1: Devrait avoir 15 vraies compétences OIC Rang A (au lieu de fallback)
- ✅ IC-2: Devrait avoir 7 vraies compétences OIC Rang A (au lieu de fallback)
- ✅ IC-27: Devrait avoir 2 vraies compétences OIC Rang A (au lieu de fallback)

### Requête de validation:
```sql
SELECT 
  COUNT(*) FILTER (WHERE (tableau_rang_a->'competences_cles'->0->>'objectif_id') LIKE 'OIC-%') as oic_rang_a,
  COUNT(*) FILTER (WHERE (tableau_rang_b->'competences_cles'->0->>'objectif_id') LIKE 'OIC-%') as oic_rang_b,
  COUNT(*) as total
FROM edn_items_immersive;
```

**Score attendu**: 95/100 (au lieu de 35/100)

---

## 🚀 Actions Réalisées

1. ✅ Diagnostic du bug (fallbacks dans table OIC)
2. ✅ Ajout du filtre `.not('objectif_id', 'like', 'IC-%')`
3. 🔄 Redéploiement de l'Edge Function
4. ⏳ Réexécution de la régénération complète

---

**Ce bug explique pourquoi 237 items utilisaient des fallbacks malgré des compétences OIC disponibles!**
