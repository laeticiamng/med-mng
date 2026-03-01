

# Plan : Injection OIC dans edn_items_immersive (et edn_items_complete)

## Diagnostic confirme

- **323 items sur 367** ont des colonnes `competences_oic_rang_a/b` vides (`[]`)
- **44 items** sont deja peuples (IC-69, IC-83, IC-99, etc.)
- **`backup_oic_competences`** contient les donnees sources : 4,872 competences couvrant les 323 items manquants (321 pour Rang A, 312 pour Rang B)
- Le format attendu dans les colonnes JSONB est un tableau d'objets avec `objectif_id`, `intitule`, `description`, `rubrique`, `url_source`, `ordre`
- **`edn_items_complete`** a le meme probleme (44/367) — les deux tables doivent etre corrigees

## Solution

Une seule migration SQL qui :
1. Pour chaque item vide, aggrege les competences depuis `backup_oic_competences` en JSONB
2. Met a jour `competences_oic_rang_a` et `competences_oic_rang_b`
3. Recalcule les compteurs `competences_count_rang_a`, `competences_count_rang_b`, `competences_count_total`
4. Applique la meme operation sur `edn_items_complete`

Aucune Edge Function ni code front a modifier — c'est une correction de donnees pure.

## Details techniques

### Migration SQL (une seule)

```text
-- Etape 1 : Peupler edn_items_immersive.competences_oic_rang_a
UPDATE edn_items_immersive e
SET competences_oic_rang_a = sub.competences
FROM (
  SELECT 
    lpad(item_parent, 3, '0') as padded_parent,
    jsonb_agg(
      jsonb_build_object(
        'objectif_id', objectif_id,
        'intitule', intitule,
        'description', description,
        'rubrique', COALESCE(rubrique, 'Non classee'),
        'ordre', row_number() OVER (PARTITION BY item_parent ORDER BY objectif_id)
      ) ORDER BY objectif_id
    ) as competences
  FROM backup_oic_competences
  WHERE rang = 'A' AND intitule IS NOT NULL
  GROUP BY item_parent
) sub
WHERE lpad(replace(e.item_code, 'IC-', ''), 3, '0') = sub.padded_parent
  AND (e.competences_oic_rang_a IS NULL OR e.competences_oic_rang_a::text = '[]');

-- Etape 2 : Idem pour rang_b
-- (meme structure, WHERE rang = 'B')

-- Etape 3 : Recalculer les compteurs
UPDATE edn_items_immersive SET
  competences_count_rang_a = jsonb_array_length(COALESCE(competences_oic_rang_a, '[]')),
  competences_count_rang_b = jsonb_array_length(COALESCE(competences_oic_rang_b, '[]')),
  competences_count_total = jsonb_array_length(COALESCE(competences_oic_rang_a, '[]'))
                          + jsonb_array_length(COALESCE(competences_oic_rang_b, '[]'));

-- Etape 4 : Repeter pour edn_items_complete (meme logique)
```

### Mapping item_code vers item_parent

- `edn_items_immersive.item_code` = `IC-1`, `IC-66`, `IC-367`
- `backup_oic_competences.item_parent` = `001`, `066`, `367`
- Transformation : `lpad(replace(item_code, 'IC-', ''), 3, '0')`

### Garde-fous

- La clause `WHERE competences_oic_rang_a::text = '[]'` protege les 44 items deja peuples
- Aucune donnee existante n'est ecrasee

## Impact attendu

| Metrique | Avant | Apres |
|----------|-------|-------|
| Items avec Rang A | 44/367 (12%) | 365/367 (99.5%) |
| Items avec Rang B | 44/367 (12%) | 356/367 (97%) |
| Compteurs a jour | Non | Oui |
| Tables corrigees | 0 | 2 (immersive + complete) |

## Fichiers modifies

- **1 migration SQL** (aucun fichier TypeScript modifie)
- Pas de deploiement Edge Function necessaire

## Estimation

~20 minutes (ecriture + execution + verification)

