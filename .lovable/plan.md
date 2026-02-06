
# Correction du chargement infini -- ItemSelector

## Probleme identifie

Le composant `ItemSelector.tsx` (ligne 70) effectue une requete sur la table **`items`** qui **n'existe pas** dans la base de donnees. C'est la cause du spinner "Chargement des items..." bloque indefiniment.

Les tables disponibles sont : `edn_items`, `edn_items_immersive`, `edn_items_complete`.

## Correction

Modifier `src/components/med-mng/create/ItemSelector.tsx` :

### 1. Remplacer la requete Supabase (lignes 69-80)

- Table : `items` → `edn_items_immersive`
- Colonnes : `code` → `item_code`, ajouter `subtitle`, `competences_count_rang_a`, `competences_count_rang_b`
- Retirer `rang` et `keywords` (colonnes inexistantes)
- Augmenter la limite de 100 a 400 (367 items dans la DB)

### 2. Adapter le mapping des items (lignes 83-94)

- `item.code` → `item.item_code`
- Description generee depuis `subtitle` au lieu de `keywords`
- Supprimer la reference a `item.rang` (pas de colonne rang dans cette table)

### 3. Adapter les references a `item.code` dans le template (lignes 152-200)

- Toutes les occurrences de `item.code` → `item.item_code` dans le rendu JSX
- Supprimer le badge "Rang" conditionnel (ligne 179-186) car le rang est selectionne a l'etape 3, pas au niveau de l'item

### 4. Supprimer le filtre par rang dans ItemSelector (lignes 131-140)

Le filtre "Tous rangs / Rang A / Rang B" dans le selecteur d'items est redondant avec l'etape 3 (RangSelector). Le retirer simplifie l'interface et evite la confusion.

### 5. Mettre a jour le fallback (lignes 18-44)

Adapter les codes du fallback de `code` a `item_code` pour coherence.

## Impact

- Corrige le bug bloquant de chargement infini
- Les 367 items s'affichent correctement avec recherche
- Le flow 4 etapes reste inchange
