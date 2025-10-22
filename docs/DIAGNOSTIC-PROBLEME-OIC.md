# 🔴 DIAGNOSTIC - PROBLÈME PERSISTANT OIC

## Problème identifié

**Résultat actuel:** 49 items Rang A / 62 items Rang B avec OIC réelles (13-17%)

**Attendu:** 255+ items avec OIC réelles (70%)

## Cause probable

Les filtres sont appliqués MAIS les compétences ne sont pas utilisées correctement dans la génération.

### Vérifications effectuées

1. ✅ Table `oic_competences` : 5,606 compétences disponibles
2. ✅ Filtres 10/20 : 5,356 compétences qualité
3. ✅ IC-1 a 16 compétences Rang A disponibles
4. ❌ MAIS l'edge function génère du fallback

## Actions nécessaires

1. **Vérifier les logs détaillés** de l'edge function
2. **Déboguer la logique** de sélection des compétences
3. **Corriger le mapping** item_code → item_parent

## Commandes de vérification

```sql
-- Vérifier IC-1
SELECT item_code, 
  tableau_rang_a->'competences_cles'->0->>'objectif_id' as obj_a,
  jsonb_array_length(tableau_rang_a->'competences_cles') as nb_a
FROM edn_items_immersive WHERE item_code = 'IC-1';
```

**Conclusion:** Le problème nécessite un débogage approfondi des logs d'exécution.
