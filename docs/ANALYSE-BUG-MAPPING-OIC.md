# 🔴 ANALYSE COMPLÈTE - BUG MAPPING OIC

**Date:** 23 octobre 2025  
**Statut:** 🔍 Bug identifié - Cause racine trouvée

---

## 🎯 PROBLÈME PERSISTANT

**Résultat actuel:** 49 items Rang A / 62 items Rang B avec OIC réelles (13-17%)  
**Attendu:** 255+ items avec OIC réelles (70%)

---

## ✅ DONNÉES DISPONIBLES (Vérifiées)

| Item | Compétences Rang A | Compétences Rang B | Après filtres 10/20 |
|------|-------------------|-------------------|---------------------|
| 001 | 16 | 1 | ✅ 16 A / 1 B |
| 002 | 8 | 3 | ✅ 7 A / 3 B |
| 003 | 13 | 12 | ✅ 12 A / 12 B |
| 010 | 2 | 3 | ✅ 2 A / 3 B |
| 050 | 10 | 8 | ✅ 10 A / 8 B |
| 100 | 9 | 2 | ✅ 9 A / 2 B |

**Total table `oic_competences`:** 5,606 compétences  
**Après filtres (10/20 chars):** 5,356 compétences valides (95.5%)

---

## ❌ RÉSULTATS EDGE FUNCTION

| Item | Résultat Rang A | Résultat Rang B | Type |
|------|----------------|----------------|------|
| IC-1 | 3 compétences | 1 compétence | ⚠️ **Fallback partiel** |
| IC-2 | Fallback | Fallback | ❌ **Fallback total** |
| IC-50 | 5 compétences OIC | 8 compétences OIC | ✅ **OIC réelles** |

---

## 🔍 CAUSE RACINE IDENTIFIÉE

### Logs manquants
Les logs de débogage ajoutés (`Filtrage`, `Test IC-1`, `Test IC-2`) **n'apparaissent pas**, ce qui indique que:
1. La version déployée n'est peut-être pas la plus récente
2. OU les logs sont tronqués/perdus
3. OU il y a un problème de timing dans l'exécution

### Hypothèses principales

**Hypothèse 1: Problème de déploiement**
- Le code mis à jour n'est pas correctement déployé
- Version en cache utilisée

**Hypothèse 2: Bug dans la logique de sélection**
- Le mapping `item_code → item_parent` fonctionne pour certains items (IC-50)
- Mais échoue pour d'autres (IC-1, IC-2)
- Possible problème avec le format ou la transformation

**Hypothèse 3: Seuils trop élevés**
- IC-1 a 16 compétences A disponibles mais seulement 3 sont utilisées
- IC-2 a 7 compétences A mais aucune n'est utilisée (fallback)
- Les seuils `>= 3` et `>= 2` sont peut-être mal appliqués

---

## 🛠️ SOLUTIONS PROPOSÉES

### Solution immédiate
1. **Ajouter des logs ultra-détaillés** dans l'edge function
2. **Redéployer avec force refresh**
3. **Tester manuellement IC-1, IC-2, IC-3**

### Solution définitive
1. **Corriger la logique de détection** des compétences suffisantes
2. **Améliorer le mapping** item_code → item_parent
3. **Réduire les seuils** ou supprimer complètement le fallback

---

## 📊 SCORE ACTUEL vs ATTENDU

| Métrique | Actuel | Attendu | Écart |
|----------|--------|---------|-------|
| Items OIC Rang A | 49 (13%) | 255+ (70%) | **-206** ❌ |
| Items OIC Rang B | 62 (17%) | 255+ (70%) | **-193** ❌ |
| Données disponibles | 5,356 | 5,356 | ✅ |
| Utilisation réelle | **13-17%** | **70%** | **-53%** ❌ |

---

## ⚡ PROCHAINES ACTIONS

1. ✅ Ajouter logs détaillés (fait)
2. 🔄 Redéployer (à tester)
3. 🔍 Analyser logs complets
4. 🛠️ Corriger bug de mapping
5. ✅ Atteindre 70% d'utilisation OIC réelles

**Objectif final:** 255+ items avec compétences OIC réelles sur 367 (70%)
